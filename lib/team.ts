// Équipe de confirmation : rôle « agent » (accès limité aux commandes qui lui sont
// attribuées) et répartition automatique des nouvelles commandes entre les agents actifs.
import { cancelIfBlacklisted } from "./blacklist";

export const AGENT_ROLE = "agent";

/**
 * Routes API qu'un agent peut appeler. Tout le reste (paramètres, intégrations,
 * pages, produits, suppression, équipe, abonnement…) est réservé au propriétaire.
 */
const AGENT_ROUTES: [method: string, pattern: RegExp][] = [
  ["GET", /^\/api\/auth\/context$/],
  ["POST", /^\/api\/auth\/logout$/],
  ["GET", /^\/api\/orders$/],
  ["GET", /^\/api\/orders\/[^/]+\/history$/],
  ["PATCH", /^\/api\/leads\/[^/]+$/],
  ["GET", /^\/api\/team\/me$/],
];

export function agentCanAccess(method: string, pathname: string): boolean {
  const m = method.toUpperCase(),
    p = pathname.replace(/\/+$/, "");
  return AGENT_ROUTES.some(([rm, re]) => rm === m && re.test(p));
}

/** Agent le moins chargé (commandes attribuées sur 24 h), à égalité le premier de la liste. */
export function pickAgent(agents: { id: string }[], load: Map<string, number>): string | null {
  let best: string | null = null,
    min = Infinity;
  for (const a of agents) {
    const n = load.get(a.id) || 0;
    if (n < min) {
      min = n;
      best = a.id;
    }
  }
  return best;
}

/** Agents actifs (compte approuvé) d'un workspace. */
export async function activeAgents(s: any, workspaceId: string): Promise<{ id: string }[]> {
  const { data: members, error } = await s
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("role", AGENT_ROLE);
  if (error || !members?.length) return [];
  const { data: users } = await s
    .from("users")
    .select("id,approval_status")
    .in(
      "id",
      members.map((m: any) => m.user_id),
    );
  return (users || []).filter((u: any) => u.approval_status === "approved").map((u: any) => ({ id: u.id }));
}

/** Attribue une nouvelle commande à un agent si la répartition automatique est activée. */
export async function autoAssign(s: any, orderId: string): Promise<string | null> {
  try {
    const { data: order } = await s
      .from("orders")
      .select("id,workspace_id,assigned_to")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.assigned_to) return null;
    const { data: ws } = await s.from("workspaces").select("settings").eq("id", order.workspace_id).maybeSingle();
    if (!ws?.settings?.auto_assign) return null;
    const agents = await activeAgents(s, order.workspace_id);
    if (!agents.length) return null;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: recent } = await s
      .from("orders")
      .select("assigned_to")
      .eq("workspace_id", order.workspace_id)
      .gte("assigned_at", since)
      .in(
        "assigned_to",
        agents.map((a) => a.id),
      );
    const load = new Map<string, number>();
    for (const r of recent || []) load.set(r.assigned_to, (load.get(r.assigned_to) || 0) + 1);
    const agentId = pickAgent(agents, load);
    if (!agentId) return null;
    await s
      .from("orders")
      .update({ assigned_to: agentId, assigned_at: new Date().toISOString() })
      .eq("id", order.id)
      .is("assigned_to", null);
    return agentId;
  } catch {
    return null; // colonnes absentes (migration non exécutée) : pas de répartition
  }
}

/** Traitement après une commande publique : liste noire, sinon répartition aux agents. */
export async function afterPublicOrder(s: any, orderId: string): Promise<void> {
  const cancelled = await cancelIfBlacklisted(s, orderId);
  if (!cancelled) await autoAssign(s, orderId);
}
