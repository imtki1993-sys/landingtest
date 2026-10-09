import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/server-auth";
function cleanPhone(v: string) {
  return v.replace(/[^0-9+]/g, "");
}
function e164(v: string) {
  let x = cleanPhone(v);
  if (x.startsWith("+212")) return x;
  if (x.startsWith("00212")) return "+" + x.slice(2);
  if (x.startsWith("0")) return "+212" + x.slice(1);
  return x.startsWith("212") ? "+" + x : x;
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
export async function POST(req: Request) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  try {
    const raw = await req.text(),
      b = JSON.parse(raw || "{}"),
      landingId = String(b.landing_id || "").trim(),
      name = String(b.name || "").trim(),
      phone = String(b.phone || "").trim(),
      city = String(b.city || "").trim(),
      address = String(b.address || "").trim(),
      qty = Math.min(10, Math.max(1, Number(b.quantity || 1)));
    if (!landingId || !name || !phone)
      return NextResponse.json({ error: "landing_id, nom et téléphone requis" }, { status: 400, headers: cors });
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15)
      return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400, headers: cors });
    const s = adminDb(),
      origin = req.headers.get("origin") || "",
      ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
    const { data: lp, error: le } = await s
      .from("landing_pages")
      .select("id,slug,status,workspace_id,product_id,seo")
      .eq("id", landingId)
      .is("archived_at", null)
      .maybeSingle();
    if (le) throw le;
    if (!lp || lp.seo?.source !== "external" || (lp.status !== "DRAFT" && lp.status !== "PUBLISHED"))
      return NextResponse.json({ error: "Landing externe introuvable ou inactive" }, { status: 404, headers: cors });
    // Le script est appelé depuis le navigateur du visiteur, sur le domaine déclaré de la landing :
    // l'en-tête Origin est obligatoire et doit correspondre à ce domaine.
    const allowed = String(lp.seo?.external_domain || "")
      .trim()
      .toLowerCase();
    let host = "";
    try {
      host = new URL(origin).hostname.toLowerCase();
    } catch {}
    if (!host || (allowed && host !== allowed && !host.endsWith("." + allowed)))
      return NextResponse.json({ error: "Domaine non autorisé" }, { status: 403, headers: cors });
    const { data: rate, error: re } = await s.rpc("check_public_order_rate_limit", {
      p_key: "external:" + landingId + "|" + ip,
      p_limit: 12,
      p_window_seconds: 600,
    });
    if (re) throw re;
    if (rate === false)
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { ...cors, "Retry-After": "600" } },
      );
    // Même règles que les autres commandes : abonnement actif et quota mensuel de commandes
    const { data: sub, error: se } = await s
      .from("workspace_subscriptions")
      .select("status,order_monthly_limit")
      .eq("workspace_id", lp.workspace_id)
      .maybeSingle();
    if (se) throw se;
    if (sub && !["active", "trialing"].includes(String(sub.status)))
      return NextResponse.json({ error: "Boutique momentanément indisponible" }, { status: 403, headers: cors });
    const limit = Number(sub?.order_monthly_limit || 0);
    if (limit > 0) {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count, error: ce } = await s
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", lp.workspace_id)
        .gte("created_at", monthStart.toISOString());
      if (ce) throw ce;
      if ((count || 0) >= limit)
        return NextResponse.json(
          { error: "Limite mensuelle de commandes atteinte pour ce plan." },
          { status: 403, headers: cors },
        );
    }
    const { data: product, error: pe } = await s
      .from("products")
      .select("id,price,is_active")
      .eq("id", lp.product_id)
      .eq("workspace_id", lp.workspace_id)
      .is("archived_at", null)
      .maybeSingle();
    if (pe) throw pe;
    if (!product?.is_active)
      return NextResponse.json({ error: "Produit indisponible" }, { status: 400, headers: cors });
    const { data: lead, error: leadError } = await s
      .from("leads")
      .insert({
        workspace_id: lp.workspace_id,
        landing_page_id: lp.id,
        product_id: product.id,
        full_name: name.slice(0, 160),
        phone_raw: phone.slice(0, 40),
        phone_e164: e164(phone),
        city_name: city.slice(0, 120) || null,
        address: address.slice(0, 500) || null,
        status: "NEW",
        notes: "Commande landing externe",
      })
      .select("id")
      .single();
    if (leadError) throw leadError;
    const unit = Number(product.price || 0),
      total = unit * qty;
    const { data: order, error: oe } = await s
      .from("orders")
      .insert({
        workspace_id: lp.workspace_id,
        lead_id: lead.id,
        landing_page_id: lp.id,
        product_id: product.id,
        quantity: qty,
        unit_price: unit,
        subtotal: total,
        shipping_price: 0,
        discount: 0,
        total,
        currency: "MAD",
        shipment_status: "PENDING",
      })
      .select("id,order_number,total")
      .single();
    if (oe) throw oe;
    return NextResponse.json(
      { ok: true, order_id: order.id, order_number: order.order_number, total: order.total },
      { status: 201, headers: cors },
    );
  } catch (e: any) {
    reportError(e, "api/external-orders");
    return NextResponse.json({ error: publicMessage(e, "Erreur de commande externe") }, { status: 500, headers: cors });
  }
}
