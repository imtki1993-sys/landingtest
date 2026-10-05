import { BENCHMARK_TEMPLATE_BLUEPRINTS, type BenchmarkTemplateRuntime } from "./benchmark-template-registry";
import { STORE_BENCHMARK_NICHES, STORE_BENCHMARK_CATEGORIES, getStoreBenchmarkNiche } from "./store-benchmark-niches";

export type LandingBenchmarkBlueprint = {
  id: string;
  referencePath: string;
  hero: BenchmarkTemplateRuntime["hero"];
  cards: BenchmarkTemplateRuntime["productCard"];
  trust: BenchmarkTemplateRuntime["trust"];
  sections: string[];
  header: BenchmarkTemplateRuntime["header"];
  footer: BenchmarkTemplateRuntime["footer"];
};
export const LANDING_BENCHMARK_NICHES = STORE_BENCHMARK_NICHES;
export const LANDING_BENCHMARK_CATEGORIES = STORE_BENCHMARK_CATEGORIES;
export function getLandingBenchmarkNiche(id: string) {
  return getStoreBenchmarkNiche(id);
}
export function getLandingBenchmarkBlueprint(id: string): LandingBenchmarkBlueprint | null {
  const r = BENCHMARK_TEMPLATE_BLUEPRINTS[id];
  const n = getStoreBenchmarkNiche(id);
  if (!r || !n) return null;
  const sections = [
    "hero",
    ...r.sections
      .filter((x) => x !== "hero" && x !== "products" && x !== "about")
      .map((x) => (x === "benefits" ? "benefits" : x)),
    "features",
    "order",
    "faq",
  ];
  return {
    id,
    referencePath: n.referencePath,
    hero: r.hero,
    cards: r.productCard,
    trust: r.trust,
    header: r.header,
    footer: r.footer,
    sections: Array.from(new Set(sections)),
  };
}
