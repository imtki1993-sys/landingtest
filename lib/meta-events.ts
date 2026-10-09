// Outils Pixel Meta partagés par la landing (navigateur) et l'API Conversions (serveur).
// Fonctions pures : testées dans tests/meta-events.test.ts.

/** Devise envoyée à Meta : un code ISO 4217 (« DH » n'en est pas un → MAD). */
export function metaCurrency(v?: unknown): string {
  const c = String(v || "")
    .trim()
    .toUpperCase();
  if (!c || c === "DH" || c === "DHS" || c === "MAD") return "MAD";
  return /^[A-Z]{3}$/.test(c) ? c : "MAD";
}

/** Valeur numérique propre (jamais NaN ni négative). */
export function metaValue(v?: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

/** Cookie _fbc au format Meta à partir d'un fbclid : fb.1.<horodatage ms>.<fbclid>. */
export function fbcFromClickId(fbclid?: string | null, now = Date.now()): string | undefined {
  const id = String(fbclid || "").trim();
  return id ? `fb.1.${now}.${id}` : undefined;
}

/** Valide un identifiant navigateur Meta (_fbp / _fbc) reçu du client. */
export function cleanFbId(v?: unknown): string | undefined {
  const s = String(v || "").trim();
  return /^fb\.\d\.\d{10,13}\.[\w.-]{1,480}$/.test(s) ? s : undefined;
}

/** Téléphone marocain au format international sans « + » (06… → 2126…). */
export function normalizeMaPhone(phone: string): string {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("00212")) return d.slice(2);
  if (d.startsWith("212")) return d;
  if (d.startsWith("0")) return "212" + d.slice(1);
  if (d.length === 9 && /^[5-7]/.test(d)) return "212" + d;
  return d;
}

/** Ville normalisée pour Meta : minuscules, sans accents, espaces ni ponctuation. */
export function normalizeCity(city?: string | null): string {
  return String(city || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z؀-ۿ]/g, "");
}

/** Identifiant d'événement commun au Pixel et à l'API Conversions (déduplication). */
export const purchaseEventId = (orderId: string) => "order_" + orderId;
