// Landing Gemini — étape 2 : textes de vente + photos de mise en scène, puis création de la landing page
// (même format que le générateur d'origine : elle s'ouvre dans l'éditeur habituel). Le générateur d'origine
// (/api/pages) n'est pas modifié.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { withLandingInvalidation } from "../../../../lib/landing-cache";
import { landingTemplate } from "../../../../lib/landing-template-presets";
import { generateUiUxProMaxDesignSystem } from "../../../../lib/uiux-pro-max-engine";
import { GeminiError, geminiImage, geminiJson, imagePart } from "../../../../lib/gemini";
import { cleanAnalysis, cleanCopy, copyPrompt, imagePrompt } from "../../../../lib/gemini-landing";

export const maxDuration = 300;
// photos générées par compte et par 24 h (chaque image est facturée par Google) ; réglable dans Vercel
const IMAGE_DAILY_LIMIT = Math.max(0, Number(process.env.GEMINI_IMAGE_DAILY_LIMIT) || 60);
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

async function handler(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const { data: usage, error: usageError } = await s.rpc("workspace_plan_usage", { p_workspace_id: workspaceId });
    if (usageError) throw usageError;
    const plan = Array.isArray(usage) ? usage[0] : usage;
    if (!plan || !["active", "trialing"].includes(String(plan.subscription_status)))
      return NextResponse.json({ error: "Abonnement inactif. Contacte l’administrateur." }, { status: 403 });
    if (Number(plan.landings_used || 0) >= Number(plan.landing_limit || 0))
      return NextResponse.json(
        { error: `Limite du plan atteinte (${plan.landing_limit} landing pages).` },
        { status: 403 },
      );

    const name = String(b.name || "")
      .trim()
      .slice(0, 120);
    if (!name) return NextResponse.json({ error: "Indique le nom du produit." }, { status: 400 });
    const price = Math.max(0, Number(b.price) || 149);
    const oldPrice = Number(b.oldPrice) > price ? Number(b.oldPrice) : null;
    const language = String(b.language || "ar-MA");
    const description = String(b.description || "").slice(0, 3000);
    const productImages: string[] = (Array.isArray(b.images) ? b.images : [])
      .filter((u: unknown) => typeof u === "string" && u.trim())
      .slice(0, 10);
    if (!productImages.length)
      return NextResponse.json({ error: "Ajoute au moins une photo du produit." }, { status: 400 });
    const analysis = cleanAnalysis(b.analysis);
    if (!analysis.features.length)
      return NextResponse.json({ error: "Analyse du produit manquante : relance l’analyse." }, { status: 400 });
    let imageCount = Math.min(4, Math.max(0, Number(b.imageCount) || 0));
    if (imageCount && IMAGE_DAILY_LIMIT) {
      const { data: ok } = await s.rpc("check_public_order_rate_limit", {
        p_key: "gemini-img|" + workspaceId,
        p_limit: Math.ceil(IMAGE_DAILY_LIMIT / Math.max(1, imageCount)),
        p_window_seconds: 24 * 3600,
      });
      if (ok === false) imageCount = 0;
    }

    const refs = (await Promise.all(productImages.slice(0, 3).map(imagePart))).filter(Boolean) as any[];
    let copy;
    try {
      copy = cleanCopy(
        await geminiJson(copyPrompt({ name, price, oldPrice, description, language, analysis, imageCount }), refs),
        name,
      );
    } catch (e: any) {
      if (e instanceof GeminiError) return NextResponse.json({ error: e.message }, { status: e.status });
      throw e;
    }

    // photos de mise en scène, en parallèle ; une photo ratée n'empêche pas la landing
    const briefs = copy.image_briefs.slice(0, imageCount);
    const shots = await Promise.allSettled(
      briefs.map(async (brief, i) => {
        const img = await geminiImage(imagePrompt(brief.prompt, name), refs, i === 0 ? "1:1" : "4:5");
        const path = `${workspaceId}/gemini-${Date.now()}-${crypto.randomUUID()}.${EXT[img.mime] || "png"}`;
        const up = await s.storage
          .from("landing-images")
          .upload(path, img.data, { contentType: img.mime, cacheControl: "31536000", upsert: false });
        if (up.error) throw up.error;
        return { kind: brief.kind, url: s.storage.from("landing-images").getPublicUrl(path).data.publicUrl as string };
      }),
    );
    const generated = shots.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const imageErrors = shots.flatMap((r) => (r.status === "rejected" ? [String(r.reason?.message || r.reason)] : []));

    // création de la landing (même procédure que le générateur d'origine)
    const slug =
      (name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || "landing") +
      "-" +
      crypto.randomUUID().replace(/-/g, "").slice(0, 10);
    const { data, error } = await s.rpc("create_landing_product_for_workspace", {
      p_workspace_id: workspaceId,
      p_name: name,
      p_slug: slug,
      p_price: price,
      p_old_price: oldPrice,
      p_description: description || copy.description,
      p_language: language,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    const id = row?.landing_page_id || row?.page_id || row?.id;
    const q = s.from("landing_pages").select("id,name,slug,status,locale,seo").eq("workspace_id", workspaceId);
    const { data: page } = await (id ? q.eq("id", id) : q.eq("slug", slug)).single();
    if (!page) return NextResponse.json({ error: "Création impossible" }, { status: 500 });

    const tpl = landingTemplate(String(b.templateId || "cod-direct"));
    const ds = generateUiUxProMaxDesignSystem({
      name,
      description: description || copy.description,
      characteristics: analysis.features.join("\n"),
      language,
    });
    const hero = generated.find((g) => g.kind === "hero") || generated[0];
    const others = generated.filter((g) => g !== hero);
    // photo principale : la mise en scène Gemini, puis les vraies photos du vendeur, puis les autres mises en scène
    const images = [...(hero ? [hero.url] : []), ...productImages, ...others.map((g) => g.url)].slice(0, 14);
    const imageTextId = "custom-ai-image-text",
      galleryId = "custom-ai-gallery";
    const { image_briefs: _briefs, headline_b, ...text } = copy;
    const content = {
      ...text,
      delivery: copy.delivery || "Paiement à la livraison",
      delivery_price: 0,
      characteristics: analysis.features.join("\n"),
      headline_variants: [copy.headline, headline_b].filter(Boolean),
      generator: "gemini",
      gemini_analysis: analysis,
      builder_template: tpl.id,
      builder_pattern: tpl.pattern,
      landing_template_id: tpl.id,
      landing_template_family: tpl.visualFamily || "conversion",
      landing_template_accent: tpl.accent,
      landing_template_dark: tpl.dark === true,
      order_form_style: tpl.formStyle,
      custom_sections: {
        [imageTextId]: {
          type: "imageText",
          title: copy.features_title || copy.headline,
          text: copy.solution || copy.description,
          image: others[0]?.url || productImages[1] || productImages[0],
        },
        [galleryId]: { type: "gallery", title: "", images },
      },
      design_profile: ds.style["Style ID"] || ds.style["Style Category"],
      design_system: ds,
      hidden_sections: [],
      section_order: Array.from(
        new Set(["hero", imageTextId, ...tpl.sectionOrder.filter((x: string) => x !== "hero"), galleryId]),
      ),
    };
    const seo = { ...((page.seo as any) || {}), images, ai_content: content };
    const { error: ue } = await s
      .from("landing_pages")
      .update({ seo })
      .eq("id", page.id)
      .eq("workspace_id", workspaceId);
    if (ue) throw ue;
    return NextResponse.json(
      {
        page: { ...page, seo },
        headlines: content.headline_variants,
        generated,
        imageErrors: imageErrors.slice(0, 3),
        imagesSkipped: Math.min(4, Math.max(0, Number(b.imageCount) || 0)) - imageCount,
      },
      { status: 201 },
    );
  } catch (e: any) {
    reportError(e, "api/landing-gemini/generate");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

export const POST = withLandingInvalidation(handler);
