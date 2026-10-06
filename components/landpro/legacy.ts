// ─────────────────────────────────────────────────────────────
// Bascule automatique des anciennes landing pages vers les templates LandPro.
// Une ancienne page (sans landing_template_id valide) est affichée avec le
// template le plus proche de son ancien thème (visual_theme). Son contenu est
// conservé tel quel ; seuls quelques champs propres à l'ancien moteur sont
// traduits vers leurs équivalents LandPro. Rien n'est réécrit en base : la
// conversion se fait à l'affichage, et l'enregistrement dans l'éditeur fige
// simplement le template choisi.
// ─────────────────────────────────────────────────────────────
import { getTemplate, resolveTemplateId, TEMPLATES } from "./registry";

/** Ancien thème (visual_theme / builder_template) → template LandPro. */
export const LEGACY_THEME_TEMPLATES: Record<string, string> = {
  "cod-s11": "cod-direct",
  "cod-auto-moto": "auto-gear",
  "cod-electronics": "tech-gadget",
  "cod-beauty": "beauty-glow",
  "cod-health": "health-trust",
  "cod-home": "home-solution",
  "cod-fashion": "fashion-editorial",
  "cod-sport": "sport-drop",
  "cod-kids": "benefit-cards",
  "cod-luxury": "luxury-black",
  "cod-decor": "home-makeover",
  general: "cod-direct",
};
export const DEFAULT_LEGACY_TEMPLATE = "cod-direct";

/** Ordre des sections de l'ancien moteur quand la page n'en avait pas enregistré. */
const LEGACY_DEFAULT_ORDER = ["hero", "order", "benefits", "features", "trust", "faq"];

const KNOWN = new Set(TEMPLATES.map((t) => t.id));
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Identifiant LandPro valide, ou "" si la valeur n'en désigne aucun. */
function asTemplate(v: unknown): string {
  const raw = str(v);
  if (!raw) return "";
  if (LEGACY_THEME_TEMPLATES[raw]) return LEGACY_THEME_TEMPLATES[raw];
  const id = resolveTemplateId(raw);
  return KNOWN.has(id) ? id : "";
}

/**
 * Template à utiliser pour une page, et si elle vient de l'ancien moteur.
 * - legacy = aucune valeur dans landing_template_id : la page était rendue par
 *   l'ancien moteur ; son contenu est traduit (adaptLegacyContent).
 * - landing_template_id présent mais inconnu (ex. "cod-s11") : la page est déjà
 *   rendue par LandPro depuis la PR #4 ; on lui donne simplement le bon template.
 */
export function resolvePageTemplate(c: any = {}): { templateId: string; legacy: boolean } {
  const legacy = !str(c.landing_template_id);
  const templateId =
    asTemplate(c.landing_template_id) ||
    asTemplate(c.visual_theme) ||
    asTemplate(c.builder_template) ||
    asTemplate(c.design_profile) ||
    DEFAULT_LEGACY_TEMPLATE;
  return { templateId, legacy };
}

/** Luminance relative (WCAG) d'une couleur #rrggbb. */
function luminance(hex: string): number | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Couleur utilisable pour des boutons à texte blanc (contraste ≥ 3:1). */
export function usableBrandColor(hex: unknown): string {
  const v = str(hex);
  const l = luminance(v);
  if (l === null) return "";
  return 1.05 / (l + 0.05) >= 3 ? (v.startsWith("#") ? v : "#" + v) : "";
}

/**
 * Contenu d'une ancienne page traduit pour le moteur LandPro.
 * Ne modifie que ce que LandPro lit différemment ; ne remplace jamais une
 * valeur LandPro déjà présente.
 */
export function adaptLegacyContent(c: any = {}, opts: { hasWhatsapp?: boolean } = {}): any {
  const out: any = { ...c };
  const ds = c.design_system || {};

  // Structure : celle enregistrée, sinon celle du design system, sinon l'ancien défaut.
  if (!Array.isArray(c.section_order) || !c.section_order.length) {
    const blueprint = Array.isArray(ds.blueprint?.sections) ? ds.blueprint.sections : [];
    out.section_order = blueprint.length ? blueprint : LEGACY_DEFAULT_ORDER;
  }
  // Problème : ancien champ problem_text
  if (!str(c.problem) && str(c.problem_text)) out.problem = c.problem_text;
  // Vidéo du hero
  if (!str(c.video_url) && str(c.hero_video)) out.video_url = c.hero_video;
  // Bouton WhatsApp : affiché par défaut dans l'ancien formulaire dès qu'un numéro existe
  if (!c.order_mode && opts.hasWhatsapp && c.order_whatsapp !== false) out.order_mode = "both";
  // Couleur de marque, seulement si elle reste lisible sur les boutons
  if (!str(c.theme_primary)) {
    const brand = usableBrandColor(ds.tokens?.colors?.primary) || usableBrandColor(c.landing_template_accent);
    if (brand) out.theme_primary = brand;
  }
  return out;
}

/** Photos du hero : les photos dédiées de l'ancien moteur passent en premier. */
export function legacyImages(c: any = {}, images: string[] = []): string[] {
  const hero = Array.isArray(c.hero_images) ? c.hero_images.filter((x: unknown) => typeof x === "string" && x) : [];
  return Array.from(new Set([...hero, ...images]));
}

/** Données prêtes pour LandingTemplateV4, que la page soit ancienne ou LandPro. */
export function toTemplateData(data: any, locale?: string) {
  const c = data?.content || {};
  const { templateId, legacy } = resolvePageTemplate(c);
  const images = Array.isArray(data?.images) ? data.images : [];
  const whatsappPhone = String(data?.whatsappPhone || "").replace(/\D/g, "");
  return {
    legacy,
    template: getTemplate(templateId),
    data: {
      templateId,
      name: data?.name || "",
      description: c.description || "",
      price: Number(data?.price || 0),
      oldPrice: data?.oldPrice || data?.compare_at_price || "",
      images: legacy ? legacyImages(c, images) : images,
      content: legacy ? adaptLegacyContent(c, { hasWhatsapp: !!whatsappPhone }) : c,
      locale: locale ?? data?.locale,
      whatsappPhone,
    },
  };
}
