import { describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));
const { withLandingInvalidation, PUBLIC_LANDINGS_TAG } = await import("../lib/landing-cache");

describe("vidage du cache des landing pages", () => {
  it("vide le cache quand la modification réussit", async () => {
    revalidateTag.mockClear();
    const h = withLandingInvalidation(async () => new Response("{}", { status: 200 }));
    await h();
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_LANDINGS_TAG);
  });

  it("ne vide pas le cache quand la modification échoue", async () => {
    revalidateTag.mockClear();
    for (const status of [400, 401, 404, 500])
      await withLandingInvalidation(async () => new Response("{}", { status }))();
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
