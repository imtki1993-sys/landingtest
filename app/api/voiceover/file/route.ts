// Fichier audio d'une voix off (privé) : vérifie le compte puis redirige vers un lien signé de 1 h.
// ?id=…&format=mp3|wav&dl=1 (dl : téléchargement avec un nom de fichier lisible)
import { NextResponse } from "next/server";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { voicePath } from "../../../../lib/voiceover-storage";

const slug = (t: string) =>
  (t || "voix-off")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .toLowerCase() || "voix-off";

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const q = new URL(req.url).searchParams;
    const wav = q.get("format") === "wav";
    let { data, error } = await s
      .from("voiceovers")
      .select("title,audio_url,wav_path")
      .eq("workspace_id", workspaceId)
      .eq("id", q.get("id") || "")
      .maybeSingle();
    if (error)
      ({ data } = await s
        .from("voiceovers")
        .select("title,audio_url")
        .eq("workspace_id", workspaceId)
        .eq("id", q.get("id") || "")
        .maybeSingle());
    if (!data) return NextResponse.json({ error: "Voix off introuvable" }, { status: 404 });
    const ref = String((wav ? data.wav_path : data.audio_url) || "");
    if (!ref) return NextResponse.json({ error: "Pas de fichier WAV pour cette voix off" }, { status: 404 });
    const loc = voicePath(ref);
    // très anciens fichiers dans le bucket public des images : lien direct
    if (!loc || loc.bucket === "landing-images") return NextResponse.redirect(ref, 302);
    const name = `${slug(data.title)}.${wav ? "wav" : ref.endsWith(".wav") ? "wav" : "mp3"}`;
    const { data: signed, error: se } = await s.storage
      .from(loc.bucket)
      .createSignedUrl(loc.path, 3600, q.get("dl") ? { download: name } : undefined);
    if (se || !signed?.signedUrl) throw se || new Error("Lien impossible");
    return NextResponse.redirect(signed.signedUrl, {
      status: 302,
      headers: { "Cache-Control": "private, max-age=600" },
    });
  } catch (e: any) {
    reportError(e, "api/voiceover/file");
    return NextResponse.json({ error: "Fichier indisponible" }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
