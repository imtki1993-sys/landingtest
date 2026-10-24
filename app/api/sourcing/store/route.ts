// Boutique Derb Omar d'un compte : une boutique LandPro qui ne montre que les produits du Sourcing que le
// client a mis en prix. Les nouveaux produits des grossistes apparaissent dans « À mettre en prix » ;
// le client fixe son prix de vente et le produit passe en vente dans la boutique.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { getStoreTemplate, seedStoreSettings } from "../../../../lib/store-templates";

const TEMPLATE = "s1-08"; // « Marketplace Gris » : boutique multi-catégories
const fail = (e: any, where: string) => {
  reportError(e, where);
  return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
};
const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "boutique";

/** { name, locale } : crée la boutique Derb Omar du compte (une seule par compte). */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const { data: found } = await s
      .from("stores")
      .select("id,name,slug,status")
      .eq("workspace_id", workspaceId)
      .eq("settings->>sourcingOnly", "true")
      .neq("status", "ARCHIVED")
      .limit(1);
    if (found?.[0]) return NextResponse.json({ store: found[0] });
    const name = String(b.name || "")
      .trim()
      .slice(0, 80);
    if (!name) return NextResponse.json({ error: "Donne un nom à ta boutique." }, { status: 400 });
    const locale = ["darija", "ar", "fr"].includes(b.locale) ? b.locale : "darija";
    const t = getStoreTemplate(TEMPLATE);
    const settings = { ...(t ? seedStoreSettings(t, locale) : {}), sourcingOnly: true };
    const { data, error } = await s
      .from("stores")
      .insert({
        workspace_id: workspaceId,
        name,
        slug: slugify(name) + "-" + Date.now().toString().slice(-6),
        template_id: t ? TEMPLATE : "benchmark-ai",
        locale,
        status: "DRAFT",
        settings,
      })
      .select("id,name,slug,status")
      .single();
    if (error) throw error;
    return NextResponse.json({ store: data }, { status: 201 });
  } catch (e) {
    return fail(e, "api/sourcing/store");
  }
}

/** { productId, active } : retire un produit de la boutique (ou le remet en vente). */
export async function PATCH(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const { error } = await s
      .from("products")
      .update({ is_active: !!b.active })
      .eq("workspace_id", workspaceId)
      .eq("id", String(b.productId || ""))
      .not("specifications->sourcing", "is", null);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e, "api/sourcing/store");
  }
}
