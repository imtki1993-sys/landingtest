// Réveil toutes les 5 min (vercel.json) : garde le serveur et le proxy démarrés, pour que le
// premier chargement du tableau de bord après une pause ne paie pas le démarrage à froid.
// Ne lit et n'écrit rien.
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== "Bearer " + secret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
