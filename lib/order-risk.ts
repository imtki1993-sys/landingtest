// Fiabilité d'un client COD, calculée à partir de ses commandes passées dans le même compte
// (même numéro de téléphone) : doublons récents, colis livrés ou retournés, liste noire.
// Fonction pure : testée dans tests/order-risk.test.ts.

export type RiskLevel = "blocked" | "duplicate" | "risky" | "trusted" | "new";

export interface PhoneHistoryItem {
  id: string; // lead
  status: string | null; // statut du lead (NEW, CONFIRMED, DELIVERED, RETURNED, CANCELLED…)
  created_at: string;
}

export interface CustomerRisk {
  level: RiskLevel;
  label: string;
  detail: string;
  orders: number; // commandes avec ce numéro (celle-ci comprise)
  delivered: number;
  returned: number;
  cancelled: number;
  duplicates: number; // autres commandes à moins de 48 h
}

/** Téléphone au format +212XXXXXXXXX (même format que leads.phone_e164). */
export function toE164(phone: string): string {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("212")) return "+" + d;
  if (d.startsWith("0")) return "+212" + d.slice(1);
  if (d.length === 9 && /^[5-7]/.test(d)) return "+212" + d;
  return d ? "+" + d : "";
}

/** Numéro marocain plausible : +212 suivi de 9 chiffres commençant par 5, 6 ou 7. */
export const isPlausibleMaPhone = (e164: string) => /^\+212[5-7]\d{8}$/.test(e164);

const DUPLICATE_WINDOW_MS = 48 * 3600 * 1000;

export function customerRisk(input: {
  leadId: string;
  createdAt: string;
  phoneE164: string | null | undefined;
  history: PhoneHistoryItem[];
  blacklisted?: { reason?: string | null } | null;
}): CustomerRisk {
  const others = input.history.filter((h) => h.id !== input.leadId);
  const t = new Date(input.createdAt).getTime();
  const count = (s: string) => input.history.filter((h) => h.status === s).length;
  const delivered = count("DELIVERED"),
    returned = count("RETURNED"),
    cancelled = count("CANCELLED");
  const duplicates = others.filter((h) => Math.abs(new Date(h.created_at).getTime() - t) <= DUPLICATE_WINDOW_MS).length;
  const base = { orders: input.history.length || 1, delivered, returned, cancelled, duplicates };
  const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? "s" : ""}`;

  if (input.blacklisted)
    return {
      ...base,
      level: "blocked",
      label: "Liste noire",
      detail: input.blacklisted.reason ? `Numéro bloqué : ${input.blacklisted.reason}` : "Numéro bloqué par toi",
    };
  if (duplicates > 0)
    return {
      ...base,
      level: "duplicate",
      label: "Doublon",
      detail: `${plural(duplicates, "autre commande")} avec ce numéro en moins de 48 h`,
    };
  if (input.phoneE164 && !isPlausibleMaPhone(input.phoneE164))
    return { ...base, level: "risky", label: "Numéro douteux", detail: "Ce n’est pas un numéro marocain valide" };
  if (returned >= 2 || (returned >= 1 && returned >= delivered))
    return {
      ...base,
      level: "risky",
      label: "Risqué",
      detail: `${plural(returned, "colis retourné")}, ${plural(delivered, "colis livré")}`,
    };
  if (delivered >= 1)
    return {
      ...base,
      level: "trusted",
      label: "Fiable",
      detail: `${plural(delivered, "colis livré")}${returned ? `, ${plural(returned, "retour")}` : ""}`,
    };
  return {
    ...base,
    level: "new",
    label: others.length ? "Client connu" : "Nouveau client",
    detail: others.length ? `${plural(others.length, "commande")} avant, aucune livrée` : "Première commande",
  };
}
