// Produit du Sourcing Derb Omar → « Mes produits » du compte (photos copiées dans le stockage LandPro,
// prix de gros gardé comme coût d'achat). Utilisé par l'import et par la boutique Derb Omar.
import { boilerplateLines, stripBoilerplate } from "./sourcing-extract";
import { isMirrored } from "./sourcing-media";
import { publicDescription } from "./sourcing-privacy";

const TG_HOST = /(^|\.)(telesco\.pe|telegram\.org|telegram-cdn\.org|cdn-telegram\.org)$/i;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "produit";

export class ImportError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** Produits du compte déjà importés du sourcing : post_id → produit. */
export async function importedPosts(s: any, workspaceId: string, postIds: string[]) {
  const out = new Map<string, { id: string; price: number; active: boolean }>();
  if (!postIds.length) return out;
  const { data, error } = await s
    .from("products")
    .select("id,price,is_active,specifications")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .in("specifications->sourcing->>post_id", postIds);
  if (error) throw error;
  for (const p of data || [])
    out.set(String(p.specifications.sourcing.post_id), {
      id: p.id,
      price: Number(p.price),
      active: p.is_active !== false,
    });
  return out;
}

export async function importSourcingPost(
  s: any,
  o: {
    workspaceId: string;
    isPlatformAdmin: boolean;
    postId: string;
    name?: string;
    price: number;
    compareAt?: number | null;
  },
) {
  const { data: post, error: pe } = await s
    .from("sourcing_posts")
    .select("id,channel_id,url,text,photos,name,category,price,min_qty,sourcing_channels(*)")
    .eq("id", o.postId)
    .maybeSingle();
  if (pe) throw pe;
  if (!post) throw new ImportError("Produit introuvable", 404);
  if (!(o.price > 0)) throw new ImportError("Indique ton prix de vente");
  // déjà importé par ce compte : on met à jour le prix et on le remet en vente
  const existing = (await importedPosts(s, o.workspaceId, [post.id])).get(post.id);
  if (existing) {
    const { data, error } = await s
      .from("products")
      .update({
        price: o.price,
        compare_at_price: Number(o.compareAt) > o.price ? Number(o.compareAt) : null,
        is_active: true,
        ...(o.name?.trim() ? { name: o.name.trim().slice(0, 120) } : {}),
      })
      .eq("id", existing.id)
      .eq("workspace_id", o.workspaceId)
      .select("id,name,price")
      .single();
    if (error) throw error;
    return { product: data, photos: null, updated: true };
  }
  const name = String(o.name || post.name || "Produit")
    .trim()
    .slice(0, 120);

  // photos : déjà copiées chez nous (lien permanent), sinon copiées dans landing-images/<workspace>/…
  const urls: string[] = [];
  for (const src of (post.photos || []).slice(0, 6)) {
    if (isMirrored(src)) {
      urls.push(src);
      continue;
    }
    try {
      const u = new URL(src);
      if (u.protocol !== "https:" || !TG_HOST.test(u.hostname)) continue;
      const r = await fetch(u, { cache: "no-store", redirect: "error" });
      const type = r.headers.get("content-type") || "image/jpeg";
      if (!r.ok || !type.startsWith("image/")) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 10 * 1024 * 1024) continue;
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const path = `${o.workspaceId}/sourcing-${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await s.storage
        .from("landing-images")
        .upload(path, buf, { contentType: type, cacheControl: "31536000", upsert: false });
      if (!error) urls.push(s.storage.from("landing-images").getPublicUrl(path).data.publicUrl);
    } catch {
      // une photo illisible ne bloque pas l'import
    }
  }
  const ch: any = Array.isArray(post.sourcing_channels) ? post.sourcing_channels[0] : post.sourcing_channels;
  // description vue par les acheteurs : sans signature du canal, prix de gros, minimum ni contact du grossiste
  const { data: sample } = await s
    .from("sourcing_posts")
    .select("text")
    .eq("channel_id", post.channel_id)
    .order("posted_at", { ascending: false })
    .limit(60);
  const body = stripBoilerplate(post.text || "", boilerplateLines((sample || []).map((r: any) => r.text)));
  const { data, error } = await s
    .from("products")
    .insert({
      workspace_id: o.workspaceId,
      name,
      slug: slugify(name) + "-" + Date.now().toString().slice(-5),
      description: publicDescription(body, ch) || null,
      price: o.price,
      compare_at_price: Number(o.compareAt) > o.price ? Number(o.compareAt) : null,
      cost_price: post.price ? Number(post.price) : null,
      currency: "MAD",
      specifications: {
        category: post.category || "",
        sourcing: {
          source: "telegram",
          post_id: post.id,
          supplier: ch?.display_name?.trim() || null,
          wholesale_price: post.price,
          min_qty: post.min_qty,
          ...(o.isPlatformAdmin ? { channel: ch?.title || ch?.username || null, url: post.url } : {}),
        },
      },
      image_urls: urls,
      is_active: true,
    })
    .select("id,name,price")
    .single();
  if (error) throw error;
  return { product: data, photos: urls.length, updated: false };
}
