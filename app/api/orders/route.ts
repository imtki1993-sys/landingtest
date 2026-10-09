import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authContext, adminDb } from "../../../lib/server-auth";
import { sendMetaPurchase } from "../../../lib/meta-capi";
import { customerRisk } from "../../../lib/order-risk";
import { blacklistedPhones } from "../../../lib/blacklist";
import { afterPublicOrder, AGENT_ROLE } from "../../../lib/team";
import { isMissingColumn } from "../../../lib/db-errors";
function db() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL,
    k = process.env.SUPABASE_SECRET_KEY;
  if (!u || !k) throw new Error("Supabase env missing");
  return createClient(u, k, { auth: { persistSession: false } });
}
export async function GET(req: Request) {
  try {
    const { s: supabase, workspaceId, role, user } = await authContext(req),
      isAgent = role === AGENT_ROLE,
      url = new URL(req.url),
      requested = Number(url.searchParams.get("limit") || 50),
      limit = Math.min(100, Math.max(1, Number.isFinite(requested) ? requested : 50)),
      cursor = url.searchParams.get("cursor"),
      dateFrom = url.searchParams.get("dateFrom"),
      dateTo = url.searchParams.get("dateTo"),
      kpiOnly = url.searchParams.get("kpiOnly") === "1";
    if (kpiOnly) {
      let kpiQuery = supabase
        .from("orders")
        .select("total,shipment_status,tracking_number,lead_id,created_at")
        .eq("workspace_id", workspaceId);
      if (isAgent) kpiQuery = kpiQuery.eq("assigned_to", user.id);
      if (dateFrom) kpiQuery = kpiQuery.gte("created_at", dateFrom + "T00:00:00");
      if (dateTo)
        kpiQuery = kpiQuery.lt(
          "created_at",
          new Date(new Date(dateTo + "T00:00:00").getTime() + 86400000).toISOString(),
        );
      const { data: kpiOrders, error: kpiError } = await kpiQuery;
      if (kpiError) throw kpiError;
      const all: any[] = kpiOrders || [],
        allLeadIds = [...new Set(all.map((o: any) => o.lead_id).filter(Boolean))];
      const { data: kpiLeads, error: kpiLeadsError } = allLeadIds.length
        ? await supabase.from("leads").select("id,status").eq("workspace_id", workspaceId).in("id", allLeadIds)
        : { data: [], error: null };
      if (kpiLeadsError) throw kpiLeadsError;
      const leadStatus = new Map((kpiLeads || []).map((l: any) => [l.id, l.status]));
      const kpis = {
        total: all.length,
        new: all.filter((o) => leadStatus.get(o.lead_id) === "NEW").length,
        call: all.filter((o) =>
          ["CONTACTED", "NO_ANSWER", "CALL_BACK"].includes(String(leadStatus.get(o.lead_id) || "")),
        ).length,
        confirmed: all.filter((o) => leadStatus.get(o.lead_id) === "CONFIRMED").length,
        sent: all.filter(
          (o) => !!o.tracking_number && ["PENDING", "PICKED_UP", "IN_TRANSIT"].includes(o.shipment_status),
        ).length,
        out: all.filter((o) => o.shipment_status === "OUT_FOR_DELIVERY").length,
        delivered: all.filter((o) => o.shipment_status === "DELIVERED").length,
        returns: all.filter((o) => ["FAILED", "RETURNING", "RETURNED", "CANCELLED"].includes(o.shipment_status)).length,
        deliveredRevenue: all
          .filter((o) => o.shipment_status === "DELIVERED")
          .reduce((sum, o) => sum + Number(o.total || 0), 0),
      };
      return NextResponse.json({ kpis });
    }
    const ORDER_COLS =
      "id,order_number,lead_id,landing_page_id,store_id,product_id,quantity,unit_price,subtotal,shipping_price,discount,total,currency,shipment_status,tracking_number,delivery_company_id,carrier_city_id,carrier_city_name,shipped_at,delivered_at,returned_at,created_at";
    // Colonnes de l'équipe (assigned_to…) : ignorées tant que la migration n'est pas exécutée
    const runOrders = (withTeam: boolean) => {
      let q = supabase
        .from("orders")
        .select(withTeam ? ORDER_COLS + ",assigned_to,assigned_at" : ORDER_COLS)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(limit + 1);
      if (cursor) q = q.lt("created_at", cursor);
      if (isAgent) q = q.eq("assigned_to", user.id);
      return q;
    };
    let { data: orders, error } = await runOrders(true);
    if (error && isMissingColumn(error) && !isAgent) ({ data: orders, error } = await runOrders(false));
    if (error) throw error;
    const fetched = orders || [],
      hasMore = fetched.length > limit,
      base = hasMore ? fetched.slice(0, limit) : fetched,
      leadIds = [...new Set(base.map((o: any) => o.lead_id).filter(Boolean))],
      productIds = [...new Set(base.map((o: any) => o.product_id).filter(Boolean))],
      landingIds = [...new Set(base.map((o: any) => o.landing_page_id).filter(Boolean))],
      storeIds = [...new Set(base.map((o: any) => o.store_id).filter(Boolean))],
      carrierIds = [...new Set(base.map((o: any) => o.delivery_company_id).filter(Boolean))];
    const [leadsQ, productsQ, landingsQ, storesQ, carriersQ] = await Promise.all([
      leadIds.length
        ? (async () => {
            const cols = "id,full_name,phone_raw,phone_e164,city_name,address,status,notes";
            const q = (c: string) => supabase.from("leads").select(c).eq("workspace_id", workspaceId).in("id", leadIds);
            const r = await q(cols + ",call_attempts,last_call_at,callback_at");
            return r.error && isMissingColumn(r.error) ? q(cols) : r;
          })()
        : Promise.resolve({ data: [] }),
      productIds.length
        ? supabase.from("products").select("id,name,images").eq("workspace_id", workspaceId).in("id", productIds)
        : Promise.resolve({ data: [] }),
      landingIds.length
        ? supabase.from("landing_pages").select("id,name,slug").eq("workspace_id", workspaceId).in("id", landingIds)
        : Promise.resolve({ data: [] }),
      storeIds.length
        ? supabase.from("stores").select("id,name,slug").eq("workspace_id", workspaceId).in("id", storeIds)
        : Promise.resolve({ data: [] }),
      carrierIds.length
        ? supabase
            .from("delivery_companies")
            .select("id,name,code")
            .eq("workspace_id", workspaceId)
            .in("id", carrierIds)
        : Promise.resolve({ data: [] }),
    ]);
    const by = (rows: any[] = []) => new Map(rows.map((x: any) => [x.id, x])),
      leads = by(leadsQ.data || []),
      products = by(productsQ.data || []),
      landings = by(landingsQ.data || []),
      stores = by(storesQ.data || []),
      carriers = by(carriersQ.data || []);
    // Fiabilité client : toutes les commandes du compte avec le même numéro + liste noire
    const phones = [...new Set([...leads.values()].map((l: any) => l.phone_e164).filter(Boolean))] as string[];
    const [historyQ, blocked] = await Promise.all([
      phones.length
        ? supabase
            .from("leads")
            .select("id,phone_e164,status,created_at")
            .eq("workspace_id", workspaceId)
            .in("phone_e164", phones)
            .limit(5000)
        : Promise.resolve({ data: [] }),
      blacklistedPhones(supabase, workspaceId, phones),
    ]);
    const historyByPhone = new Map<string, any[]>();
    for (const h of (historyQ as any).data || [])
      historyByPhone.set(h.phone_e164, [...(historyByPhone.get(h.phone_e164) || []), h]);
    const riskOf = (o: any) => {
      const lead = leads.get(o.lead_id) as any;
      if (!lead) return null;
      return customerRisk({
        leadId: lead.id,
        createdAt: o.created_at,
        phoneE164: lead.phone_e164,
        history: historyByPhone.get(lead.phone_e164) || [
          { id: lead.id, status: lead.status, created_at: o.created_at },
        ],
        blacklisted: blocked.get(lead.phone_e164) || null,
      });
    };
    // Noms des agents attribués (vue du propriétaire)
    const agentIds = [...new Set(base.map((o: any) => o.assigned_to).filter(Boolean))];
    const { data: agentRows } = agentIds.length
      ? await supabase.from("users").select("id,full_name,email").in("id", agentIds)
      : { data: [] as any[] };
    const agentName = new Map((agentRows || []).map((u: any) => [u.id, u.full_name || u.email]));
    const rows = base.map((o: any) => ({
      ...o,
      agent: o.assigned_to ? { id: o.assigned_to, name: agentName.get(o.assigned_to) || "Agent" } : null,
      risk: riskOf(o),
      lead: leads.get(o.lead_id) || null,
      product: products.get(o.product_id) || null,
      landing: landings.get(o.landing_page_id) || null,
      store: stores.get(o.store_id) || null,
      delivery_company: carriers.get(o.delivery_company_id) || null,
    }));
    let kpiQuery = supabase
      .from("orders")
      .select("total,shipment_status,tracking_number,lead_id,created_at")
      .eq("workspace_id", workspaceId);
    if (isAgent) kpiQuery = kpiQuery.eq("assigned_to", user.id);
    if (dateFrom) kpiQuery = kpiQuery.gte("created_at", dateFrom + "T00:00:00");
    if (dateTo)
      kpiQuery = kpiQuery.lt("created_at", new Date(new Date(dateTo + "T00:00:00").getTime() + 86400000).toISOString());
    const { data: kpiOrders, error: kpiError } = await kpiQuery;
    if (kpiError) throw kpiError;
    const all: any[] = kpiOrders || [],
      allLeadIds = [...new Set(all.map((o: any) => o.lead_id).filter(Boolean))];
    const { data: kpiLeads, error: kpiLeadsError } = allLeadIds.length
      ? await supabase
          .from("leads")
          .select("id,status,workspace_id")
          .eq("workspace_id", workspaceId)
          .in("id", allLeadIds)
      : { data: [], error: null };
    if (kpiLeadsError) throw kpiLeadsError;
    const leadStatus = new Map((kpiLeads || []).map((l: any) => [l.id, l.status]));
    const kpis = {
      total: all.length,
      new: all.filter((o) => leadStatus.get(o.lead_id) === "NEW").length,
      call: all.filter((o) => ["CONTACTED", "NO_ANSWER", "CALL_BACK"].includes(String(leadStatus.get(o.lead_id) || "")))
        .length,
      confirmed: all.filter((o) => leadStatus.get(o.lead_id) === "CONFIRMED").length,
      sent: all.filter((o) => !!o.tracking_number && ["PENDING", "PICKED_UP", "IN_TRANSIT"].includes(o.shipment_status))
        .length,
      out: all.filter((o) => o.shipment_status === "OUT_FOR_DELIVERY").length,
      delivered: all.filter((o) => o.shipment_status === "DELIVERED").length,
      returns: all.filter((o) => ["FAILED", "RETURNING", "RETURNED", "CANCELLED"].includes(o.shipment_status)).length,
      deliveredRevenue: all
        .filter((o) => o.shipment_status === "DELIVERED")
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
    };
    return NextResponse.json({
      orders: rows,
      kpis,
      pagination: { limit, hasMore, nextCursor: hasMore ? base[base.length - 1]?.created_at || null : null },
    });
  } catch (e: any) {
    reportError(e, "api/orders");
    return NextResponse.json({ error: publicMessage(e), orders: [] }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.slug || !b.name || !b.phone) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    const s = adminDb(),
      slug = String(b.slug).trim(),
      ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
    const { data: allowed, error: re } = await s.rpc("check_public_order_rate_limit", {
      p_key: slug + "|" + ip,
      p_limit: 12,
      p_window_seconds: 600,
    });
    if (re) throw re;
    if (!allowed)
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    const { data: lp } = await s
      .from("landing_pages")
      .select("id,name,status,workspace_id")
      .eq("slug", slug)
      .is("archived_at", null)
      .maybeSingle();
    if (!lp || lp.status !== "PUBLISHED")
      return NextResponse.json({ error: "Cette landing page n’est pas publiée" }, { status: 404 });
    const { data, error } = await s.rpc("capture_public_order", {
      p_slug: slug,
      p_full_name: String(b.name).trim().slice(0, 160),
      p_phone: String(b.phone).trim().slice(0, 40),
      p_city: b.city ? String(b.city).trim().slice(0, 120) : null,
      p_quantity: Math.min(10, Math.max(1, Number(b.quantity || 1))),
      p_address: b.address ? String(b.address).trim().slice(0, 500) : null,
    });
    if (error) throw error;
    if (data?.order_id) {
      const orderId = String(data.order_id);
      after(() => afterPublicOrder(s, orderId).catch(() => undefined));
      // URL exacte de la page (envoyée par la landing), sinon le Referer ; jamais une autre origine
      const referer = req.headers.get("referer") || "",
        pageUrl = typeof b.page_url === "string" ? b.page_url.slice(0, 1000) : "";
      const sameHost = (u: string) => {
        try {
          return new URL(u).host === new URL(referer || req.url).host;
        } catch {
          return false;
        }
      };
      const eventSourceUrl = pageUrl && sameHost(pageUrl) ? pageUrl : referer || undefined;
      const ip2 =
        (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "").split(",")[0].trim() || undefined;
      after(() =>
        sendMetaPurchase({
          workspaceId: lp.workspace_id,
          landingPageId: lp.id,
          orderId: data.order_id,
          value: Number(data.total || 0),
          currency: String(data.currency || "MAD"),
          quantity: Math.min(10, Math.max(1, Number(b.quantity || 1))),
          contentName: lp.name || undefined,
          phone: String(b.phone),
          name: String(b.name),
          city: b.city ? String(b.city) : undefined,
          eventSourceUrl,
          clientIp: ip2,
          userAgent: req.headers.get("user-agent") || undefined,
          fbp: typeof b.fbp === "string" ? b.fbp : undefined,
          fbc: typeof b.fbc === "string" ? b.fbc : undefined,
          externalId: typeof b.visitor_id === "string" ? b.visitor_id.slice(0, 80) : undefined,
        }).catch(() => {}),
      );
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/orders");
    const m = String(e.message || "");
    const limited = /order_limit_reached|subscription_inactive/.test(m);
    return NextResponse.json(
      {
        error: m === "order_limit_reached" ? "Limite mensuelle de commandes atteinte pour ce plan." : publicMessage(e),
      },
      { status: limited ? 403 : 500 },
    );
  }
}
