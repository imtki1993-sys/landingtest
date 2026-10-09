import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../lib/server-auth";
function vurl(path: string) {
  const team = process.env.VERCEL_TEAM_ID;
  return "https://api.vercel.com" + path + (team ? "?teamId=" + encodeURIComponent(team) : "");
}
export async function GET(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const { data, error } = await s
      .from("domains")
      .select(
        "id,landing_page_id,hostname,type,is_primary,verification_status,ssl_status,last_error,last_checked_at,created_at,landing_pages(id,name,slug,status)",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ domains: data || [], vercelConfigured: !!process.env.VERCEL_TOKEN });
  } catch (e: any) {
    reportError(e, "api/domains");
    return NextResponse.json({ error: publicMessage(e), domains: [] }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json(),
      hostname = String(b.hostname || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
    if (!hostname || !b.landing_page_id)
      return NextResponse.json({ error: "Domaine et landing page requis" }, { status: 400 });
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname))
      return NextResponse.json({ error: "Nom de domaine invalide" }, { status: 400 });
    // Domaines de la plateforme : réservés (sous-domaines *.landpro.online attribués automatiquement)
    if (/(^|\.)(landpro\.online|vercel\.app)$/.test(hostname))
      return NextResponse.json({ error: "Ce domaine est réservé par LandPro" }, { status: 400 });
    // La landing doit appartenir à ce workspace
    const { data: lp, error: lpError } = await s
      .from("landing_pages")
      .select("id")
      .eq("id", b.landing_page_id)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (lpError) throw lpError;
    if (!lp) return NextResponse.json({ error: "Landing page introuvable" }, { status: 404 });
    // Un domaine déjà enregistré par un autre workspace ne peut pas être repris
    const { data: existing, error: exError } = await s
      .from("domains")
      .select("workspace_id")
      .eq("hostname", hostname)
      .maybeSingle();
    if (exError) throw exError;
    if (existing && existing.workspace_id !== workspaceId)
      return NextResponse.json({ error: "Ce domaine est déjà utilisé par un autre compte" }, { status: 409 });
    const token = process.env.VERCEL_TOKEN,
      project = process.env.VERCEL_PROJECT_ID || "landingtest";
    if (!token)
      return NextResponse.json(
        { error: "VERCEL_TOKEN manquant dans les variables Vercel. Ajoute-le côté serveur puis redéploie." },
        { status: 503 },
      );
    const vr = await fetch(vurl("/v9/projects/" + encodeURIComponent(project) + "/domains"), {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ name: hostname }),
      }),
      vx = await vr.json();
    if (!vr.ok && vx?.error?.code !== "not_modified")
      return NextResponse.json(
        { error: vx?.error?.message || "Vercel a refusé le domaine", details: vx?.error },
        { status: 400 },
      );
    const verified = !!vx?.verified;
    const { data, error } = await s
      .from("domains")
      .upsert(
        {
          workspace_id: workspaceId,
          landing_page_id: lp.id,
          hostname,
          type: hostname.split(".").length > 2 ? "SUBDOMAIN" : "CUSTOM",
          verification_status: verified ? "VERIFIED" : "PENDING",
          ssl_status: verified ? "ISSUED" : "PENDING",
          vercel_domain_id: vx?.name || hostname,
          last_checked_at: new Date().toISOString(),
          last_error: null,
        },
        { onConflict: "hostname" },
      )
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ domain: data, vercel: vx, dnsRequired: !verified }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/domains");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
