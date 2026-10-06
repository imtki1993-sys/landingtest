// Opérations de l'éditeur sur les sections de l'accueil (settings.sx).
// Fonctions pures : elles prennent les réglages et renvoient de nouveaux réglages.
import { newSectionKey, resolveSections, sectionType } from "./index";
import type { StoreTemplate, SxSectionType, SxSettings } from "./types";

export type SxEditAction = "up" | "down" | "hide" | "show" | "duplicate" | "delete";

function current(t: StoreTemplate, sx: SxSettings | undefined, customIds: string[]) {
  const { order, hidden } = resolveSections(t, sx, customIds);
  return { order: [...order], hidden: new Set(hidden) };
}

/** Réglages sx après une action sur une section ; les blocs personnalisés sont gérés par l'appelant. */
export function applySectionAction(
  t: StoreTemplate,
  sx: SxSettings | undefined,
  customIds: string[],
  key: string,
  action: SxEditAction,
): SxSettings {
  const base: SxSettings = { ...(sx || {}) };
  const { order, hidden } = current(t, sx, customIds);
  const i = order.indexOf(key);
  if (i < 0) return base;
  switch (action) {
    case "up":
    case "down": {
      const j = action === "up" ? i - 1 : i + 1;
      // le hero reste en tête : rien ne passe au-dessus
      if (key === "hero" || j < 0 || j >= order.length || order[j] === "hero") return base;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...base, order, hidden: Array.from(hidden) };
    }
    case "hide":
      hidden.add(key);
      return { ...base, order, hidden: Array.from(hidden) };
    case "show":
      hidden.delete(key);
      return { ...base, order, hidden: Array.from(hidden) };
    case "duplicate": {
      const type = sectionType(key);
      if (!type || type === "custom" || key === "hero") return base;
      const copy = newSectionKey(type, order);
      order.splice(i + 1, 0, copy);
      const content = { ...(base.content || {}) };
      if (content[key]) content[copy] = JSON.parse(JSON.stringify(content[key]));
      return { ...base, order, hidden: Array.from(hidden), content };
    }
    case "delete": {
      if (key === "hero") return base;
      order.splice(i, 1);
      hidden.delete(key);
      const content = { ...(base.content || {}) };
      delete content[key];
      // une section du template supprimée n'est pas rajoutée automatiquement
      const removed = Array.from(new Set([...(base.removed || []), ...(key.includes("~") ? [] : [key])]));
      return { ...base, order, hidden: Array.from(hidden), content, removed };
    }
  }
  return base;
}

/** Ajoute une section (type de la bibliothèque) juste après la section `after` (ou à la fin). */
export function addSection(
  t: StoreTemplate,
  sx: SxSettings | undefined,
  customIds: string[],
  type: SxSectionType,
  after?: string,
): { sx: SxSettings; key: string } {
  const { order, hidden } = current(t, sx, customIds);
  const key = newSectionKey(type, order);
  const at = after ? order.indexOf(after) : -1;
  order.splice(at >= 0 ? at + 1 : order.length, 0, key);
  const removed = (sx?.removed || []).filter((k) => k !== key);
  return { sx: { ...(sx || {}), order, hidden: Array.from(hidden), removed }, key };
}

/** Place un bloc personnalisé déjà créé dans l'ordre de l'accueil. */
export function addCustomSection(
  t: StoreTemplate,
  sx: SxSettings | undefined,
  customIds: string[],
  id: string,
  after?: string,
): SxSettings {
  const { order, hidden } = current(
    t,
    sx,
    customIds.filter((x) => x !== id),
  );
  const key = "custom:" + id;
  const at = after ? order.indexOf(after) : -1;
  order.splice(at >= 0 ? at + 1 : order.length, 0, key);
  return { ...(sx || {}), order, hidden: Array.from(hidden) };
}

/** Retire les choix de mise en page, de hero et de couleurs : retour au template d'origine. */
export function resetStyle(sx: SxSettings | undefined): SxSettings {
  const rest = { ...(sx || {}) };
  delete rest.layout;
  delete rest.hero;
  delete rest.theme;
  return rest;
}
