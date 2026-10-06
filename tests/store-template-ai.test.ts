// Génération IA à partir des templates de séries : choix du template, structure gardée, repli sur le template.
import { describe, expect, it } from "vitest";
import { getStoreTemplate, resolveSections, sectionContent } from "../lib/store-templates";
import {
  applyTemplateAiContent,
  generateTemplateStore,
  parseJsonReply,
  pickTemplateLocally,
  readTemplateChoice,
  rewriteStoreTexts,
  templateContentPrompt,
  writableSections,
} from "../lib/store-templates/ai";

const t = getStoreTemplate("s2-07")!; // Endurance : stats, rows, swatch…

function fakeReply(locale = "fr") {
  const sections = writableSections(t, locale);
  const out: any = {};
  for (const [k, b] of Object.entries(sections))
    out[k] = {
      ...b,
      title: b.title ? "IA " + k : undefined,
      items: b.items?.map((x, i) => ({ ...x, title: "IA item " + i, value: "999" })),
    };
  return {
    announcement: "Livraison offerte dès 500 DH",
    hero: {
      eyebrow: "Running",
      title: "Courez plus loin chaque jour",
      highlight: "plus loin",
      text: "Texte",
      button: "Acheter",
    },
    collection: { title: "Nos chaussures", subtitle: "" },
    sections: out,
    faq: [
      { q: "Q1", a: "R1" },
      { q: "Q2", a: "R2" },
      { q: "Q3", a: "R3" },
    ],
    delivery: { title: "Livraison", intro: "Partout au Maroc", points: [{ title: "24-48 h", text: "Casablanca" }] },
    contact: { title: "Contact", intro: "Écris-nous" },
    seo: { title: "Endurance Shop", description: "Chaussures de course" },
  };
}

describe("IA sur les templates de séries", () => {
  it("parseJsonReply lit un JSON même entouré de texte ou de ```", () => {
    expect(parseJsonReply('Voici :\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => parseJsonReply("pas de json")).toThrow();
  });

  it("readTemplateChoice n'accepte que des templates existants", () => {
    expect(readTemplateChoice('{"template_id":"s2-10"}')).toBe("s2-10");
    expect(readTemplateChoice('{"template_id":"s9-99"}')).toBeNull();
    expect(readTemplateChoice("n'importe quoi")).toBeNull();
  });

  it("le prompt contient la structure exacte du template et la langue", () => {
    const p = templateContentPrompt(t, { name: "Run Maroc", locale: "darija", brief: "chaussures" });
    expect(p).toContain("Run Maroc");
    expect(p).toContain("darija");
    for (const k of Object.keys(writableSections(t, "darija"))) expect(p).toContain('"' + k + '"');
    expect(Object.keys(writableSections(t, "fr"))).not.toContain("testimonials");
  });

  it("applique les textes en gardant la structure, les valeurs calculées et les sections du template", () => {
    const s = applyTemplateAiContent(t, "fr", fakeReply());
    expect(s.storeTemplateId).toBe(t.id);
    expect(s.heroTitle).toBe("Courez plus loin chaque jour");
    expect(s.heroHighlight).toBe("plus loin");
    expect(s.faq).toHaveLength(3);
    expect(s.deliveryContent.points[0].title).toBe("24-48 h");
    expect(s.brand.seo_title).toBe("Endurance Shop");
    expect(s.sx.order).toEqual(t.sections);
    expect(resolveSections(t, s.sx).hidden.has("testimonials")).toBe(true);
    for (const [k, def] of Object.entries(writableSections(t, "fr"))) {
      const b = sectionContent(t, "fr", k, s.sx);
      expect(b.items?.length || 0).toBe(def.items?.length || 0);
      b.items?.forEach((x, i) => {
        const d = def.items![i];
        if (d.value && /[{#]/.test(d.value)) expect(x.value).toBe(d.value);
      });
    }
  });

  it("réponse incomplète : les textes du template restent", () => {
    const s = applyTemplateAiContent(t, "fr", { hero: { title: "" }, faq: [{ q: "x" }] });
    expect(s.heroTitle).toBe(t.copy.fr.title);
    expect(s.faq.length).toBeGreaterThanOrEqual(3);
    expect(s.heroHighlight).toBe(t.copy.fr.highlight || "");
  });

  it("un mot mis en valeur absent du titre est ignoré", () => {
    const s = applyTemplateAiContent(t, "fr", { hero: { title: "Nouveau titre", highlight: "ailleurs" } });
    expect(s.heroHighlight).toBe("");
  });

  it("generateTemplateStore : l'IA choisit le template puis rédige", async () => {
    const prompts: string[] = [];
    const ask = async (p: string) => {
      prompts.push(p);
      return prompts.length === 1 ? '{"template_id":"s2-07","reason":"chaussures"}' : JSON.stringify(fakeReply());
    };
    const r = await generateTemplateStore(ask, { name: "Run Maroc", locale: "fr", brief: "chaussures de course" });
    expect(r.templateId).toBe("s2-07");
    expect(prompts).toHaveLength(2);
    expect(r.settings.heroTitle).toBe("Courez plus loin chaque jour");
    expect(r.settings.aiBrief).toBe("chaussures de course");
  });

  it("generateTemplateStore : template imposé = un seul appel ; choix invalide = repli local", async () => {
    let calls = 0;
    const one = await generateTemplateStore(async () => (calls++, JSON.stringify(fakeReply())), {
      name: "X",
      locale: "fr",
      templateId: "s1-03",
    });
    expect(one.templateId).toBe("s1-03");
    expect(calls).toBe(1);
    const fallback = await generateTemplateStore(
      async (p) => (p.includes("Templates disponibles") ? '{"template_id":"zzz"}' : "{}"),
      { name: "Restaurant Dar", locale: "fr", brief: "restaurant plats" },
    );
    expect(getStoreTemplate(fallback.templateId)).toBeTruthy();
  });

  it("pickTemplateLocally trouve une niche proche", () => {
    expect(pickTemplateLocally({ name: "Golf Club", locale: "fr", brief: "golf" }).niche.toLowerCase()).toContain(
      "golf",
    );
  });

  it("rewriteStoreTexts garde le design, l'ordre, les images et les blocs personnalisés", () => {
    const settings: any = {
      storeTemplateId: t.id,
      primary: "#123456",
      headingFont: "Lato",
      logo: "logo.png",
      sx: {
        order: ["hero", "custom:b1", ...t.sections.filter((x) => x !== "hero")],
        hidden: ["faq"],
        layout: { card: "tinted" },
        content: { rows: { items: [{ title: "old", image: "img.jpg" }] }, "promos~2": { title: "copie" } },
      },
    };
    const out = rewriteStoreTexts(t, "fr", fakeReply(), settings);
    expect(out.primary).toBe("#123456");
    expect(out.headingFont).toBe("Lato");
    expect(out.logo).toBe("logo.png");
    expect(out.sx.order).toEqual(settings.sx.order);
    expect(out.sx.hidden).toEqual(["faq"]);
    expect(out.sx.layout).toEqual({ card: "tinted" });
    expect(out.sx.content["promos~2"]).toEqual({ title: "copie" });
    if (t.sections.includes("rows")) expect(out.sx.content.rows.items[0].image).toBe("img.jpg");
    expect(out.heroTitle).toBe("Courez plus loin chaque jour");
  });
});
