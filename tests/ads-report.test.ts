import { describe, it, expect } from "vitest";
import { buildAdsReport, metrics, type AdsRow } from "../lib/ads-report";
import { utmFrom } from "../lib/utm";

const row = (p: Partial<AdsRow>): AdsRow => ({
  campaign: null,
  adset: null,
  ad: null,
  visits: 0,
  orders: 0,
  confirmed: 0,
  delivered: 0,
  returned: 0,
  cancelled: 0,
  revenue: 0,
  delivered_revenue: 0,
  ...p,
});

describe("analyse des pubs", () => {
  it("regroupe par campagne, met à part les commandes sans pub", () => {
    const r = buildAdsReport(
      [
        row({
          campaign: "Promo",
          ad: "Vidéo",
          visits: 100,
          orders: 4,
          confirmed: 3,
          delivered: 2,
          delivered_revenue: 400,
        }),
        row({ campaign: "Promo", ad: "Image", visits: 50, orders: 1, confirmed: 1 }),
        row({ orders: 7 }),
      ],
      { Promo: 200, Ancienne: 50 },
    );
    expect(r.campaigns.map((c) => c.campaign)).toEqual(["Promo", "Ancienne"]);
    expect(r.campaigns[0]).toMatchObject({ visits: 150, orders: 5, delivered: 2, spend: 200 });
    expect(r.campaigns[0].ads.map((a) => a.ad)).toEqual(["Vidéo", "Image"]);
    expect(r.untracked.orders).toBe(7);
    expect(r.total).toMatchObject({ orders: 5, spend: 250 });
  });
  it("coût par livrée et ROAS réel ; rien sans dépense", () => {
    const m = metrics(
      {
        visits: 100,
        orders: 4,
        confirmed: 3,
        delivered: 2,
        returned: 0,
        cancelled: 0,
        revenue: 800,
        delivered_revenue: 400,
      },
      200,
    );
    expect(m.costPerOrder).toBe(50);
    expect(m.costPerDelivered).toBe(100);
    expect(m.roas).toBe(2);
    expect(m.profit).toBe(200);
    expect(
      metrics(
        {
          visits: 0,
          orders: 0,
          confirmed: 0,
          delivered: 0,
          returned: 0,
          cancelled: 0,
          revenue: 0,
          delivered_revenue: 0,
        },
        0,
      ),
    ).toMatchObject({ roas: null, costPerDelivered: null, conversion: null });
  });
  it("UTM : depuis l'URL ou le corps, paramètres Facebook non remplacés ignorés", () => {
    expect(
      utmFrom("https://x.landpro.online/?utm_source=facebook&utm_campaign=Promo%20Oct&utm_content={{ad.name}}"),
    ).toEqual({ utm_source: "facebook", utm_campaign: "Promo Oct" });
    expect(utmFrom({ utm_term: "  Femmes  ", other: "x" })).toEqual({ utm_term: "Femmes" });
    expect(utmFrom("pas une url")).toEqual({});
  });
});
