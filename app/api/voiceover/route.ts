// Voix off darija : historique, génération (Habibi-TTS ou Azure), régénération d'une phrase, suppression.
// Les fichiers audio sont privés : lus via /api/voiceover/file (lien signé, vérification du compte).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import {
  availableProviders,
  PAUSES,
  PRESETS,
  newSeed,
  splitSegments,
  synthesize,
  VOICES,
  wavFromPcm,
  type PauseKind,
  type Synthesis,
} from "../../../lib/voiceover";
import { cleanLexicon, estimateSeconds, groupPassages, normalizeDarija, type Lexicon } from "../../../lib/darija-text";
import { VOICE_BUCKET, ensureVoiceBucket, voicePath } from "../../../lib/voiceover-storage";

export const maxDuration = 300;
const MAX_CHARS = 1500;
// voix off par compte et par 24 h ; réglable dans Vercel (VOICEOVER_DAILY_LIMIT)
const DAILY_LIMIT = Math.max(1, Number(process.env.VOICEOVER_DAILY_LIMIT) || 400_000);

const BASE_COLS = "id,title,script,voice,provider,speed,audio_url,seconds,created_at,product_id";
const STUDIO_COLS = `${BASE_COLS},parent_id,preset,exact,settings,sentences,gaps,bounds,wav_path,segments_path,quality`;

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
  ["42P01", "PGRST205"].includes(String(e?.code || "")) || /relation .*voiceovers/.test(String(e?.message || ""));
/** colonne absente : migration « voiceover_studio » pas encore exécutée */
const noColumn = (e: any) =>
  ["42703", "PGRST204"].includes(String(e?.code || "")) || /column .* does not exist/.test(String(e?.message || ""));

/** Ligne → élément envoyé à la page (sans chemins de stockage). */
function toItem(r: any) {
  return {
    id: r.id,
    title: r.title,
    script: r.script,
    voice: r.voice,
    provider: r.provider,
    speed: Number(r.speed),
    seconds: r.seconds == null ? null : Number(r.seconds),
    created_at: r.created_at,
    product_id: r.product_id,
    parent_id: r.parent_id ?? null,
    preset: r.preset ?? null,
    exact: !!r.exact,
    settings: r.settings || {},
    sentences: Array.isArray(r.sentences) ? r.sentences : null,
    has_wav: !!r.wav_path,
    can_redo: !!(r.segments_path && Array.isArray(r.bounds) && Array.isArray(r.sentences)),
    quality: r.quality ?? null,
    audio: `/api/voiceover/file?id=${r.id}`,
  };
}

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const providers = availableProviders();
    const lexicon = await loadLexicon(s, workspaceId);
    await ensureVoiceBucket(s).catch((e) => reportError(e, "api/voiceover bucket"));
    const list = (cols: string) =>
      s
        .from("voiceovers")
        .select(cols)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(40);
    let { data, error } = await list(STUDIO_COLS);
    let studio = true;
    if (error && noColumn(error)) {
      studio = false;
      ({ data, error } = await list(BASE_COLS));
    }
    if (error && missing(error))
      return NextResponse.json({ installed: false, providers, voices: VOICES, presets: PRESETS });
    if (error) throw error;
    return NextResponse.json({
      installed: true,
      studio,
      providers,
      voices: VOICES,
      presets: PRESETS,
      items: (data || []).map(toItem),
      lexicon: lexicon || {},
      lexiconInstalled: lexicon !== null,
    });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** Enregistre les fichiers d'une génération (MP3, WAV, phrases brutes) dans le dossier privé du compte. */
async function storeAudio(s: any, workspaceId: string, out: Synthesis) {
  await ensureVoiceBucket(s);
  const base = `${workspaceId}/voiceover-${Date.now()}-${crypto.randomUUID()}`;
  const put = async (path: string, body: Buffer, type: string) => {
    const up = await s.storage
      .from(VOICE_BUCKET)
      .upload(path, body, { contentType: type, cacheControl: "31536000", upsert: false });
    if (up.error) throw up.error;
    return path;
  };
  const ext = out.mime.includes("wav") ? "wav" : "mp3";
  const [audio, wav, segments] = await Promise.all([
    put(`${base}.${ext}`, out.audio, out.mime),
    out.wav ? put(`${base}.wav`, out.wav, "audio/wav") : null,
    out.segments && out.bounds ? put(`${base}-phrases.wav`, wavFromPcm(out.segments), "audio/wav") : null,
  ]);
  return { audio, wav, segments };
}

