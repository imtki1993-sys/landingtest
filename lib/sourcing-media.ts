// Photos du Sourcing Derb Omar : les liens d'images de Telegram expirent au bout de quelques heures/jours.
// Chaque photo est donc copiée une fois dans le stockage LandPro (bucket public « sourcing-photos »),
// et les anciennes publications aux liens expirés sont réparées en relisant leur page Telegram.
import { fetchChannelPage, type TgPost } from "./telegram-public";

export const PHOTO_BUCKET = "sourcing-photos";
const MAX_BYTES = 6 * 1024 * 1024;

/** Photo déjà copiée chez nous (lien permanent). */
export const isMirrored = (url: string) => url.includes(`/${PHOTO_BUCKET}/`);
export const needsMirror = (photos: string[] | null | undefined) =>
  !!photos?.length && photos.some((u) => !isMirrored(u));

let bucketReady = false;
async function ensureBucket(s: any) {
  if (bucketReady) return;
  const opts = {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    fileSizeLimit: "6MB",
  };
  const { error } = await s.storage.createBucket(PHOTO_BUCKET, opts);
  if (error && !/exist|duplicate/i.test(String(error.message || ""))) throw error;
  bucketReady = true;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Copie une photo Telegram dans le stockage ; renvoie le lien permanent, ou null si elle n'est plus accessible. */
async function copyOne(s: any, url: string, path: string): Promise<string | null> {
  const r = await fetch(url, { signal: AbortSignal.timeout(12_000), cache: "no-store" }).catch(() => null);
  if (!r?.ok) return null;
  const type = (r.headers.get("content-type") || "image/jpeg").split(";")[0].trim().toLowerCase();
  if (!EXT[type]) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return null;
  const file = `${path}.${EXT[type]}`;
  const up = await s.storage
    .from(PHOTO_BUCKET)
    .upload(file, buf, { contentType: type, cacheControl: "31536000", upsert: true });
  if (up.error) return null;
  return s.storage.from(PHOTO_BUCKET).getPublicUrl(file).data.publicUrl as string;
}

/** Photos d'une publication → liens permanents (celles déjà copiées sont gardées telles quelles). */
export async function mirrorPhotos(s: any, channelId: string, postId: number, urls: string[]): Promise<string[]> {
  await ensureBucket(s);
  const out = await Promise.all(urls.map((u, i) => (isMirrored(u) ? u : copyOne(s, u, `${channelId}/${postId}-${i}`))));
  return out.filter((u): u is string => !!u);
}

/** Photo d'un canal → lien permanent (null si non copiée). */
export async function mirrorChannelPhoto(s: any, channelId: string, url: string): Promise<string | null> {
  if (isMirrored(url)) return url;
  await ensureBucket(s);
  return copyOne(s, url, `channels/${channelId}`);
}

/** Exécute des tâches avec au plus `n` en parallèle. */
async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

/**
 * Copie les photos des publications lues à l'instant sur Telegram (liens encore valides).
 * `stored` : photos actuellement en base, par post_id (pour ne pas recopier).
 */
export async function mirrorFromPage(
  s: any,
  channelId: string,
  posts: TgPost[],
  stored: Map<number, string[]>,
  limit = 30,
): Promise<number> {
  const todo = posts
    .filter((p) => p.photos.length && needsMirror(stored.get(p.postId)?.length ? stored.get(p.postId) : p.photos))
    .slice(0, limit);
  let n = 0;
  await pool(todo, 4, async (p) => {
    const photos = await mirrorPhotos(s, channelId, p.postId, p.photos);
    if (!photos.length) return;
    await s.from("sourcing_posts").update({ photos }).eq("channel_id", channelId).eq("post_id", p.postId);
    n++;
  });
  return n;
}

interface PostRow {
  id: string;
  channel_id: string;
  post_id: number;
  photos: string[];
}

/**
 * Répare des publications dont les liens Telegram ont expiré : relit la page Telegram qui les contient
 * (liens frais), copie les photos, enregistre les liens permanents. Renvoie les photos réparées par id.
 */
export async function repairPosts(s: any, rows: PostRow[], maxPages = 6): Promise<Map<string, string[]>> {
  const fixed = new Map<string, string[]>();
  const todo = rows.filter((r) => needsMirror(r.photos));
  if (!todo.length) return fixed;
  const ids = [...new Set(todo.map((r) => r.channel_id))];
  const { data: chans } = await s.from("sourcing_channels").select("id,username").in("id", ids);
  const username = new Map<string, string>((chans || []).map((c: any) => [c.id, c.username]));
  const left = [...todo].sort((a, b) => b.post_id - a.post_id);
  let pages = 0;
  while (left.length && pages < maxPages) {
    const target = left[0];
    const user = username.get(target.channel_id);
    left.shift();
    if (!user) continue;
    pages++;
    // la page « avant post_id + 1 » contient la publication et ~20 plus anciennes du même canal
    const page = await fetchChannelPage(user, target.post_id + 1).catch(() => null);
    if (!page) continue;
    const byId = new Map<number, TgPost>(page.posts.map((p: TgPost) => [p.postId, p]));
    const here = [target, ...left.filter((r) => r.channel_id === target.channel_id && byId.has(r.post_id))];
    for (const r of here.slice(1)) left.splice(left.indexOf(r), 1);
    await pool(here, 4, async (r) => {
      const p = byId.get(r.post_id);
      // publication supprimée du canal, ou sans photo : on retire les liens morts (la carte affiche « Pas de photo »)
      const photos = p?.photos.length ? await mirrorPhotos(s, r.channel_id, r.post_id, p.photos) : [];
      if (p?.photos.length && !photos.length) return; // téléchargement raté : nouvel essai plus tard
      await s.from("sourcing_posts").update({ photos }).eq("id", r.id);
      fixed.set(r.id, photos);
    });
  }
  return fixed;
}

/** Cron : répare les publications récentes dont les photos ne sont pas encore copiées. */
export async function repairPending(s: any, limit = 40, maxPages = 6): Promise<number> {
  const { data } = await s
    .from("sourcing_posts")
    .select("id,channel_id,post_id,photos")
    .eq("is_product", true)
    .neq("photos", "{}")
    .order("posted_at", { ascending: false })
    .limit(600);
  const rows = ((data || []) as PostRow[]).filter((r) => needsMirror(r.photos)).slice(0, limit);
  return (await repairPosts(s, rows, maxPages)).size;
}

/**
 * Photos des publications récentes (< 3 jours) encore sur Telegram : copiées depuis le lien enregistré, encore valide
 * à ce stade. Sans dépasser `deadline`. Les liens expirés sont ensuite réparés par `repairPending`.
 */
export async function mirrorRecent(s: any, deadline: number, limit = 80): Promise<number> {
  const since = new Date(Date.now() - 3 * 86400_000).toISOString();
  const { data } = await s
    .from("sourcing_posts")
    .select("id,channel_id,post_id,photos")
    .neq("photos", "{}")
    .gte("posted_at", since)
    .order("posted_at", { ascending: false })
    .limit(400);
  const rows = ((data || []) as PostRow[]).filter((r) => needsMirror(r.photos)).slice(0, limit);
  let n = 0;
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, rows.length) }, async () => {
      while (i < rows.length && Date.now() < deadline) {
        const r = rows[i++];
        const photos = await mirrorPhotos(s, r.channel_id, r.post_id, r.photos).catch(() => []);
        // tout copié : liens permanents ; sinon on garde les liens Telegram (réparés plus tard)
        if (photos.length === r.photos.length) {
          await s.from("sourcing_posts").update({ photos }).eq("id", r.id);
          n++;
        }
      }
    }),
  );
  return n;
}
