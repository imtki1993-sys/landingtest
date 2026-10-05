import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { withLandingInvalidation } from "../../../../lib/landing-cache";
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
function slugify(v: string) {
  return (
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "external"
  );
}
function normalizeUrl(v: string) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw).toString();
  } catch {
    return "";
  }
}
function hostOf(v: string) {
  try {
    return new URL(v).hostname.toLowerCase();
  } catch {
    return "";
  }
}
function detect(html: string, url: string) {
  const forms = html.match(/<form\b[\s\S]*?<\/form>/gi) || [];
  const score = (x: string) => {
    const s = x.toLowerCase();
    return (
      (/(phone|tel|telephone|الهاتف|هاتف)/.test(s) ? 5 : 0) +
      (/(name|nom|fullname|الاسم)/.test(s) ? 3 : 0) +
      (/(city|ville|مدينة|المدينة)/.test(s) ? 2 : 0) +
      (/(address|adresse|العنوان)/.test(s) ? 2 : 0) +
      (/(submit|commander|commande|order|طلب|أكد)/.test(s) ? 3 : 0)
    );
  };
  const form = forms.sort((a, b) => score(b) - score(a))[0] || "";
  const field = (aliases: string[]) => {
    for (const a of aliases) {
      const re = new RegExp(
          "<(?:input|select|textarea)[^>]*(?:name|id)=[\\\"']([^\\\"']*" + a + "[^\\\"']*)[\\\"'][^>]*>",
          "i",
        ),
        m = form.match(re);
      if (m) return m[1];
    }
    return "";
  };
  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();
  return {
    url,
    title,
    form_detected: !!form,
    fields: {
      name: field(["name", "nom", "fullname"]),
      phone: field(["phone", "tel", "telephone"]),
      city: field(["city", "ville"]),
      address: field(["address", "adresse"]),
      quantity: field(["quantity", "qty", "quantite"]),
    },
    confidence: Math.min(100, score(form) * 7),
  };
}
async function PUTHandler(req: Request) {
  try {
    await authContext(req);
    const b = await req.json(),
      url = normalizeUrl(b.url);
    if (!url) return NextResponse.json({ error: "URL de landing invalide" }, { status: 400 });
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 8000);
    let r: Response;
    try {
      r = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "LandPro-External-Landing-Scanner/1.0" },
        cache: "no-store",
      });
    } finally {
      clearTimeout(timer);
    }
    if (!r.ok) return NextResponse.json({ error: "Landing inaccessible (HTTP " + r.status + ")" }, { status: 400 });
    const type = r.headers.get("content-type") || "";
    if (!type.includes("text/html"))
      return NextResponse.json({ error: "Cette URL ne retourne pas une page HTML" }, { status: 400 });
    const html = (await r.text()).slice(0, 1500000),
      finalUrl = r.url || url,
      analysis = detect(html, finalUrl);
    return NextResponse.json({ analysis: { ...analysis, domain: hostOf(finalUrl) } });
  } catch (e: any) {
    reportError(e, "api/pages/external");
    return NextResponse.json(
      {
        error:
          e.name === "AbortError" ? "La landing met trop de temps à répondre" : publicMessage(e, "Analyse impossible"),
      },
      { status: e.message === "Non autorisé" ? 401 : 500 },
    );
  }
}
async function POSTHandler(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req),
      b = await req.json(),
      sourceUrl = normalizeUrl(b.url),
      name = String(b.name || "Landing externe")
        .trim()
        .slice(0, 120),
      productId = String(b.product_id || "").trim(),
      domain = sourceUrl
        ? hostOf(sourceUrl)
        : String(b.domain || "")
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .split("/")[0];
    if (!productId) return NextResponse.json({ error: "Produit requis" }, { status: 400 });
    const { data: product } = await s
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .is("archived_at", null)
      .maybeSingle();
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    const slug = slugify(name) + "-ext-" + crypto.randomUUID().replace(/-/g, "").slice(0, 8),
      seo = {
        source: "external",
        external_url: sourceUrl || null,
        external_domain: domain,
        external_mapping: b.mapping || null,
        external_scan: b.analysis || null,
        external_created_at: new Date().toISOString(),
      };
    const { data, error } = await s
      .from("landing_pages")
      .insert({
        workspace_id: workspaceId,
        product_id: productId,
        name,
        slug,
        status: "DRAFT",
        locale: "fr",
        published_at: null,
        seo,
      })
      .select("id,name,slug,status,product_id,seo")
      .single();
    if (error) throw error;
    return NextResponse.json({ page: data }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/pages/external");
    return NextResponse.json({ error: publicMessage(e) }, { status: e.message === "Non autorisé" ? 401 : 500 });
  }
}

export const PUT = withLandingInvalidation(PUTHandler);
export const POST = withLandingInvalidation(POSTHandler);
