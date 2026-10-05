import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));

describe("suivi des erreurs", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    fetchMock = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.ERROR_WEBHOOK_URL = "https://hooks.exemple.test/x";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ERROR_WEBHOOK_URL;
  });

  it("ignore les refus normaux (non connecté, quota, anti-spam)", async () => {
    const { reportError } = await import("../lib/monitoring");
    reportError(new Error("Non autorisé"), "api/x");
    reportError(new Error("Trop de tentatives. Réessayez"), "api/x");
    expect(console.error).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("journalise une vraie erreur et envoie une seule alerte par minute", async () => {
    const { reportError } = await import("../lib/monitoring");
    reportError(new Error("fetch failed"), "api/store-order");
    reportError(new Error("fetch failed"), "api/store-order");
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).text).toContain("api/store-order");
  });

  it("ne casse jamais la requête, même si l'alerte échoue", async () => {
    fetchMock.mockRejectedValue(new Error("réseau"));
    const { reportError } = await import("../lib/monitoring");
    expect(() => reportError(new Error("boom"), "api/y")).not.toThrow();
  });
});
