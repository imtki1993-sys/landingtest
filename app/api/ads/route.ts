// Analyse des pubs : rapport par campagne / pub (ads_report), dépense saisie par le vendeur
// (par période) et noms lisibles donnés aux campagnes / pubs.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { buildAdsReport, type AdsRow } from "../../../lib/ads-report";

/** Fonction, table ou colonne absente : un script SQL de l'analyse des pubs n'a pas été lancé. */
const missing = (e: any) =>
  ["42883", "42P01", "42703", "PGRST202", "PGRST204", "PGRST205"].includes(String(e?.code || "")) ||
  /ads_report|ad_spend|ad_labels|period_from|utm_campaign/.test(String(e?.message || ""));

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/i;
/** Jour marocain (UTC+1) → instant. */
const startOf = (d: string) => new Date(d + "T00:00:00+01:00").toISOString();
const nextDay = (d: string) => new Date(new Date(d + "T00:00:00+01:00").getTime() + 86400000).toISOString();

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const q = new URL(req.url).searchParams;
    const from = DAY.test(q.get("from") || "") ? q.get("from")! : null;
    const to = DAY.test(q.get("to") || "") ? q.get("to")! : null;
    const landing = UUID.test(q.get("landing") || "") ? q.get("landing")! : null;

    // v2 (filtres, dépense par période, noms) installée ?
    const labelsQ = await s.from("ad_labels").select("campaign,label").eq("workspace_id", workspaceId);
    const v2 = !labelsQ.error;
    if (labelsQ.error && !missing(labelsQ.error)) throw labelsQ.error;

    const args: Record<string, unknown> = { p_workspace_id: workspaceId };
    if (v2) {
      if (from) args.p_from = startOf(from);
      if (to) args.p_to = nextDay(to);
      if (landing) args.p_landing_page_id = landing;
    }
    let spendQ = s.from("ad_spend").select(v2 ? "campaign,amount,period_from,period_to" : "campaign,amount");
    spendQ = spendQ.eq("workspace_id", workspaceId);
    const [rep, sp] = await Promise.all([s.rpc("ads_report", args), spendQ]);
    if (rep.error || sp.error) {
      const e = rep.error || sp.error;
      if (missing(e)) return NextResponse.json({ installed: false });
      throw e;
    }
    // Dépense : celle saisie pour exactement cette période, sinon la somme des périodes plus courtes
    // qu'elle contient ; sans période choisie, la dépense totale de la campagne.
    const spend: Record<string, number> = {};
    const exact: Record<string, number> = {};
    for (const r of (sp.data || []) as any[]) {
      const a = Number(r.amount || 0);
      const pf = r.period_from || null,
        pt = r.period_to || null;
      if (!from && !to) {
        if (!pf && !pt) spend[r.campaign] = a;
        continue;
      }
      if (!pf || !pt) continue;
      if (pf === from && pt === to) exact[r.campaign] = a;
      else if ((!from || pf >= from) && (!to || pt <= to)) spend[r.campaign] = (spend[r.campaign] || 0) + a;
    }
    Object.assign(spend, exact);
    const labels: Record<string, string> = {};
    for (const r of (labelsQ.data || []) as any[]) labels[r.campaign] = r.label;
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
    return NextResponse.json({
      installed: true,
      v2,
      period: { from, to },
      landing,
      ...buildAdsReport(rows, spend, labels),
    });
  } catch (e: any) {
    reportError(e, "api/ads");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/**
 * { campaign, amount, from?, to? } : dépense de la campagne pour la période (sans période : totale).
 * { type: "label", key, label } : nom lisible d'une campagne ou d'une pub (vide = supprimé).
 */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const key = String(b.type === "label" ? b.key || "" : b.campaign || "")
      .trim()
      .slice(0, 200);
    if (!key) return NextResponse.json({ error: "Nom de campagne manquant" }, { status: 400 });

    if (b.type === "label") {
      const label = String(b.label || "")
        .trim()
        .slice(0, 120);
      const { error } = label
        ? await s
            .from("ad_labels")
            .upsert({ workspace_id: workspaceId, campaign: key, label }, { onConflict: "workspace_id,campaign" })
        : await s.from("ad_labels").delete().eq("workspace_id", workspaceId).eq("campaign", key);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    const amount = Math.max(0, Math.min(10_000_000, Math.round(Number(b.amount || 0) * 100) / 100));
    if (!Number.isFinite(amount)) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    const from = DAY.test(b.from || "") ? b.from : null;
    const to = DAY.test(b.to || "") ? b.to : null;
    const period = !!(from && to);
    // ligne existante pour cette période : remplacée
    let del = s.from("ad_spend").delete().eq("workspace_id", workspaceId).eq("campaign", key);
    del = period ? del.eq("period_from", from).eq("period_to", to) : del.is("period_from", null);
    const d = await del;
    if (d.error) {
      if (!missing(d.error) || period) throw d.error;
      // base v1 (sans périodes) : dépense totale seulement
      const { error } = amount
        ? await s
            .from("ad_spend")
            .upsert(
              { workspace_id: workspaceId, campaign: key, amount, updated_at: new Date().toISOString() },
              { onConflict: "workspace_id,campaign" },
            )
        : await s.from("ad_spend").delete().eq("workspace_id", workspaceId).eq("campaign", key);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    if (amount) {
      const { error } = await s.from("ad_spend").insert({
        workspace_id: workspaceId,
        campaign: key,
        amount,
        period_from: period ? from : null,
        period_to: period ? to : null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, campaign: key, amount });
  } catch (e: any) {
    reportError(e, "api/ads");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
