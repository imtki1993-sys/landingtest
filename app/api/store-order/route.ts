import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/server-auth";
function phoneE164(v: string) {
  let x = v.replace(/[^0-9+]/g, "");
  if (x.startsWith("+212")) return x;
  if (x.startsWith("00212")) return "+" + x.slice(2);
  if (x.startsWith("0")) return "+212" + x.slice(1);
  return x.startsWith("212") ? "+" + x : x;
}
export async function POST(req: Request) {
  try {
    const b = await req.json(),
      slug = String(b.slug || "").trim(),
      name = String(b.name || "").trim(),
      phone = String(b.phone || "").trim(),
      city = String(b.city || "").trim(),
      address = String(b.address || "").trim(),
      items = Array.isArray(b.items) ? b.items.slice(0, 20) : [];
    if (!slug || !name || !phone || !items.length)
      return NextResponse.json({ error: "Nom, téléphone et panier requis" }, { status: 400 });
    if (name.length > 160 || phone.length > 40 || city.length > 120 || address.length > 500)
      return NextResponse.json({ error: "Données de commande invalides" }, { status: 400 });
    const phoneDigits = phone.replace(/\D/g, "");
    const moroccoPhone = /^(?:\+?212|00212|0)?[5-7]\d{8}$/.test(phone.replace(/[ .()-]/g, ""));
    if (phoneDigits.length < 9 || phoneDigits.length > 15 || (!moroccoPhone && phoneDigits.length < 10))
      return NextResponse.json(
        { error: "Numéro de téléphone invalide. Exemple : 0673833237 ou +212673833237" },
        { status: 400 },
      );
    if (
      items.some(
        (x: any) =>
          !x ||
          typeof x !== "object" ||
          !String(x.id || "").trim() ||
          !Number.isFinite(Number(x.qty)) ||
          Number(x.qty) < 1 ||
          Number(x.qty) > 10,
      )
    )
      return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
    const s = adminDb(),
      ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
    const { data: allowed, error: rateError } = await s.rpc("check_public_order_rate_limit", {
      p_key: "store:" + slug + "|" + ip,
      p_limit: 12,
      p_window_seconds: 600,
    });
    if (rateError) throw rateError;
    if (allowed === false)
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const { data: store, error: se } = await s
      .from("stores")
      .select("id,workspace_id,status,name")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();
    if (se) throw se;
    if (!store) return NextResponse.json({ error: "Boutique introuvable ou non publiée" }, { status: 404 });
    const mergedItems = Array.from(
      items
        .reduce((m: Map<string, any>, x: any) => {
          const id = String(x.id).trim(),
            variant = x.variant_id == null ? "" : String(x.variant_id),
            key = id + "::" + variant,
            prev = m.get(key);
          m.set(key, { id, variant_id: variant || null, qty: Math.min(10, Number(prev?.qty || 0) + Number(x.qty)) });
          return m;
        }, new Map<string, any>())
        .values(),
    );
    const ids = [...new Set(mergedItems.map((x: any) => x.id))];
    const { data: products, error: pe } = await s
      .from("products")
      .select("id,name,price,is_active,specifications")
      .eq("workspace_id", store.workspace_id)
      .in("id", ids)
      .eq("is_active", true)
      .is("archived_at", null);
    if (pe) throw pe;
    const map = new Map((products || []).map((p: any) => [p.id, p]));
    if (map.size !== ids.length)
      return NextResponse.json({ error: "Un produit du panier est indisponible" }, { status: 400 });
    const lines = mergedItems.map((x: any) => {
        const p: any = map.get(String(x.id)),
          q = Math.min(10, Math.max(1, Number(x.qty || 1))),
          variants = Array.isArray(p.specifications?.variants) ? p.specifications.variants : [],
          variant = x.variant_id
            ? variants.find((v: any) => String(v.id) === String(x.variant_id) && v.active !== false)
            : null;
        if (x.variant_id && !variant) throw new Error("Variante indisponible pour " + p.name);
        if (variant?.stock != null && Number(variant.stock) < q) throw new Error("Stock insuffisant pour " + p.name);
        const price = variant?.price != null ? Number(variant.price) : Number(p.price),
          options = variant?.options || {};
        return { p, q, variant, options, price, subtotal: price * q };
      }),
      total = lines.reduce((n: number, x: any) => n + x.subtotal, 0),
      e164 = phoneE164(phone);
    const { data: result, error: atomicError } = await s.rpc("capture_public_store_order", {
      p_store_slug: slug,
      p_full_name: name,
      p_phone_raw: phone,
      p_phone_e164: e164,
      p_city: city || null,
      p_address: address || null,
      p_items: lines.map((x: any) => ({ id: x.p.id, qty: x.q, variant_id: x.variant?.id || null })),
      p_landing_url: req.headers.get("referer") || null,
      p_user_agent: req.headers.get("user-agent") || null,
    });
    if (atomicError) throw atomicError;
    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/store-order");
    return NextResponse.json({ error: e.message || "Erreur de commande" }, { status: 500 });
  }
}
