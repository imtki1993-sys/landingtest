// Sourcing Derb Omar : les clients de LandPro ne voient pas quel canal Telegram publie un produit.
// Seul l'administrateur de la plateforme voit les vrais noms ; les clients voient « Fournisseur N ».

export interface ChannelRef {
  id: string;
  username: string;
  title?: string | null;
}

/** Nom par défaut de chaque canal, « Fournisseur N » (ordre d'ajout, canaux désactivés compris) :
 * utilisé quand l'administrateur n'a pas choisi de nom (display_name). */
export function supplierAliases(channels: (ChannelRef & { created_at?: string | null })[]): Map<string, string> {
  const sorted = [...channels].sort(
    (a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")) || a.id.localeCompare(b.id),
  );
  return new Map(sorted.map((c, i) => [c.id, `Fournisseur ${i + 1}`]));
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Retire d'un texte tout ce qui nomme le canal : liens Telegram, @mentions, nom d'utilisateur
 * et titre du canal. Les numéros de téléphone sont gardés (contact du fournisseur).
 */
export function maskSupplier(text: string | null | undefined, c?: ChannelRef | null): string {
  let t = String(text || "");
  t = t.replace(/(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\/[^\s)]+/gi, "");
  t = t.replace(/(^|[^\w@])@[A-Za-z][\w]{3,}/g, "$1");
  const names = [c?.username, c?.title]
    .map((x) => String(x || "").trim())
    .filter((x) => x.length >= 3)
    .sort((a, b) => b.length - a.length);
  for (const n of names) t = t.replace(new RegExp(escape(n), "gi"), "");
  return t
    .split("\n")
    .map((l) => l.replace(/[ \t]{2,}/g, " ").trimEnd())
    .filter((l, i, all) => l.trim() || (i > 0 && all[i - 1].trim()))
    .join("\n")
    .trim();
}
