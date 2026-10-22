// Voix off par Gemini TTS (Google) : une seule requête pour tout le script, le ton se règle en langage naturel.
// API « Interactions » : https://generativelanguage.googleapis.com/v1beta/interactions (clé GEMINI_API_KEY, serveur).
import { Mp3Encoder } from "@breezystack/lamejs";

export const GEMINI_TTS_MODEL = "gemini-3.8-flash-tts";
const SAMPLE_RATE = 24_000;

/** Direction de base : darija marocaine de pub (Casablanca), jamais d'arabe classique ni d'autres dialectes. */
export const DARIJA_AD_STYLE =
  "Native Moroccan Darija voice-over with an authentic Casablanca accent, for an e-commerce product ad. " +
  "Natural Moroccan rhythm and pronunciation, French loanwords said the Moroccan way. " +
  "Never Modern Standard Arabic, never Egyptian, Gulf or Levantine accents, never robotic. " +
  "Read the script exactly as written, without adding or removing words.";

const TONE_STYLE: Record<string, string> = {
  energique: "Energetic, confident, friendly and persuasive, medium-fast pace, strong hook and call to action.",
  chaleureux: "Warm, close and trustworthy, like a friend giving advice, relaxed medium pace.",
  premium: "Calm, deep and elegant, controlled medium-slow pace, subtle emphasis, no shouting.",
  drole: "Light and playful with a smile in the voice, lively pace, natural Moroccan humour.",
  temoignage: "A real satisfied customer telling their own experience, relaxed and natural, small pauses, no acting.",
  ugc: "A young Moroccan creator talking straight to the camera, spontaneous, lively, real reactions, not an announcer.",
};

/** Consigne de ton envoyée au modèle (ton du script, pauses, vitesse). */
export function geminiStyle(o: { tone?: string; pause?: string; speed?: number }): string {
  const parts = [DARIJA_AD_STYLE, TONE_STYLE[o.tone || ""] || TONE_STYLE.energique];
  if (o.pause === "courtes") parts.push("Keep pauses short and the flow tight.");
  if (o.pause === "longues") parts.push("Take clear breathing pauses between sentences.");
  if ((o.speed || 1) >= 1.08) parts.push("Speak a little faster than usual.");
  if ((o.speed || 1) <= 0.92) parts.push("Speak a little slower than usual.");
  return parts.join(" ");
}

/** Cherche l'audio (base64) dans la réponse, quelle que soit sa forme (Interactions ou generateContent). */
export function findAudio(j: any): { data: string; mime: string } | null {
  const seen = new Set<any>();
  const walk = (x: any): { data: string; mime: string } | null => {
    if (!x || typeof x !== "object" || seen.has(x)) return null;
    seen.add(x);
    const mime = String(x.mime_type || x.mimeType || "");
    if (typeof x.data === "string" && x.data.length > 100 && (!mime || mime.startsWith("audio")))
      return { data: x.data, mime: mime || "audio/wav" };
    for (const v of Array.isArray(x) ? x : Object.values(x)) {
      const r = walk(v);
      if (r) return r;
    }
    return null;
  };
  return walk(j);
}

/** WAV 16 bits (ou PCM brut) → échantillons PCM 16 bits. */
export function pcmFromAudio(buf: Buffer): Buffer {
  if (buf.subarray(0, 4).toString() !== "RIFF") return buf;
  // saute les blocs jusqu'à « data »
  let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.subarray(p, p + 4).toString();
    const size = buf.readUInt32LE(p + 4);
    if (id === "data") return buf.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size % 2);
  }
  return buf.subarray(44);
}

/** PCM 16 bits mono → MP3 (lame, en JavaScript : pas besoin de ffmpeg sur Vercel). */
export function pcmToMp3(pcm: Buffer, sampleRate = SAMPLE_RATE, kbps = 128): Buffer {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const enc = new Mp3Encoder(1, sampleRate, kbps);
  const out: Uint8Array[] = [];
  for (let i = 0; i < samples.length; i += 1152) {
    const b = enc.encodeBuffer(samples.subarray(i, i + 1152));
    if (b.length) out.push(b);
  }
  const end = enc.flush();
  if (end.length) out.push(end);
  return Buffer.concat(out.map((u) => Buffer.from(u)));
}

export async function geminiTts(text: string, voice: string, style: string, key: string) {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      model: GEMINI_TTS_MODEL,
      input: [
        {
          type: "user_input",
          content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }],
        },
      ],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice }] },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(180_000),
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = String(j?.error?.message || "").slice(0, 200);
    throw new Error(
      r.status === 400 && /api key/i.test(msg)
        ? "Clé Gemini refusée : vérifie GEMINI_API_KEY dans Vercel."
        : r.status === 429
          ? "Quota Gemini atteint : réessaie dans une minute ou active la facturation dans Google AI Studio."
          : `Gemini a répondu ${r.status}${msg ? " : " + msg : ""}`,
    );
  }
  const audio = findAudio(j);
  if (!audio) throw new Error("Gemini n'a pas renvoyé d'audio. Réessaie.");
  return pcmFromAudio(Buffer.from(audio.data, "base64"));
}
