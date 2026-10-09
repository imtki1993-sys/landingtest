import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
import { AGENT_ROLE } from "../../../../lib/team";
const leadStatuses = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "NO_ANSWER",
  "CALL_BACK",
  "CANCELLED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
];
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params,
      { s, workspaceId, role, user } = await authContext(req),
      b = await req.json(),
      patch: any = {};
    // Un agent ne modifie que les clients de commandes qui lui sont attribuées
    if (role === AGENT_ROLE) {
      const { data: mine } = await s
        .from("orders")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("lead_id", id)
        .eq("assigned_to", user.id)
        .limit(1);
      if (!mine?.length) return NextResponse.json({ error: "Commande non attribuée à toi" }, { status: 403 });
    }
    if (b.status !== undefined) {
      if (!leadStatuses.includes(b.status))
        return NextResponse.json({ error: "Statut lead invalide" }, { status: 400 });
      patch.status = b.status;
      if (b.status === "CONTACTED") patch.contacted_at = new Date().toISOString();
      if (b.status === "CONFIRMED") patch.confirmed_at = new Date().toISOString();
    }
    // Appels de confirmation : compteur + date du dernier appel, rappel planifié
    const callStatus = ["CONTACTED", "NO_ANSWER", "CALL_BACK", "CONFIRMED", "CANCELLED"].includes(b.status);
    let callPatch: any = null;
    if (callStatus) {
      const { data: cur } = await s
        .from("leads")
        .select("call_attempts")
        .eq("id", id)
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (cur && "call_attempts" in cur) {
        callPatch = { call_attempts: Number(cur.call_attempts || 0) + 1, last_call_at: new Date().toISOString() };
        if (b.status === "CALL_BACK") {
          const at = b.callback_at ? new Date(b.callback_at) : null;
          callPatch.callback_at = at && !isNaN(at.getTime()) ? at.toISOString() : null;
        } else callPatch.callback_at = null;
      }
    }
    if (callPatch) Object.assign(patch, callPatch);
    if (b.notes !== undefined) patch.notes = String(b.notes || "").slice(0, 4000);
    if (b.full_name !== undefined) {
      const name = String(b.full_name || "").trim();
      if (name.length < 2) return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
      patch.full_name = name.slice(0, 160);
    }
    if (b.address !== undefined)
      patch.address =
        String(b.address || "")
          .trim()
          .slice(0, 500) || null;
    if (b.city_name !== undefined)
      patch.city_name =
        String(b.city_name || "")
          .trim()
          .slice(0, 120) || null;
    if (b.phone !== undefined) {
      let phone = String(b.phone || "").replace(/[^0-9+]/g, "");
      if (phone.startsWith("0")) phone = "+212" + phone.slice(1);
      else if (phone.startsWith("212")) phone = "+" + phone;
      if (!/^\+212[5-7][0-9]{8}$/.test(phone))
        return NextResponse.json({ error: "Numéro marocain invalide" }, { status: 400 });
      patch.phone_raw = String(b.phone).trim();
      patch.phone_e164 = phone;
    }
    const { data, error } = await s
      .from("leads")
      .update(patch)
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .select("id,full_name,phone_raw,phone_e164,city_name,address,status,notes,contacted_at,confirmed_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
    if (b.status !== undefined) {
      const { data: linked } = await s
        .from("orders")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("lead_id", id)
        .limit(20);
      if (linked?.length)
        await s.from("order_status_history").insert(
          linked.map((o: any) => ({
            workspace_id: workspaceId,
            order_id: o.id,
            source: "CRM",
            status: "LEAD_" + b.status,
            note:
              "Statut commercial : " +
              b.status +
              (role === AGENT_ROLE ? " (agent " + (user.email || user.id) + ")" : ""),
          })),
        );
    }
    return NextResponse.json(data);
  } catch (e: any) {
    reportError(e, "api/leads/[id]");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
