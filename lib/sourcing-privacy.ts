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

// lignes réservées au vendeur : prix de gros, quantité minimum, contact du grossiste
const SELLER_ONLY =
  /(\bgros\b|جمل[ةه]|بالجملة|\bprix\b|ثمن|سعر|السعر|\bdhs?\b|درهم|دراهم|\bmad\b|\bmin(imum)?\b|أقل|اقل|كمية|الكمية|whats|واتس|واتساب|\btel\b|téléphone|telephone|للتواصل|تواصل|اتصل|للطلب|commande|livraison|التوصيل|\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2})/i;

/**
 * Description montrée aux acheteurs d'une boutique : texte du produit sans le canal (voir maskSupplier),
 * ni prix de gros, ni quantité minimum, ni numéro ou contact du grossiste.
 */
export function publicDescription(text: string | null | undefined, c?: ChannelRef | null): string {
  return maskSupplier(text, c)
    .split("\n")
    .filter((l) => !SELLER_ONLY.test(l))
    .filter((l) => /[\p{L}\p{N}]/u.test(l) || !l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2000);
}
