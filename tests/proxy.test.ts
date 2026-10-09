// Le middleware ne doit laisser passer sans connexion que les fichiers statiques et les pages publiques.
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy as middleware } from "../proxy";

const call = (path: string) => middleware(new NextRequest("https://landpro.online" + path));
const passes = (res: Response) => res.headers.get("x-middleware-next") === "1";

describe("proxy (ex-middleware) — accès sans connexion", () => {
  it("bloque une route API même si le chemin contient un point", async () => {
    for (const p of ["/api/products/123.json", "/api/orders.x", "/api/admin-users"]) {
      const res = await call(p);
      expect(res.status, p).toBe(401);
    }
  });

  it("redirige le tableau de bord vers la connexion", async () => {
    const res = await call("/orders");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("laisse passer les pages publiques et les fichiers statiques", async () => {
    for (const p of [
      "/connect/order.js",
      "/landing/ma-page",
      "/store/atlas",
      "/template-assets/landpro/holder.svg",
      "/login",
    ]) {
      expect(passes(await call(p)), p).toBe(true);
    }
  });

  it("laisse passer les formulaires publics et les tâches planifiées", async () => {
    const req = (path: string, method: string) =>
      middleware(new NextRequest("https://landpro.online" + path, { method }));
    for (const [p, m] of [
      ["/api/external-orders", "POST"],
      ["/api/external-orders", "OPTIONS"],
      ["/api/store-contact", "POST"],
      ["/api/cron/analytics-rollup", "GET"],
      ["/api/cron/ozon-sync", "GET"],
    ]) {
      expect(passes(await req(p, m)), `${m} ${p}`).toBe(true);
    }
    // mais pas la lecture des messages de contact
    expect((await req("/api/store-contact", "GET")).status).toBe(401);
  });
});
