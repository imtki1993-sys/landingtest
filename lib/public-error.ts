// Message d'erreur montré à l'utilisateur.
// Les messages métier écrits par l'application (en français) sont conservés ;
// les erreurs techniques (base de données, réseau, configuration, bugs) sont
// remplacées par un message générique — le détail reste dans les logs
// (lib/monitoring.ts), jamais chez le visiteur.

export const GENERIC_ERROR = "Une erreur est survenue. Réessayez dans un instant.";

const TECHNICAL =
  /supabase env|encryption_key|secret_legacy|fetch failed|econn|etimedout|enotfound|socket|network|timeout|violates|duplicate key|relation |column |syntax|json|unexpected token|cannot read|undefined|null value|is not a function|permission denied|jwt|pgrst|rpc|openai|api key|status code|internal/i;

export function publicMessage(error: unknown, fallback = GENERIC_ERROR): string {
  const e = error as any;
  if (!e) return fallback;
  // Exception levée volontairement par une fonction Postgres (RAISE EXCEPTION) : message métier
  if (e.code === "P0001" && typeof e.message === "string" && e.message) return e.message;
  // Erreur Supabase/PostgREST (objet avec code + details/hint) : technique
  if (typeof e.code === "string" && ("details" in e || "hint" in e)) return fallback;
  // Erreurs JavaScript techniques
  if (e instanceof TypeError || e instanceof SyntaxError || e instanceof RangeError || e?.name === "AbortError")
    return fallback;
  const msg = typeof e === "string" ? e : typeof e.message === "string" ? e.message : "";
  if (!msg || msg.length > 200 || TECHNICAL.test(msg)) return fallback;
  return msg;
}
