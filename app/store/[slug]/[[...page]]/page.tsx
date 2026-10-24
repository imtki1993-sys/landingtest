import { adminDb } from "../../../../lib/server-auth";
import { cookies } from "next/headers";
import Storefront from "../Storefront";
import DocumentLang from "../../../../components/public/DocumentLang";
import type { Metadata } from "next";
import { cache } from "react";
const storeMeta = cache(async (slug: string) => {
  const { data } = await adminDb()
    .from("stores")
    .select("name,published_name,settings,published_settings,status")
    .eq("slug", slug)
    .maybeSingle();
  return data as any;
});
const clean = (v: any, max: number) =>
  String(v || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
// Titre et description propres à chaque boutique (au lieu de « Landing Page Motor »).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; page?: string[] }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params,
      st = await storeMeta(slug);
    if (!st) return { title: "Boutique introuvable", robots: { index: false } };
    const set: any = st.published_settings || st.settings || {};
    const title = clean(set.brand?.seo_title || st.published_name || st.name, 70) || "Boutique";
    const description = clean(set.brand?.seo_description || set.heroText || set.brand?.tagline, 160);
    const image = [set.heroImage, ...(Array.isArray(set.heroImages) ? set.heroImages : []), set.logo].find(
      (x: any) => typeof x === "string" && /^https?:\/\//.test(x),
    );
    return {
      title,
      description,
      robots: st.status === "PUBLISHED" ? undefined : { index: false },
      openGraph: { title, description, type: "website", images: image ? [{ url: image }] : undefined },
    };
  } catch {
    return { title: "Boutique" };
  }
}
export const dynamic = "force-dynamic";
export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; page?: string[] }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug, page } = await params;
  const { preview } = await searchParams;
  try {
    const s = adminDb();
    const { data: store } = await s
      .from("stores")
      .select(
        "id,workspace_id,name,slug,locale,template_id,settings,status,published_settings,published_name,published_locale,published_template_id",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (!store) return <div className="public-store-missing">Boutique introuvable</div>;
    if (preview) {
      const token = (await cookies()).get("lm_access")?.value;
      if (!token) return <div className="public-store-missing">Aperçu non autorisé</div>;
      const {
        data: { user },
      } = await s.auth.getUser(token);
      if (!user) return <div className="public-store-missing">Aperçu non autorisé</div>;
      const { data: ctx } = await s.rpc("resolve_user_context", { p_user_id: user.id });
      const resolved = Array.isArray(ctx) ? ctx[0] : ctx;
      if (!resolved || resolved.workspace_id !== store.workspace_id)
        return <div className="public-store-missing">Aperçu non autorisé</div>;
    } else if (store.status !== "PUBLISHED") return <div className="public-store-missing">Boutique introuvable</div>;
    if (!preview) {
      store.settings = store.published_settings || store.settings || {};
      store.name = store.published_name || store.name;
      store.locale = store.published_locale || store.locale;
      store.template_id = store.published_template_id || store.template_id;
    }
    // Boutique Derb Omar : seulement les produits du Sourcing mis en vente par le client
    const sourcingOnly = (store.settings as any)?.sourcingOnly === true;
    const [{ data: workspace }, { data: allProducts, error: productsError }] = await Promise.all([
      s.from("workspaces").select("settings").eq("id", store.workspace_id).maybeSingle(),
      s
        .from("products")
        .select("id,name,slug,description,short_description,price,compare_at_price,currency,image_urls,specifications")
        .eq("workspace_id", store.workspace_id)
        .eq("is_active", true)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(sourcingOnly ? 1000 : 100),
    ]);
    if (productsError) console.error("store products", slug, productsError.message);
    // tri fait ici (et non dans la requête) : une boutique Derb Omar garde les produits venus du Sourcing
    const rawProducts = (allProducts || [])
      .filter((p: any) => !sourcingOnly || !!p.specifications?.sourcing)
      .slice(0, 500);
    // jamais vu par les acheteurs : fournisseur, prix de gros, lien du grossiste
    const products = (rawProducts || []).map((p: any) => {
      if (!p.specifications?.sourcing) return p;
      const { sourcing: _hidden, ...specifications } = p.specifications;
      return { ...p, specifications };
    });
    store.settings = { ...(store.settings || {}), contactEmail: workspace?.settings?.contact_email || "" };
    // Numéro WhatsApp des Paramètres, utilisé si la boutique n'a pas le sien
    (store as any).workspace_whatsapp = workspace?.settings?.whatsapp_phone || "";
    return (
      <>
        <DocumentLang locale={(store as any).published_locale || (store as any).locale} />
        <Storefront store={store} products={products} page={(page || []).join("/") || "home"} />
      </>
    );
  } catch {
    return <div className="public-store-missing">Boutique indisponible</div>;
  }
}
