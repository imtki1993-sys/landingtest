import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminDb, authContext } from "../../../../lib/server-auth";
import { getPublicLanding } from "../../../../lib/public-landing";
import { getUiuxLibrary } from "../../../../lib/uiux-library-data";

const NO_STORE = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params,
      preview = new URL(req.url).searchParams.get("preview") === "1";

    // Page publiée : même source que le rendu serveur (lib/public-landing.ts, mise en cache).
    if (!preview) {
      const data = await getPublicLanding(slug);
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(
        { ...data, content: { ...(data.content || {}), uiux_library: getUiuxLibrary() } },
        { headers: NO_STORE },
      );
    }

    // Aperçu de l'éditeur : brouillon (pas la version publiée), réservé au workspace propriétaire.
    const s = adminDb();
    const { data: lp, error } = await s
      .from("landing_pages")
      .select("id,workspace_id,name,slug,locale,seo,product_id,status,archived_at,published_version_id")
      .eq("slug", slug)
      .is("archived_at", null)
      .maybeSingle();
    if (error || !lp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    try {
      const a = await authContext(req);
      if (a.workspaceId !== lp.workspace_id && !a.isPlatformAdmin)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [{ data: p }, { data: w }] = await Promise.all([
      s
        .from("products")
        .select("name,price,compare_at_price,description,image_urls")
        .eq("id", lp.product_id)
        .maybeSingle(),
      s.from("workspaces").select("settings").eq("id", lp.workspace_id).maybeSingle(),
    ]);
    const seo: any = lp.seo || {},
      product: any = p || {};
    const whatsapp = seo.whatsapp_phone || (w?.settings as any)?.whatsapp_phone || "";
    return NextResponse.json(
      {
        id: lp.id,
        name: product.name || lp.name,
        price: product.price,
        oldPrice: product.compare_at_price,
        description: product.description,
        locale: lp.locale,
        content: { ...(seo.ai_content || {}), uiux_library: getUiuxLibrary() },
        images: seo.images || product.image_urls || [],
        whatsappPhone: String(whatsapp).replace(/\D/g, ""),
        metaPixelId: seo.meta_pixel_id || null,
      },
      { headers: NO_STORE },
    );
  } catch (e: any) {
    reportError(e, "api/landing/[slug]");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
