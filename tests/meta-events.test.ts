// Événements Meta (Pixel + API Conversions) : formats attendus par Meta et déduplication.
import { createHash } from "crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/server-auth", () => ({ adminDb: () => ({}) }));
vi.mock("../lib/integration-secrets", () => ({ decryptIntegrationSecret: () => "" }));

import {
  cleanFbId,
  fbcFromClickId,
  metaCurrency,
  metaValue,
  normalizeCity,
  normalizeMaPhone,
  purchaseEventId,
} from "../lib/meta-events";
import { buildPurchaseEvent } from "../lib/meta-capi";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

describe("formats Meta", () => {
  it("convertit DH en code ISO MAD", () => {
    expect(metaCurrency("DH")).toBe("MAD");
    expect(metaCurrency(undefined)).toBe("MAD");
    expect(metaCurrency("eur")).toBe("EUR");
    expect(metaCurrency("dirham")).toBe("MAD");
  });

  it("donne une valeur numérique propre", () => {
    expect(metaValue("349")).toBe(349);
    expect(metaValue("abc")).toBe(0);
    expect(metaValue(-5)).toBe(0);
  });

  it("normalise les téléphones marocains", () => {
    expect(normalizeMaPhone("06 12 34 56 78")).toBe("212612345678");
    expect(normalizeMaPhone("+212 6 12 34 56 78")).toBe("212612345678");
    expect(normalizeMaPhone("00212612345678")).toBe("212612345678");
    expect(normalizeMaPhone("612345678")).toBe("212612345678");
  });

  it("normalise la ville", () => {
    expect(normalizeCity("Fès")).toBe("fes");
    expect(normalizeCity("Dar El Beïda")).toBe("darelbeida");
  });

  it("construit et valide les identifiants navigateur", () => {
    const fbc = fbcFromClickId("IwAR123abc", 1760000000000);
    expect(fbc).toBe("fb.1.1760000000000.IwAR123abc");
    expect(cleanFbId(fbc)).toBe(fbc);
    expect(cleanFbId("fb.1.1760000000000.1234567890")).toBeTruthy();
    expect(cleanFbId("<script>")).toBeUndefined();
    expect(fbcFromClickId("")).toBeUndefined();
  });
});

describe("Purchase côté serveur (API Conversions)", () => {
  const ev = buildPurchaseEvent(
    {
      workspaceId: "w",
      landingPageId: "lp1",
      orderId: "o42",
      value: 349,
      currency: "DH",
      quantity: 2,
      contentName: "Support voiture",
      phone: "0612345678",
      name: "Yassine Benali",
      city: "Casablanca",
      eventSourceUrl: "https://shop.example/landing/support",
      clientIp: "1.2.3.4",
      userAgent: "UA",
      fbp: "fb.1.1760000000000.1234567890",
      fbc: "fb.1.1760000000000.IwAR123abc",
      externalId: "visitor-uuid",
    },
    1760000000000,
  );

  it("partage l'eventID du Pixel pour la déduplication", () => {
    expect(ev.event_id).toBe(purchaseEventId("o42"));
    expect(ev.event_name).toBe("Purchase");
    expect(ev.action_source).toBe("website");
    expect(ev.event_source_url).toBe("https://shop.example/landing/support");
  });

  it("envoie des données client hachées et les cookies Meta en clair", () => {
    const u = ev.user_data as any;
    expect(u.ph).toEqual([sha("212612345678")]);
    expect(u.fn).toEqual([sha("yassine")]);
    expect(u.ln).toEqual([sha("benali")]);
    expect(u.ct).toEqual([sha("casablanca")]);
    expect(u.country).toEqual([sha("ma")]);
    expect(u.external_id).toEqual([sha("visitor-uuid")]);
    expect(u.fbp).toBe("fb.1.1760000000000.1234567890");
    expect(u.fbc).toBe("fb.1.1760000000000.IwAR123abc");
    expect(u.client_ip_address).toBe("1.2.3.4");
  });

  it("décrit la commande (valeur, devise ISO, quantité, produit)", () => {
    expect(ev.custom_data).toMatchObject({
      currency: "MAD",
      value: 349,
      order_id: "o42",
      content_type: "product",
      content_ids: ["lp1"],
      num_items: 2,
      contents: [{ id: "lp1", quantity: 2 }],
    });
  });

  it("ignore des cookies Meta invalides", () => {
    const e2 = buildPurchaseEvent({
      workspaceId: "w",
      landingPageId: "lp1",
      orderId: "o1",
      value: 1,
      currency: "MAD",
      phone: "0600000000",
      name: "A",
      fbp: "n'importe quoi",
    });
    expect((e2.user_data as any).fbp).toBeUndefined();
  });
});
