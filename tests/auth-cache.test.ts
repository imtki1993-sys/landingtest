import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn(async () => ({ data: { user: { id: "u1", email: "a@b.c" } }, error: null }));
const rpc = vi.fn(async () => ({
  data: [{ workspace_id: "w1", role: "owner", approval_status: "approved", is_platform_admin: false }],
  error: null,
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ auth: { getUser }, rpc }) }));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
process.env.SUPABASE_SECRET_KEY = "k";
const { authContext, forgetSession } = await import("../lib/server-auth");
const req = (t: string) => new Request("https://landpro.online/api/orders", { headers: { cookie: "lm_access=" + t } });

describe("session gardée entre deux appels d'API", () => {
  beforeEach(() => {
    forgetSession();
    getUser.mockClear();
    rpc.mockClear();
  });
  it("un seul aller-retour Supabase pour deux appels avec le même jeton", async () => {
    const a = await authContext(req("tok1"));
    const b = await authContext(req("tok1"));
    expect(a.workspaceId).toBe("w1");
    expect(b.user.id).toBe("u1");
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledTimes(1);
  });
  it("déconnexion : le jeton est revérifié", async () => {
    await authContext(req("tok2"));
    forgetSession("tok2");
    await authContext(req("tok2"));
    expect(getUser).toHaveBeenCalledTimes(2);
  });
  it("compte en attente : jamais gardé", async () => {
    rpc.mockResolvedValueOnce({ data: [{ workspace_id: "w1", approval_status: "pending" }], error: null } as any);
    await expect(authContext(req("tok3"))).rejects.toThrow("attente");
    await authContext(req("tok3"));
    expect(getUser).toHaveBeenCalledTimes(2);
  });
});
