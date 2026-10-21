// Analyse des pubs : lignes du rapport SQL (ads_report) → campagnes, pubs et indicateurs.
export interface AdsRow {
  campaign: string | null;
  adset: string | null;
  ad: string | null;
  visits: number;
  orders: number;
  confirmed: number;
  delivered: number;
  returned: number;
  cancelled: number;
  revenue: number;
  delivered_revenue: number;
}
type Counts = Omit<AdsRow, "campaign" | "adset" | "ad">;
export interface AdLine extends Counts {
  adset: string | null;
  ad: string | null;
}
export interface Campaign extends Counts {
  campaign: string;
  spend: number;
  ads: AdLine[];
}
export interface Metrics {
  conversion: number | null;
  confirmationRate: number | null;
  deliveryRate: number | null;
  costPerOrder: number | null;
  costPerDelivered: number | null;
  roas: number | null;
  profit: number | null;
}

const ZERO: Counts = {
  visits: 0,
  orders: 0,
  confirmed: 0,
  delivered: 0,
  returned: 0,
  cancelled: 0,
  revenue: 0,
  delivered_revenue: 0,
};
const KEYS = Object.keys(ZERO) as (keyof Counts)[];
const add = <T extends Counts>(a: T, b: Partial<Counts>): T => {
  for (const k of KEYS) a[k] += Number(b[k] || 0);
  return a;
};
const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

/** Indicateurs d'une campagne (ou du total) ; null quand le calcul n'a pas de sens. */
export function metrics(c: Counts, spend: number): Metrics {
  return {
    conversion: ratio(c.orders, c.visits),
    confirmationRate: ratio(c.confirmed, c.orders),
    deliveryRate: ratio(c.delivered, c.confirmed),
    costPerOrder: spend > 0 ? ratio(spend, c.orders) : null,
    costPerDelivered: spend > 0 ? ratio(spend, c.delivered) : null,
    roas: spend > 0 ? c.delivered_revenue / spend : null,
    profit: spend > 0 ? c.delivered_revenue - spend : null,
  };
}

/** Regroupe par campagne ; les commandes sans pub identifiée sont comptées à part. */
export function buildAdsReport(rows: AdsRow[], spendByCampaign: Record<string, number>) {
  const map = new Map<string, Campaign>();
  const untracked: Counts = { ...ZERO };
  for (const r of rows) {
    if (!r.campaign) {
      add(untracked, r);
      continue;
    }
    let c = map.get(r.campaign);
    if (!c) {
      c = { campaign: r.campaign, ...ZERO, spend: Number(spendByCampaign[r.campaign] || 0), ads: [] };
      map.set(r.campaign, c);
    }
    add(c, r);
    const line: AdLine = { adset: r.adset, ad: r.ad, ...ZERO };
    add(line, r);
    c.ads.push(line);
  }
  // dépense saisie pour une campagne sans visite ni commande : elle compte quand même
  for (const [name, amount] of Object.entries(spendByCampaign))
    if (!map.has(name) && amount > 0) map.set(name, { campaign: name, ...ZERO, spend: amount, ads: [] });
  const campaigns = [...map.values()]
    .map((c) => ({ ...c, ads: c.ads.sort((a, b) => b.orders - a.orders || b.visits - a.visits) }))
    .sort((a, b) => b.orders - a.orders || b.spend - a.spend || b.visits - a.visits);
  const total = campaigns.reduce((t, c) => add(t, c), { ...ZERO });
  const spend = campaigns.reduce((n, c) => n + c.spend, 0);
  return { campaigns, total: { ...total, spend }, untracked };
}
