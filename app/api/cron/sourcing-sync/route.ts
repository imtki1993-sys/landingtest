// Toutes les 30 min (vercel.json) : nouveaux messages des canaux du Sourcing Derb Omar, puis fiches par l'IA.
// Ordre pensé pour ne jamais rater les produits du jour : 1) dernière page de TOUS les canaux (rapide, en parallèle),
// 2) fiches par l'IA, 3) copie des photos récentes, 4) réparation des anciennes photos — chaque étape dans le temps
// restant (la fonction est coupée à 300 s).
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/server-auth";
import { reportError } from "../../../../lib/monitoring";
import { aiExtractPending, eachLimited, syncChannel } from "../../../../lib/sourcing-sync";
import { mirrorRecent, repairPending } from "../../../../lib/sourcing-media";

export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== "Bearer " + secret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const t0 = Date.now();
  const left = () => 280_000 - (Date.now() - t0);
  const s = adminDb();
  const { data: channels, error } = await s
    .from("sourcing_channels")
    .select("id,username,last_post_id")
    .eq("active", true)
    .order("last_synced_at", { ascending: true, nullsFirst: true })
    .limit(80);
  if (error) {
    reportError(error, "cron/sourcing-sync");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 1. nouveaux messages de tous les canaux, photos copiées plus tard
  const results: Record<string, unknown> = {};
  await eachLimited(channels || [], 4, t0 + 120_000, async (ch: any) => {
    try {
      results[ch.username] = await syncChannel(s, ch, ch.last_post_id ? 2 : 4, { mirror: false });
    } catch (e: any) {
      results[ch.username] = { error: e.message };
      await s
        .from("sourcing_channels")
        .update({ last_error: String(e.message).slice(0, 300), last_synced_at: new Date().toISOString() })
        .eq("id", ch.id);
    }
  });

  // 2. fiches (nom, prix, catégorie) par l'IA
  let ai = 0;
  if (left() > 90_000)
    try {
      ai = await aiExtractPending(s, 25);
    } catch (e) {
      reportError(e, "cron/sourcing-sync ai");
    }

  // 3. photos des publications récentes (liens Telegram encore valides) → stockage LandPro
  let mirrored = 0;
  if (left() > 40_000)
    try {
      mirrored = await mirrorRecent(s, Date.now() + left() - 30_000);
    } catch (e) {
      reportError(e, "cron/sourcing-sync mirror");
    }

  // 4. anciennes publications aux liens expirés : pages Telegram relues
  let repaired = 0;
  if (left() > 60_000)
    try {
      repaired = await repairPending(s, 30, 4);
    } catch (e) {
      reportError(e, "cron/sourcing-sync photos");
    }
  return NextResponse.json({
    ok: true,
    channels: (channels || []).length,
    synced: Object.keys(results).length,
    results,
    ai,
    mirrored,
    repaired,
    seconds: Math.round((Date.now() - t0) / 1000),
  });
}
