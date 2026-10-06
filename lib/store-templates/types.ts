// ─────────────────────────────────────────────────────────────
// Templates de boutique par séries (Série 1 = 15 templates, 7 séries prévues).
// Un template = un thème (couleurs, polices, formes) + une variante de header
// et de hero + une liste ordonnée de sections, rendus avec les vrais produits
// de la boutique. Tous les textes sont modifiables depuis l'éditeur de boutique
// (settings.sx), les sections peuvent être masquées et réordonnées.
// ─────────────────────────────────────────────────────────────

export type SxSectionType =
  | "hero"
  | "trust"
  | "categories"
  | "products"
  | "catalog"
  | "promos"
  | "showcase"
  | "stats"
  | "wordmark"
  | "testimonials"
  | "newsletter"
  | "faq";

export type SxHeroVariant =
  | "editorial" // gros titre en capitales + bloc image coloré + chiffres verticaux
  | "pop" // fond clair, mot coloré souligné, image dans un disque dégradé
  | "giant" // panneau coloré, mot géant derrière le produit
  | "split-card" // texte + grande carte image avec carte flottante
  | "mockup" // centré, produit dans une maquette de téléphone
  | "photo-dark" // photo plein cadre sombre, titre capitales, chiffres en bas
  | "color-block" // bloc coloré plein, titre condensé, image à droite
  | "market" // titre à droite, barre de catégories au-dessus
  | "search" // photo arrondie, titre centré et barre de recherche
  | "rounded-dark" // carte sombre arrondie, recherche, cartes de service
  | "serif-photo" // photo beige plein cadre, titre serif à gauche
  | "gradient-promo" // dégradé, titre blanc, accent manuscrit
  | "wordmark" // photo ciel, accent manuscrit, grand logotype en minuscules
  | "architect" // titre souligné, image courbe et carte flottante
  | "food"; // titre serif, image détourée, cartes colorées

export type SxHeader = "split" | "center" | "overlay" | "dark";
export type SxCard = "plain" | "boxed" | "soft" | "dark" | "outline";
export type SxCategories = "circles" | "tiles" | "pills";
export type SxPromos = "split" | "cards" | "banner";
export type SxTrust = "bar" | "icons" | "numbered";

/** Mise en page des blocs communs et des pages internes, propre à chaque template. */
export type SxCardLayout = "classic" | "overlay" | "minimal" | "editorial" | "centered" | "tag" | "framed";
export type SxFaqLayout = "split" | "center" | "cards" | "numbered" | "band";
export type SxFooterLayout = "columns" | "wordmark" | "centered" | "cta" | "minimal" | "split";
export type SxShopLayout = "sidebar" | "topbar" | "banner";
export type SxProductLayout = "split" | "stack" | "centered" | "panel";
export type SxPageLayout = "simple" | "banner" | "split";
export interface SxLayout {
  card: SxCardLayout;
  faq: SxFaqLayout;
  footer: SxFooterLayout;
  shop: SxShopLayout;
  product: SxProductLayout;
  page: SxPageLayout;
}

export interface SxItem {
  title: string;
  text?: string;
  value?: string;
}

export interface SxBlock {
  eyebrow?: string;
  title?: string;
  text?: string;
  button?: string;
  items?: SxItem[];
}

export interface SxCopy {
  eyebrow: string;
  title: string;
  /** mot du titre mis en valeur (couleur, soulignement) */
  highlight?: string;
  text: string;
  button: string;
  secondary?: string;
  announcement: string;
  collectionTitle: string;
  collectionSubtitle?: string;
  sections: Partial<Record<SxSectionType, SxBlock>>;
}

export interface SxTheme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  /** fond des sections sombres */
  dark: string;
  onDark: string;
  /** fond du hero (couleur ou dégradé CSS) */
  heroBg: string;
  heroText: string;
  radius: number;
  headingFont: string;
  bodyFont: string;
  scriptFont?: string;
  headingWeight: number;
  headingCase?: "uppercase" | "none" | "lowercase";
  headingTracking?: string;
}

export interface StoreTemplate {
  id: string;
  series: number;
  /** nom du dossier source de la série */
  folder: string;
  name: string;
  niche: string;
  description: string;
  theme: SxTheme;
  header: SxHeader;
  hero: SxHeroVariant;
  card: SxCard;
  categories: SxCategories;
  promos: SxPromos;
  trust: SxTrust;
  /** cartes produit, FAQ, pied de page et pages internes (boutique, produit, livraison, contact…) */
  layout: SxLayout;
  /** ordre par défaut des sections de l'accueil */
  sections: SxSectionType[];
  /** sections présentes mais masquées par défaut (à compléter par le marchand) */
  hiddenByDefault?: SxSectionType[];
  copy: { fr: SxCopy; ar: SxCopy };
}

/** Réglages enregistrés dans stores.settings.sx */
export interface SxSettings {
  order?: string[];
  hidden?: string[];
  content?: Partial<Record<SxSectionType, SxBlock>>;
}
