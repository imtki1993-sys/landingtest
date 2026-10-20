import { createClient } from "@supabase/supabase-js";
import { agentCanAccess, AGENT_ROLE } from "./team";
let cachedAdmin: any = null;
export function adminDb() {
  if (cachedAdmin) return cachedAdmin;
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL,
    k = process.env.SUPABASE_SECRET_KEY;
  if (!u || !k) throw new Error("Supabase env missing");
  cachedAdmin = createClient(u, k, { auth: { persistSession: false, autoRefreshToken: false } });
  return cachedAdmin;
}
// Session et compte déjà vérifiés, gardés 30 s par instance : sans ça chaque appel d'API
// refaisait 2 allers-retours vers Supabase (utilisateur + contexte) avant de lire les données.
const CTX_TTL_MS = 30_000;
const ctxCache = new Map<string, { user: any; ctx: any; until: number }>();

/** Oublie une session (déconnexion, changement de rôle). Sans jeton : vide tout. */
export function forgetSession(token?: string) {
  if (token) ctxCache.delete(decodeURIComponent(token));
  else ctxCache.clear();
}

async function sessionContext(s: any, token: string) {
  const now = Date.now();
  const hit = ctxCache.get(token);
  if (hit && hit.until > now) return hit;
  const {
    data: { user },
    error,
  } = await s.auth.getUser(token);
  if (error || !user) throw new Error("Non autorisé");
  const { data, error: ce } = await s.rpc("resolve_user_context", { p_user_id: user.id });
  if (ce) throw ce;
  const ctx = Array.isArray(data) ? data[0] : data;
  if (!ctx) throw new Error("Profil introuvable");
  const entry = { user, ctx, until: now + CTX_TTL_MS };
  // Seuls les comptes valides sont gardés : une attente d'approbation est revérifiée à chaque appel
  if (ctx.approval_status === "approved" && ctx.workspace_id) {
    if (ctxCache.size > 500) ctxCache.clear();
    ctxCache.set(token, entry);
  }
  return entry;
}

export async function authContext(req: Request) {
  const raw = (req.headers.get("cookie") || "").match(/(?:^|;\s*)lm_access=([^;]+)/)?.[1];
  if (!raw) throw new Error("Non autorisé");
  const s = adminDb();
  const { user, ctx } = await sessionContext(s, decodeURIComponent(raw));
  if (ctx.approval_status !== "approved") throw new Error("Compte en attente d’approbation");
  if (!ctx.workspace_id) throw new Error("Workspace introuvable");
  // Agent de confirmation : uniquement les routes des commandes (lib/team.ts)
  if (ctx.role === AGENT_ROLE && !ctx.is_platform_admin) {
    let path = "";
    try {
      path = new URL(req.url).pathname;
    } catch {}
    if (!agentCanAccess(req.method || "GET", path)) throw new Error("Accès réservé au propriétaire du compte");
  }
  return { s, user, workspaceId: ctx.workspace_id, role: ctx.role, isPlatformAdmin: !!ctx.is_platform_admin };
}