async function underLimit(s: any, workspaceId: string) {
  // seules les voix off réellement produites comptent (pas les essais en erreur)
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count, error } = await s
    .from("voiceovers")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", since);
  if (error) throw error;
  return (count || 0) < DAILY_LIMIT;
}

/** Insère la voix off ; sans la migration « studio », seules les colonnes d'origine sont écrites. */
async function insertRow(s: any, row: Record<string, unknown>, extra: Record<string, unknown>) {
  let r = await s
    .from("voiceovers")
    .insert({ ...row, ...extra })
    .select(STUDIO_COLS)
    .single();
  if (r.error && noColumn(r.error)) r = await s.from("voiceovers").insert(row).select(BASE_COLS).single();
  if (r.error) throw r.error;
  return toItem(r.data);
}

const limitReached = () =>
  NextResponse.json(
    { error: `Limite de ${DAILY_LIMIT} voix off par 24 h atteinte. Réessaie demain.` },
    { status: 429 },
  );

/**
 * Nouvelle voix off : { script, spoken?, voice, speed?, pause?, target_seconds?, exact?, preset?, title?, product_id? }
 * Régénérer une phrase : { action: "redo", id, index, text? } → nouvelle version (parent_id = version d'origine).
 */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const lexicon = (await loadLexicon(s, workspaceId)) || {};
    if (b.action === "redo") return redo(s, workspaceId, b, lexicon);

    const script = String(b.script || "").trim();
    if (!script) return NextResponse.json({ error: "Le script est vide." }, { status: 400 });
    const exact = !!b.exact;
    // texte lu : celui corrigé par le vendeur, sinon préparé automatiquement à partir du script
    const spoken = normalizeDarija(String(b.spoken || "").trim() || script, lexicon, { exact });
    if (!spoken.sentences.length) return NextResponse.json({ error: "Rien à lire dans ce texte." }, { status: 400 });
    if (spoken.text.length > MAX_CHARS)
      return NextResponse.json(
        { error: `Texte trop long (${spoken.text.length} caractères, ${MAX_CHARS} au maximum, soit ~60 s).` },
        { status: 400 },
      );
    const voice = VOICES.find((v) => v.id === b.voice);
    if (!voice) return NextResponse.json({ error: "Choisis une voix." }, { status: 400 });
    const speed = Math.min(1.3, Math.max(0.7, Number(b.speed) || 1));
    const pause = (b.pause in PAUSES ? b.pause : "normales") as PauseKind;
    const target = Number(b.target_seconds) || null;
    if (!(await underLimit(s, workspaceId))) return limitReached();

    // passages de 2-3 phrases lus d'une traite, même tirage pour toute la voix : pas de changement de voix entre les lignes
    const { passages, gaps } = groupPassages(spoken.sentences, spoken.gaps);
    const seed = newSeed();
    let out: Synthesis;
    try {
      out = await synthesize(passages, voice.id, { speed, pause, targetSeconds: target, gaps, seed });
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Génération de la voix impossible." }, { status: 502 });
    }
    const files = await storeAudio(s, workspaceId, out);
    const item = await insertRow(
      s,
      {
        workspace_id: workspaceId,
        product_id: typeof b.product_id === "string" && b.product_id ? b.product_id : null,
        title: String(b.title || "").slice(0, 80) || null,
        script: script.slice(0, 4000),
        tts_text: spoken.text,
        voice: voice.id,
        provider: voice.provider,
        speed,
        audio_url: files.audio,
        seconds: out.seconds ?? estimateSeconds(spoken.text, speed),
      },
      {
        preset: PRESETS.some((p) => p.id === b.preset) ? b.preset : null,
        exact,
        settings: { pause, target_seconds: target, seed },
        sentences: passages,
        gaps,
        bounds: out.bounds ?? null,
        wav_path: files.wav,
        segments_path: files.segments,
        quality: out.quality ?? null,
      },
    );
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** Régénère une seule phrase : les autres phrases sont reprises telles quelles (même prise). */
async function redo(s: any, workspaceId: string, b: any, lexicon: Lexicon) {
  const { data: row, error } = await s
    .from("voiceovers")
    .select(`${STUDIO_COLS},tts_text`)
    .eq("workspace_id", workspaceId)
    .eq("id", String(b.id || ""))
    .maybeSingle();
  if (error && noColumn(error))
    return NextResponse.json(
      { error: "Exécute d'abord la migration « voiceover_studio » dans Supabase." },
      { status: 409 },
    );
  if (error) throw error;
  if (!row) return NextResponse.json({ error: "Voix off introuvable" }, { status: 404 });
  const sentences: string[] = Array.isArray(row.sentences) ? [...row.sentences] : [];
  const bounds: number[] = Array.isArray(row.bounds) ? row.bounds : [];
  const index = Number(b.index);
  if (!row.segments_path || bounds.length !== sentences.length || !(index >= 0 && index < sentences.length))
    return NextResponse.json(
      { error: "Cette voix off a été créée avant la régénération par phrase : génère-la de nouveau." },
      { status: 400 },
    );
  if (!(await underLimit(s, workspaceId))) return limitReached();

  // phrase corrigée par le vendeur : préparée comme le reste (chiffres, mots latins…), reste une seule phrase
  if (typeof b.text === "string" && b.text.trim()) {
    const fixed = normalizeDarija(b.text.trim(), lexicon, { exact: !!row.exact }).sentences.join(" ");
    if (fixed) sentences[index] = fixed;
  }
  const dl = await s.storage.from(VOICE_BUCKET).download(row.segments_path);
  if (dl.error) throw dl.error;
  const segments: (string | null)[] = splitSegments(Buffer.from(await dl.data.arrayBuffer()), bounds);
  segments[index] = null;
  const settings = row.settings || {};
  let out: Synthesis;
  try {
    out = await synthesize(sentences, row.voice, {
      speed: Number(row.speed) || 1,
      pause: settings.pause,
      targetSeconds: settings.target_seconds,
      gaps: Array.isArray(row.gaps) ? row.gaps : undefined,
      segments,
      seed: newSeed(), // nouvelle prise pour le passage refait
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Génération de la voix impossible." }, { status: 502 });
  }
  if (!out.segments) return NextResponse.json({ error: "Le service de voix doit être mis à jour." }, { status: 502 });
  const files = await storeAudio(s, workspaceId, out);
  const tts_text = sentences.join(" ");
  const item = await insertRow(
    s,
    {
      workspace_id: workspaceId,
      product_id: row.product_id,
      title: row.title,
      script: row.script,
      tts_text,
      voice: row.voice,
      provider: row.provider,
      speed: row.speed,
      audio_url: files.audio,
      seconds: out.seconds ?? estimateSeconds(tts_text, Number(row.speed) || 1),
    },
    {
      parent_id: row.id,
      preset: row.preset,
      exact: row.exact,
      settings: { ...settings, redone: index },
      sentences,
      gaps: row.gaps,
      bounds: out.bounds,
      wav_path: files.wav,
      segments_path: files.segments,
      quality: out.quality ?? null,
    },
  );
  return NextResponse.json({ item }, { status: 201 });
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
    let { data, error: le } = await s
      .from("voiceovers")
      .select("audio_url,wav_path,segments_path")
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (le && noColumn(le))
      ({ data } = await s
        .from("voiceovers")
        .select("audio_url")
        .eq("workspace_id", workspaceId)
        .eq("id", id)
        .maybeSingle());
    const { error } = await s.from("voiceovers").delete().eq("workspace_id", workspaceId).eq("id", id);
    if (error) throw error;
    // fichiers : supprimés du stockage s'ils sont bien dans le dossier du compte
    const byBucket = new Map<string, string[]>();
    for (const ref of [data?.audio_url, data?.wav_path, data?.segments_path]) {
      const p = voicePath(String(ref || ""));
      if (p && p.path.startsWith(workspaceId + "/"))
        byBucket.set(p.bucket, [...(byBucket.get(p.bucket) || []), p.path]);
    }
    for (const [bucket, paths] of byBucket) await s.storage.from(bucket).remove(paths);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
