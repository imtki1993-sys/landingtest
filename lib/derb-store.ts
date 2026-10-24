// Boutique Derb Omar publique : tout le catalogue du Sourcing, présenté comme la page Sourcing (par jour,
// catégories, recherche). Prix du client s'il en a mis un, sinon « prix sur demande ». Les acheteurs ne voient
// jamais le fournisseur, le prix de gros, la quantité minimum ni le contact du grossiste.
import { boilerplateLines, guessName, stripBoilerplate } from "./sourcing-extract";
import { isMirrored } from "./sourcing-media";
import { maskSupplier, publicDescription } from "./sourcing-privacy";
import { importedPosts } from "./sourcing-import";

export interface DerbItem {
  id: string;
  name: string;
  category: string | null;
  photos: string[];
  has_video: boolean;
  posted_at: string | null;
  /** prix de vente du client (null : prix sur demande) */
  price: number | null;
  compare: number | null;
  body: string;
}

export interface DerbStoreRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  status: string;
  locale: string;
  settings: any;
}

/** Le site Derb Omar est réservé à l'administrateur de la plateforme : compte avec un membre administrateur ? */
export async function isAdminWorkspace(s: any, workspaceId: string): Promise<boolean> {
  const { data: members } = await s.from("workspace_members").select("user_id").eq("workspace_id", workspaceId);
  const ids = (members || []).map((m: any) => m.user_id).filter(Boolean);
  if (!ids.length) return false;
  const { data: admins } = await s.from("users").select("id").in("id", ids).eq("is_platform_admin", true).limit(1);
  return !!admins?.length;
}

/** Boutique Derb Omar par son adresse (publiée, ou brouillon si `draft`). */
export async function derbStoreBySlug(s: any, slug: string, draft = false): Promise<DerbStoreRow | null> {
  const { data } = await s
    .from("stores")
    .select("id,workspace_id,name,slug,status,locale,settings,published_settings,published_name,published_locale")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || data.status === "ARCHIVED") return null;
  if (!draft && data.status !== "PUBLISHED") return null;
  const settings = (!draft && data.published_settings) || data.settings || {};
  if (settings.sourcingOnly !== true) return null;
  if (!(await isAdminWorkspace(s, data.workspace_id))) return null;
  return {
    id: data.id,
    workspace_id: data.workspace_id,
    name: (!draft && data.published_name) || data.name,
    slug: data.slug,
    status: data.status,
    locale: (!draft && data.published_locale) || data.locale,
    settings,
  };
}

export async function derbCatalog(
  s: any,
  workspaceId: string,
  o: { cursor?: string | null; category?: string; q?: string; limit?: number } = {},
): Promise<{ items: DerbItem[]; next: string | null }> {
  const limit = Math.min(60, Math.max(12, o.limit || 48));
  const search = String(o.q || "")
    .trim()
    .slice(0, 60)
    .replace(/[%,()*]/g, " ");
  const items: DerbItem[] = [];
  let cursor = o.cursor || null;
  let next: string | null = null;
  // les publications sans photo copiée chez nous ou retirées par le client sont sautées : on lit par paquets
  for (let round = 0; round < 4 && items.length < limit; round++) {
    let q = s
      .from("sourcing_posts")
      .select("id,channel_id,posted_at,text,photos,has_video,name,category,extracted_by")
      .eq("is_product", true)
      .neq("photos", "{}")
      .order("posted_at", { ascending: false, nullsFirst: false })
      .limit(limit * 2);
    if (cursor) q = q.lt("posted_at", cursor);
    if (o.category) q = q.eq("category", o.category);
    if (search) q = q.or(`name.ilike.%${search}%,text.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    const rows: any[] = data || [];
    if (!rows.length) {
      next = null;
      break;
    }
    const chanIds = [...new Set(rows.map((r) => r.channel_id))];
    const [chans, sample, mine] = await Promise.all([
      s.from("sourcing_channels").select("id,username,title").in("id", chanIds),
      s
        .from("sourcing_posts")
        .select("channel_id,text")
        .in("channel_id", chanIds)
        .order("posted_at", { ascending: false })
        .limit(40 * chanIds.length),
      importedPosts(
        s,
        workspaceId,
        rows.map((r) => r.id),
      ),
    ]);
    const chan = new Map<string, any>((chans.data || []).map((c: any) => [c.id, c]));
    const texts = new Map<string, string[]>();
    for (const r of (sample.data || []) as any[]) texts.set(r.channel_id, [...(texts.get(r.channel_id) || []), r.text]);
    const sig = new Map([...texts].map(([id, t]) => [id, boilerplateLines(t)]));
    for (const r of rows) {
      if (items.length >= limit) break;
      cursor = r.posted_at;
      const m = mine.get(r.id);
      if (m && !m.active && !m.onRequest) continue; // retiré de la vente par le client
      const photos = (r.photos || []).filter(isMirrored);
      if (!photos.length) continue;
      const c = chan.get(r.channel_id);
      const body = stripBoilerplate(r.text || "", sig.get(r.channel_id) || new Set());
      const name =
        (m?.active && m.name) || maskSupplier(r.extracted_by === "ai" ? r.name : guessName(body) || r.name, c) || null;
      if (!name) continue;
      items.push({
        id: r.id,
        name: name.slice(0, 120),
        category: r.category || null,
        photos: photos.slice(0, 6),
        has_video: !!r.has_video,
        posted_at: r.posted_at,
        price: m?.active ? m.price : null,
        compare: m?.active && m.compare && m.compare > m.price ? m.compare : null,
        body: publicDescription(body, c).slice(0, 1200),
      });
    }
    next = rows.length === limit * 2 || items.length >= limit ? cursor : null;
    if (rows.length < limit * 2) break;
  }
  return { items, next: items.length ? next : null };
}
