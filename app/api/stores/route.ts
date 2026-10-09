import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { generateProfessionalStore } from "../../../lib/store-ai-generator";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import OpenAI from "openai";
import { createStoreProV2Config } from "../../../lib/store-pro-v2";
import { getStoreTemplate, seedStoreSettings, STORE_TEMPLATE_IDS } from "../../../lib/store-templates";
import { generateTemplateStore } from "../../../lib/store-templates/ai";
import { metaAsk, MetaModelError, resolveMetaKey } from "../../../lib/meta-model";
import { aiProductList } from "../../../lib/store-templates/ai-input";
function slugify(v: string) {
  return (
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "store"
  );
}
// "benchmark-ai" = ancien générateur IA ; s1-01… = templates de boutique par séries ;
// "ai-auto" = template de série choisi par l'IA
const allowedTemplates = new Set(["benchmark-ai", "ai-auto", ...STORE_TEMPLATE_IDS]);
// la génération IA peut prendre plus de 10 s
export const maxDuration = 60;
export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("stores")
      .select("id,name,slug,template_id,locale,status,settings,published_at,created_at,updated_at")
      .eq("workspace_id", workspaceId)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const stores = (data || []).map((v: any) => {
      const settings = v.settings || {};
      return {
        ...v,
        card_image:
          settings.heroImage ||
          settings.heroImages?.[0] ||
          settings.products?.[0]?.image ||
          settings.productImage ||
          "",
        selected_product_ids: Array.isArray(settings.selectedProductIds) ? settings.selectedProductIds : [],
        settings: undefined,
      };
    });
    return NextResponse.json({ stores });
  } catch (e: any) {
    reportError(e, "api/stores");
    return NextResponse.json({ error: publicMessage(e), stores: [] }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const b = await req.json(),
      { s, workspaceId } = await authContext(req);
    const name = String(b.name || "").trim(),
      locale = ["darija", "ar", "fr"].includes(b.locale) ? b.locale : "darija",
      templateId = allowedTemplates.has(b.templateId) ? b.templateId : "benchmark-ai";
    if (!name) return NextResponse.json({ error: "Nom de boutique requis" }, { status: 400 });
    const base = slugify(name),
      slug = base + "-" + Date.now().toString().slice(-6);
    let settings: any = {},
      resolvedTemplateId = templateId;
    const seriesTemplate = getStoreTemplate(templateId);
    if ((seriesTemplate || templateId === "ai-auto") && b.generateWithAI === true) {
      // Template de série + textes rédigés par Meta AI (template choisi par l'IA si "ai-auto")
      try {
        const ask = await metaAsk(s, workspaceId);
        const generated = await generateTemplateStore(ask, {
          name,
          locale,
          brief: String(b.brief || "").slice(0, 1500),
          products: aiProductList(b.products),
          templateId: seriesTemplate?.id,
        });
        settings = generated.settings;
        resolvedTemplateId = generated.templateId;
      } catch (aiError: any) {
        if (aiError instanceof MetaModelError)
          return NextResponse.json({ error: aiError.message, code: aiError.code }, { status: aiError.status });
        console.error("Store template AI generation failed", { message: aiError?.message });
        return NextResponse.json(
          {
            error: "La réponse de Meta AI est incomplète. Relance la génération (aucune boutique n'a été créée).",
            code: "META_AI_UNAVAILABLE",
          },
          { status: 502 },
        );
      }
    } else if (seriesTemplate) {
      // Template de série : boutique prête tout de suite, textes du template dans la langue choisie
      settings = seedStoreSettings(seriesTemplate, locale);
    } else if (b.generateWithAI === true) {
      let metaKey: string | null = null;
      try {
        metaKey = (await resolveMetaKey(s, workspaceId)).key;
      } catch (keyError: any) {
        if (keyError instanceof MetaModelError && keyError.code !== "META_AI_KEY_MISSING")
          return NextResponse.json({ error: keyError.message, code: keyError.code }, { status: keyError.status });
        if (!(keyError instanceof MetaModelError)) throw keyError;
      }
      if (metaKey) {
        try {
          const client = new OpenAI({ baseURL: "https://api.meta.ai/v1", apiKey: metaKey });
          const generated = await generateProfessionalStore({ client, name, locale, niche: String(b.niche || name) });
          settings = generated.settings;
          if (b.generatorVersion === "pro-v2") {
            settings = {
              ...settings,
              generatorVersion: "pro-v2",
              proPreset: String(b.proPreset || "modern-glow"),
              proV2: createStoreProV2Config(String(b.proPreset || "modern-glow")),
            };
          }
          resolvedTemplateId = generated.templateId;
        } catch (aiError: any) {
          console.error("Store Meta AI generation failed", {
            status: aiError?.status,
            code: aiError?.code,
            message: aiError?.message,
          });
          if (aiError?.status === 401)
            return NextResponse.json(
              {
                error:
                  "Meta Model API non autorisée (401). Vérifie ou remplace MODEL_API_KEY dans Paramètres > Intégrations. Aucun Store de secours n’a été généré.",
                code: "META_AI_UNAUTHORIZED",
              },
              { status: 401 },
            );
          return NextResponse.json(
            {
              error:
                "Meta AI est indisponible pour le moment. La génération a été arrêtée pour éviter de créer un Store incomplet.",
              code: "META_AI_UNAVAILABLE",
            },
            { status: 502 },
          );
        }
      } else {
        return NextResponse.json(
          {
            error:
              "Aucune Meta Model API Key configurée. Ajoute MODEL_API_KEY dans Paramètres > Intégrations avant de générer le Store avec IA.",
            code: "META_AI_KEY_MISSING",
          },
          { status: 422 },
        );
      }
    }
    const { data, error } = await s
      .from("stores")
      .insert({
        workspace_id: workspaceId,
        name,
        slug,
        template_id: resolvedTemplateId,
        locale,
        status: "DRAFT",
        settings,
      })
      .select("id,name,slug,template_id,locale,status,settings,published_at,created_at,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ store: data }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/stores");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
