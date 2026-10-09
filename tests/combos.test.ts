// Les 60 templates assemblés (n° 90 → 149) : pièces existantes, règles d'unicité et de compatibilité.
import { describe, expect, it } from "vitest";
import { TEMPLATES } from "../components/landpro/registry";
import { PIECE_META } from "../components/landpro/pieces/catalog";
import { getDemoProduct } from "../components/landpro/demo-products";

const combos = TEMPLATES.filter((t) => t.number >= 90);

describe("templates assemblés 90 → 149", () => {
  it("sont 60, tous construits avec un header, un hero et un footer de pièces", () => {
    expect(combos).toHaveLength(60);
    for (const t of combos) {
      const p = t.pieces!;
      expect(PIECE_META[p.header!]?.kind, t.id).toBe("header");
      expect(PIECE_META[p.hero!]?.kind, t.id).toBe("hero");
      expect(PIECE_META[p.footer!]?.kind, t.id).toBe("footer");
    }
  });

  it("n'utilisent une version de section que pour une section présente dans la page", () => {
    for (const t of combos)
      for (const [section, id] of Object.entries(t.pieces!.sections || {})) {
        expect(PIECE_META[id]?.section, `${t.id} ${id}`).toBe(section);
        expect(t.sections, `${t.id} ${id}`).toContain(section);
      }
  });

  it("ne répètent jamais le même trio header / hero / footer", () => {
    const trios = combos.map((t) => `${t.pieces!.header}|${t.pieces!.hero}|${t.pieces!.footer}`);
    expect(new Set(trios).size).toBe(60);
  });

  it("ont tous une architecture différente (pièces + ordre des sections)", () => {
    const archi = combos.map((t) => JSON.stringify([t.pieces, t.sections]));
    expect(new Set(archi).size).toBe(60);
  });

  it("deux templates voisins ne partagent ni header, ni hero, ni footer", () => {
    for (let i = 1; i < combos.length; i++) {
      const a = combos[i - 1].pieces!,
        b = combos[i].pieces!;
      expect(a.header, combos[i].id).not.toBe(b.header);
      expect(a.hero, combos[i].id).not.toBe(b.hero);
      expect(a.footer, combos[i].id).not.toBe(b.footer);
    }
  });

  it("utilisent les 47 pièces, de façon équilibrée", () => {
    const used = new Map<string, number>();
    for (const t of combos) {
      const p = t.pieces!;
      for (const id of [p.header!, p.hero!, p.footer!, ...Object.values(p.sections || {})])
        used.set(id, (used.get(id) || 0) + 1);
    }
    expect(used.size).toBe(47);
    for (const [id, n] of used) expect(n, id).toBeLessThanOrEqual(14);
  });

  it("respectent la compatibilité des pièces avec le produit", () => {
    for (const t of combos) {
      const p = t.pieces!;
      const demo = getDemoProduct(t.demoProduct);
      // deux barres collées en bas d'écran sur mobile
      expect(p.header === "h17-app" && p.footer === "f19-collant", t.id).toBe(false);
      // sélecteur de couleur : seulement pour un produit avec des variantes
      if (p.header === "h20-selecteur") expect(demo.variants?.length, t.id).toBeGreaterThan(0);
      // un template arabe a besoin des textes arabes du produit
      if (t.lang === "ar") expect(demo.i18n?.ar?.name, t.id).toBeTruthy();
    }
  });
});
