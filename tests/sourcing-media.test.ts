import { describe, it, expect, vi, afterEach } from "vitest";
import { isMirrored, needsMirror, repairPosts } from "../lib/sourcing-media";

const page = (posts: [number, string[]][]) =>
  `<html>${posts
    .map(
      ([id, photos]) =>
        `<div class="tgme_widget_message_wrap"><div data-post="derb/${id}">${photos
          .map((u) => `<a class="tgme_widget_message_photo_wrap" style="background-image:url('${u}')"></a>`)
          .join("")}<div class="tgme_widget_message_text">منتج ${id}</div></div></div>`,
    )
    .join("")}</html>`;

function fakeDb() {
  const updates: [string, any][] = [];
  const uploads: string[] = [];
  const s: any = {
    storage: {
      createBucket: async () => ({ error: { message: "already exists" } }),
      from: () => ({
        upload: async (path: string) => (uploads.push(path), { error: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://x.supabase.co/storage/v1/object/public/sourcing-photos/${path}` },
        }),
      }),
    },
    from: (table: string) => ({
      select: () => ({ in: async () => ({ data: [{ id: "c1", username: "derb" }] }) }),
      update: (patch: any) => ({ eq: async (_k: string, id: string) => (updates.push([id, patch]), {}) }),
      table,
    }),
  };
  return { s, updates, uploads };
}

afterEach(() => vi.unstubAllGlobals());

describe("photos du sourcing", () => {
  it("reconnaît les photos déjà copiées", () => {
    expect(isMirrored("https://x.supabase.co/storage/v1/object/public/sourcing-photos/a/1-0.jpg")).toBe(true);
    expect(needsMirror(["https://cdn4.telesco.pe/file/abc.jpg"])).toBe(true);
    expect(needsMirror([])).toBe(false);
  });

  it("relit la page Telegram, copie les photos fraîches, vide celles des messages supprimés", async () => {
    const f = vi.fn(async (url: string) =>
      url.startsWith("https://t.me/s/derb")
        ? new Response(
            page([
              [12, ["https://cdn.telesco.pe/new12.jpg"]],
              [10, ["https://cdn.telesco.pe/new10.jpg"]],
            ]),
          )
        : new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } }),
    );
    vi.stubGlobal("fetch", f);
    const { s, updates, uploads } = fakeDb();
    const fixed = await repairPosts(s, [
      { id: "a", channel_id: "c1", post_id: 12, photos: ["https://cdn.telesco.pe/old12.jpg"] },
      { id: "b", channel_id: "c1", post_id: 10, photos: ["https://cdn.telesco.pe/old10.jpg"] },
      { id: "c", channel_id: "c1", post_id: 11, photos: ["https://cdn.telesco.pe/old11.jpg"] },
    ]);
    // une seule page lue pour 12 et 10 ; 11 n'existe plus → nouvelle page puis photos vidées
    expect(f.mock.calls.filter(([u]) => String(u).startsWith("https://t.me")).length).toBe(2);
    expect(fixed.get("a")?.[0]).toContain("/sourcing-photos/c1/12-0.jpg");
    expect(fixed.get("b")?.[0]).toContain("/sourcing-photos/c1/10-0.jpg");
    expect(fixed.get("c")).toEqual([]);
    expect(uploads.sort()).toEqual(["c1/10-0.jpg", "c1/12-0.jpg"]);
    expect(updates.find(([id]) => id === "c")?.[1]).toEqual({ photos: [] });
  });
});
