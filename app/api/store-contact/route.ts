import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/server-auth";
export async function POST(req: Request) {
  try {
    const b = await req.json(),
      slug = String(b.storeSlug || "").trim(),
      name = String(b.name || "")
        .trim()
        .slice(0, 120),
      email = String(b.email || "")
        .trim()
        .slice(0, 200),
      phone = String(b.phone || "")
        .trim()
        .slice(0, 40),
      subject = String(b.subject || "")
        .trim()
        .slice(0, 200),
      message = String(b.message || "")
        .trim()
        .slice(0, 4000);
    if (!slug || !name || !subject || !message)
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    const s = adminDb(),
      ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
    const { data: allowed } = await s.rpc("check_public_order_rate_limit", {
      p_key: "contact:" + slug + "|" + ip,
      p_limit: 8,
      p_window_seconds: 600,
    });
    if (allowed === false)
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const { data: store, error: se } = await s
      .from("stores")
      .select("id,workspace_id,status")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();
    if (se || !store) return NextResponse.json({ error: "Boutique introuvable ou non publiée" }, { status: 404 });
    const { error } = await s.from("store_contact_messages").insert({
      workspace_id: store.workspace_id,
      store_id: store.id,
      name,
      email: email || null,
      phone: phone || null,
      subject,
      message,
      status: "NEW",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    reportError(e, "api/store-contact");
    return NextResponse.json({ error: publicMessage(e, "Envoi impossible") }, { status: 500 });
  }
}
