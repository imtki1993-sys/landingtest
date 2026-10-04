// Adaptateur : expose les 60 templates LandPro avec l'interface historique
// (utilisée par la création de page, l'API /api/pages et la galerie).
// La source de vérité est components/landpro/registry.ts.
import { TEMPLATES, defaultSectionOrder, getTemplate } from "../components/landpro/registry";

export type LandingTemplatePreset = {
  id: string;
  number: number;
  name: string;
  category: string;
  description: string;
  pattern: string;
  formStyle: "classic" | "compact" | "cards" | "premium";
  sectionOrder: string[];
  accent: string;
  dark?: boolean;
  visualFamily?: string;
  locale?: string;
};

const formStyleFor = (variant: string): LandingTemplatePreset["formStyle"] =>
  variant === "luxury" || variant === "editorial" ? "premium" : variant === "oneScreen" || variant === "flash" ? "compact" : variant === "marketplace" ? "cards" : "classic";

export const LANDING_TEMPLATE_PRESETS: LandingTemplatePreset[] = TEMPLATES.map((t) => ({
  id: t.id,
  number: t.number,
  name: t.name,
  category: t.category,
  description: t.description,
  pattern: t.hero.variant,
  formStyle: formStyleFor(t.hero.variant),
  sectionOrder: defaultSectionOrder(t),
  accent: t.theme.primary,
  dark: t.theme.dark,
  visualFamily: "landpro",
  locale: t.lang === "ar" ? "ar-MA" : "fr",
}));

export const LANDING_TEMPLATE_CATEGORIES = ["Tous", ...Array.from(new Set(LANDING_TEMPLATE_PRESETS.map((x) => x.category)))];

export const landingTemplate = (id: string): LandingTemplatePreset => {
  const t = getTemplate(id);
  return LANDING_TEMPLATE_PRESETS.find((x) => x.id === t.id) || LANDING_TEMPLATE_PRESETS[0];
};
