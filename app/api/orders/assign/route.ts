// Attribution manuelle de commandes à un agent (ou retrait), par le propriétaire.
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
import { AGENT_ROLE } from "../../../../lib/team";
import { isMissingColumn } from "../../../../lib/db-errors";
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const ids = (Array.isArray(b.order_ids) ? b.order_ids : []).map(String).slice(0, 500);
    if (!ids.length) return NextResponse.json({ error: "Aucune commande sélectionnée" }, { status: 400 });
    const agentId = b.agent_id ? String(b.agent_id) : null;
    if (agentId) {
      const { data: m } = await s
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", agentId)
        .eq("role", AGENT_ROLE)
        .maybeSingle();
      if (!m) return NextResponse.json({ error: "Agent introuvable" }, { status: 404 });
    }
    const { data, error } = await s
      .from("orders")
      .update({ assigned_to: agentId, assigned_at: agentId ? new Date().toISOString() : null })
      .eq("workspace_id", workspaceId)
      .in("id", ids)
      .select("id");
    if (error) throw error;
    return NextResponse.json({ ok: true, updated: (data || []).length });
  } catch (e: any) {
    if (isMissingColumn(e))
      return NextResponse.json(
        { error: "Exécute d’abord le fichier supabase/migrations/20261009180000_team.sql dans Supabase." },
        { status: 503 },
      );
    reportError(e, "api/orders/assign");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
