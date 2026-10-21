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

/** Fournisseurs configurés sur ce déploiement (variables d'environnement Vercel). */
export function availableProviders(): VoiceProvider[] {
  const out: VoiceProvider[] = [];
  if (process.env.TTS_SERVICE_URL && process.env.TTS_SERVICE_TOKEN) out.push("habibi");
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) out.push("azure");
  return out;
}

export interface Synthesis {
  audio: Buffer;
  mime: string;
  seconds: number | null;
}

/** Habibi-TTS sur le service GPU : une phrase à la fois, pauses et volume gérés par le service. */
async function habibi(sentences: string[], voice: string, speed: number): Promise<Synthesis> {
  const base = String(process.env.TTS_SERVICE_URL).replace(/\/+$/, "");
  const r = await fetch(base + "/synthesize", {
    method: "POST",
    headers: {
      authorization: "Bearer " + process.env.TTS_SERVICE_TOKEN,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({ sentences, voice, speed }),
    cache: "no-store",
    signal: AbortSignal.timeout(240_000),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(
      r.status === 401
        ? "Le service de voix refuse la clé (TTS_SERVICE_TOKEN)."
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
async function azure(sentences: string[], voice: string, speed: number): Promise<Synthesis> {
  const name = voice === "azure-mouna" ? "ar-MA-MounaNeural" : "ar-MA-JamalNeural";
  const rate = `${Math.round((speed - 1) * 100) >= 0 ? "+" : ""}${Math.round((speed - 1) * 100)}%`;
  const ssml = `<speak version="1.0" xml:lang="ar-MA"><voice name="${name}"><prosody rate="${rate}">${sentences
    .map((s) => esc(s))
    .join('<break time="350ms"/>')}</prosody></voice></speak>`;
  const r = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": String(process.env.AZURE_SPEECH_KEY),
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

export async function synthesize(sentences: string[], voiceId: string, speed = 1): Promise<Synthesis> {
  const voice = VOICES.find((v) => v.id === voiceId);
  if (!voice) throw new Error("Voix inconnue");
  if (!availableProviders().includes(voice.provider))
    throw new Error(
      voice.provider === "habibi"
        ? "Le service de voix darija n'est pas encore branché (TTS_SERVICE_URL / TTS_SERVICE_TOKEN)."
        : "Azure Speech n'est pas configuré (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION).",
    );
  const s = Math.min(1.3, Math.max(0.7, Number(speed) || 1));
  return voice.provider === "habibi" ? habibi(sentences, voice.id, s) : azure(sentences, voice.id, s);
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
- Structure : une accroche forte dans la première phrase (question ou situation que le client vit), puis le produit, puis l'offre, puis l'appel à l'action « الدفع عند الاستلام » et « التوصيل لجميع المدن ».
- Phrases courtes (5 à 12 mots), une idée par phrase, ponctuation qui marque les respirations.
- Darija naturelle en alphabet arabe : PAS de mots en lettres latines, PAS d'emojis, PAS de hashtags.
- Écris les prix et les nombres en lettres darija (ex. « مية و تسعة و تسعين درهم »).
- N'invente aucune caractéristique, certification, garantie ou résultat qui n'est pas dans la description. Aucune promesse médicale.
Réponds UNIQUEMENT avec ce JSON : {"title":"titre court en français (4 à 6 mots)","lines":["phrase 1","phrase 2","…"]}`;
}
