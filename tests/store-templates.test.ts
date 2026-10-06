// Templates de boutique par séries : registre, réglages initiaux, sections et contenus.
import { describe, expect, it } from "vitest";
import {
  STORE_SERIES,
  STORE_TEMPLATES,
  STORE_TEMPLATE_IDS,
  copyLang,
  fillTokens,
  getStoreTemplate,
  resolveSections,
  sectionContent,
  seedStoreSettings,
  templateSectionKeys,
} from "../lib/store-templates";

const SERIE_1_FOLDERS = [
  "001_DdBNP5wICPa",
  "001_DeCti3rjl8W",
  "002_Ddwt4xeE0Sa",
  "002_DeCjirbGcJC",
  "003_Dd31zZaCmOm",
  "003_Dd4iBljtc_6",
  "004_Ddn4pFNn6Cs",
  "004_DeHNP7KkiEI",
  "005_DdcF78wDlmf",
  "005_DeEJznYDtxU",
  "006_Dc2wwXxDK4O",
  "006_Ddl9Rc9Evrz",
  "007_DdrsY3YGT_3",
  "007_DeES_f3mTpe",
  "008_Dc3YlnbjodC",
];

describe("registre des templates de boutique", () => {
  it("Série 1 : un template par dossier, 15 au total", () => {
    const s1 = STORE_SERIES.find((s) => s.id === 1)!;
    expect(s1.templates).toHaveLength(15);
    expect(s1.templates.map((t) => t.folder)).toEqual(SERIE_1_FOLDERS);
  });

  it("identifiants et noms uniques, au format sN-NN", () => {
    expect(new Set(STORE_TEMPLATE_IDS).size).toBe(STORE_TEMPLATE_IDS.length);
    expect(new Set(STORE_TEMPLATES.map((t) => t.name)).size).toBe(STORE_TEMPLATES.length);
    for (const id of STORE_TEMPLATE_IDS) expect(id).toMatch(/^s\d+-\d{2}$/);
  });

  it("chaque template a des textes complets en français et en arabe", () => {
    for (const t of STORE_TEMPLATES)
      for (const lang of ["fr", "ar"] as const) {
        const c = t.copy[lang];
        for (const k of ["eyebrow", "title", "text", "button", "announcement", "collectionTitle"] as const)
          expect(c[k], `${t.id} ${lang} ${k}`).toBeTruthy();
        expect(c.sections.trust?.items?.length, `${t.id} ${lang} trust`).toBeGreaterThan(0);
        expect(c.sections.newsletter?.title, `${t.id} ${lang} newsletter`).toBeTruthy();
      }
  });

  it("les avis clients ne sont jamais affichés par défaut (à remplir avec de vrais avis)", () => {
    for (const t of STORE_TEMPLATES) {
      expect(t.hiddenByDefault).toContain("testimonials");
      expect(resolveSections(t, seedStoreSettings(t, "fr").sx).hidden.has("testimonials")).toBe(true);
    }
  });

  it("chaque template a sa propre combinaison de carte produit, FAQ, pied de page et pages internes", () => {
    const combos = STORE_TEMPLATES.map((t) =>
      [t.layout.card, t.layout.faq, t.layout.footer, t.layout.shop, t.layout.product, t.layout.page].join("|"),
    );
    expect(new Set(combos).size).toBe(STORE_TEMPLATES.length);
    // chaque variante est utilisée par au moins un template de la série
    const s1 = STORE_SERIES[0].templates;
    expect(new Set(s1.map((t) => t.layout.card)).size).toBe(7);
    expect(new Set(s1.map((t) => t.layout.faq)).size).toBe(5);
    expect(new Set(s1.map((t) => t.layout.footer)).size).toBe(6);
    expect(new Set(s1.map((t) => t.layout.product)).size).toBe(4);
  });

  it("getStoreTemplate refuse les valeurs inconnues", () => {
    expect(getStoreTemplate("s1-01")?.name).toBe("Vision Rouge");
    expect(getStoreTemplate("benchmark-ai")).toBeNull();
    expect(getStoreTemplate(undefined)).toBeNull();
  });
});

describe("réglages et sections", () => {
  const t = getStoreTemplate("s1-11")!;

  it("seedStoreSettings remplit les champs de l'éditeur dans la langue de la boutique", () => {
    const fr = seedStoreSettings(t, "fr");
    expect(fr.storeTemplateId).toBe("s1-11");
    expect(fr.heroTitle).toBe(t.copy.fr.title);
    expect(fr.primary).toBe(t.theme.primary);
    expect(fr.sx.order).toEqual(t.sections);
    expect(fr.faq.length).toBeGreaterThan(0);
    const ar = seedStoreSettings(t, "darija");
    expect(ar.heroTitle).toBe(t.copy.ar.title);
    expect(copyLang("darija")).toBe("ar");
    expect(copyLang("fr")).toBe("fr");
  });

  it("seedStoreSettings garde la FAQ existante et les autres réglages", () => {
    const s = seedStoreSettings(t, "fr", { faq: [{ q: "Q", a: "R" }], selectedProductIds: ["p1"] });
    expect(s.faq).toEqual([{ q: "Q", a: "R" }]);
    expect(s.selectedProductIds).toEqual(["p1"]);
  });

  it("resolveSections : ordre enregistré, sections inconnues ignorées, nouvelles sections ajoutées", () => {
    const { order, hidden } = resolveSections(t, { order: ["faq", "nope", "hero"], hidden: ["faq"] });
    expect(order.slice(0, 2)).toEqual(["faq", "hero"]);
    expect(order).not.toContain("nope");
    expect(new Set(order)).toEqual(new Set(templateSectionKeys(t)));
    expect(hidden.has("faq")).toBe(true);
    // sans réglage : sections masquées par défaut
    expect(resolveSections(t, undefined).hidden.has("testimonials")).toBe(true);
  });

  it("sectionContent : le texte du marchand remplace celui du template, champ par champ", () => {
    const def = sectionContent(t, "fr", "promos", undefined);
    expect(def.items?.length).toBe(2);
    const own = sectionContent(t, "fr", "promos", { content: { promos: { title: "Soldes", items: [] } } });
    expect(own.title).toBe("Soldes");
    expect(own.items).toEqual(def.items); // liste vide = garder celle du template
  });

  it("fillTokens remplace les nombres réels de la boutique", () => {
    expect(fillTokens("{products} produits · {categories} catégories", { products: 12, categories: 3 })).toBe(
      "12 produits · 3 catégories",
    );
  });
});
