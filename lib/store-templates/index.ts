// Registre des templates de boutique par séries + réglages initiaux d'une boutique.
// Fichier sans React : utilisable côté serveur (API) comme côté navigateur.
import type { SxBlock, SxCopy, SxHeroVariant, SxLayout, SxSectionType, SxSettings, StoreTemplate } from "./types";
import { SERIE_1 } from "./serie1";
import { SERIE_2 } from "./serie2";
import { DEFAULT_FAQ } from "./shared-copy";
import { storeBuilderDefaults } from "../store-builder-config";

export * from "./types";

/** Séries publiées. Ajouter SERIE_2… ici quand elles arrivent. */
export const STORE_SERIES: { id: number; label: string; templates: StoreTemplate[] }[] = [
  { id: 1, label: "Série 1", templates: SERIE_1 },
  { id: 2, label: "Série 2", templates: SERIE_2 },
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
  marquee: "Bandeau défilant",
  bento: "Cartes chiffres",
  rows: "Liste en lignes",
  spotlight: "Grande image",
};

/** Toutes les sections connues du template (ordre par défaut + celles masquées par défaut). */
export function templateSectionKeys(t: StoreTemplate): SxSectionType[] {
  return Array.from(new Set([...t.sections, ...(t.hiddenByDefault || [])]));
}

/** Types de section qu'on peut ajouter depuis la bibliothèque (le hero est unique). */
export const ADDABLE_SECTIONS: SxSectionType[] = [
  "products",
  "promos",
  "showcase",
  "categories",
  "trust",
  "stats",
  "testimonials",
  "newsletter",
  "faq",
  "wordmark",
  "catalog",
  "marquee",
  "bento",
  "rows",
  "spotlight",
];
const ALL_TYPES = new Set<string>(Object.keys(SECTION_LABELS));

/** Type d'une clé de section : "promos~2" → "promos", "custom:b_1" → "custom". */
export function sectionType(key: string): SxSectionType | "custom" | null {
  if (key.startsWith("custom:")) return "custom";
  const type = key.split("~")[0];
  return ALL_TYPES.has(type) ? (type as SxSectionType) : null;
}

/** Nouvelle clé libre pour une copie d'un type de section. */
export function newSectionKey(type: SxSectionType, existing: string[]): string {
  if (!existing.includes(type)) return type;
  let n = 2;
  while (existing.includes(type + "~" + n)) n++;
  return type + "~" + n;
}

/**
 * Ordre et visibilité effectifs des sections de l'accueil.
 * - sections enregistrées (types connus, copies, blocs personnalisés existants) ;
 * - puis sections du template absentes, sauf celles supprimées par le marchand.
 */
export function resolveSections(t: StoreTemplate, sx: SxSettings | undefined, customIds: string[] = []) {
  const known = templateSectionKeys(t) as string[];
  const removed = new Set(Array.isArray(sx?.removed) ? sx!.removed : []);
  const valid = (k: string) => {
    const type = sectionType(k);
    if (!type) return false;
    if (type === "custom") return customIds.includes(k.slice(7));
    return k === type ? known.includes(k) || ADDABLE_SECTIONS.includes(type) : true;
  };
  const saved = Array.isArray(sx?.order) ? Array.from(new Set(sx!.order.filter(valid))) : [];
  const order = [
    ...saved,
    ...known.filter((k) => !saved.includes(k) && !removed.has(k)),
    // blocs personnalisés pas encore placés : à la fin
    ...customIds.map((id) => "custom:" + id).filter((k) => !saved.includes(k)),
  ];
  // le hero reste toujours en tête
  const hero = order.indexOf("hero");
  if (hero > 0) order.unshift(...order.splice(hero, 1));
  const hidden = new Set<string>(Array.isArray(sx?.hidden) ? sx!.hidden : t.hiddenByDefault || []);
  return { order, hidden };
}

/** Contenu d'une section : texte enregistré par le marchand, sinon texte du template. */
export function sectionContent(t: StoreTemplate, locale: unknown, key: string, sx: SxSettings | undefined): SxBlock {
  const type = sectionType(key);
  const own: Record<string, unknown> = (sx?.content?.[key] as any) || {};
  const def = (type && type !== "custom" && templateCopy(t, locale).sections[type]) || {};
  const out: SxBlock = { ...def };
  for (const [k, v] of Object.entries(own)) {
    if (k === "items") {
      if (Array.isArray(v) && v.length) out.items = v as SxBlock["items"];
    } else if (typeof v === "string") (out as any)[k] = v;
  }
  return out;
}

/** Variantes de hero adaptées à un header transparent (posé sur une photo ou un aplat sombre). */
const OVERLAY_HEROES = new Set([
  "giant",
  "photo-dark",
  "color-block",
  "search",
  "wordmark",
  "photo-cards",
  "giant-under",
  "dark-forest",
  "center-photo",
  "dark-split",
]);

