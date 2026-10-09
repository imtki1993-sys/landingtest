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
export async function authContext(req: Request) {
  const token = (req.headers.get("cookie") || "").match(/(?:^|;\s*)lm_access=([^;]+)/)?.[1];
  if (!token) throw new Error("Non autorisé");
  const s = adminDb(),
    {
      data: { user },
      error,
    } = await s.auth.getUser(decodeURIComponent(token));
  if (error || !user) throw new Error("Non autorisé");
  const { data, error: ce } = await s.rpc("resolve_user_context", { p_user_id: user.id });
  if (ce) throw ce;
  const ctx = Array.isArray(data) ? data[0] : data;
  if (!ctx) throw new Error("Profil introuvable");
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
