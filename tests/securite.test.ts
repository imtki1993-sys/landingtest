// Corrections de sécurité : SSRF, clés transporteurs chiffrées, plafond IA sur la clé de la plateforme.
import { afterEach, describe, expect, it, vi } from "vitest";
import { assertPublicUrl, isBlockedIp, UnsafeUrlError } from "../lib/safe-fetch";

describe("analyse d'URL externe sans SSRF", () => {
  it("refuse les adresses internes, locales et de métadonnées", () => {
    for (const ip of [
      "127.0.0.1",
      "10.2.3.4",
      "172.16.0.1",
      "192.168.1.10",
      "169.254.169.254",
      "0.0.0.0",
      "::1",
      "fd00::1",
      "::ffff:127.0.0.1",
    ])
      expect(isBlockedIp(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "104.18.2.3", "2606:4700::1111"]) expect(isBlockedIp(ip), ip).toBe(false);
  });

  it("refuse un domaine qui pointe vers une adresse interne", async () => {
    const resolve: any = async () => [{ address: "169.254.169.254" }];
    await expect(assertPublicUrl("https://piege.example/", resolve)).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("refuse les schémas, ports et hôtes internes", async () => {
    const pub: any = async () => [{ address: "93.184.216.34" }];
    for (const u of [
      "file:///etc/passwd",
      "http://localhost/",
      "https://x.example:8080/",
      "http://user:pw@x.example/",
      "http://10.0.0.1/",
    ])
      await expect(assertPublicUrl(u, pub), u).rejects.toBeInstanceOf(UnsafeUrlError);
    await expect(assertPublicUrl("https://boutique.example/page", pub)).resolves.toBeInstanceOf(URL);
  });
});

describe("clés des transporteurs", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sont chiffrées à l'enregistrement et relisibles pour l'appel au transporteur", async () => {
    vi.stubEnv("INTEGRATION_ENCRYPTION_KEY", "cle-de-test");
    const { sealCarrierSettings, openCarrierSettings } = await import("../lib/carrier-secrets");
    const sealed = sealCarrierSettings({ client_id: "123", api_key: "SECRET-OZON", mode: "api" });
    expect(sealed.api_key).toMatch(/^v1:/);
    expect(JSON.stringify(sealed)).not.toContain("SECRET-OZON");
    expect(sealed.client_id).toBe("123");
    expect(openCarrierSettings(sealed).api_key).toBe("SECRET-OZON");
    // une ancienne valeur en clair reste utilisable, et n'est pas chiffrée deux fois
    expect(openCarrierSettings({ api_key: "ancienne" }).api_key).toBe("ancienne");
    expect(sealCarrierSettings(sealed).api_key).toBe(sealed.api_key);
  });

  it("ne sont jamais renvoyées dans une réponse d'erreur", async () => {
    const { redactSecret } = await import("../lib/carrier-secrets");
    const out = redactSecret({ url: "https://api.ozonexpress.ma/customers/1/K3Y%2F1/cities" }, "K3Y/1");
    expect(JSON.stringify(out)).not.toContain("K3Y");
  });
});

describe("IA sur la clé de la plateforme", () => {
  afterEach(() => vi.unstubAllEnvs());

  const db = (allowed: boolean, ownKey: string | null = null) => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: { openai_api_key_enc: ownKey }, error: null }) }),
      }),
    }),
    rpc: vi.fn(async () => ({ data: allowed, error: null })),
  });

  it("est plafonnée par workspace", async () => {
    vi.stubEnv("MODEL_API_KEY", "cle-plateforme");
    vi.stubEnv("PLATFORM_AI_MONTHLY_LIMIT", "20");
    const { resolveMetaKey } = await import("../lib/meta-model");
    const ok = db(true);
    await expect(resolveMetaKey(ok, "w1")).resolves.toEqual({ key: "cle-plateforme", platform: true });
    expect(ok.rpc).toHaveBeenCalledWith("check_public_order_rate_limit", {
      p_key: "ai-platform|w1",
      p_limit: 20,
      p_window_seconds: 30 * 24 * 3600,
    });
    await expect(resolveMetaKey(db(false), "w1")).rejects.toMatchObject({ code: "META_AI_QUOTA", status: 429 });
  });

  it("sans clé de plateforme ni clé du client : erreur claire", async () => {
    vi.stubEnv("MODEL_API_KEY", "");
    const { resolveMetaKey } = await import("../lib/meta-model");
    await expect(resolveMetaKey(db(true), "w1")).rejects.toMatchObject({ code: "META_AI_KEY_MISSING" });
  });
});
