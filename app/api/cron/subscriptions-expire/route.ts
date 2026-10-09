// Tâche quotidienne : un abonnement par clé dont la période est terminée passe en « past_due »
// (les commandes publiques et la création de pages sont alors bloquées jusqu'au renouvellement).
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/server-auth";
export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get("authorization") !== "Bearer " + secret)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const now = new Date().toISOString(),
      s = adminDb();
    // Seuls les comptes passés aux clés d'activation expirent : les abonnements gérés
    // à la main par l'admin (anciens clients) ne sont jamais coupés par cette tâche.
    const { data: licensed, error: le } = await s
      .from("license_keys")
      .select("used_by_workspace")
      .eq("status", "used")
      .not("used_by_workspace", "is", null);
    if (le) throw le;
    const ids = [...new Set((licensed || []).map((k: any) => k.used_by_workspace))];
    if (!ids.length) return NextResponse.json({ ok: true, expired: 0 });
    const { data, error } = await s
      .from("workspace_subscriptions")
      .update({ status: "past_due", updated_at: now })
      .in("status", ["active", "trialing"])
      .not("current_period_end", "is", null)
      .lt("current_period_end", now)
      .in("workspace_id", ids)
      .select("workspace_id");
    if (error) throw error;
    return NextResponse.json({ ok: true, expired: (data || []).length });
  } catch (e: any) {
    reportError(e, "api/cron/subscriptions-expire");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
