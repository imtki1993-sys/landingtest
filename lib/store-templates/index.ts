// Registre des templates de boutique par séries + réglages initiaux d'une boutique.
// Fichier sans React : utilisable côté serveur (API) comme côté navigateur.
import type { SxBlock, SxCopy, SxSectionType, SxSettings, StoreTemplate } from "./types";
import { SERIE_1 } from "./serie1";
import { DEFAULT_FAQ } from "./shared-copy";
import { storeBuilderDefaults } from "../store-builder-config";

export * from "./types";

/** Séries publiées. Ajouter SERIE_2… ici quand elles arrivent. */
export const STORE_SERIES: { id: number; label: string; templates: StoreTemplate[] }[] = [
  { id: 1, label: "Série 1", templates: SERIE_1 },
];

export const STORE_TEMPLATES: StoreTemplate[] = STORE_SERIES.flatMap((s) => s.templates);
export const STORE_TEMPLATE_IDS: string[] = STORE_TEMPLATES.map((t) => t.id);

const BY_ID = new Map(STORE_TEMPLATES.map((t) => [t.id, t]));

export function getStoreTemplate(id: unknown): StoreTemplate | null {
  return typeof id === "string" ? BY_ID.get(id) || null : null;
}

export function isSeriesTemplate(id: unknown): boolean {
  return getStoreTemplate(id) !== null;
}

/** Langue des textes du template selon la langue de la boutique. */
export function copyLang(locale: unknown): "fr" | "ar" {
  return locale === "ar" || locale === "darija" ? "ar" : "fr";
}

export function templateCopy(t: StoreTemplate, locale: unknown): SxCopy {
  return t.copy[copyLang(locale)];
}

export const SECTION_LABELS: Record<SxSectionType, string> = {
  hero: "Bannière principale",
  trust: "Garanties",
  categories: "Catégories",
  products: "Produits",
  catalog: "Catalogue avec filtres",
  promos: "Bannières promo",
  showcase: "Présentation",
  stats: "Chiffres clés",
  wordmark: "Logotype géant",
  testimonials: "Avis clients",
  newsletter: "Appel à l'action",
  faq: "FAQ",
};

/** Toutes les sections connues du template (ordre par défaut + celles masquées par défaut). */
export function templateSectionKeys(t: StoreTemplate): SxSectionType[] {
  return Array.from(new Set([...t.sections, ...(t.hiddenByDefault || [])]));
}

/** Ordre et visibilité effectifs, en tenant compte des réglages enregistrés. */
export function resolveSections(t: StoreTemplate, sx: SxSettings | undefined) {
  const known = templateSectionKeys(t);
  const saved = Array.isArray(sx?.order) ? sx!.order.filter((k) => (known as string[]).includes(k)) : [];
  const order = [...saved, ...known.filter((k) => !saved.includes(k))] as SxSectionType[];
  const hidden = new Set<string>(Array.isArray(sx?.hidden) ? sx!.hidden : t.hiddenByDefault || []);
  return { order, hidden };
}

/** Contenu d'une section : texte enregistré par le marchand, sinon texte du template. */
export function sectionContent(
  t: StoreTemplate,
  locale: unknown,
  key: SxSectionType,
  sx: SxSettings | undefined,
): SxBlock {
  const own = sx?.content?.[key] || {};
  const def = templateCopy(t, locale).sections[key] || {};
  const out: SxBlock = { ...def };
  for (const [k, v] of Object.entries(own)) {
    if (k === "items") {
      if (Array.isArray(v) && v.length) out.items = v as SxBlock["items"];
    } else if (typeof v === "string") (out as any)[k] = v;
  }
  return out;
}

/** Remplace {products} / {categories} par les vrais nombres de la boutique. */
export function fillTokens(v: string | undefined, ctx: { products: number; categories: number }): string {
  return String(v || "")
    .replace(/\{products\}/g, String(ctx.products))
    .replace(/\{categories\}/g, String(ctx.categories));
}

/**
 * Réglages d'une boutique créée (ou basculée) sur un template de série.
 * Les champs standards (hero, annonce, couleurs, polices, FAQ) restent ceux de
 * l'éditeur de boutique, pour que tous les panneaux existants fonctionnent.
 */
export function seedStoreSettings(
  t: StoreTemplate,
  locale: unknown,
  current: Record<string, any> = {},
): Record<string, any> {
  const c = templateCopy(t, locale);
  return {
    ...current,
    storeTemplateId: t.id,
    primary: t.theme.primary,
    accent: t.theme.accent,
    headingFont: t.theme.headingFont,
    bodyFont: t.theme.bodyFont,
    heroEyebrow: c.eyebrow,
    heroTitle: c.title,
    heroText: c.text,
    heroButton: c.button,
    heroSecondaryButton: c.secondary || "",
    announcement: c.announcement,
    showAnnouncement: true,
    collectionTitle: c.collectionTitle,
    collectionSubtitle: c.collectionSubtitle || "",
    faq: Array.isArray(current.faq) && current.faq.length ? current.faq : DEFAULT_FAQ[copyLang(locale)],
    sx: { order: [...t.sections], hidden: [...(t.hiddenByDefault || [])], content: {} },
  };
}

/** Texte de réglage encore égal à la valeur par défaut générique de l'éditeur ? */
export function isGenericDefault(key: keyof typeof storeBuilderDefaults, value: unknown): boolean {
  return !value || value === (storeBuilderDefaults as any)[key];
}
