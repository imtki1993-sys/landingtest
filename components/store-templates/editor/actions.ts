// Actions sur les sections de l'accueil, partagées par le panneau « Accueil »
// et la barre d'actions de l'aperçu. Renvoient les nouveaux réglages de la boutique.
import { getStoreTemplate } from "../../../lib/store-templates";
import { addCustomSection, applySectionAction, type SxEditAction } from "../../../lib/store-templates/editing";

export const newBlockId = () => "b_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

export function homeAction(settings: any, templateId: string, key: string, action: SxEditAction): any {
  const t = getStoreTemplate(templateId);
  if (!t) return settings;
  const sx = settings.sx || {};
  const blocks: any[] = Array.isArray(settings.pageSections?.home) ? settings.pageSections.home : [];
  const ids = blocks.map((b) => b.id);
  const own = { ...settings, storeTemplateId: t.id };
  if (key.startsWith("custom:")) {
    const id = key.slice(7);
    if (action === "delete")
      return {
        ...own,
        sx: applySectionAction(t, sx, ids, key, "delete"),
        pageSections: { ...(settings.pageSections || {}), home: blocks.filter((b) => b.id !== id) },
      };
    if (action === "duplicate") {
      const src = blocks.find((b) => b.id === id);
      if (!src) return settings;
      const copy = { ...JSON.parse(JSON.stringify(src)), id: newBlockId() };
      return {
        ...own,
        sx: addCustomSection(t, sx, [...ids, copy.id], copy.id, key),
        pageSections: { ...(settings.pageSections || {}), home: [...blocks, copy] },
      };
    }
  }
  return { ...own, sx: applySectionAction(t, sx, ids, key, action) };
}
