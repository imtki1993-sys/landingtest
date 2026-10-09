// Identifiants des transporteurs (Ozon, Sendit, Cathedis) : les secrets sont chiffrés
// dans delivery_companies.settings (même chiffrement que les intégrations).
// Les anciennes valeurs en clair restent lisibles et sont chiffrées au prochain enregistrement.
import { decryptIntegrationSecret, encryptIntegrationSecret } from "./integration-secrets";

export const CARRIER_SECRET_FIELDS = ["api_key", "secret_key", "token"] as const;

/** Chiffre les champs secrets avant enregistrement. */
export function sealCarrierSettings(settings: Record<string, any>): Record<string, any> {
  const out = { ...settings };
  for (const k of CARRIER_SECRET_FIELDS) {
    const v = out[k];
    if (typeof v === "string" && v && !v.startsWith("v1:")) out[k] = encryptIntegrationSecret(v);
  }
  return out;
}

/** Déchiffre les champs secrets pour un appel au transporteur (jamais renvoyé au navigateur). */
export function openCarrierSettings(settings: Record<string, any> | null | undefined): Record<string, any> {
  const out = { ...(settings || {}) };
  for (const k of CARRIER_SECRET_FIELDS) {
    const v = out[k];
    if (typeof v === "string" && v.startsWith("v1:")) out[k] = decryptIntegrationSecret(v);
  }
  return out;
}

/** Retire une clé de tout texte ou objet avant de le renvoyer au navigateur. */
export function redactSecret<T>(value: T, secret?: string | null): T {
  if (!secret || value == null) return value;
  const text = JSON.stringify(value).split(secret).join("***").split(encodeURIComponent(secret)).join("***");
  return JSON.parse(text);
}
