// Admin : générer des clés 3 / 6 / 12 mois, les lister, révoquer une clé non utilisée.
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
import {
  generateLicenseCode,
  hashLicenseCode,
  licenseHint,
  licenseSetupMessage,
  offerFor,
} from "../../../../lib/licenses";

async function admin(req: Request) {
  const a = await authContext(req);
  if (!a.isPlatformAdmin) throw new Error("Accès administrateur requis");
  return a;
}
// L'admin voit la cause précise d'une erreur de mise en place (table, variable manquante)
const fail = (e: any) =>
  NextResponse.json(
    { error: licenseSetupMessage(e) || publicMessage(e) },
    { status: String(e?.message || "").includes("administrateur") ? 403 : 500 },
  );

export async function GET(req: Request) {
  try {
    const { s } = await admin(req);
    const { data, error } = await s
      .from("license_keys")
      .select("id,code_hint,duration_months,price_mad,status,note,created_at,used_at,used_by_workspace,revoked_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const ids = [...new Set((data || []).map((k: any) => k.used_by_workspace).filter(Boolean))];
    const { data: ws } = ids.length
      ? await s.from("workspaces").select("id,name").in("id", ids)
      : { data: [] as any[] };
    const names = new Map((ws || []).map((w: any) => [w.id, w.name]));
    return NextResponse.json({
      keys: (data || []).map((k: any) => ({ ...k, workspace_name: names.get(k.used_by_workspace) || null })),
    });
  } catch (e: any) {
    reportError(e, "api/admin/licenses");
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const { s, user } = await admin(req);
    const b = await req.json().catch(() => ({}));
    if (b.action === "revoke") {
      const { data, error } = await s
        .from("license_keys")
        .update({ status: "revoked", revoked_at: new Date().toISOString() })
        .eq("id", String(b.id || ""))
        .eq("status", "available")
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: "Seule une clé non utilisée peut être révoquée." }, { status: 400 });
      return NextResponse.json({ ok: true });
    }
    const offer = offerFor(Number(b.months));
    const count = Math.floor(Number(b.count || 1));
    if (!offer || !Number.isFinite(count) || count < 1 || count > 50)
      return NextResponse.json({ error: "Durée (3, 6 ou 12 mois) et nombre (1 à 50) requis" }, { status: 400 });
    const note = String(b.note || "")
      .trim()
      .slice(0, 200);
    const codes = Array.from({ length: count }, () => generateLicenseCode());
    const { error } = await s.from("license_keys").insert(
      codes.map((code) => ({
        code_hash: hashLicenseCode(code),
        code_hint: licenseHint(code),
        duration_months: offer.months,
        price_mad: offer.price,
        note: note || null,
        created_by: user.id,
      })),
    );
    if (error) throw error;
    // Les clés ne sont montrées qu'ici, une seule fois : seule leur empreinte est enregistrée
    return NextResponse.json({ ok: true, codes, months: offer.months, price: offer.price }, { status: 201 });
  } catch (e: any) {
    reportError(e, "api/admin/licenses");
    return fail(e);
  }
}
