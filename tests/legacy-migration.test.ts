// Bascule automatique des anciennes pages vers les templates LandPro.
import { describe, expect, it } from "vitest";
import {
  adaptLegacyContent,
  LEGACY_THEME_TEMPLATES,
  resolvePageTemplate,
  toTemplateData,
  usableBrandColor,
} from "../components/landpro/legacy";
import { TEMPLATES } from "../components/landpro/registry";
import { buildVM } from "../components/landpro/model";

const ids = new Set(TEMPLATES.map((t) => t.id));

describe("choix du template", () => {
  it("chaque ancien thème correspond à un template existant", () => {
    for (const [theme, id] of Object.entries(LEGACY_THEME_TEMPLATES)) expect(ids.has(id), theme).toBe(true);
  });

  it("ancienne page : template d'après son thème, marquée legacy", () => {
    expect(resolvePageTemplate({ visual_theme: "cod-beauty" })).toEqual({ templateId: "beauty-glow", legacy: true });
    expect(resolvePageTemplate({})).toEqual({ templateId: "cod-direct", legacy: true });
  });

  it("page LandPro : template conservé, pas de conversion", () => {
    expect(resolvePageTemplate({ landing_template_id: "luxury-black", visual_theme: "cod-beauty" })).toEqual({
      templateId: "luxury-black",
      legacy: false,
    });
  });

  it("identifiant inconnu déjà rendu par LandPro (ex. cod-s11) : bon template, sans conversion", () => {
    expect(resolvePageTemplate({ landing_template_id: "cod-s11" })).toEqual({
      templateId: "cod-direct",
      legacy: false,
    });
    expect(resolvePageTemplate({ landing_template_id: "style-inconnu", visual_theme: "cod-luxury" })).toEqual({
      templateId: "luxury-black",
      legacy: false,
    });
  });
});

describe("conversion du contenu", () => {
  const legacy = {
    headline: "Titre",
    benefits: ["A", "B"],
    problem_text: "Le problème",
    hero_video: "https://youtu.be/abc123xyz",
    design_system: { tokens: { colors: { primary: "#0b5d3b" } } },
  };

  it("garde la structure de l'ancien moteur quand aucune n'est enregistrée", () => {
    expect(adaptLegacyContent(legacy).section_order).toEqual(["hero", "order", "benefits", "features", "trust", "faq"]);
    expect(adaptLegacyContent({ section_order: ["hero", "faq", "order"] }).section_order).toEqual([
      "hero",
      "faq",
      "order",
    ]);
  });

  it("traduit les champs propres à l'ancien moteur", () => {
    const c = adaptLegacyContent(legacy, { hasWhatsapp: true });
    expect(c.problem).toBe("Le problème");
    expect(c.video_url).toBe("https://youtu.be/abc123xyz");
    expect(c.order_mode).toBe("both");
    expect(c.theme_primary).toBe("#0b5d3b");
    expect(c.headline).toBe("Titre");
  });

  it("ne remplace jamais une valeur déjà présente", () => {
    const c = adaptLegacyContent(
      { ...legacy, problem: "P", order_mode: "form", theme_primary: "#111111" },
      { hasWhatsapp: true },
    );
    expect(c).toMatchObject({ problem: "P", order_mode: "form", theme_primary: "#111111" });
  });

  it("respecte la désactivation du bouton WhatsApp", () => {
    expect(adaptLegacyContent({ order_whatsapp: false }, { hasWhatsapp: true }).order_mode).toBeUndefined();
  });

  it("ignore une couleur de marque illisible sur des boutons blancs", () => {
    expect(usableBrandColor("#f5f5f5")).toBe("");
    expect(usableBrandColor("#16a34a")).toBe("#16a34a");
    expect(usableBrandColor("pas-une-couleur")).toBe("");
  });

  it("met les photos dédiées du hero en premier, sans doublon", () => {
    const { data } = toTemplateData({ content: { hero_images: ["h.jpg", "a.jpg"] }, images: ["a.jpg", "b.jpg"] });
    expect(data.images).toEqual(["h.jpg", "a.jpg", "b.jpg"]);
  });
});

describe("livraison et commande", () => {
  const page = (content: any, extra: any = {}) => ({
    templateId: "cod-direct",
    name: "P",
    price: 199,
    content,
    ...extra,
  });

  it("frais de livraison : ajoutés au modèle, plus de « Livraison gratuite » par défaut", () => {
    const vm = buildVM(page({ delivery_price: 30 }));
    expect(vm.shipping).toBe(30);
    expect(vm.trust[0]).not.toMatch(/gratuite/i);
    expect(vm.delivery).not.toMatch(/gratuite/i);
  });

  it("livraison gratuite par défaut", () => {
    expect(buildVM(page({})).trust[0]).toMatch(/gratuite/i);
  });

  it("sans numéro WhatsApp, le formulaire reste disponible", () => {
    expect(buildVM(page({ order_mode: "whatsapp" })).orderMode).toBe("form");
    expect(buildVM(page({ order_mode: "whatsapp" }, { whatsappPhone: "212600000000" })).orderMode).toBe("whatsapp");
  });
});
