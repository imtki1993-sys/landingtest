// Modèle de rendu : comment le contenu d'une page alimente les sections.
import { describe, expect, it } from "vitest";
import { buildVM, toItem } from "../components/landpro/model";

const page = (content: any = {}, extra: any = {}) => ({
  templateId: "cod-direct",
  name: "Support S11",
  price: 199,
  content,
  ...extra,
});

describe("ordre et visibilité des sections", () => {
  it("suit section_order enregistré par l'éditeur", () => {
    const vm = buildVM(page({ section_order: ["hero", "faq", "order", "benefits"] }));
    expect(vm.order).toEqual(["hero", "faq", "order", "benefits"]);
  });

  it("ajoute toujours le hero et le formulaire, et ignore les sections inconnues", () => {
    const vm = buildVM(page({ section_order: ["faq", "section-inexistante"] }));
    expect(vm.order).toEqual(["hero", "faq", "order"]);
  });

  it("garde les blocs personnalisés existants", () => {
    const vm = buildVM(
      page({
        section_order: ["hero", "custom-1", "order"],
        custom_sections: { "custom-1": { type: "text", title: "T" } },
      }),
    );
    expect(vm.order).toContain("custom-1");
  });

  it("utilise l'ordre par défaut du template si rien n'est enregistré", () => {
    expect(buildVM(page()).order[0]).toBe("hero");
  });

  it("transmet les sections masquées", () => {
    expect(buildVM(page({ hidden_sections: ["faq"] })).hidden.has("faq")).toBe(true);
  });
});

describe("contenu", () => {
  it("n'invente jamais d'avis sur une vraie page", () => {
    expect(buildVM(page()).reviews).toEqual([]);
  });

  it("remplit les avis seulement en mode démonstration (galerie)", () => {
    expect(buildVM(page(), { demo: true }).reviews.length).toBeGreaterThan(0);
  });

  it("propose 1, 2 et 3 pièces au prix du produit par défaut", () => {
    expect(buildVM(page()).offers.map((o) => [o.qty, o.price])).toEqual([
      [1, 199],
      [2, 398],
      [3, 597],
    ]);
  });

  it("traduit oui / non du comparatif en ✓ / ✕", () => {
    const vm = buildVM(page({ comparison_rows: [{ label: "Charge 15W", us: "oui", them: "non" }] }));
    expect(vm.comparison[0]).toMatchObject({ us: "✓", them: "✕" });
  });

  it("nettoie le numéro WhatsApp", () => {
    expect(buildVM(page({}, { whatsappPhone: "+212 6 00-00 00 00" })).whatsapp).toBe("212600000000");
  });

  it("passe en arabe et en RTL selon la langue de la page", () => {
    const vm = buildVM(page({}, { locale: "ar-MA" }));
    expect(vm.rtl).toBe(true);
    expect(vm.lang).toBe("ar");
  });
});

describe("toItem", () => {
  it("découpe « Titre : texte »", () => {
    expect(toItem("Charge rapide : 15W sans fil", 0)).toMatchObject({ title: "Charge rapide", text: "15W sans fil" });
  });
  it("reprend l'emoji de tête comme icône", () => {
    expect(toItem("⚡ Rapide", 0)).toMatchObject({ icon: "⚡", title: "Rapide" });
  });
});