/**
 * Template tel qu'il s'affiche pour une boutique : mise en page, hero et couleurs
 * choisis par le marchand appliqués par-dessus ceux du template.
 */
export function effectiveTemplate(t: StoreTemplate, sx: SxSettings | undefined): StoreTemplate {
  if (!sx || (!sx.layout && !sx.hero && !sx.theme)) return t;
  const hero = sx.hero || t.hero;
  const theme = { ...t.theme };
  const o = sx.theme || {};
  for (const k of ["bg", "surface", "text", "dark"] as const)
    if (typeof o[k] === "string" && /^#[0-9a-f]{6}$/i.test(o[k]!)) theme[k] = o[k]!;
  if (typeof o.radius === "number" && o.radius >= 0 && o.radius <= 40) theme.radius = o.radius;
  // fond du hero : celui du template, ou le fond de page si le hero choisi vient d'un autre template
  if (sx.hero && sx.hero !== t.hero && !OVERLAY_HEROES.has(hero)) {
    theme.heroBg = theme.bg;
    theme.heroText = theme.text;
  }
  const header = t.header === "overlay" && !OVERLAY_HEROES.has(hero) ? "split" : t.header;
  return { ...t, hero, header, theme, layout: { ...t.layout, ...(sx.layout || {}) } };
}

/** Mises en page proposées dans l'éditeur, pièce par pièce. */
export const LAYOUT_CHOICES: Record<keyof SxLayout, [string, string][]> = {
  header: [
    ["classic", "Classique"],
    ["centered", "Logo centré"],
    ["editorial", "Éditorial"],
    ["pill", "Barre flottante"],
    ["stacked", "Recherche + catégories"],
    ["menu", "Bouton Menu"],
    ["split", "Menu de part et d'autre"],
    ["search", "Avec recherche"],
    ["utility", "Bandeau d'infos"],
  ],
  card: [
    ["classic", "Classique"],
    ["overlay", "Texte sur l'image"],
    ["minimal", "Minimale"],
    ["editorial", "Éditoriale numérotée"],
    ["centered", "Centrée en arche"],
    ["tag", "Prix en étiquette"],
    ["framed", "Encadrée"],
    ["tinted", "Fonds colorés"],
    ["swatch", "Pastilles de couleurs"],
  ],
  faq: [
    ["split", "Deux colonnes"],
    ["center", "Centrée"],
    ["cards", "Cartes"],
    ["numbered", "Numérotée"],
    ["band", "Bandeau sombre"],
  ],
  footer: [
    ["columns", "Colonnes"],
    ["wordmark", "Nom géant"],
    ["centered", "Centré"],
    ["cta", "Appel à commander"],
    ["minimal", "Minimal"],
    ["split", "Deux panneaux"],
  ],
  shop: [
    ["sidebar", "Filtres sur le côté"],
    ["topbar", "Filtres en haut"],
    ["banner", "Grand bandeau"],
  ],
  product: [
    ["split", "Photo + miniatures"],
    ["stack", "Photos empilées"],
    ["centered", "Centrée"],
    ["panel", "Panneau coloré"],
  ],
  page: [
    ["simple", "Simple"],
    ["banner", "Bandeau coloré"],
    ["split", "Grand titre"],
  ],
};

export const HERO_CHOICES: [SxHeroVariant, string][] = [
  ["editorial", "Éditorial (grand titre + bloc coloré)"],
  ["pop", "Pop (image ronde)"],
  ["giant", "Mot géant"],
  ["split-card", "Image + carte produit"],
  ["mockup", "Maquette mobile"],
  ["photo-dark", "Photo plein écran sombre"],
  ["color-block", "Aplat de couleur"],
  ["market", "Marketplace"],
  ["search", "Photo + recherche"],
  ["rounded-dark", "Carte sombre arrondie"],
  ["serif-photo", "Photo élégante"],
  ["gradient-promo", "Dégradé promo"],
  ["wordmark", "Photo + logotype"],
  ["architect", "Arche + carte flottante"],
  ["food", "Image ronde + cartes produits"],
  ["gallery", "Galerie + recherche"],
  ["warm-photo", "Photo chaude + produit flottant"],
  ["sky-left", "Ciel + jauge"],
  ["freeflow", "Vagues + titre géant"],
  ["soft-card", "Carte pastel"],
  ["photo-cards", "Photo + cartes flottantes"],
  ["giant-under", "Photo + mot géant"],
  ["editorial-serif", "Serif élégant"],
  ["dark-forest", "Photo sombre végétale"],
  ["plates", "Assiettes en cercle"],
  ["sky-wellness", "Photo ciel + chiffres"],
  ["framed-photo", "Photo encadrée"],
  ["dark-collage", "Collage sur fond sombre"],
  ["center-photo", "Photo + titre centré"],
  ["dark-split", "Fond nuit + accent"],
];

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
    heroHighlight: c.highlight || "",
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
