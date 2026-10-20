// Dernières données de chaque page du tableau de bord, gardées dans l'onglet (sessionStorage) :
// la page s'affiche tout de suite avec elles, puis se met à jour quand le serveur répond.
// Vidé à la déconnexion ; jamais partagé entre onglets ni gardé après fermeture.
const PREFIX = "lp_c:";
const MAX_AGE_MS = 30 * 60_000;

export function readPage<T = any>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < MAX_AGE_MS ? (data as T) : null;
  } catch {
    return null;
  }
}

export function writePage(key: string, data: unknown) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // stockage plein ou bloqué : la page marche sans
  }
}

/** À la déconnexion : efface toutes les données gardées. */
export function clearPages() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === "lp_plan")) sessionStorage.removeItem(k);
    }
  } catch {}
}
