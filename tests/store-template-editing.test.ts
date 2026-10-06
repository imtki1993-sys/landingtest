// Éditeur des templates de boutique : sections (copies, blocs personnalisés,
// suppression), mise en page à la carte et retour au style du template.
import { describe, expect, it } from "vitest";
import {
  effectiveTemplate,
  getStoreTemplate,
  newSectionKey,
  resolveSections,
  sectionContent,
  sectionType,
} from "../lib/store-templates";
import { addCustomSection, addSection, applySectionAction, resetStyle } from "../lib/store-templates/editing";

const t = getStoreTemplate("s1-11")!;

describe("clés de section", () => {
  it("type d'une clé, copie et bloc personnalisé", () => {
    expect(sectionType("promos")).toBe("promos");
    expect(sectionType("promos~2")).toBe("promos");
    expect(sectionType("custom:b_1")).toBe("custom");
    expect(sectionType("inconnu")).toBeNull();
    expect(newSectionKey("promos", ["promos"])).toBe("promos~2");
    expect(newSectionKey("promos", ["promos", "promos~2"])).toBe("promos~3");
    expect(newSectionKey("stats", ["promos"])).toBe("stats");
  });

  it("resolveSections garde le hero en tête, ajoute les blocs personnalisés et ignore les clés invalides", () => {
    const { order } = resolveSections(t, { order: ["faq", "hero", "nope", "promos~2", "custom:b_9"] }, ["b_1"]);
    expect(order[0]).toBe("hero");
    expect(order).toContain("promos~2");
    expect(order).not.toContain("nope");
    expect(order).not.toContain("custom:b_9"); // bloc supprimé
    expect(order[order.length - 1]).toBe("custom:b_1"); // bloc pas encore placé
  });

  it("le contenu d'une copie est indépendant et repart du texte du template", () => {
    const sx = { content: { promos: { title: "Soldes" } } };
    expect(sectionContent(t, "fr", "promos", sx).title).toBe("Soldes");
    expect(sectionContent(t, "fr", "promos~2", sx).items).toEqual(t.copy.fr.sections.promos!.items);
  });
});

describe("actions sur les sections", () => {
  const base = { order: [...t.sections], hidden: [] as string[], content: {} };

  it("monter / descendre, sans jamais passer au-dessus du hero", () => {
    const second = t.sections[1];
    expect(applySectionAction(t, base, [], second, "up").order).toEqual(t.sections);
    const third = t.sections[2];
    const moved = applySectionAction(t, base, [], third, "up").order!;
    expect(moved.indexOf(third)).toBe(1);
  });

  it("masquer puis afficher", () => {
    const hidden = applySectionAction(t, base, [], "faq", "hide");
    expect(hidden.hidden).toContain("faq");
    expect(applySectionAction(t, hidden, [], "faq", "show").hidden).not.toContain("faq");
  });

  it("dupliquer copie le contenu juste après l'original", () => {
    const sx = { ...base, content: { promos: { title: "Soldes" } } };
    const r = applySectionAction(t, sx, [], "promos", "duplicate");
    const i = r.order!.indexOf("promos");
    expect(r.order![i + 1]).toBe("promos~2");
    expect(r.content!["promos~2"]).toEqual({ title: "Soldes" });
  });

  it("une section du template supprimée ne revient pas ; le hero ne se supprime pas", () => {
    const r = applySectionAction(t, base, [], "faq", "delete");
    expect(r.removed).toContain("faq");
    expect(resolveSections(t, r).order).not.toContain("faq");
    expect(applySectionAction(t, base, [], "hero", "delete").order).toEqual(base.order);
  });

  it("ajout depuis la bibliothèque après la section choisie, et bloc personnalisé", () => {
    const r = addSection(t, base, [], "stats", "promos");
    expect(r.key).toBe("stats");
    expect(r.sx.order![r.sx.order!.indexOf("promos") + 1]).toBe("stats");
    const again = addSection(t, r.sx, [], "stats");
    expect(again.key).toBe("stats~2");
    const c = addCustomSection(t, base, ["b_1"], "b_1", "hero");
    expect(c.order![1]).toBe("custom:b_1");
  });
});

describe("mise en page à la carte", () => {
  it("les choix du marchand s'appliquent par-dessus le template, puis se réinitialisent", () => {
    const sx = { layout: { card: "overlay" as const }, theme: { bg: "#000000", radius: 4 }, hero: "food" as const };
    const e = effectiveTemplate(t, sx);
    expect(e.layout.card).toBe("overlay");
    expect(e.layout.footer).toBe(t.layout.footer);
    expect(e.theme.bg).toBe("#000000");
    expect(e.theme.radius).toBe(4);
    expect(e.hero).toBe("food");
    const reset = resetStyle(sx);
    expect(effectiveTemplate(t, reset)).toBe(t);
  });

  it("couleur invalide ignorée ; header transparent désactivé si le hero choisi n'est pas sur photo", () => {
    expect(effectiveTemplate(t, { theme: { bg: "rouge" } }).theme.bg).toBe(t.theme.bg);
    const overlay = getStoreTemplate("s1-06")!; // header transparent sur photo
    expect(effectiveTemplate(overlay, { hero: "pop" }).header).toBe("split");
    expect(effectiveTemplate(overlay, { hero: "search" }).header).toBe("overlay");
  });
});
