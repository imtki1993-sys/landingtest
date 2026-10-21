// Catalogue du Sourcing Derb Omar (partagé entre tous les comptes LandPro).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { boilerplateLines, extractPhones, guessName, stripBoilerplate } from "../../../lib/sourcing-extract";

const missing = (e: any) =>
  ["42P01", "PGRST205"].includes(String(e?.code || "")) || /sourcing_/.test(String(e?.message || ""));
const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  try {
    const { s, isPlatformAdmin } = await authContext(req);
    const q = new URL(req.url).searchParams;
    const limit = Math.min(60, Math.max(1, Number(q.get("limit") || 36)));
    const search = (q.get("q") || "")
      .trim()
      .slice(0, 80)
      .replace(/[%,()*]/g, " ");
    const category = (q.get("category") || "").slice(0, 60);
    const channel = q.get("channel") || "";
    const maxPrice = Number(q.get("max_price") || 0);
    const sort = q.get("sort") === "price" ? "price" : "recent";
    const cursor = q.get("cursor");
    const withPhotos = q.get("photos") !== "0";

    let query = s
      .from("sourcing_posts")
      .select("id,url,posted_at,text,photos,has_video,name,category,price,min_qty,phone,channel_id,extracted_by")
      .eq("is_product", true)
      .limit(limit + 1);
    if (withPhotos) query = query.neq("photos", "{}");
    if (search) query = query.or(`name.ilike.%${search}%,text.ilike.%${search}%`);
    if (category) query = query.eq("category", category);
    if (UUID.test(channel)) query = query.eq("channel_id", channel);
    if (maxPrice > 0) query = query.lte("price", maxPrice);
    if (sort === "price") {
      query = query
        .not("price", "is", null)
        .order("price", { ascending: true })
        .order("posted_at", { ascending: false });
      if (cursor) query = query.range(Number(cursor) || 0, (Number(cursor) || 0) + limit);
    } else {
      query = query.order("posted_at", { ascending: false, nullsFirst: false });
      if (cursor) query = query.lt("posted_at", cursor);
    }
    const [posts, channels] = await Promise.all([
      query,
      s
        .from("sourcing_channels")
        .select("id,username,title,photo_url,active,last_synced_at,last_error")
        .order("title", { ascending: true }),
    ]);
    if (posts.error || channels.error) {
      const e = posts.error || channels.error;
      if (missing(e)) return NextResponse.json({ installed: false, isPlatformAdmin });
      throw e;
    }
    const rows: any[] = posts.data || [];
    // Signature répétée de chaque canal (nom, slogan, numéros) : retirée du texte affiché et du nom
    const chanIds = [...new Set(rows.map((r) => r.channel_id))];
    const sample = chanIds.length
      ? await s
          .from("sourcing_posts")
          .select("channel_id,text")
          .in("channel_id", chanIds)
          .order("posted_at", { ascending: false })
          .limit(60 * chanIds.length)
      : { data: [] };
    const byChan = new Map<string, string[]>();
    for (const r of (sample.data || []) as any[]) {
      const list = byChan.get(r.channel_id) || [];
      if (list.length < 60) list.push(r.text || "");
      byChan.set(r.channel_id, list);
    }
    const sig = new Map([...byChan].map(([id, texts]) => [id, boilerplateLines(texts)]));
    for (const r of rows) {
      const body = stripBoilerplate(r.text || "", sig.get(r.channel_id) || new Set());
      r.body = body;
      r.phones = extractPhones(r.text || "");
      // nom lu par règles : relu sans la signature (l'IA, elle, a déjà ignoré la signature)
      if (r.extracted_by !== "ai") r.name = guessName(body);
      delete r.extracted_by;
    }
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const next = !hasMore
      ? null
      : sort === "price"
        ? String((Number(cursor) || 0) + limit)
        : items[items.length - 1]?.posted_at || null;
    return NextResponse.json({
      installed: true,
      isPlatformAdmin,
      items,
      next,
      // les clients ne voient pas l'état technique des canaux
      channels: (channels.data || [])
        .filter((c: any) => isPlatformAdmin || c.active)
        .map((c: any) =>
          isPlatformAdmin ? c : { id: c.id, username: c.username, title: c.title, photo_url: c.photo_url },
        ),
    });
  } catch (e: any) {
    reportError(e, "api/sourcing");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
