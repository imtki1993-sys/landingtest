// Stockage des voix off : bucket privé (lecture par lien signé de courte durée, après vérification du compte).
export const VOICE_BUCKET = "voiceovers";

let ready = false;
export async function ensureVoiceBucket(s: any) {
  if (ready) return;
  const opts = { public: false, allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav"], fileSizeLimit: "30MB" };
  const { error } = await s.storage.createBucket(VOICE_BUCKET, opts);
  if (error && !/exist|duplicate/i.test(String(error.message || ""))) throw error;
  // bucket créé public par une version précédente : rendu privé
  if (error) await s.storage.updateBucket(VOICE_BUCKET, opts);
  ready = true;
}

/** Ancien lien public (…/voiceovers/x.mp3, …/landing-images/x.mp3) ou chemin direct → bucket + chemin. */
export function voicePath(ref: string): { bucket: string; path: string } | null {
  if (!ref) return null;
  const m = ref.match(/\/(voiceovers|landing-images)\/(.+)$/);
  if (m) return { bucket: m[1], path: decodeURIComponent(m[2].split("?")[0]) };
  return /^https?:/.test(ref) ? null : { bucket: VOICE_BUCKET, path: ref };
}
