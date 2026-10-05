import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { generateProfessionalStore } from "../../../lib/store-ai-generator";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import OpenAI from "openai";
import { decryptIntegrationSecret } from "../../../lib/integration-secrets";
import { createStoreProV2Config } from "../../../lib/store-pro-v2";
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
const allowedTemplates = new Set(["benchmark-ai"]);
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
    if (b.generateWithAI === true) {
      const { data: integration, error: integrationError } = await s
        .from("workspace_integrations")
        .select("openai_api_key_enc")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (integrationError) throw integrationError;
      let metaKey: string | null = null;
      try {
        metaKey = decryptIntegrationSecret(integration?.openai_api_key_enc) || process.env.MODEL_API_KEY || null;
      } catch (secretError: any) {
        console.error("Meta key decrypt failed", { message: secretError?.message });
        return NextResponse.json(
          {
            error:
              "La clé Meta Model API est enregistrée mais son déchiffrement a échoué. Réenregistre la clé dans Paramètres > Intégrations.",
            code: "META_AI_KEY_DECRYPT_FAILED",
          },
          { status: 500 },
        );
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
