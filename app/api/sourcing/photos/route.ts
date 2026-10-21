// Réparation immédiate des photos du Sourcing dont le lien Telegram a expiré (appelé par la page quand une image ne charge pas).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { repairPosts } from "../../../../lib/sourcing-media";

export const maxDuration = 60;
const UUID = /^[0-9a-f-]{36}$/i;

/** { ids: string[] } → { photos: { id: string[] } } (liens permanents ; [] = photo plus disponible sur Telegram). */
export async function POST(req: Request) {
  try {
    const { s } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const ids = (Array.isArray(b.ids) ? b.ids : []).filter((x: unknown) => typeof x === "string" && UUID.test(x));
    if (!ids.length) return NextResponse.json({ photos: {} });
    const { data, error } = await s
      .from("sourcing_posts")
      .select("id,channel_id,post_id,photos")
      .in("id", ids.slice(0, 24));
    if (error) throw error;
    const fixed = await repairPosts(s, data || [], 4);
    return NextResponse.json({ photos: Object.fromEntries(fixed) });
  } catch (e: any) {
    reportError(e, "api/sourcing/photos");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
