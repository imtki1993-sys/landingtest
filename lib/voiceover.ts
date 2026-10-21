// Voix off darija : catalogue des voix et fournisseurs de synthèse.
// 1. Habibi-TTS (modèle marocain, Apache 2.0) sur le service GPU de LandPro (services/darija-tts),
//    voix de référence tirées du corpus DODa (7 comédiens marocains, enregistrés en studio).
// 2. Azure Speech (voix « arabe du Maroc » Jamal / Mouna) en secours, sans GPU.

export type VoiceProvider = "habibi" | "azure";
export interface Voice {
  id: string;
  label: string;
  gender: "f" | "m";
  provider: VoiceProvider;
  /** description courte affichée dans le choix */
  hint: string;
}

export const VOICES: Voice[] = [
  { id: "doda-f1", label: "Salma", gender: "f", provider: "habibi", hint: "Femme · claire, posée" },
  { id: "doda-f2", label: "Nadia", gender: "f", provider: "habibi", hint: "Femme · chaleureuse" },
  { id: "doda-f3", label: "Imane", gender: "f", provider: "habibi", hint: "Femme · jeune, dynamique" },
  { id: "doda-f4", label: "Kenza", gender: "f", provider: "habibi", hint: "Femme · douce" },
  { id: "doda-m1", label: "Youssef", gender: "m", provider: "habibi", hint: "Homme · grave, confiant" },
  { id: "doda-m2", label: "Hamza", gender: "m", provider: "habibi", hint: "Homme · énergique" },
  { id: "doda-m3", label: "Karim", gender: "m", provider: "habibi", hint: "Homme · naturel" },
  { id: "azure-jamal", label: "Jamal", gender: "m", provider: "azure", hint: "Homme · Azure (arabe du Maroc)" },
  { id: "azure-mouna", label: "Mouna", gender: "f", provider: "azure", hint: "Femme · Azure (arabe du Maroc)" },
];

