// Ajoute des harakat au script par Meta AI ; une ligne n'est gardée que si ses mots sont strictement inchangés.
import { NextResponse } from "next/server";
import { publicMessage } from "../../../../lib/public-error";
import { reportError } from "../../../../lib/monitoring";
import { authContext } from "../../../../lib/server-auth";
import { metaAsk, MetaModelError } from "../../../../lib/meta-model";
import { parseJsonReply } from "../../../../lib/store-templates/ai";
import { mergeVocalized, vocalizePrompt } from "../../../../lib/voiceover";

export const maxDuration = 60;

/** { text } → { text, lines (lignes vocalisées), rejected (lignes où l'IA a changé un mot : gardées telles quelles) } */
export async function POST(req: Request) {
  try {
    const { s, workspaceId } = await authContext(req);
    const b = await req.json().catch(() => ({}));
    const text = String(b.text || "").slice(0, 4000);
    if (!text.trim()) return NextResponse.json({ error: "Le script est vide." }, { status: 400 });
    try {
      const ask = await metaAsk(s, workspaceId);
      const raw = parseJsonReply(await ask(vocalizePrompt(text)));
      return NextResponse.json(mergeVocalized(text, String(raw.text || "")));
    } catch (e: any) {
      if (e instanceof MetaModelError)
        return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      return NextResponse.json({ error: "La réponse de Meta AI est incomplète. Réessaie." }, { status: 502 });
    }
  } catch (e: any) {
    reportError(e, "api/voiceover/vocalize");
    return NextResponse.json({ error: publicMessage(e) }, { status: e?.message === "Non autorisé" ? 401 : 500 });
  }
}
