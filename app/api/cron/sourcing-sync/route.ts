// Toutes les 30 min (vercel.json) : nouveaux messages des canaux du Sourcing Derb Omar, puis fiches par l'IA.
import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/server-auth";
import { reportError } from "../../../../lib/monitoring";
import { aiExtractPending, syncChannel } from "../../../../lib/sourcing-sync";
import { repairPending } from "../../../../lib/sourcing-media";

export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== "Bearer " + secret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = adminDb();
  const { data: channels, error } = await s
    .from("sourcing_channels")
    .select("id,username,last_post_id")
    .eq("active", true)
    .order("last_synced_at", { ascending: true, nullsFirst: true })
    .limit(40);
  if (error) {
    reportError(error, "cron/sourcing-sync");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const results: Record<string, unknown> = {};
  for (const ch of channels || []) {
    try {
      results[ch.username] = await syncChannel(s, ch, ch.last_post_id ? 2 : 4);
    } catch (e: any) {
      results[ch.username] = { error: e.message };
      await s
        .from("sourcing_channels")
        .update({ last_error: String(e.message).slice(0, 300), last_synced_at: new Date().toISOString() })
        .eq("id", ch.id);
    }
  }
  let ai = 0;
  try {
    ai = await aiExtractPending(s, 25);
  } catch (e) {
    reportError(e, "cron/sourcing-sync ai");
  }
  // anciennes publications aux liens Telegram expirés : photos relues et copiées
  let repaired = 0;
  try {
    repaired = await repairPending(s, 60, 8);
  } catch (e) {
    reportError(e, "cron/sourcing-sync photos");
  }
  return NextResponse.json({ ok: true, results, ai, repaired });
}