/** Variable d'environnement sans espaces ni guillemets parasites (copier-coller dans Vercel). */
const env = (k: string) =>
  String(process.env[k] || "")
    .trim()
    .replace(/^["']|["']$/g, "");

/** Fournisseurs configurés sur ce déploiement (variables d'environnement Vercel). */
export function availableProviders(): VoiceProvider[] {
  const out: VoiceProvider[] = [];
  if (env("TTS_SERVICE_URL") && env("TTS_SERVICE_TOKEN")) out.push("habibi");
  if (env("AZURE_SPEECH_KEY") && env("AZURE_SPEECH_REGION")) out.push("azure");
  return out;
}

/** Pauses entre les phrases. */
export const PAUSES = { courtes: 0.6, normales: 1, longues: 1.5 } as const;
export type PauseKind = keyof typeof PAUSES;

export interface SynthesisOptions {
  speed?: number;
  pause?: PauseKind;
  /** durée visée (s) : l'audio trop long est accéléré sans changer la voix (25 % au plus) */
  targetSeconds?: number | null;
  /** silence après chaque phrase (s), calculé d'après la ponctuation (normalizeDarija) */
  gaps?: number[];
}

export interface Synthesis {
  audio: Buffer;
  mime: string;
  seconds: number | null;
}

/** Habibi-TTS sur le service GPU : une phrase à la fois, pauses et volume gérés par le service. */
async function habibi(
  sentences: string[],
  voice: string,
  speed: number,
  pause: number,
  target: number | null,
  gaps: number[] | null,
): Promise<Synthesis> {
  const base = env("TTS_SERVICE_URL").replace(/\/+$/, "");
  const r = await fetch(base + "/synthesize", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env("TTS_SERVICE_TOKEN"),
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({ sentences, voice, speed, pause, target_seconds: target, gaps, expressive: true }),
    cache: "no-store",
    signal: AbortSignal.timeout(240_000),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(
      r.status === 401
        ? "Le service de voix refuse la clé : TTS_SERVICE_TOKEN dans Vercel doit être exactement la même valeur que le secret GitHub TTS_SERVICE_TOKEN (64 caractères)."
        : `Le service de voix a répondu ${r.status}${detail ? " : " + detail.slice(0, 160) : ""}`,
    );
  }
  const seconds = Number(r.headers.get("x-audio-seconds"));
  return {
    audio: Buffer.from(await r.arrayBuffer()),
    mime: r.headers.get("content-type") || "audio/mpeg",
    seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : null,
  };
}

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** Azure Speech, voix ar-MA ; une courte pause entre les phrases. */
async function azure(
  sentences: string[],
  voice: string,
  speed: number,
  pause: number,
  gaps: number[] | null,
): Promise<Synthesis> {
  const name = voice === "azure-mouna" ? "ar-MA-MounaNeural" : "ar-MA-JamalNeural";
  const rate = `${Math.round((speed - 1) * 100) >= 0 ? "+" : ""}${Math.round((speed - 1) * 100)}%`;
  const ssml = `<speak version="1.0" xml:lang="ar-MA"><voice name="${name}"><prosody rate="${rate}">${sentences
    .map(
      (s, i) =>
        esc(s) +
        (i < sentences.length - 1 ? `<break time="${Math.round((gaps ? gaps[i] * 1000 : 350) * pause)}ms"/>` : ""),
    )
    .join("")}</prosody></voice></speak>`;
  const r = await fetch(`https://${env("AZURE_SPEECH_REGION")}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env("AZURE_SPEECH_KEY"),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "LandPro",
    },
    body: ssml,
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!r.ok) throw new Error(`Azure Speech a répondu ${r.status}`);
  return { audio: Buffer.from(await r.arrayBuffer()), mime: "audio/mpeg", seconds: null };
}

export async function synthesize(sentences: string[], voiceId: string, o: SynthesisOptions = {}): Promise<Synthesis> {
  const voice = VOICES.find((v) => v.id === voiceId);
  if (!voice) throw new Error("Voix inconnue");
  if (!availableProviders().includes(voice.provider))
    throw new Error(
      voice.provider === "habibi"
        ? "Le service de voix darija n'est pas encore branché (TTS_SERVICE_URL / TTS_SERVICE_TOKEN)."
        : "Azure Speech n'est pas configuré (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION).",
    );
  const s = Math.min(1.3, Math.max(0.7, Number(o.speed) || 1));
  const pause = PAUSES[o.pause as PauseKind] ?? 1;
  const target = Number(o.targetSeconds) >= 5 ? Math.min(90, Number(o.targetSeconds)) : null;
  const gaps =
    Array.isArray(o.gaps) && o.gaps.length === sentences.length
      ? o.gaps.map((g) => Math.min(1.5, Math.max(0, Number(g) || 0)))
      : null;
  return voice.provider === "habibi"
    ? habibi(sentences, voice.id, s, pause, target, gaps)
    : azure(sentences, voice.id, s, pause, gaps);
}

// ─── Script ───
export const DURATIONS = [15, 30, 45, 60] as const;
export const TONES: Record<string, string> = {
  energique: "énergique et enthousiaste, rythme rapide, comme une pub TikTok",
  chaleureux: "chaleureux et proche, comme une amie qui conseille",
  premium: "élégant et posé, haut de gamme",
  drole: "drôle et léger, avec une petite touche d'humour marocain",
  temoignage: "témoignage d'un client satisfait, à la première personne",
};
export const ANGLES: Record<string, string> = {
  probleme: "problème du quotidien → le produit le résout",
  offre: "offre limitée : prix barré, stock limité, commander maintenant",
  benefices: "3 bénéfices concrets du produit",
  demonstration: "décrire ce qu'on voit dans la vidéo, étape par étape",
};

export function scriptPrompt(p: {
  name: string;
  description?: string;
  price?: number | null;
  oldPrice?: number | null;
  seconds: number;
  tone: string;
  angle: string;
  audience?: string;
  notes?: string;
}): string {
  const words = Math.round(p.seconds * 2.4);
  return `Tu es un copywriter marocain spécialisé dans les publicités vidéo COD (paiement à la livraison) sur Facebook et TikTok.
Écris le script de VOIX OFF d'une publicité pour ce produit, en DARIJA MAROCAINE écrite en alphabet arabe, exactement comme on parle à Casablanca.

Produit : ${p.name}
${p.description ? "Description : " + p.description.slice(0, 1200) : ""}
${p.price ? "Prix : " + p.price + " درهم" : ""}${p.oldPrice ? " (au lieu de " + p.oldPrice + " درهم)" : ""}
${p.audience ? "Public : " + p.audience : ""}
Ton : ${TONES[p.tone] || TONES.energique}
Angle : ${ANGLES[p.angle] || ANGLES.probleme}
${p.notes ? "Consignes du vendeur : " + p.notes.slice(0, 400) : ""}

Règles :
- Durée lue : ${p.seconds} secondes, soit environ ${words} mots au total (pas plus).
- Structure : une accroche forte dans la première phrase (question ou situation que le client vit), puis le produit, puis l'offre, puis l'appel à l'action « الخلاص عند الاستلام » et « التوصيل لجميع المدن ».
- Phrases courtes (5 à 12 mots), une idée par phrase, UNE PHRASE PAR LIGNE.
- Ponctue comme on parle, la voix suit la ponctuation :
  « ؟ » pour les vraies questions (واش…؟ علاش…؟ شحال…؟), « ! » pour l'enthousiasme et l'urgence,
  « ، » pour respirer au milieu d'une phrase, « … » pour un petit suspense avant une révélation (le prix, l'offre).
- Ajoute 1 ou 2 réactions marocaines naturelles là où elles sonnent vrai (ex. « واو! »، « والله! »، « ياك؟ »، « صافي! »، « يالاه! »، « شوف شوف… »), sans en abuser.
- DARIJA PARLÉE, jamais d'arabe classique (fusha). Utilise : هاد، هادي، دابا، بزاف، غير، كاين، ماكاينش، ديال، واخا، علاش، فين، شنو، كيفاش، باش، ملي، بغيتي، تقدر، حاجة، زوين، واعر، فابور، خود، طلب.
  N'utilise JAMAIS : هذا، هذه، الآن، جدا، فقط، أيضا، لماذا، ماذا، كيف، سوف، الذي، التي، يمكنك، تستطيع، شيء، رائع، مجانا.
  Exemple du ton attendu, une phrase par ligne : « واش عييتي من التليفون اللي كيطيح ليك فالطوموبيل؟ » / « صافي، سالا هاد المشكل! » / « هاد الحامل كيشد مزيان، حتى ف الحفر. » / « والثمن… غير 199 درهم! »
- Alphabet arabe uniquement : PAS de mots en lettres latines, PAS d'emojis, PAS de hashtags.
- Écris les prix et les nombres en CHIFFRES suivis de « درهم » (ex. « 199 درهم ») : ils seront lus correctement par la voix.
- N'invente aucune caractéristique, certification, garantie ou résultat qui n'est pas dans la description. Aucune promesse médicale.
Réponds UNIQUEMENT avec ce JSON : {"title":"titre court en français (4 à 6 mots)","lines":["phrase 1","phrase 2","…"]}`;
}
