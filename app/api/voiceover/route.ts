// Voix off darija : historique, génération (Habibi-TTS ou Azure), suppression.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { availableProviders, PAUSES, synthesize, VOICES, type PauseKind } from "../../../lib/voiceover";
import { cleanLexicon, estimateSeconds, normalizeDarija, type Lexicon } from "../../../lib/darija-text";

export const maxDuration = 300;
const MAX_CHARS = 1500;
// voix off par compte et par 24 h ; réglable dans Vercel (VOICEOVER_DAILY_LIMIT)
const DAILY_LIMIT = Math.max(1, Number(process.env.VOICEOVER_DAILY_LIMIT) || 200);
// stockage dédié à l'audio (le bucket des images refuse audio/mpeg) ; créé au premier usage
const BUCKET = "voiceovers";
let bucketReady = false;
async function ensureBucket(s: any) {
  if (bucketReady) return;
  const opts = { public: true, allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav"], fileSizeLimit: "20MB" };
  const { error } = await s.storage.createBucket(BUCKET, opts);
  if (error && !/exist|duplicate/i.test(String(error.message || ""))) throw error;
  if (error) await s.storage.updateBucket(BUCKET, opts);
  bucketReady = true;
}
/** Dictionnaire de prononciation du compte ; null si la table n'est pas encore créée. */
async function loadLexicon(s: any, workspaceId: string): Promise<Lexicon | null> {
  const { data, error } = await s
    .from("voiceover_lexicon")
    .select("words")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) return null;
  return cleanLexicon(data?.words);
}

const missing = (e: any) =>
  ["42P01", "PGRST205"].includes(String(e?.code || "")) || /voiceovers/.test(String(e?.message || ""));

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const providers = availableProviders();
    const lexicon = await loadLexicon(s, workspaceId);
    const { data, error } = await s
      .from("voiceovers")
      .select("id,title,script,voice,provider,speed,audio_url,seconds,created_at,product_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error && missing(error)) return NextResponse.json({ installed: false, providers, voices: VOICES });
    if (error) throw error;
    return NextResponse.json({
      installed: true,
      providers,
      voices: VOICES,
      items: data || [],
      lexicon: lexicon || {},
      lexiconInstalled: lexicon !== null,
    });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** { script, spoken?, voice, speed?, pause?, target_seconds?, title?, product_id? } → voix off enregistrée. */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const script = String(b.script || "").trim();
    if (!script) return NextResponse.json({ error: "Le script est vide." }, { status: 400 });
    // texte lu : celui corrigé par le vendeur, sinon préparé automatiquement à partir du script
    const lexicon = (await loadLexicon(s, workspaceId)) || {};
    const spoken = normalizeDarija(String(b.spoken || "").trim() || script, lexicon);
    if (!spoken.sentences.length) return NextResponse.json({ error: "Rien à lire dans ce texte." }, { status: 400 });
    if (spoken.text.length > MAX_CHARS)
      return NextResponse.json(
        { error: `Texte trop long (${spoken.text.length} caractères, ${MAX_CHARS} au maximum, soit ~60 s).` },
        { status: 400 },
      );
    const voice = VOICES.find((v) => v.id === b.voice);
    if (!voice) return NextResponse.json({ error: "Choisis une voix." }, { status: 400 });
    const speed = Math.min(1.3, Math.max(0.7, Number(b.speed) || 1));

    // limite : seules les voix off réellement produites comptent (pas les essais en erreur)
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error: le } = await s
      .from("voiceovers")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", since);
    if (le) throw le;
    if ((count || 0) >= DAILY_LIMIT)
      return NextResponse.json(
        { error: `Limite de ${DAILY_LIMIT} voix off par 24 h atteinte. Réessaie demain.` },
        { status: 429 },
      );

    let out;
    try {
      out = await synthesize(spoken.sentences, voice.id, {
        speed,
        pause: (b.pause in PAUSES ? b.pause : "normales") as PauseKind,
        targetSeconds: Number(b.target_seconds) || null,
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Génération de la voix impossible." }, { status: 502 });
    }
    const ext = out.mime.includes("wav") ? "wav" : "mp3";
    const path = `${workspaceId}/voiceover-${Date.now()}-${crypto.randomUUID()}.${ext}`;
    await ensureBucket(s);
    const up = await s.storage
      .from(BUCKET)
      .upload(path, out.audio, { contentType: out.mime, cacheControl: "31536000", upsert: false });
    if (up.error) throw up.error;
    const audio_url = s.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const row = {
      workspace_id: workspaceId,
      product_id: typeof b.product_id === "string" && b.product_id ? b.product_id : null,
      title: String(b.title || "").slice(0, 80) || null,
      script: script.slice(0, 4000),
      tts_text: spoken.text,
      voice: voice.id,
      provider: voice.provider,
      speed,
      audio_url,
      seconds: out.seconds ?? estimateSeconds(spoken.text, speed),
    };
    const { data, error } = await s
      .from("voiceovers")
      .insert(row)
      .select("id,title,script,voice,provider,speed,audio_url,seconds,created_at,product_id")
      .single();
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** { lexicon: { mot: prononciation } } → dictionnaire de prononciation enregistré. */
export async function PUT(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const words = cleanLexicon(b.lexicon);
    const { error } = await s
      .from("voiceover_lexicon")
      .upsert({ workspace_id: workspaceId, words, updated_at: new Date().toISOString() });
    if (error && ["42P01", "PGRST205"].includes(String(error.code || "")))
      return NextResponse.json(
        { error: "Dictionnaire pas encore installé : exécute la migration voiceover_lexicon dans Supabase." },
        { status: 409 },
      );
    if (error) throw error;
    return NextResponse.json({ lexicon: words });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Voix off manquante" }, { status: 400 });
    const { data } = await s
      .from("voiceovers")
      .select("audio_url")
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    const { error } = await s.from("voiceovers").delete().eq("workspace_id", workspaceId).eq("id", id);
    if (error) throw error;
    // fichier audio : supprimé du stockage s'il est bien dans le dossier du compte
    const m = String(data?.audio_url || "").match(/\/(voiceovers|landing-images)\/(.+)$/);
    if (m && m[2].startsWith(workspaceId + "/")) await s.storage.from(m[1]).remove([m[2]]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
