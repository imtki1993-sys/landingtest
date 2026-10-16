// Saisie de la clé d'activation côté navigateur (même alphabet que lib/licenses.ts).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Met la clé en forme LP-XXXX-XXXX-XXXX pendant la saisie. */
export function formatKey(input: string) {
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.startsWith("LP")) s = s.slice(2);
  s = s.slice(0, 12);
  if (!s) return "";
  return "LP-" + (s.match(/.{1,4}/g) || []).join("-");
}
export function keyState(key: string): "empty" | "partial" | "ok" | "bad" {
  const s = key.replace(/^LP-?/, "").replace(/-/g, "");
  if (!s) return "empty";
  if ([...s].some((c) => !ALPHABET.includes(c))) return "bad";
  return s.length === 12 ? "ok" : "partial";
}
