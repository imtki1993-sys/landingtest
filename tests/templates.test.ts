// Les 60 templates et leur adaptateur historique (création de page, /api/pages, galerie).
import { describe, expect, it } from "vitest";
import { TEMPLATES, getTemplate, resolveTemplateId, TEMPLATE_ALIASES } from "../components/landpro/registry";
import { LANDING_TEMPLATE_PRESETS, landingTemplate } from "../lib/landing-template-presets";

describe("registre des templates", () => {
  it("contient 60 templates numérotés de 1 à 60, aux identifiants uniques", () => {
    expect(TEMPLATES).toHaveLength(60);
    expect(TEMPLATES.map((t) => t.number)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1));
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(60);
  });

  it("conserve les identifiants déjà enregistrés dans les pages existantes", () => {
    for (const id of [
      "cod-direct",
      "premium-product",
      "luxury-black",
      "arabic-cod",
      "darija-morocco",
      "conversion-max",
      "gaming-neon",
    ])
      expect(getTemplate(id).id).toBe(id);
  });

  it("redirige les anciens identifiants de marques", () => {
    for (const [old, now] of Object.entries(TEMPLATE_ALIASES)) {
      expect(resolveTemplateId(old)).toBe(now);
      expect(getTemplate(old).id).toBe(now);
    }
  });

  it("chaque template a un formulaire de commande", () => {
    for (const t of TEMPLATES) expect(t.sections, t.id).toContain("order");
  });

  it("un identifiant inconnu retombe sur le template 01", () => {
    expect(getTemplate("inconnu").number).toBe(1);
  });
});

describe("adaptateur landing-template-presets", () => {
  it("expose les 60 templates avec un ordre de sections commençant par le hero", () => {
    expect(LANDING_TEMPLATE_PRESETS).toHaveLength(60);
    for (const p of LANDING_TEMPLATE_PRESETS) {
      expect(p.sectionOrder[0], p.id).toBe("hero");
      expect(p.sectionOrder, p.id).toContain("order");
    }
  });

  it("landingTemplate() accepte aussi les anciens identifiants", () => {
    expect(landingTemplate("apple-product").id).toBe("pro-device-launch");
  });
});
