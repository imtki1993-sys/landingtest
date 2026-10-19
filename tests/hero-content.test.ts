// Contenu du hero réglable dans l'éditeur : textes, avantages, éléments affichés.
import { describe, expect, it } from "vitest";
import { buildVM } from "../components/landpro/model";

const base = { name: "Montre", locale: "fr-MA", price: 299, images: [] } as any;
const vm = (content: Record<string, unknown>) =>
  buildVM({ ...base, content: { landing_template_id: "cod-direct", ...content } });

describe("contenu du hero", () => {
  it("mot mis en valeur sur une vraie page", () => {
    expect(vm({ headline: "Montre Orbite 360", hero_highlight: "Orbite" }).highlight).toBe("Orbite");
    expect(vm({ headline: "Montre" }).highlight).toBeUndefined();
  });
  it("avantages du hero : une ligne par avantage, sinon ceux de la section Confiance", () => {
    const a = vm({ hero_trust: "Livraison 24 h\n\n Paiement cash " });
    expect(a.hero.trust).toEqual(["Livraison 24 h", "Paiement cash"]);
    expect(a.hero.trustCustom).toBe(true);
    const b = vm({ trust_points: ["Garantie 1 an"] });
    expect(b.hero.trust).toEqual(b.trust);
    expect(b.hero.trustCustom).toBe(false);
  });
  it("accroche, bouton secondaire, nom du produit et éléments masqués", () => {
    const v = vm({
      hero_kicker: "Vente flash",
      hero_cta2_text: "Voir les avis",
      hero_cta2_target: "reviews",
      product_name: "Orbite 360",
      hero_show_trust: false,
      hero_show_cta2: false,
    });
    expect(v.hero.kicker).toBe("Vente flash");
    expect([v.hero.cta2, v.hero.cta2Target]).toEqual(["Voir les avis", "reviews"]);
    expect(v.name).toBe("Orbite 360");
    expect([v.show.trust, v.show.cta2, v.show.rating, v.show.kicker]).toEqual([false, false, true, true]);
  });
});
