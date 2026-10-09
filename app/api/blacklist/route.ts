// Liste noire de numéros du compte : lister, bloquer, débloquer.
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import { toE164 } from "../../../lib/order-risk";

const SETUP =
  "La liste noire n’est pas encore installée : exécute le fichier supabase/migrations/20261009150000_phone_blacklist.sql dans Supabase (SQL Editor).";
const fail = (e: any, where: string) => {
  const t = `${e?.code || ""} ${e?.message || ""}`;
  if (/42P01|PGRST205/.test(t) || /phone_blacklist/.test(t))
    return NextResponse.json({ error: SETUP }, { status: 503 });
  reportError(e, where);
  return NextResponse.json(
    { error: publicMessage(e) },
    { status: String(e?.message).includes("autorisé") ? 401 : 500 },
  );
};

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("phone_blacklist")
      .select("id,phone_e164,reason,created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return NextResponse.json({ numbers: data || [] });
  } catch (e: any) {
    return fail(e, "api/blacklist");
  }
}

export async function POST(req: Request) {
  try {
    const { s, workspaceId, user } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const phone = toE164(String(b.phone || ""));
    if (!/^\+\d{9,15}$/.test(phone)) return NextResponse.json({ error: "Numéro invalide" }, { status: 400 });
    const reason =
      String(b.reason || "")
        .trim()
        .slice(0, 200) || null;
    const { error } = await s
      .from("phone_blacklist")
      .upsert(
        { workspace_id: workspaceId, phone_e164: phone, reason, created_by: user.id },
        { onConflict: "workspace_id,phone_e164" },
      );
    if (error) throw error;
    return NextResponse.json({ ok: true, phone_e164: phone }, { status: 201 });
  } catch (e: any) {
    return fail(e, "api/blacklist");
  }
}

export async function DELETE(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const phone = toE164(new URL(req.url).searchParams.get("phone") || "");
    if (!phone) return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    const { error } = await s.from("phone_blacklist").delete().eq("workspace_id", workspaceId).eq("phone_e164", phone);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return fail(e, "api/blacklist");
  }
}
