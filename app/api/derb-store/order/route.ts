// Commande sur une boutique Derb Omar : produit du catalogue Sourcing, avec ou sans prix fixé par le client.
// La commande arrive dans Commandes (boutique = « site Derb Omar »). Sans prix : total 0, prix à confirmer
// au téléphone ; le produit est créé dans « Mes produits » sans être mis en vente.
import { NextResponse, after } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { adminDb } from "../../../../lib/server-auth";
import { afterPublicOrder } from "../../../../lib/team";
import { derbStoreBySlug } from "../../../../lib/derb-store";
import { importedPosts, importSourcingPost } from "../../../../lib/sourcing-import";

function e164(v: string) {
  const x = v.replace(/[^0-9+]/g, "");
  if (x.startsWith("+212")) return x;
  if (x.startsWith("00212")) return "+" + x.slice(2);
  if (x.startsWith("0")) return "+212" + x.slice(1);
  return x.startsWith("212") ? "+" + x : x;
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const slug = String(b.slug || "").trim(),
      postId = String(b.id || "").trim(),
      name = String(b.name || "").trim(),
      phone = String(b.phone || "").trim(),
      city = String(b.city || "").trim(),
      address = String(b.address || "").trim(),
      qty = Math.min(10, Math.max(1, Math.round(Number(b.qty) || 1)));
    if (!slug || !postId || !name || !phone)
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 });
    if (name.length > 160 || phone.length > 40 || city.length > 120 || address.length > 500)
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 });
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15)
      return NextResponse.json({ error: "Numéro de téléphone invalide. Exemple : 0612345678" }, { status: 400 });
    const s = adminDb();
    const store = await derbStoreBySlug(s, slug);
    if (!store) return NextResponse.json({ error: "Boutique introuvable ou non publiée" }, { status: 404 });
    const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
    const { data: allowed, error: re } = await s.rpc("check_public_order_rate_limit", {
      p_key: "derb:" + slug + "|" + ip,
      p_limit: 12,
      p_window_seconds: 600,
    });
    if (re) throw re;
    if (allowed === false)
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });
    // mêmes règles que les autres commandes : abonnement actif et quota mensuel
    const { data: sub } = await s
      .from("workspace_subscriptions")
      .select("status,order_monthly_limit")
      .eq("workspace_id", store.workspace_id)
      .maybeSingle();
    if (sub && !["active", "trialing"].includes(String(sub.status)))
      return NextResponse.json({ error: "Boutique momentanément indisponible" }, { status: 403 });
    const monthly = Number(sub?.order_monthly_limit || 0);
    if (monthly > 0) {
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      const { count } = await s
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", store.workspace_id)
        .gte("created_at", start.toISOString());
      if ((count || 0) >= monthly)
        return NextResponse.json({ error: "Boutique momentanément indisponible" }, { status: 403 });
    }
    // produit du client : en vente (son prix) ou créé maintenant « prix sur demande »
    let mine = (await importedPosts(s, store.workspace_id, [postId])).get(postId);
    if (mine && !mine.active && !mine.onRequest)
      return NextResponse.json({ error: "Produit indisponible" }, { status: 400 });
    if (!mine) {
      await importSourcingPost(s, {
        workspaceId: store.workspace_id,
        isPlatformAdmin: false,
        postId,
        price: 0,
        onRequest: true,
      });
      mine = (await importedPosts(s, store.workspace_id, [postId])).get(postId);
      if (!mine) throw new Error("Produit indisponible");
    }
    const unit = mine.active ? mine.price : 0,
      total = unit * qty;
    const { data: lead, error: le } = await s
      .from("leads")
      .insert({
        workspace_id: store.workspace_id,
        product_id: mine.id,
        full_name: name.slice(0, 160),
        phone_raw: phone.slice(0, 40),
        phone_e164: e164(phone),
        city_name: city.slice(0, 120) || null,
        address: address.slice(0, 500) || null,
        status: "NEW",
        notes: "Site Derb Omar" + (unit ? "" : " · prix à confirmer au téléphone"),
      })
      .select("id")
      .single();
    if (le) throw le;
    const { data: order, error: oe } = await s
      .from("orders")
      .insert({
        workspace_id: store.workspace_id,
        lead_id: lead.id,
        store_id: store.id,
        product_id: mine.id,
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
    after(() => afterPublicOrder(s, order.id).catch(() => null));
    return NextResponse.json({ ok: true, order_number: order.order_number, total: order.total }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/derb-store/order");
    return NextResponse.json({ error: publicMessage(e, "Erreur de commande") }, { status: 500 });
  }
}
