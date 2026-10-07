// ─────────────────────────────────────────────────────────────
// LandPro – moteur de templates : types partagés
// Un template = un thème (couleurs, typo) + un hero + une liste
// ordonnée de sections. L'ordre réel affiché vient de
// content.section_order (modifiable dans l'éditeur).
// ─────────────────────────────────────────────────────────────

export type FontKey = "sans" | "grotesk" | "serif" | "elegant" | "condensed" | "display" | "tech" | "arabic";

export interface Theme {
  dark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  heroBg?: string;
  radius: number;
  font: FontKey;
  heading: FontKey;
  headingWeight?: number;
  uppercaseHeadings?: boolean;
  glow?: boolean;
}

export type HeroVariant =
  | "split"
  | "centered"
  | "fullbleed"
  | "luxury"
  | "ugc"
  | "problem"
  | "flash"
  | "video"
  | "beforeAfter"
  | "whatsapp"
  | "editorial"
  | "neon"
  | "sport"
  | "marketplace"
  | "minimal"
  | "oneScreen"
  // Designs sur mesure (components/landpro/designs) : hero propre au template
  | "design";

/** Sections natives de l'éditeur (déjà connues de BuilderV3). */
export const CORE_SECTIONS = ["hero", "order", "benefits", "problem", "features", "how", "trust", "faq"] as const;

/** Sections ajoutées par le moteur LandPro. */
export const LANDPRO_SECTIONS = [
  "announcement",
  "showcase",
  "story",
  "before_after",
  "stats",
  "ugc",
  "reviews",
  "comparison",
  "specs",
  "variants",
  "offers",
  "countdown",
  "video",
  "whatsapp",
  "guarantee",
  "final_cta",
] as const;

export type CoreSection = (typeof CORE_SECTIONS)[number];
export type LandproSection = (typeof LANDPRO_SECTIONS)[number];
export type SectionKey = CoreSection | LandproSection;

export interface TemplateDef {
  number: number;
  id: string;
  name: string;
  category: string;
  description: string;
  lang: "fr" | "ar";
  demoProduct: string;
  theme: Theme;
  hero: {
    variant: HeroVariant;
    eyebrow?: string;
    title: string;
    highlight?: string;
    subtitle?: string;
    badge?: string;
  };
  sections: SectionKey[]; // sans "hero" : il est toujours ajouté en tête
  /** titres par défaut des sections propres au template (sinon : titres génériques) */
  titles?: Partial<Record<SectionKey, string>>;
  options?: { countdownMinutes?: number; orderMode?: "form" | "whatsapp" | "both"; announcement?: string };
}

export type LandingV4Data = {
  templateId: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number | string;
  images?: string[];
  content?: any;
  locale?: string;
  whatsappPhone?: string;
};
