export const STORE_PRO_V2_VERSION = "pro-v2" as const;
export type StoreProSectionType =
  "header" | "hero" | "categories" | "products" | "promo" | "offers" | "benefits" | "reviews" | "faq" | "footer";
export type StoreProSection = {
  id: string;
  type: StoreProSectionType;
  variant: string;
  visible: boolean;
  settings?: Record<string, any>;
};
export type StoreProConfig = {
  engine: typeof STORE_PRO_V2_VERSION;
  preset: string;
  design: {
    mode: "light" | "dark";
    radius: number;
    containerWidth: number;
    sectionSpacing: number;
    colors: Record<string, string>;
    effects: { glow: boolean; motion: "none" | "subtle" | "expressive" };
  };
  sections: StoreProSection[];
};
export const MODERN_GLOW_PRESET: StoreProConfig = {
  engine: STORE_PRO_V2_VERSION,
  preset: "modern-glow",
  design: {
    mode: "light",
    radius: 24,
    containerWidth: 1240,
    sectionSpacing: 80,
    colors: {
      primary: "#18181A",
      accent: "#38C976",
      secondary: "#8B6FFB",
      background: "#F8F9FC",
      surface: "#FFFFFF",
      text: "#18181A",
      muted: "#667085",
      border: "#EDEDF2",
      glowPink: "#EB67D0",
      glowGreen: "#38C976",
    },
    effects: { glow: true, motion: "subtle" },
  },
  sections: [
    { id: "pro_header", type: "header", variant: "floating", visible: true },
    { id: "pro_hero", type: "hero", variant: "glow-product", visible: true },
    { id: "pro_categories", type: "categories", variant: "cards", visible: true },
    { id: "pro_products", type: "products", variant: "premium-grid", visible: true },
    { id: "pro_promo", type: "promo", variant: "split-banner", visible: true },
    { id: "pro_offers", type: "offers", variant: "selectable-cards", visible: true },
    { id: "pro_benefits", type: "benefits", variant: "icon-grid", visible: true },
    { id: "pro_reviews", type: "reviews", variant: "ugc", visible: true },
    { id: "pro_faq", type: "faq", variant: "accordion", visible: true },
    { id: "pro_footer", type: "footer", variant: "premium-columns", visible: true },
  ],
};
export function createStoreProV2Config(preset = "modern-glow"): StoreProConfig {
  return structuredClone(MODERN_GLOW_PRESET);
}
export function isStoreProV2(settings: any) {
  return settings?.generatorVersion === STORE_PRO_V2_VERSION || settings?.proV2?.engine === STORE_PRO_V2_VERSION;
}
