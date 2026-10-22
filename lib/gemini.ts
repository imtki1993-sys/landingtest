// Appels Gemini (Google) côté serveur : texte / analyse d'images (JSON) et génération d'images (Nano Banana).
// Clé : GEMINI_API_KEY (Vercel). Modèles réglables : GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const env = (k: string) =>
  String(process.env[k] || "")
    .trim()
    .replace(/^["']|["']$/g, "");

export const geminiKey = () => env("GEMINI_API_KEY");
export const GEMINI_TEXT_MODEL = () => env("GEMINI_TEXT_MODEL") || "gemini-3.6-flash";
export const GEMINI_IMAGE_MODEL = () => env("GEMINI_IMAGE_MODEL") || "gemini-nano-banana-2.1";
/** Modèles de secours quand le modèle principal est saturé (503) ou indisponible (404). */
const TEXT_FALLBACKS = ["gemini-3-flash-preview", "gemini-3.5-flash-lite"];
const IMAGE_FALLBACKS = ["gemini-2.5-flash-image"];
const chain = (main: string, fallbacks: string[]) => [main, ...fallbacks.filter((m) => m !== main)];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Erreurs passagères côté Google (surcharge, panne) : on réessaie puis on passe au modèle suivant. */
const TRANSIENT = new Set([500, 502, 503, 504]);

export class GeminiError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

/** Photo (lien) → partie image pour Gemini (4 Mo au plus). */
export async function imagePart(url: string): Promise<Part | null> {
  const r = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" }).catch(() => null);
  if (!r?.ok) return null;
  const type = (r.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
  if (!/^image\/(jpeg|png|webp)$/.test(type)) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (!buf.length || buf.length > 4 * 1024 * 1024) return null;
  return { inline_data: { mime_type: type, data: buf.toString("base64") } };
}

async function callOnce(model: string, body: unknown, timeout: number): Promise<any> {
  const key = geminiKey();
  const r = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeout),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = String(j?.error?.message || "").slice(0, 220);
    throw new GeminiError(
      r.status === 429
        ? "Quota Gemini atteint : réessaie dans une minute ou active la facturation dans Google AI Studio."
        : /api key/i.test(msg)
          ? "Clé Gemini refusée : vérifie GEMINI_API_KEY dans Vercel."
          : `Gemini (${model}) a répondu ${r.status}${msg ? " : " + msg : ""}`,
      r.status,
    );
  }
  return j;
}

/**
 * Appel avec reprise : surcharge passagère (503…) → 2 nouveaux essais espacés, puis modèle de secours ;
 * modèle inconnu (404) → modèle de secours. Les autres erreurs (clé, quota, consigne refusée) remontent tout de suite.
 */
async function call(models: string[], body: unknown, timeout = 120_000): Promise<any> {
  if (!geminiKey()) throw new GeminiError("Gemini n'est pas configuré : ajoute GEMINI_API_KEY dans Vercel.", 503);
  let last: GeminiError | null = null;
  let quota = false;
  for (const model of models) {
    for (const wait of [0, 1500, 4000]) {
      if (wait) await sleep(wait);
      try {
        return await callOnce(model, body, timeout);
      } catch (e: any) {
        if (!(e instanceof GeminiError)) throw e;
        last = e;
        if (e.status === 404) break; // modèle indisponible pour cette clé : suivant
        // quota épuisé pour CE modèle (les quotas sont par modèle, très bas en offre gratuite) : modèle suivant
        if (e.status === 429) {
          quota = true;
          break;
        }
        if (!TRANSIENT.has(e.status)) throw new GeminiError(e.message, 502);
      }
    }
  }
  if (quota)
    throw new GeminiError(
      "Quota Gemini atteint pour tous les modèles (offre gratuite de Google très limitée, surtout pour les photos). " +
        "Active la facturation dans Google AI Studio (Paramètres → Facturation) ou réessaie dans une minute.",
      429,
    );
  throw new GeminiError(
    last?.status === 404
      ? `Aucun modèle Gemini disponible pour cette clé (${models.join(", ")}).`
      : "Gemini est surchargé en ce moment (forte demande chez Google). Réessaie dans une minute.",
    503,
  );
}

const partsOf = (j: any): any[] => (j?.candidates || []).flatMap((c: any) => c?.content?.parts || []);

/** Réponse JSON (texte + images éventuelles en entrée). */
export async function geminiJson<T = any>(prompt: string, images: Part[] = []): Promise<T> {
  const j = await call(chain(GEMINI_TEXT_MODEL(), TEXT_FALLBACKS), {
    contents: [{ role: "user", parts: [...images, { text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });
  const text = partsOf(j)
    .map((p) => p.text || "")
    .join("")
    .trim();
  const clean = text.replace(/```json|```/gi, "").trim();
  const a = clean.indexOf("{"),
    b = clean.lastIndexOf("}");
  if (a < 0 || b <= a) throw new GeminiError("Gemini n'a pas renvoyé de JSON valide. Réessaie.");
  try {
    return JSON.parse(clean.slice(a, b + 1)) as T;
  } catch {
    throw new GeminiError("Gemini n'a pas renvoyé de JSON valide. Réessaie.");
  }
}

/** Image générée à partir d'une consigne et de photos de référence (le produit doit rester identique). */
export async function geminiImage(
  prompt: string,
  refs: Part[],
  aspectRatio = "1:1",
): Promise<{ data: Buffer; mime: string }> {
  const j = await call(
    chain(GEMINI_IMAGE_MODEL(), IMAGE_FALLBACKS),
    {
      contents: [{ role: "user", parts: [...refs, { text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio } },
    },
    150_000,
  );
  for (const p of partsOf(j)) {
    const d = p.inline_data || p.inlineData;
    if (d?.data && String(d.mime_type || d.mimeType || "image/png").startsWith("image/"))
      return { data: Buffer.from(d.data, "base64"), mime: String(d.mime_type || d.mimeType || "image/png") };
  }
  throw new GeminiError("Gemini n'a pas renvoyé d'image (consigne refusée ou réponse vide).");
}

/** Modèle du design complet (HTML/CSS) : le plus capable, avec secours. Réglable : GEMINI_DESIGN_MODEL. */
export const GEMINI_DESIGN_MODEL = () => env("GEMINI_DESIGN_MODEL") || "gemini-4-argon";

/** Réponse texte libre (ex. une page HTML complète), photos de référence en entrée possibles. */
export async function geminiText(prompt: string, images: Part[] = [], model = GEMINI_DESIGN_MODEL()): Promise<string> {
  const j = await call(
    chain(model, ["gemini-3.6-flash", ...TEXT_FALLBACKS]),
    {
      contents: [{ role: "user", parts: [...images, { text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 32768 },
    },
    240_000,
  );
  return partsOf(j)
    .map((p) => p.text || "")
    .join("")
    .trim();
}
