// Canaux suivis par le Sourcing Derb Omar : ajout, pause, suppression (administrateur de la plateforme).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { channelUsername } from "../../../../lib/telegram-public";
import { backfillChannel, syncChannel } from "../../../../lib/sourcing-sync";

export const maxDuration = 60;

async function admin(req: Request) {
  const ctx = await authContext(req);
  if (!ctx.isPlatformAdmin) throw Object.assign(new Error("Accès administrateur requis"), { status: 403 });
  return ctx.s;
}
const fail = (e: any) => {
  reportError(e, "api/sourcing/channels");
  return NextResponse.json(
    { error: publicMessage(e) },
    { status: e?.status || (e?.message === "Non autorisé" ? 401 : 500) },
  );
};

/**
 * { link } : ajoute le canal et lit tout de suite ses derniers messages. { id, sync: true } : relit maintenant.
 * { backfill: true, since: "AAAA-MM-JJ", id? } : importe les publications depuis cette date (tous les canaux actifs,
 * ou un seul) ; à relancer tant que `done` est faux (≈ 50 s de lecture par appel).
 */
export async function POST(req: Request) {
  try {
    const s = await admin(req);
    const b = await req.json().catch(() => ({}));
    if (b.backfill) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.since || "")))
        return NextResponse.json({ error: "Date invalide" }, { status: 400 });
      const since = new Date(`${b.since}T00:00:00+01:00`).toISOString();
      let q = s.from("sourcing_channels").select("id,username,last_post_id").eq("active", true);
      if (b.id) q = q.eq("id", b.id);
      const { data: chans, error } = await q;
      if (error) throw error;
      const deadline = Date.now() + 48_000;
      let added = 0;
      let done = true;
      const channels: Record<string, unknown> = {};
      for (const ch of chans || []) {
        if (Date.now() >= deadline) {
          done = false;
          break;
        }
        try {
          const r = await backfillChannel(s, ch, since, deadline);
          channels[ch.username] = r;
          added += r.added;
          if (!r.done) done = false;
        } catch (e: any) {
          channels[ch.username] = { error: e.message };
        }
      }
      return NextResponse.json({ ok: true, added, done, channels });
    }
    if (b.id && b.sync) {
      const { data: ch } = await s.from("sourcing_channels").select("id,username,last_post_id").eq("id", b.id).single();
      if (!ch) return NextResponse.json({ error: "Canal introuvable" }, { status: 404 });
      const r = await syncChannel(s, ch, 2);
      return NextResponse.json({ ok: true, ...r });
    }
    const username = channelUsername(b.link || "");
    if (!username)
      return NextResponse.json(
        { error: "Lien invalide. Colle le lien public du canal, par exemple https://t.me/nom_du_canal." },
        { status: 400 },
      );
    const { data: existing } = await s.from("sourcing_channels").select("id").ilike("username", username).maybeSingle();
    if (existing) return NextResponse.json({ error: "Ce canal est déjà suivi." }, { status: 409 });
    const { data: ch, error } = await s
      .from("sourcing_channels")
      .insert({ username })
      .select("id,username,last_post_id")
      .single();
    if (error) throw error;
    try {
      const r = await syncChannel(s, ch, 4);
      return NextResponse.json({ ok: true, channel: ch, ...r });
    } catch (e: any) {
      // canal privé ou aperçu désactivé : on ne le garde pas
      await s.from("sourcing_channels").delete().eq("id", ch.id);
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
  } catch (e) {
    return fail(e);
  }
}

/** { id, active } : met en pause ou reprend la lecture d'un canal. */
export async function PATCH(req: Request) {
  try {
    const s = await admin(req);
    const b = await req.json().catch(() => ({}));
    const { error } = await s.from("sourcing_channels").update({ active: !!b.active }).eq("id", b.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

/** ?id= : supprime le canal et ses produits du catalogue. */
export async function DELETE(req: Request) {
  try {
    const s = await admin(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Canal manquant" }, { status: 400 });
    const { error } = await s.from("sourcing_channels").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
