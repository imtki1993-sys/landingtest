// Templates de boutique par séries : registre, réglages initiaux, sections et contenus.
import { describe, expect, it } from "vitest";
import {
  OVERLAY_HEROES,
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

const SERIE_2_FOLDERS = [
  "16_Home arch",
  "17_Cousmi hand",
  "18_Sport",
  "19_Conference",
  "20_architc",
  "21_Fitness",
  "22_Shoes",
  "23_cloth",
  "24_Cosmi Bio",
  "25_Restaurant",
  "26_Cousmi pro",
  "27_Golf",
  "28_cousmitique",
  "29_Bio Tch",
  "30_Golfio",
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
      [
        t.layout.header,
        t.layout.card,
        t.layout.faq,
        t.layout.footer,
        t.layout.shop,
        t.layout.product,
        t.layout.page,
      ].join("|"),
    );
    expect(new Set(combos).size).toBe(STORE_TEMPLATES.length);
    // chaque variante est utilisée par au moins un template de la série
    const s1 = STORE_SERIES[0].templates;
    expect(new Set(s1.map((t) => t.layout.header)).size).toBe(9);
    expect(new Set(s1.map((t) => t.layout.card)).size).toBe(7);
    expect(new Set(s1.map((t) => t.layout.faq)).size).toBe(5);
    expect(new Set(s1.map((t) => t.layout.footer)).size).toBe(6);
    expect(new Set(s1.map((t) => t.layout.product)).size).toBe(4);
  });

  it("Série 2 : un template par dossier, chacun avec son propre hero", () => {
    const s2 = STORE_SERIES.find((s) => s.id === 2)!;
    expect(s2.templates.map((t) => t.folder)).toEqual(SERIE_2_FOLDERS);
    expect(s2.templates.every((t) => t.series === 2 && t.id.startsWith("s2-"))).toBe(true);
    expect(new Set(s2.templates.map((t) => t.hero)).size).toBe(15);
    // aucun hero ni nom partagé avec la Série 1
    const s1 = STORE_SERIES.find((s) => s.id === 1)!.templates;
    for (const t of s2.templates) expect(s1.some((o) => o.hero === t.hero)).toBe(false);
  });

  it("Série 2 : les nouvelles sections ont un contenu dans les deux langues", () => {
    const s2 = STORE_SERIES.find((s) => s.id === 2)!.templates;
    for (const type of ["marquee", "bento", "rows", "spotlight"] as const) {
      const users = s2.filter((t) => t.sections.includes(type));
      expect(users.length, type).toBeGreaterThan(0);
      for (const t of users)
        for (const lang of ["fr", "ar"] as const) {
          const c = sectionContent(t, lang, type, undefined);
          expect(c.title || c.items?.length, `${t.id} ${lang} ${type}`).toBeTruthy();
        }
    }
  });

  it("Série 3 : 20 templates, chacun avec son hero, sa carte produit et ses catégories", () => {
    const s3 = STORE_SERIES.find((s) => s.id === 3)!.templates;
    expect(s3).toHaveLength(20);
    expect(s3.every((t, i) => t.series === 3 && t.id === "s3-" + String(i + 1).padStart(2, "0"))).toBe(true);
    expect(new Set(s3.map((t) => t.folder)).size).toBe(20);
    expect(new Set(s3.map((t) => t.hero)).size).toBe(20);
    // aucun hero partagé avec les autres séries
    const others = STORE_TEMPLATES.filter((t) => t.series !== 3);
    for (const t of s3)
      expect(
        others.some((o) => o.hero === t.hero),
        t.id,
      ).toBe(false);
    // les en-têtes superposés ne sont utilisés qu'avec un hero photo/sombre prévu pour
    for (const t of s3) if (t.header === "overlay") expect(OVERLAY_HEROES.has(t.hero), t.id).toBe(true);
  });

  it("Série 3 : les nouvelles sections ont un contenu dans les deux langues", () => {
    const s3 = STORE_SERIES.find((s) => s.id === 3)!.templates;
    for (const type of ["deals", "mosaic", "specs", "gallery"] as const) {
      const users = s3.filter((t) => t.sections.includes(type));
      expect(users.length, type).toBeGreaterThan(0);
      for (const t of users)
        for (const lang of ["fr", "ar"] as const) {
          const c = sectionContent(t, lang, type, undefined);
          expect(c.title || c.items?.length, `${t.id} ${lang} ${type}`).toBeTruthy();
          if (type === "mosaic" || type === "specs")
            expect(c.items?.length, `${t.id} ${lang} ${type}`).toBeGreaterThan(0);
        }
    }
  });

  it("template sur mesure École Vive : cartes du hero, sections propres, textes FR + AR", () => {
    const t = getStoreTemplate("s90-01")!;
    expect(t.hero).toBe("school");
    expect(t.sections).toEqual(expect.arrayContaining(["features", "photostats"]));
    expect(seedStoreSettings(t, "fr").showAnnouncement).toBe(false);
    for (const lang of ["fr", "ar"] as const) {
      expect(sectionContent(t, lang, "hero", undefined).items).toHaveLength(2);
      expect(sectionContent(t, lang, "features", undefined).items).toHaveLength(3);
      expect(sectionContent(t, lang, "photostats", undefined).items?.length).toBeGreaterThan(0);
    }
  });

  it("templates sur mesure Clé Lime et Sourire Clair : heros et sections propres", () => {
    const lime = getStoreTemplate("s90-02")!;
    const smile = getStoreTemplate("s90-03")!;
    expect([lime.hero, smile.hero]).toEqual(["estate", "clinic"]);
    expect(lime.sections).toEqual(expect.arrayContaining(["statement", "services"]));
    expect(smile.sections).toEqual(expect.arrayContaining(["statement", "expert", "highlights"]));
    for (const t of [lime, smile])
      for (const lang of ["fr", "ar"] as const)
        for (const k of t.sections.filter(
          (x) => !["hero", "products", "faq", "testimonials", "categories"].includes(x),
        ))
          expect(
            sectionContent(t, lang, k, undefined).items?.length || sectionContent(t, lang, k, undefined).title,
            `${t.id} ${lang} ${k}`,
          ).toBeTruthy();
  });

  it("templates sur mesure Détail Rouge et Bande Rouge : heros, sections, en-têtes et pieds de page propres", () => {
    const kicks = getStoreTemplate("s90-04")!;
    const studds = getStoreTemplate("s90-05")!;
    expect(kicks.hero).toBe("kicks");
    expect(studds.hero).toBe("studds");
    expect(kicks.layout).toMatchObject({ header: "kicks", card: "kicks", footer: "kicks" });
    expect(studds.layout).toMatchObject({ header: "studds", card: "studds", footer: "studds" });
    expect(kicks.sections).toContain("zigzag");
    expect(studds.sections).toEqual(expect.arrayContaining(["welcome", "shelf", "filmstrip", "coverflow"]));
    for (const lang of ["fr", "ar"] as const) {
      expect(sectionContent(kicks, lang, "zigzag", undefined).items).toHaveLength(3);
      expect(sectionContent(kicks, lang, "zigzag", undefined).button).toBeTruthy();
      expect(sectionContent(studds, lang, "hero", undefined).items?.[0]?.title).toBeTruthy();
      expect(sectionContent(studds, lang, "welcome", undefined).items?.[0]?.text).toBeTruthy();
      expect(sectionContent(studds, lang, "shelf", undefined).title).toBeTruthy();
      expect(sectionContent(studds, lang, "filmstrip", undefined).button).toBeTruthy();
    }
    // lien vidéo modifiable par le marchand
    const sx = { content: { filmstrip: { url: "https://youtu.be/x" } } };
    expect(sectionContent(studds, "fr", "filmstrip", sx).url).toBe("https://youtu.be/x");
  });

  it("section Carte & adresse : disponible partout, textes FR + AR, adresse modifiable", () => {
    const t = getStoreTemplate("s1-01")!;
    for (const lang of ["fr", "ar"] as const) expect(sectionContent(t, lang, "map", undefined).title).toBeTruthy();
    const own = sectionContent(t, "fr", "map", { content: { map: { address: "Casablanca" } } });
    expect(own.address).toBe("Casablanca");
    expect(getStoreTemplate("s90-02")!.sections).toContain("map");
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
    expect(order.slice(0, 2)).toEqual(["hero", "faq"]); // le hero reste en tête
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
