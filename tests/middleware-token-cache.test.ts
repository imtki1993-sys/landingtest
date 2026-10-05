// Un jeton déjà validé n'est pas revérifié auprès de Supabase pendant 60 s ; un jeton refusé l'est toujours.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

describe("middleware — vérification du jeton", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SECRET_KEY = "k";
    fetchMock = vi.fn(async (_url: string, init: any) =>
      String(init?.headers?.Authorization).endsWith("bon")
        ? new Response("{}", { status: 200 })
        : new Response("{}", { status: 401 }),
    );
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const call = async (token: string) => {
    const { middleware } = await import("../middleware");
    const req = new NextRequest("https://landpro.online/orders", { headers: { cookie: "lm_access=" + token } });
    return middleware(req);
  };

  it("ne vérifie un jeton valide qu'une fois", async () => {
    expect((await call("jeton-bon")).headers.get("x-middleware-next")).toBe("1");
    expect((await call("jeton-bon")).headers.get("x-middleware-next")).toBe("1");
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).includes("/auth/v1/user"))).toHaveLength(1);
  });

  it("refuse et revérifie toujours un jeton invalide", async () => {
    expect((await call("jeton-faux")).status).toBe(307);
    expect((await call("jeton-faux")).status).toBe(307);
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).includes("/auth/v1/user"))).toHaveLength(2);
  });
});
