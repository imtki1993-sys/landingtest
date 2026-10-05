export type BuilderV3Block = { id: string; type: string; visible: boolean; props: Record<string, any> };
export type BuilderV3Document = {
  version: 3;
  designSystem: any;
  blocks: BuilderV3Block[];
  viewport: "desktop" | "tablet" | "mobile";
};
const builtins = ["hero", "order", "benefits", "problem", "features", "how", "trust", "faq"];
export const BUILDER_V3_VERSION = 3;
export const BUILDER_BREAKPOINTS = { desktop: 1440, tablet: 768, mobile: 390 } as const;
export function createBuilderV3(content: any = {}): BuilderV3Document {
  const order = Array.isArray(content.section_order) ? content.section_order : builtins,
    hidden = new Set(Array.isArray(content.hidden_sections) ? content.hidden_sections : []),
    custom = content.custom_sections || {};
  return {
    version: BUILDER_V3_VERSION,
    designSystem: content.design_system || {},
    viewport: "desktop",
    blocks: order.map((id: string) => ({
      id,
      type: id.startsWith("custom-") ? custom[id]?.type || "text" : id,
      visible: !hidden.has(id),
      props: id.startsWith("custom-") ? { ...custom[id] } : {},
    })),
  };
}
export function normalizeBuilderV3Content(content: any = {}) {
  const c = { ...content };
  return {
    ...c,
    builder_v3: { version: BUILDER_V3_VERSION },
    design_system:
      c.design_system && typeof c.design_system === "object" ? c.design_system : { source: "landpro/builder-v3" },
    section_order: Array.isArray(c.section_order) ? c.section_order : builtins,
    hidden_sections: Array.isArray(c.hidden_sections) ? c.hidden_sections : [],
    custom_sections: c.custom_sections && typeof c.custom_sections === "object" ? c.custom_sections : {},
    section_styles: c.section_styles && typeof c.section_styles === "object" ? c.section_styles : {},
    quantity_offers: Array.isArray(c.quantity_offers) ? c.quantity_offers : [],
  };
}
export function isBuilderV3(content: any) {
  return (
    content?.builder_v3?.version === BUILDER_V3_VERSION ||
    content?.design_system?.source === "nextlevelbuilder/ui-ux-pro-max-skill" ||
    content?.design_system?.source === "landpro/builder-v3"
  );
}
