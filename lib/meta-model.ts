// Accès à la Meta Model API avec la clé du workspace (Paramètres > Intégrations),
// ou MODEL_API_KEY en secours. Renvoie une fonction `ask(prompt) → texte`.
import OpenAI from "openai";
import { decryptIntegrationSecret } from "./integration-secrets";
import { META_TEXT_MODEL, type AskModel } from "./store-templates/ai";

export class MetaModelError extends Error {
  constructor(
    public code: "META_AI_KEY_MISSING" | "META_AI_KEY_DECRYPT_FAILED" | "META_AI_UNAUTHORIZED" | "META_AI_UNAVAILABLE",
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function metaAsk(s: any, workspaceId: string): Promise<AskModel> {
  const { data, error } = await s
    .from("workspace_integrations")
    .select("openai_api_key_enc")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  let key: string | null = null;
  try {
    key = decryptIntegrationSecret(data?.openai_api_key_enc) || process.env.MODEL_API_KEY || null;
  } catch {
    throw new MetaModelError(
      "META_AI_KEY_DECRYPT_FAILED",
      "La clé Meta Model API est enregistrée mais illisible. Réenregistre-la dans Paramètres > Intégrations.",
      500,
    );
  }
  if (!key)
    throw new MetaModelError(
      "META_AI_KEY_MISSING",
      "Aucune clé Meta Model API configurée. Ajoute-la dans Paramètres > Intégrations.",
      422,
    );
  const client = new OpenAI({ baseURL: "https://api.meta.ai/v1", apiKey: key });
  return async (prompt: string) => {
    try {
      const r: any = await client.responses.create({
        model: META_TEXT_MODEL,
        input: prompt,
        reasoning: { effort: "low" },
        store: false,
      } as any);
      return String(r.output_text || "");
    } catch (e: any) {
      console.error("Meta Model API error", { status: e?.status, code: e?.code, message: e?.message });
      if (e?.status === 401 || e?.status === 403)
        throw new MetaModelError(
          "META_AI_UNAUTHORIZED",
          "Meta Model API refuse la clé (401). Vérifie-la dans Paramètres > Intégrations.",
          401,
        );
      throw new MetaModelError(
        "META_AI_UNAVAILABLE",
        "Meta AI ne répond pas pour le moment. Réessaie dans un instant.",
        502,
      );
    }
  };
}
