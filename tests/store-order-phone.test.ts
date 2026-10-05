// Validation du téléphone des commandes boutique (bug des barres obliques doublées, PR #3).
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/server-auth", () => ({
  adminDb: () => {
    throw new Error("base non disponible dans le test");
  },
}));
vi.mock("../lib/monitoring", () => ({ reportError: vi.fn() }));

const { POST } = await import("../app/api/store-order/route");
const order = (phone: string) =>
  POST(
    new Request("https://landpro.online/api/store-order", {
      method: "POST",
      body: JSON.stringify({ slug: "atlas", name: "Client", phone, city: "Rabat", items: [{ id: "p1", qty: 1 }] }),
    }),
  );

describe("store-order — numéro de téléphone", () => {
  it.each(["0673833237", "06 73 83 32 37", "+212673833237", "+212 6 73 83 32 37", "00212 673 833 237"])(
    "accepte %s",
    async (phone) => {
      // la validation passe : la requête atteint la base (indisponible ici → 500, pas 400)
      expect((await order(phone)).status).not.toBe(400);
    },
  );

  it.each(["abcdefghij", "12", "06-xx-xx"])("refuse %s", async (phone) => {
    expect((await order(phone)).status).toBe(400);
  });
});
