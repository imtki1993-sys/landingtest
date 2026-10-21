// Voix off darija : historique, génération (Habibi-TTS ou Azure), suppression.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { authContext } from "../../../lib/server-auth";
import { availableProviders, synthesize, VOICES } from "../../../lib/voiceover";
import { estimateSeconds, normalizeDarija } from "../../../lib/darija-text";

export const maxDuration = 300;
const MAX_CHARS = 1500;
const DAILY_LIMIT = 40;
const missing = (e: any) =>
  ["42P01", "PGRST205"].includes(String(e?.code || "")) || /voiceovers/.test(String(e?.message || ""));

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const providers = availableProviders();
    const { data, error } = await s
      .from("voiceovers")
      .select("id,title,script,voice,provider,speed,audio_url,seconds,created_at,product_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error && missing(error)) return NextResponse.json({ installed: false, providers, voices: VOICES });
    if (error) throw error;
    return NextResponse.json({ installed: true, providers, voices: VOICES, items: data || [] });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}

/** { script, spoken?, voice, speed?, title?, product_id? } → voix off enregistrée. */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const script = String(b.script || "").trim();
    if (!script) return NextResponse.json({ error: "Le script est vide." }, { status: 400 });
    // texte lu : celui corrigé par le vendeur, sinon préparé automatiquement à partir du script
    const spoken = normalizeDarija(String(b.spoken || "").trim() || script);
    if (!spoken.sentences.length) return NextResponse.json({ error: "Rien à lire dans ce texte." }, { status: 400 });
    if (spoken.text.length > MAX_CHARS)
      return NextResponse.json(
        { error: `Texte trop long (${spoken.text.length} caractères, ${MAX_CHARS} au maximum, soit ~60 s).` },
        { status: 400 },
      );
    const voice = VOICES.find((v) => v.id === b.voice);
    if (!voice) return NextResponse.json({ error: "Choisis une voix." }, { status: 400 });
    const speed = Math.min(1.3, Math.max(0.7, Number(b.speed) || 1));

    const { data: allowed, error: le } = await s.rpc("check_public_order_rate_limit", {
      p_key: "tts|" + workspaceId,
      p_limit: DAILY_LIMIT,
      p_window_seconds: 24 * 3600,
    });
    if (le) throw le;
    if (!allowed)
      return NextResponse.json(
        { error: `Limite de ${DAILY_LIMIT} voix off par 24 h atteinte. Réessaie demain.` },
        { status: 429 },
      );

    let out;
    try {
      out = await synthesize(spoken.sentences, voice.id, speed);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Génération de la voix impossible." }, { status: 502 });
    }
    const ext = out.mime.includes("wav") ? "wav" : "mp3";
    const path = `${workspaceId}/voiceover-${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const up = await s.storage
      .from("landing-images")
      .upload(path, out.audio, { contentType: out.mime, cacheControl: "31536000", upsert: false });
    if (up.error) throw up.error;
    const audio_url = s.storage.from("landing-images").getPublicUrl(path).data.publicUrl;
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
    const m = String(data?.audio_url || "").match(/\/landing-images\/(.+)$/);
    if (m && m[1].startsWith(workspaceId + "/")) await s.storage.from("landing-images").remove([m[1]]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/voiceover");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
