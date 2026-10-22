// Landing Gemini — étape 1 : analyse des vraies photos du produit (fiche à valider par le vendeur).
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { GeminiError, geminiJson, imagePart } from "../../../../lib/gemini";
import { analyzePrompt, cleanAnalysis } from "../../../../lib/gemini-landing";

export const maxDuration = 90;

/** { name, description?, images: string[], language } → { analysis } */
export async function POST(req: Request) {
  try {
    await authContext(req);
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || "")
      .trim()
      .slice(0, 120);
    if (!name) return NextResponse.json({ error: "Indique le nom du produit." }, { status: 400 });
    const urls: string[] = (Array.isArray(b.images) ? b.images : []).filter((u: unknown) => typeof u === "string");
    if (!urls.length) return NextResponse.json({ error: "Ajoute au moins une photo du produit." }, { status: 400 });
    const parts = (await Promise.all(urls.slice(0, 4).map(imagePart))).filter(Boolean) as any[];
    if (!parts.length)
      return NextResponse.json({ error: "Photos illisibles : utilise des images JPG, PNG ou WebP." }, { status: 400 });
    try {
      const raw = await geminiJson(
        analyzePrompt({ name, description: String(b.description || ""), language: String(b.language || "ar-MA") }),
        parts,
      );
      return NextResponse.json({ analysis: cleanAnalysis(raw) });
    } catch (e: any) {
      if (e instanceof GeminiError) return NextResponse.json({ error: e.message }, { status: e.status });
      throw e;
    }
  } catch (e: any) {
    reportError(e, "api/landing-gemini/analyze");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
