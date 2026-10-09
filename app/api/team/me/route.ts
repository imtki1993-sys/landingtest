// Rôle et nom de l'utilisateur connecté (propriétaire ou agent).
import { NextResponse } from "next/server";
import { authContext } from "../../../../lib/server-auth";
export async function GET(req: Request) {
  try {
    const { s, user, role } = await authContext(req);
    const { data } = await s.from("users").select("full_name,email").eq("id", user.id).maybeSingle();
    return NextResponse.json({ role, name: data?.full_name || data?.email || user.email || "" });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
