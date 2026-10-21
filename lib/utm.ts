// Provenance publicitaire d'une visite ou d'une commande (paramètres UTM ajoutés par la pub).
// Facebook : utm_campaign = campagne, utm_term = ensemble de pubs, utm_content = pub.
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

const clean = (v: unknown) => {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, 200);
  // paramètre Facebook non remplacé (aperçu de la pub) : sans valeur
  return s && !/^\{\{.*\}\}$/.test(s) ? s : undefined;
};

/** UTM d'un objet (corps de requête) ou des paramètres d'une URL. */
export function utmFrom(src: unknown): Utm {
  const out: Utm = {};
  if (!src) return out;
  let get: (k: string) => unknown;
  if (typeof src === "string") {
    try {
      const q = new URL(src).searchParams;
      get = (k) => q.get(k);
    } catch {
      return out;
    }
  } else if (typeof src === "object") get = (k) => (src as Record<string, unknown>)[k];
  else return out;
  for (const k of UTM_KEYS) {
    const v = clean(get(k));
    if (v) out[k] = v;
  }
  return out;
}

export const hasUtm = (u: Utm) => Object.keys(u).length > 0;
