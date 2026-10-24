// Boutique Derb Omar publique : page suivante du catalogue (« Voir plus », catégorie, recherche).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../lib/public-error";
import { reportError } from "../../../lib/monitoring";
import { adminDb } from "../../../lib/server-auth";
import { derbCatalog, derbStoreBySlug } from "../../../lib/derb-store";
import { SOURCING_CATEGORIES } from "../../../lib/sourcing-extract";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const s = adminDb();
    const store = await derbStoreBySlug(s, String(q.get("slug") || ""), true);
    if (!store) return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
    const category = (SOURCING_CATEGORIES as readonly string[]).includes(q.get("category") || "")
      ? String(q.get("category"))
      : "";
    const r = await derbCatalog(s, store.workspace_id, {
      cursor: q.get("cursor"),
      category,
      q: q.get("q") || "",
    });
    return NextResponse.json(r, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e: any) {
    reportError(e, "api/derb-store");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
