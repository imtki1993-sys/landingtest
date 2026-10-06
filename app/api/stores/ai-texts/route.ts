// Réécrit avec Meta AI les textes d'une boutique (éditeur) : renvoie les nouveaux réglages,
// sans les enregistrer — le marchand voit le résultat dans l'aperçu, peut annuler, puis enregistre.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { getStoreTemplate } from "../../../../lib/store-templates";
import { parseJsonReply, rewriteStoreTexts, templateContentPrompt } from "../../../../lib/store-templates/ai";
import { aiProductList } from "../../../../lib/store-templates/ai-input";
import { metaAsk, MetaModelError } from "../../../../lib/meta-model";

// la génération IA peut prendre plus de 10 s
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const { s, workspaceId } = await authContext(req);
    const t = getStoreTemplate(b.templateId);
    if (!t) return NextResponse.json({ error: "Template inconnu" }, { status: 400 });
    const settings = b.settings && typeof b.settings === "object" ? b.settings : {};
    const locale = ["darija", "ar", "fr"].includes(b.locale) ? b.locale : "darija";
    const name = String(b.name || "").slice(0, 80) || "Boutique";
    const brief = String(b.brief || "").slice(0, 1500);
    try {
      const ask = await metaAsk(s, workspaceId);
      const raw = parseJsonReply(
        await ask(templateContentPrompt(t, { name, locale, brief, products: aiProductList(b.products) })),
      );
      const next = rewriteStoreTexts(t, locale, raw, settings);
      if (brief) next.aiBrief = brief;
      return NextResponse.json({ settings: next });
    } catch (e: any) {
      if (e instanceof MetaModelError)
        return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      console.error("Store AI texts failed", { message: e?.message });
      return NextResponse.json(
        { error: "La réponse de Meta AI est incomplète. Relance la génération.", code: "META_AI_UNAVAILABLE" },
        { status: 502 },
      );
    }
  } catch (e: any) {
    reportError(e, "api/stores/ai-texts");
    return NextResponse.json({ error: publicMessage(e) }, { status: 500 });
  }
}
