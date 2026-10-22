// Landing Gemini — étape 3 : Gemini dessine toute la page (HTML/CSS) à partir des textes, de la fiche produit et
// des photos. Enregistrée en brouillon (render « gemini ») ; publiée depuis la page Landing Gemini.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { withLandingInvalidation } from "../../../../lib/landing-cache";
import { GeminiError, geminiText, imagePart } from "../../../../lib/gemini";
import { designPrompt, ensureOrderForm, sanitizeDesign } from "../../../../lib/gemini-design";

export const maxDuration = 300;

/** { pageId } → { html, content, images } */
async function handler(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const { data: page, error } = await s
      .from("landing_pages")
      .select("id,name,slug,locale,seo,products(price,compare_at_price)")
      .eq("workspace_id", workspaceId)
      .eq("id", String(b.pageId || ""))
      .maybeSingle();
    if (error) throw error;
    if (!page) return NextResponse.json({ error: "Landing introuvable" }, { status: 404 });
    const seo: any = page.seo || {};
    const content: any = seo.ai_content || {};
    const product: any = Array.isArray(page.products) ? page.products[0] : page.products;
    const price = Number(product?.price) || Number(b.price) || 0;
    const oldPrice = Number(product?.compare_at_price) || null;
    const language = String(page.locale || "ar-MA");
    const images: { url: string; role: string }[] = Array.isArray(content.gemini_images)
      ? content.gemini_images
      : (Array.isArray(seo.images) ? seo.images : []).map((u: string, i: number) => ({
          url: u,
          role: i ? "photo " + (i + 1) : "photo principale",
        }));
    if (!images.length) return NextResponse.json({ error: "Aucune photo pour cette landing." }, { status: 400 });
    const { gemini_html: _old, design_system: _ds, gemini_images: _gi, gemini_analysis, ...copy } = content;
    const refs = (await Promise.all(images.slice(0, 2).map((i) => imagePart(i.url)))).filter(Boolean) as any[];
    let raw: string;
    try {
      raw = await geminiText(
        designPrompt({
          name: page.name,
          price,
          oldPrice,
          language,
          copy: {
            headline: copy.headline,
            subheadline: copy.subheadline,
            problem: copy.problem,
            solution: copy.solution,
            benefits: copy.benefits,
            features: copy.features,
            how_steps: copy.how_steps,
            faq: copy.faq,
            cta: copy.cta,
            delivery: copy.delivery,
          },
          features: Array.isArray(gemini_analysis?.features) ? gemini_analysis.features : copy.features || [],
          images,
        }),
        refs,
      );
    } catch (e: any) {
      if (e instanceof GeminiError) return NextResponse.json({ error: e.message }, { status: e.status });
      throw e;
    }
    const html = ensureOrderForm(sanitizeDesign(raw), language, price);
    if (html.length < 500)
      return NextResponse.json({ error: "Gemini a renvoyé une page vide. Réessaie." }, { status: 502 });
    const nextContent = { ...content, gemini_html: html, render: "gemini" };
    const { error: ue } = await s
      .from("landing_pages")
      .update({ seo: { ...seo, ai_content: nextContent } })
      .eq("id", page.id)
      .eq("workspace_id", workspaceId);
    if (ue) throw ue;
    return NextResponse.json({
      html,
      content: nextContent,
      images: seo.images || [],
      slug: page.slug,
      price,
      oldPrice,
    });
  } catch (e: any) {
    reportError(e, "api/landing-gemini/design");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

export const POST = withLandingInvalidation(handler);
