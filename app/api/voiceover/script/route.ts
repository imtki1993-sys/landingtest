// Script de voix off en darija écrit par Meta AI, puis préparé pour la voix (chiffres, mots latins…).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { metaAsk, MetaModelError } from "../../../../lib/meta-model";
import { parseJsonReply } from "../../../../lib/store-templates/ai";
import { DURATIONS, PRESETS, scriptPrompt } from "../../../../lib/voiceover";
import { normalizeDarija } from "../../../../lib/darija-text";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    let name = String(b.name || "")
      .trim()
      .slice(0, 120);
    let description = String(b.description || "").slice(0, 1500);
    let price = Number(b.price) || null;
    let oldPrice = Number(b.oldPrice) || null;
    // produit choisi dans « Mes produits » : ses vraies infos
    if (b.product_id) {
      const { data: p } = await s
        .from("products")
        .select("name,description,price,compare_at_price")
        .eq("workspace_id", workspaceId)
        .eq("id", String(b.product_id))
        .maybeSingle();
      if (p) {
        name ||= p.name;
        description ||= p.description || "";
        price ||= Number(p.price) || null;
        oldPrice ||= Number(p.compare_at_price) || null;
      }
    }
    if (!name) return NextResponse.json({ error: "Indique le nom du produit." }, { status: 400 });
    const seconds = (DURATIONS as readonly number[]).includes(Number(b.seconds)) ? Number(b.seconds) : 30;
    try {
      const ask = await metaAsk(s, workspaceId);
      const raw = parseJsonReply(
        await ask(
          scriptPrompt({
            name,
            description,
            price,
            oldPrice,
            seconds,
            tone: String(b.tone || "energique"),
            angle: String(b.angle || "probleme"),
            audience: String(b.audience || "").slice(0, 80),
            notes: String(b.notes || ""),
            brief: PRESETS.find((x) => x.id === b.preset)?.brief,
          }),
        ),
      );
      const lines: string[] = (Array.isArray(raw.lines) ? raw.lines : [])
        .map((l: unknown) => String(l || "").trim())
        .filter(Boolean)
        .slice(0, 30);
      if (!lines.length) throw new Error("script vide");
      const script = lines.join("\n");
      return NextResponse.json({
        title: String(raw.title || name).slice(0, 80),
        script,
        spoken: normalizeDarija(script),
      });
    } catch (e: any) {
      if (e instanceof MetaModelError)
        return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      console.error("Voiceover script failed", { message: e?.message });
      return NextResponse.json(
        { error: "La réponse de Meta AI est incomplète. Relance la génération." },
        { status: 502 },
      );
    }
  } catch (e: any) {
    reportError(e, "api/voiceover/script");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
