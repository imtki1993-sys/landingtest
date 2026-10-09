import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activateLicense, LicenseError, normalizeLicenseCode } from "../../../../lib/licenses";
export async function POST(req: Request) {
  try {
    const { email, password, license_key } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    if (String(password).length < 8)
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    if (license_key && !normalizeLicenseCode(license_key))
      return NextResponse.json({ error: "Format de clé invalide (LP-XXXX-XXXX-XXXX)." }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase env missing");
    const s = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await s.auth.signUp({ email: String(email).trim(), password: String(password) });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // Clé saisie à l'inscription : le compte est activé tout de suite
    let licenseError = "";
    if (license_key && data.user) {
      try {
        const { data: ctx } = await s.rpc("resolve_user_context", { p_user_id: data.user.id });
        const workspaceId = (Array.isArray(ctx) ? ctx[0] : ctx)?.workspace_id;
        if (!workspaceId) throw new LicenseError("LICENSE_ACCOUNT", "Workspace introuvable", 409);
        await activateLicense(s, {
          workspaceId,
          userId: data.user.id,
          code: license_key,
          ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined,
        });
      } catch (e: any) {
        if (!(e instanceof LicenseError)) reportError(e, "api/auth/signup/license");
        licenseError =
          e instanceof LicenseError && e.code !== "LICENSE_ACCOUNT"
            ? e.message + " Ton compte est créé : saisis une clé valide à la connexion."
            : "Compte créé, mais la clé n’a pas pu être activée. Saisis-la à la connexion.";
      }
    }
    if (!data.session) return NextResponse.json({ ok: true, confirmationRequired: true, licenseError });
    const res = NextResponse.json({ ok: true, licenseError });
    res.cookies.set("lm_access", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in,
    });
    res.cookies.set("lm_refresh", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    reportError(e, "api/auth/signup");
    return NextResponse.json({ error: publicMessage(e, "Erreur inscription") }, { status: 500 });
  }
}
