// La route API publique utilise la même source que la page (lib/public-landing) ;
// l'aperçu du brouillon reste réservé au propriétaire.
import { describe, expect, it, vi } from "vitest";

const getPublicLanding = vi.fn();
vi.mock("../lib/public-landing", () => ({ getPublicLanding }));
vi.mock("../lib/uiux-library-data", () => ({ getUiuxLibrary: () => ({ styles: [] }) }));
vi.mock("../lib/monitoring", () => ({ reportError: vi.fn() }));
vi.mock("../lib/server-auth", () => ({
  authContext: async () => {
    throw new Error("Non autorisé");
  },
  adminDb: () => ({
    from: () => {
      const q: any = {
        select: () => q,
        eq: () => q,
        is: () => q,
        maybeSingle: async () => ({ data: { id: "lp", workspace_id: "ws-A", seo: {} }, error: null }),
      };
      return q;
    },
  }),
}));

const { GET } = await import("../app/api/landing/[slug]/route");
const call = (q = "") =>
  GET(new Request("https://landpro.online/api/landing/ma-page" + q), { params: Promise.resolve({ slug: "ma-page" }) });

describe("api/landing/[slug]", () => {
  it("sert la page publiée depuis lib/public-landing", async () => {
    getPublicLanding.mockResolvedValue({ id: "lp", name: "Produit", content: { headline: "H" } });
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: "lp", content: { headline: "H", uiux_library: { styles: [] } } });
    expect(getPublicLanding).toHaveBeenCalledWith("ma-page");
  });

  it("404 si la page n'est pas publiée", async () => {
    getPublicLanding.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });

  it("refuse l'aperçu du brouillon sans compte", async () => {
    expect((await call("?preview=1")).status).toBe(401);
  });
});
