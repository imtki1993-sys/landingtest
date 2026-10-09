import { describe, expect, it } from "vitest";
import { PIECE_LIST, PIECES } from "../components/landpro/pieces";
import { PIECE_CATALOG } from "../components/landpro/pieces/catalog";

describe("landpro pieces", () => {
  it("registers the 47 pieces with unique ids", () => {
    expect(PIECE_LIST).toHaveLength(47);
    expect(new Set(PIECE_LIST.map((p) => p.id)).size).toBe(47);
    expect(Object.keys(PIECES)).toHaveLength(47);
  });

  it("has the expected kind counts", () => {
    const count = (k: string) => PIECE_LIST.filter((p) => p.kind === k).length;
    expect(count("header")).toBe(8);
    expect(count("hero")).toBe(14);
    expect(count("footer")).toBe(11);
    expect(count("section")).toBe(14);
  });

  it("gives every section piece a target section and every piece a render", () => {
    for (const p of PIECE_LIST) {
      expect(typeof p.render).toBe("function");
      expect(p.name.length).toBeGreaterThan(0);
      if (p.kind === "section") expect(p.section).toBeTruthy();
    }
  });

  it("le catalogue serveur reprend exactement les pièces enregistrées", () => {
    const meta = (p: { id: string; kind: string; section?: string; name: string }) =>
      `${p.id}|${p.kind}|${p.section || ""}|${p.name}`;
    expect(PIECE_CATALOG.map(meta).sort()).toEqual(PIECE_LIST.map(meta).sort());
  });
});
