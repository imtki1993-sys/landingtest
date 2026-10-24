// Catalogue du Sourcing Derb Omar (partagé entre tous les comptes LandPro).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { boilerplateLines, extractPhones, guessName, stripBoilerplate } from "../../../lib/sourcing-extract";
import { maskSupplier, supplierAliases } from "../../../lib/sourcing-privacy";
import { importedPosts } from "../../../lib/sourcing-import";

const missing = (e: any) =>
  ["42P01", "PGRST205"].includes(String(e?.code || "")) || /sourcing_/.test(String(e?.message || ""));
const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  try {
    const { s, isPlatformAdmin, workspaceId } = await authContext(req);
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
    // date de publication sur Telegram (jours du Maroc, UTC+1)
    const day = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
    const from = day(q.get("from"));
    const to = day(q.get("to"));
    // boutique Derb Omar du compte : « in » = produits déjà en vente, « todo » = pas encore mis en prix
    const shop = q.get("shop") === "in" ? "in" : q.get("shop") === "todo" ? "todo" : "";
    let mineIds: string[] = [];
    if (shop) {
      const { data: mine } = await s
        .from("products")
        .select("specifications->sourcing->>post_id")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .is("archived_at", null)
        .not("specifications->sourcing->>post_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(400);
      mineIds = ((mine || []) as any[]).map((r) => r.post_id).filter((x) => UUID.test(String(x)));
    }

    let query = s
      .from("sourcing_posts")
      .select("id,url,posted_at,text,photos,has_video,name,category,price,min_qty,phone,channel_id,extracted_by")
      .eq("is_product", true)
      .limit(limit + 1);
    if (withPhotos) query = query.neq("photos", "{}");
    if (shop === "in") query = query.in("id", mineIds.length ? mineIds : ["00000000-0000-0000-0000-000000000000"]);
    if (shop === "todo" && mineIds.length) query = query.not("id", "in", `(${mineIds.join(",")})`);
    if (search) query = query.or(`name.ilike.%${search}%,text.ilike.%${search}%`);
    if (category) query = query.eq("category", category);
    if (UUID.test(channel)) query = query.eq("channel_id", channel);
    if (maxPrice > 0) query = query.lte("price", maxPrice);
    if (from) query = query.gte("posted_at", new Date(`${from}T00:00:00+01:00`).toISOString());
    if (to) query = query.lte("posted_at", new Date(`${to}T23:59:59.999+01:00`).toISOString());
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
    // plus ancienne publication importée (pour proposer l'import d'une période plus ancienne)
    let oldestQ = s.from("sourcing_posts").select("posted_at").not("posted_at", "is", null);
    if (UUID.test(channel)) oldestQ = oldestQ.eq("channel_id", channel);
    const [posts, channels, oldestRow] = await Promise.all([
      query,
      s.from("sourcing_channels").select("*").order("title", { ascending: true }),
      from ? oldestQ.order("posted_at", { ascending: true }).limit(1) : Promise.resolve({ data: null }),
    ]);
    const oldest: string | null = (oldestRow as any)?.data?.[0]?.posted_at ?? null;
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
    // WhatsApp général du canal (description) : utilisé quand le message n'a pas de numéro
    const chanPhones = new Map<string, string[]>(
      ((channels.data || []) as any[]).map((c) => [c.id, extractPhones(c.description || "")]),
    );
    const chanById = new Map<string, any>(((channels.data || []) as any[]).map((c) => [c.id, c]));
    const alias = supplierAliases((channels.data || []) as any[]);
    for (const r of rows) {
      const body = stripBoilerplate(r.text || "", sig.get(r.channel_id) || new Set());
      r.body = body;
      r.phones = extractPhones(r.text || "");
      r.phones_from_channel = false;
      if (!r.phones.length && chanPhones.get(r.channel_id)?.length) {
        r.phones = chanPhones.get(r.channel_id);
        r.phones_from_channel = true;
      }
      // nom lu par règles : relu sans la signature (l'IA, elle, a déjà ignoré la signature)
      if (r.extracted_by !== "ai") r.name = guessName(body);
      delete r.extracted_by;
      // clients : ni nom du canal, ni lien Telegram, ni message complet (signature du canal)
      if (!isPlatformAdmin) {
        const c = chanById.get(r.channel_id);
        r.body = maskSupplier(body, c);
        r.name = r.name ? maskSupplier(r.name, c) || null : null;
        delete r.text;
        delete r.url;
      }
    }
    // état de chaque produit dans la boutique du compte (prix de vente choisi, en vente ou retiré)
    const mine = await importedPosts(
      s,
      workspaceId,
      rows.map((r) => r.id),
    ).catch(() => new Map());
    for (const r of rows) r.mine = mine.get(r.id) || null;
    const { data: stores } = await s
      .from("stores")
      .select("id,name,slug,status")
      .eq("workspace_id", workspaceId)
      .eq("settings->>sourcingOnly", "true")
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: true })
      .limit(1);
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
      store: stores?.[0] || null,
      items,
      next,
      oldest,
      // dernière lecture des canaux (le plus récent) : affichée sous les filtres
      lastSync:
        ((channels.data || []) as any[])
          .map((c) => c.last_synced_at)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null,
      // les clients ne voient ni l'état technique des canaux, ni leur nom ou photo : « Fournisseur N »
      channels: (channels.data || [])
        .filter((c: any) => isPlatformAdmin || c.active)
        .map((c: any) =>
          isPlatformAdmin
            ? { ...c, description: undefined, created_at: undefined, last_post_id: undefined, alias: alias.get(c.id) }
            : { id: c.id, username: "", title: c.display_name?.trim() || alias.get(c.id), photo_url: null },
        )
        .sort((a: any, b: any) =>
          isPlatformAdmin ? 0 : String(a.title).localeCompare(String(b.title), "fr", { numeric: true }),
        ),
    });
  } catch (e: any) {
    reportError(e, "api/sourcing");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
