// Importe un produit du Sourcing Derb Omar dans « Mes produits » (et donc dans la boutique Derb Omar du compte).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { ImportError, importSourcingPost } from "../../../../lib/sourcing-import";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { s, workspaceId, isPlatformAdmin } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const r = await importSourcingPost(s, {
      workspaceId,
      isPlatformAdmin,
      postId: String(b.id || ""),
      name: b.name ? String(b.name) : undefined,
      price: Number(b.price),
      compareAt: Number(b.compare_at_price) || null,
    });
    return NextResponse.json(r, { status: r.updated ? 200 : 201 });
  } catch (e: any) {
    if (e instanceof ImportError) return NextResponse.json({ error: e.message }, { status: e.status });
    reportError(e, "api/sourcing/import");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
