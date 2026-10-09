// Accès à la Meta Model API avec la clé du workspace (Paramètres > Intégrations),
// ou MODEL_API_KEY (clé de la plateforme) en secours, plafonnée par workspace.
// Renvoie une fonction `ask(prompt) → texte`.
import OpenAI from "openai";
import { decryptIntegrationSecret } from "./integration-secrets";
import { META_TEXT_MODEL, type AskModel } from "./store-templates/ai";

export class MetaModelError extends Error {
  constructor(
    public code:
      | "META_AI_KEY_MISSING"
      | "META_AI_KEY_DECRYPT_FAILED"
      | "META_AI_UNAUTHORIZED"
      | "META_AI_UNAVAILABLE"
      | "META_AI_QUOTA",
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Générations IA par workspace et par 30 jours sur la clé de la plateforme (variable PLATFORM_AI_MONTHLY_LIMIT). */
export const platformAiLimit = () => {
  const n = Number(process.env.PLATFORM_AI_MONTHLY_LIMIT);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 30;
};

/**
 * Clé à utiliser pour ce workspace : la sienne (illimitée), sinon celle de la plateforme
 * dans la limite de platformAiLimit() générations sur 30 jours glissants.
 */
export async function resolveMetaKey(s: any, workspaceId: string): Promise<{ key: string; platform: boolean }> {
  const { data, error } = await s
    .from("workspace_integrations")
    .select("openai_api_key_enc")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  let own: string | null = null;
  try {
    own = decryptIntegrationSecret(data?.openai_api_key_enc) || null;
  } catch {
    throw new MetaModelError(
      "META_AI_KEY_DECRYPT_FAILED",
      "La clé Meta Model API est enregistrée mais illisible. Réenregistre-la dans Paramètres > Intégrations.",
      500,
    );
  }
  if (own) return { key: own, platform: false };
  const platformKey = process.env.MODEL_API_KEY;
  if (!platformKey)
    throw new MetaModelError(
      "META_AI_KEY_MISSING",
      "Aucune clé Meta Model API configurée. Ajoute-la dans Paramètres > Intégrations.",
      422,
    );
  // Compteur glissant partagé (même RPC que la limite des commandes publiques)
  const { data: allowed, error: limitError } = await s.rpc("check_public_order_rate_limit", {
    p_key: "ai-platform|" + workspaceId,
    p_limit: platformAiLimit(),
    p_window_seconds: 30 * 24 * 3600,
  });
  if (limitError) throw limitError;
  if (!allowed)
    throw new MetaModelError(
      "META_AI_QUOTA",
      `Limite de ${platformAiLimit()} générations IA incluses sur 30 jours atteinte. Ajoute ta propre clé dans Paramètres > Intégrations pour continuer sans limite.`,
      429,
    );
  return { key: platformKey, platform: true };
}

export async function metaAsk(s: any, workspaceId: string): Promise<AskModel> {
  const { key } = await resolveMetaKey(s, workspaceId);
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
