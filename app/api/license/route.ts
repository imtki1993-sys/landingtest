// Abonnement du compte connecté : état (GET) et activation d'une clé (POST).
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
import { activateLicense, daysLeft, LicenseError, LICENSE_OFFERS } from "../../../lib/licenses";

const clientIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();

export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const [{ data: sub, error }, { data: keys }] = await Promise.all([
      s
        .from("workspace_subscriptions")
        .select("plan_code,status,current_period_start,current_period_end,landing_limit")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
      s
        .from("license_keys")
        .select("code_hint,duration_months,price_mad,used_at")
        .eq("used_by_workspace", workspaceId)
        .order("used_at", { ascending: false })
        .limit(20),
    ]);
    if (error) throw error;
    const end = sub?.current_period_end || null,
      left = daysLeft(end);
    const active = !!sub && ["active", "trialing"].includes(String(sub.status)) && (left === null || left > 0);
    return NextResponse.json({
      subscription: sub || null,
      active,
      days_left: left,
      offers: LICENSE_OFFERS,
      history: keys || [],
      sales_whatsapp: String(process.env.LANDPRO_SALES_WHATSAPP || "").replace(/\D/g, ""),
    });
  } catch (e: any) {
    reportError(e, "api/license");
    return NextResponse.json({ error: publicMessage(e) }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { s, user, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const out = await activateLicense(s, { workspaceId, userId: user.id, code: b.code, ip: clientIp(req) });
    return NextResponse.json({ ok: true, ...out });
  } catch (e: any) {
    if (e instanceof LicenseError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    reportError(e, "api/license");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
