// Téléchargement d'une URL fournie par un utilisateur, sans SSRF :
// http(s) seulement, ports standards, adresses publiques uniquement (vérifiées
// après résolution DNS), et chaque redirection revérifiée.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** Adresse IP privée, locale, réservée ou de métadonnées cloud (à refuser). */
export function isBlockedIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 169 && b === 254) || // lien local + métadonnées cloud
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224 // multicast + réservé
    );
  }
  if (v === 6) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]);
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(x) || x.startsWith("64:ff9b:") || x.startsWith("2001:db8");
  }
  return true; // pas une IP valide
}

export class UnsafeUrlError extends Error {}

/** Vérifie qu'une URL est publique ; renvoie l'URL normalisée. */
export async function assertPublicUrl(raw: string, resolve = lookup): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new UnsafeUrlError("URL invalide");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:")
    throw new UnsafeUrlError("Seules les URL http(s) sont acceptées");
  if (u.username || u.password) throw new UnsafeUrlError("URL avec identifiants refusée");
  if (u.port && u.port !== "80" && u.port !== "443") throw new UnsafeUrlError("Port non autorisé");
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local"))
    throw new UnsafeUrlError("Adresse interne refusée");
  const addrs = isIP(host) ? [{ address: host }] : await resolve(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new UnsafeUrlError("Domaine introuvable");
  if (addrs.some((a) => isBlockedIp(a.address))) throw new UnsafeUrlError("Adresse interne refusée");
  return u;
}

/** fetch() d'une URL publique, redirections suivies à la main (3 au plus) et revérifiées. */
export async function safeFetch(raw: string, init: RequestInit = {}, maxRedirects = 3): Promise<Response> {
  let url = (await assertPublicUrl(raw)).toString();
  for (let i = 0; i <= maxRedirects; i++) {
    const r = await fetch(url, { ...init, redirect: "manual" });
    const loc = r.status >= 300 && r.status < 400 ? r.headers.get("location") : null;
    if (!loc) return r;
    url = (await assertPublicUrl(new URL(loc, url).toString())).toString();
  }
  throw new UnsafeUrlError("Trop de redirections");
}
