// Synchronisation des canaux Telegram publics du Sourcing Derb Omar (cron + ajout d'un canal).
import OpenAI from "openai";
import { fetchChannelPage, type TgPost } from "./telegram-public";
import { aiPrompt, parseAiAnswer, regexExtract } from "./sourcing-extract";
import { META_TEXT_MODEL } from "./store-templates/ai";

export interface ChannelRow {
  id: string;
  username: string;
  last_post_id: number | null;
}

const rowOf = (channelId: string, p: TgPost) => {
  const x = regexExtract(p.text, p.photos.length > 0);
  return {
    channel_id: channelId,
    post_id: p.postId,
    url: p.url,
    posted_at: p.date,
    text: p.text || null,
    photos: p.photos,
    has_video: p.hasVideo,
    is_product: x.is_product,
    name: x.name,
    category: x.category,
    price: x.price,
    min_qty: x.min_qty,
    phone: x.phone,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Lit les derniers messages d'un canal (et `pages` pages plus anciennes au premier passage).
 * Les messages déjà connus gardent leur fiche (extraction IA) : seules les photos sont rafraîchies.
 */
export async function syncChannel(s: any, ch: ChannelRow, pages = 1) {
  let before: number | undefined;
  let info: Awaited<ReturnType<typeof fetchChannelPage>>["channel"] | null = null;
  const posts: TgPost[] = [];
  for (let i = 0; i < pages; i++) {
    const page = await fetchChannelPage(ch.username, before);
    info ||= page.channel;
    if (!page.posts.length) break;
    posts.push(...page.posts);
    const oldest = Math.min(...page.posts.map((p) => p.postId));
    if (ch.last_post_id && oldest <= ch.last_post_id) break; // on a rejoint ce qui est déjà connu
    before = oldest;
  }
  const ids = posts.map((p) => p.postId);
  const { data: known } = ids.length
    ? await s.from("sourcing_posts").select("post_id").eq("channel_id", ch.id).in("post_id", ids)
    : { data: [] };
  const knownSet = new Set((known || []).map((k: any) => Number(k.post_id)));
  const fresh = posts.filter((p) => !knownSet.has(p.postId)).map((p) => rowOf(ch.id, p));
  if (fresh.length) {
    const { error } = await s.from("sourcing_posts").upsert(fresh, { onConflict: "channel_id,post_id" });
    if (error) throw error;
  }
  // liens des photos Telegram : ils changent parfois, on garde les plus récents
  for (const p of posts.filter((x) => knownSet.has(x.postId) && x.photos.length))
    await s.from("sourcing_posts").update({ photos: p.photos }).eq("channel_id", ch.id).eq("post_id", p.postId);
  const last = ids.length ? Math.max(...ids, ch.last_post_id || 0) : ch.last_post_id;
  await s
    .from("sourcing_channels")
    .update({
      ...(info?.title ? { title: info.title } : {}),
      ...(info?.photo ? { photo_url: info.photo } : {}),
      ...(info?.description ? { description: info.description } : {}),
      last_post_id: last,
      last_synced_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", ch.id);
  return { added: fresh.length, seen: posts.length };
}

/** Améliore par l'IA les fiches lues par règles (clé de la plateforme MODEL_API_KEY). */
export async function aiExtractPending(s: any, limit = 20) {
  const key = process.env.MODEL_API_KEY;
  if (!key) return 0;
  const { data } = await s
    .from("sourcing_posts")
    .select("id,text")
    .eq("extracted_by", "regex")
    .not("text", "is", null)
    .order("posted_at", { ascending: false })
    .limit(limit);
  const rows = (data || []).filter((r: any) => r.text && r.text.trim().length > 3);
  if (!rows.length) return 0;
  const client = new OpenAI({ baseURL: "https://api.meta.ai/v1", apiKey: key });
  const ai: any = await client.responses.create({
    model: META_TEXT_MODEL,
    input: aiPrompt(rows),
    reasoning: { effort: "low" },
    store: false,
  } as any);
  const found = parseAiAnswer(String(ai.output_text || ""));
  let n = 0;
  for (const r of rows) {
    const x = found.get(r.id);
    // réponse illisible pour ce message : marqué quand même pour ne pas le renvoyer en boucle
    const patch: Record<string, unknown> = {
      extracted_by: x ? "ai" : "ai-failed",
      updated_at: new Date().toISOString(),
    };
    if (x) {
      patch.is_product = x.is_product;
      for (const k of ["name", "category", "price", "min_qty"] as const) if (x[k] !== undefined) patch[k] = x[k];
      n++;
    }
    await s.from("sourcing_posts").update(patch).eq("id", r.id);
  }
  return n;
}
