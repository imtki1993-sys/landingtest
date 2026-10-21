// Analyse des pubs : rapport par campagne / pub (ads_report) et dépense saisie par le vendeur.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { buildAdsReport, type AdsRow } from "../../../lib/ads-report";

/** Fonction ou table absente : la migration 20261021130000_ads_analytics.sql n'a pas encore été lancée. */
const notInstalled = (e: any) =>
  ["42883", "42P01", "PGRST202", "PGRST205"].includes(String(e?.code || "")) ||
  /ads_report|ad_spend|utm_campaign/.test(String(e?.message || ""));

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const [rep, sp] = await Promise.all([
      s.rpc("ads_report", { p_workspace_id: workspaceId }),
      s.from("ad_spend").select("campaign,amount").eq("workspace_id", workspaceId),
    ]);
    if (rep.error || sp.error) {
      const e = rep.error || sp.error;
      if (notInstalled(e)) return NextResponse.json({ installed: false });
      throw e;
    }
    const spend: Record<string, number> = {};
    for (const r of sp.data || []) spend[r.campaign] = Number(r.amount || 0);
    const rows: AdsRow[] = (rep.data || []).map((r: any) => ({
      ...r,
      visits: Number(r.visits || 0),
      orders: Number(r.orders || 0),
      confirmed: Number(r.confirmed || 0),
      delivered: Number(r.delivered || 0),
      returned: Number(r.returned || 0),
      cancelled: Number(r.cancelled || 0),
      revenue: Number(r.revenue || 0),
      delivered_revenue: Number(r.delivered_revenue || 0),
    }));
    return NextResponse.json({ installed: true, ...buildAdsReport(rows, spend) });
  } catch (e: any) {
    reportError(e, "api/ads");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** Dépense totale d'une campagne (montant dépensé affiché dans Ads Manager). 0 ou vide = supprimée. */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const campaign = String(b.campaign || "")
      .trim()
      .slice(0, 200);
    const amount = Math.max(0, Math.min(10_000_000, Math.round(Number(b.amount || 0) * 100) / 100));
    if (!campaign) return NextResponse.json({ error: "Nom de campagne manquant" }, { status: 400 });
    if (!Number.isFinite(amount)) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    const { error } = amount
      ? await s
          .from("ad_spend")
          .upsert(
            { workspace_id: workspaceId, campaign, amount, updated_at: new Date().toISOString() },
            { onConflict: "workspace_id,campaign" },
          )
      : await s.from("ad_spend").delete().eq("workspace_id", workspaceId).eq("campaign", campaign);
    if (error) throw error;
    return NextResponse.json({ ok: true, campaign, amount });
  } catch (e: any) {
    reportError(e, "api/ads");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
