// Voix pub personnalisées du compte : un extrait de 4 à 12 s lu avec le ton d'une pub (consentement obligatoire).
// Le modèle imite le ton de l'extrait : c'est ce qui donne l'énergie « vendeur » que les voix du corpus n'ont pas.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { checkReference } from "../../../../lib/voiceover";
import { VOICE_BUCKET, ensureVoiceBucket } from "../../../../lib/voiceover-storage";

export const maxDuration = 120;
const MAX_VOICES = 10;
const missing = (e: any) => ["42P01", "PGRST205"].includes(String(e?.code || ""));
const fail = (e: any) => {
  reportError(e, "api/voiceover/voices");
  return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
};

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("voice_profiles")
      .select("id,name,gender,ref_text,seconds,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error && missing(error)) return NextResponse.json({ installed: false, voices: [] });
    if (error) throw error;
    return NextResponse.json({ installed: true, voices: data || [] });
  } catch (e) {
    return fail(e);
  }
}

/** { name, gender, text, audio (base64), consent: true } → voix enregistrée, ou { problems } à corriger. */
export async function POST(req: Request) {
  try {
    const { s, workspaceId, user } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const name =
      String(b.name || "")
        .trim()
        .slice(0, 40) || "Ma voix pub";
    const gender = b.gender === "f" ? "f" : "m";
    const text = String(b.text || "")
      .trim()
      .slice(0, 400);
    if (b.consent !== true)
      return NextResponse.json(
        { error: "Confirme que c'est ta voix ou que la personne enregistrée a donné son accord." },
        { status: 400 },
      );
    if (text.length < 10)
      return NextResponse.json({ error: "Écris le texte exact lu dans l'enregistrement." }, { status: 400 });
    const audio = Buffer.from(String(b.audio || ""), "base64");
    if (audio.length < 2000) return NextResponse.json({ error: "Enregistrement vide." }, { status: 400 });
    if (audio.length > 6 * 1024 * 1024)
      return NextResponse.json({ error: "Fichier trop lourd (6 Mo maximum)." }, { status: 400 });
    const { count } = await s
      .from("voice_profiles")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);
    if ((count || 0) >= MAX_VOICES)
      return NextResponse.json({ error: `${MAX_VOICES} voix au maximum : supprimes-en une.` }, { status: 400 });

    const check = await checkReference(audio, text);
    if (!check.ok || !check.wav)
      return NextResponse.json({ problems: check.problems, seconds: check.seconds }, { status: 422 });

    await ensureVoiceBucket(s);
    const id = crypto.randomUUID();
    const ref_path = `${workspaceId}/voices/${id}.wav`;
    const up = await s.storage
      .from(VOICE_BUCKET)
      .upload(ref_path, check.wav, { contentType: "audio/wav", upsert: false });
    if (up.error) throw up.error;
    const { data, error } = await s
      .from("voice_profiles")
      .insert({
        id,
        workspace_id: workspaceId,
        name,
        gender,
        ref_path,
        ref_text: text,
        seconds: check.seconds,
        consent_at: new Date().toISOString(),
        created_by: user?.id ?? null,
      })
      .select("id,name,gender,ref_text,seconds,created_at")
      .single();
    if (error) {
      await s.storage.from(VOICE_BUCKET).remove([ref_path]);
      if (missing(error))
        return NextResponse.json(
          { error: "Exécute d'abord la migration « voice_profiles » dans Supabase." },
          { status: 409 },
        );
      throw error;
    }
    return NextResponse.json({ voice: data }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}

/** ?id= : supprime la voix et son enregistrement. */
export async function DELETE(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const id = new URL(req.url).searchParams.get("id") || "";
    const { data } = await s
      .from("voice_profiles")
      .select("ref_path")
      .eq("workspace_id", workspaceId)
      .eq("id", id)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Voix introuvable" }, { status: 404 });
    const { error } = await s.from("voice_profiles").delete().eq("workspace_id", workspaceId).eq("id", id);
    if (error) throw error;
    if (String(data.ref_path).startsWith(workspaceId + "/")) await s.storage.from(VOICE_BUCKET).remove([data.ref_path]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
