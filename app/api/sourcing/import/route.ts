// Importe un produit du Sourcing Derb Omar dans « Mes produits » : photos copiées dans le stockage
// LandPro (les liens Telegram changent), prix de gros gardé comme coût d'achat.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";

export const maxDuration = 60;
const TG_HOST = /(^|\.)(telesco\.pe|telegram\.org|telegram-cdn\.org|cdn-telegram\.org)$/i;
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "produit";

export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const { data: post, error: pe } = await s
      .from("sourcing_posts")
      .select("id,url,text,photos,name,category,price,min_qty,sourcing_channels(username,title)")
      .eq("id", String(b.id || ""))
      .maybeSingle();
    if (pe) throw pe;
    if (!post) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    const name = String(b.name || post.name || "Produit Derb Omar")
      .trim()
      .slice(0, 120);
    const price = Number(b.price);
    if (!(price > 0)) return NextResponse.json({ error: "Indique ton prix de vente" }, { status: 400 });

    // photos : copiées dans landing-images/<workspace>/…
    const urls: string[] = [];
    for (const src of (post.photos || []).slice(0, 6)) {
      try {
        const u = new URL(src);
        if (u.protocol !== "https:" || !TG_HOST.test(u.hostname)) continue;
        const r = await fetch(u, { cache: "no-store", redirect: "error" });
        const type = r.headers.get("content-type") || "image/jpeg";
        if (!r.ok || !type.startsWith("image/")) continue;
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > 10 * 1024 * 1024) continue;
        const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
        const path = `${workspaceId}/sourcing-${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error } = await s.storage
          .from("landing-images")
          .upload(path, buf, { contentType: type, cacheControl: "31536000", upsert: false });
        if (!error) urls.push(s.storage.from("landing-images").getPublicUrl(path).data.publicUrl);
      } catch {
        // une photo illisible ne bloque pas l'import
      }
    }
    const ch: any = Array.isArray(post.sourcing_channels) ? post.sourcing_channels[0] : post.sourcing_channels;
    const { data, error } = await s
      .from("products")
      .insert({
        workspace_id: workspaceId,
        name,
        slug: slugify(name) + "-" + Date.now().toString().slice(-5),
        description: post.text || null,
        price,
        compare_at_price: Number(b.compare_at_price) > price ? Number(b.compare_at_price) : null,
        cost_price: post.price ? Number(post.price) : null,
        currency: "MAD",
        specifications: {
          category: post.category || "",
          sourcing: {
            source: "telegram",
            channel: ch?.title || ch?.username || null,
            url: post.url,
            wholesale_price: post.price,
            min_qty: post.min_qty,
          },
        },
        image_urls: urls,
        is_active: true,
      })
      .select("id,name")
      .single();
    if (error) throw error;
    return NextResponse.json({ product: data, photos: urls.length }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/sourcing/import");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
