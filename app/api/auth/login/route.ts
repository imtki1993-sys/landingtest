import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activateLicense, LicenseError } from "../../../../lib/licenses";
export async function POST(req: Request) {
  try {
    const { email, password, license_key } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase env missing");
    const s = createClient(url, key, { auth: { persistSession: false } });
    const login = s.auth.signInWithPassword({ email: String(email).trim(), password: String(password) });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Délai de connexion Supabase dépassé")), 12000),
    );
    const { data, error } = await Promise.race([login, timeout]);
    if (error || !data.session) return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    const admin = createClient(url, key, { auth: { persistSession: false } });
    let { data: profile } = await admin.from("users").select("approval_status").eq("id", data.user.id).single();
    // Compte en attente + clé d'activation : la clé active le compte (mot de passe déjà vérifié)
    if (profile?.approval_status === "pending" && license_key) {
      const { data: ctx } = await admin.rpc("resolve_user_context", { p_user_id: data.user.id });
      const workspaceId = (Array.isArray(ctx) ? ctx[0] : ctx)?.workspace_id;
      if (!workspaceId) return NextResponse.json({ error: "Workspace introuvable" }, { status: 409 });
      try {
        await activateLicense(admin, {
          workspaceId,
          userId: data.user.id,
          code: license_key,
          ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined,
        });
      } catch (e) {
        if (e instanceof LicenseError)
          return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
        throw e;
      }
      profile = { approval_status: "approved" };
    }
    if (profile?.approval_status !== "approved")
      return NextResponse.json(
        {
          error:
            profile?.approval_status === "rejected"
              ? "Inscription refusée par l’administrateur"
              : profile?.approval_status === "suspended"
                ? "Compte suspendu. Contacte l’administrateur."
                : "Compte en attente d’activation : saisis ta clé d’activation pour l’activer.",
          code: profile?.approval_status === "pending" ? "PENDING" : "BLOCKED",
        },
        { status: 403 },
      );
    // Rôle pour la redirection après connexion (agent → ses commandes)
    const { data: ctxRole } = await admin.rpc("resolve_user_context", { p_user_id: data.user.id });
    const role = (Array.isArray(ctxRole) ? ctxRole[0] : ctxRole)?.role || null;
    const res = NextResponse.json({ ok: true, role });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set("lm_access", data.session.access_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in,
    });
    res.cookies.set("lm_refresh", data.session.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    reportError(e, "api/auth/login");
    return NextResponse.json({ error: publicMessage(e, "Erreur connexion") }, { status: 500 });
  }
}
