// Régression de sécurité : un compte ne doit jamais lire, modifier ni supprimer
// le produit d'un autre client (faille corrigée dans la PR #5).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeDb } from "./helpers/fake-db";

const PRODUCT = "11111111-1111-1111-1111-111111111111";
let current: { db: any; workspaceId: string } | Error;

vi.mock("../lib/server-auth", () => ({
  authContext: async () => {
    if (current instanceof Error) throw current;
    return { s: current.db, workspaceId: current.workspaceId, user: { id: "u" } };
  },
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("../lib/monitoring", () => ({ reportError: vi.fn() }));

const route = await import("../app/api/products/[id]/route");
const params = { params: Promise.resolve({ id: PRODUCT }) };
const req = (method = "GET", body?: unknown) =>
  new Request("https://landpro.online/api/products/" + PRODUCT, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

let state: ReturnType<typeof fakeDb>;
beforeEach(() => {
  state = fakeDb({
    products: [
      { id: PRODUCT, workspace_id: "ws-A", price: 199, cost_price: 45, specifications: {}, archived_at: null },
    ],
    landing_pages: [{ id: "lp1", product_id: PRODUCT, workspace_id: "ws-A", archived_at: null }],
  });
});

describe("api/products/[id] — isolation entre clients", () => {
  it("refuse la lecture du produit d'un autre client", async () => {
    current = { db: state.db, workspaceId: "ws-B" };
    const res = await route.GET(req(), params);
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain("cost_price");
  });

  it("refuse la modification du prix par un autre client", async () => {
    current = { db: state.db, workspaceId: "ws-B" };
    const res = await route.PATCH(req("PATCH", { price: 1 }), params);
    expect(res.status).toBe(404);
    expect(state.log.some((q) => q.op === "update")).toBe(false);
  });

  it("refuse la suppression par un autre client", async () => {
    current = { db: state.db, workspaceId: "ws-B" };
    const res = await route.DELETE(req("DELETE"), params);
    expect(res.status).toBe(404);
    expect(state.log.some((q) => q.op === "update")).toBe(false);
  });

  it("toutes les requêtes du propriétaire sont filtrées par son workspace", async () => {
    current = { db: state.db, workspaceId: "ws-A" };
    expect((await route.GET(req(), params)).status).toBe(200);
    expect((await route.PATCH(req("PATCH", { price: 189 }), params)).status).toBe(200);
    expect((await route.DELETE(req("DELETE"), params)).status).toBe(200);
    expect(state.log.length).toBeGreaterThan(0);
    for (const q of state.log) expect(q.filters.workspace_id).toBe("ws-A");
  });

  it("renvoie 401 sans compte approuvé", async () => {
    current = new Error("Compte en attente d’approbation");
    expect((await route.GET(req(), params)).status).toBe(401);
  });
});
