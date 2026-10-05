// Les messages métier restent visibles, les erreurs techniques sont masquées.
import { describe, expect, it } from "vitest";
import { GENERIC_ERROR, publicMessage } from "../lib/public-error";

describe("publicMessage", () => {
  it("conserve les messages métier de l'application", () => {
    for (const m of ["Compte en attente d’approbation", "Produit introuvable", "Minimum 1 photo produit requise"])
      expect(publicMessage(new Error(m))).toBe(m);
  });

  it("conserve une exception métier levée par Postgres (RAISE EXCEPTION)", () => {
    expect(publicMessage({ code: "P0001", message: "landing_limit_reached", details: null, hint: null })).toBe(
      "landing_limit_reached",
    );
  });

  it("masque les erreurs de base de données", () => {
    const pg = { code: "23505", message: 'duplicate key value violates unique constraint "x"', details: "", hint: "" };
    expect(publicMessage(pg)).toBe(GENERIC_ERROR);
  });

  it("masque les erreurs réseau, de configuration et les bugs", () => {
    expect(publicMessage(new TypeError("fetch failed"))).toBe(GENERIC_ERROR);
    expect(publicMessage(new Error("Supabase env missing"))).toBe(GENERIC_ERROR);
    expect(publicMessage(new Error("Cannot read properties of undefined (reading 'id')"))).toBe(GENERIC_ERROR);
    expect(publicMessage(new Error("integration_encryption_key_not_configured"))).toBe(GENERIC_ERROR);
  });

  it("utilise le message de repli fourni", () => {
    expect(publicMessage(new TypeError("x"), "Upload impossible")).toBe("Upload impossible");
    expect(publicMessage(null, "Upload impossible")).toBe("Upload impossible");
  });
});
