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
  | "faq"
  // Série 2
  | "marquee" // bandeau défilant (catégories ou mots-clés)
  | "bento" // cartes chiffres / avantages avec images
  | "rows" // liste en lignes avec image (événements, collections)
  | "spotlight" // grande image avec titre centré
  // Sur mesure
  | "features" // cartes à encoche avec icône dessinée et flèche
  | "photostats" // grande photo + chiffres en tuiles colorées
  | "statement" // phrase de présentation + photo + chiffres
  | "services" // grille de services avec icônes + carte chiffre
  | "expert" // carte profil + grande photo avec chiffres
  | "highlights" // rangée de cartes : image, carte colorée, photo, chiffre + graphique
  | "map"; // carte Google Maps + adresse, horaires et bouton itinéraire

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
  | "food" // titre serif, image détourée, cartes colorées
  // Série 2
  | "gallery" // titre + image principale, miniatures, barre de recherche
  | "warm-photo" // photo chaude arrondie, titre serif, carte produit flottante
  | "sky-left" // dégradé ciel, image à droite, jauge de performance
  | "freeflow" // vagues abstraites, titre géant bicolore
  | "soft-card" // carte pastel arrondie, champ de recherche, grande image
  | "photo-cards" // photo sombre, grand titre, cartes flottantes
  | "giant-under" // photo ciel, mot géant en bas
  | "editorial-serif" // serif capitales + italique, image avec points produits
  | "dark-forest" // photo sombre verte, titre serif italique
  | "plates" // assiettes en cercle, titre souligné au pinceau
  | "sky-wellness" // photo ciel, chiffres sous le hero
  | "framed-photo" // photo encadrée arrondie, étiquette, carte d'infos
  | "dark-collage" // fond sombre, titre centré condensé, collage d'images
  | "center-photo" // photo plein cadre, titre centré en haut
  | "dark-split" // fond vert nuit, titre et accent jaune, image à droite
  // Sur mesure
  | "school" // titre souligné au feutre, collage photo sur blocs, deux cartes sous le texte
  | "estate" // photo plein cadre, titre en bas, chiffres sur une ligne, bouton pilule
  | "clinic"; // photo arrondie encadrée, carte vidéo, pastilles de services, bandeau de garanties

export type SxHeader = "split" | "center" | "overlay" | "dark";
export type SxCard = "plain" | "boxed" | "soft" | "dark" | "outline";
export type SxCategories = "circles" | "tiles" | "pills" | "trio";
export type SxPromos = "split" | "cards" | "banner";
export type SxTrust = "bar" | "icons" | "numbered";

/** Mise en page des blocs communs et des pages internes, propre à chaque template. */
export type SxCardLayout =
  | "classic"
  | "overlay"
  | "minimal"
  | "editorial"
  | "centered"
  | "tag"
  | "framed"
  | "tinted" // fonds colorés en alternance
  | "swatch" // fond gris, pastilles de couleurs, bouton +
  | "notch" // carte grise à encoche avec bouton flèche dans le coin
  | "listing" // carte horizontale : photo, lieu, prix, points forts
  | "post"; // carte article : photo avec étiquette, titre, lien « En savoir plus »
export type SxFaqLayout = "split" | "center" | "cards" | "numbered" | "band";
export type SxFooterLayout = "columns" | "wordmark" | "centered" | "cta" | "minimal" | "split" | "bar" | "photo";
export type SxShopLayout = "sidebar" | "topbar" | "banner";
export type SxProductLayout = "split" | "stack" | "centered" | "panel";
export type SxPageLayout = "simple" | "banner" | "split";
export type SxHeaderLayout =
  | "classic" // logo, menu au centre, icônes + bouton
  | "centered" // menu à gauche, logo au centre
  | "editorial" // grand logo, menu numéroté, liens texte
  | "pill" // barre flottante arrondie
  | "stacked" // recherche + logo, puis barre de catégories
  | "menu" // bouton « Menu » et menu plein écran
  | "split" // menu de part et d'autre du logo centré
  | "search" // champ de recherche dans le header
  | "utility"; // bandeau d'infos au-dessus du header
export interface SxLayout {
  header: SxHeaderLayout;
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
  /** image propre à l'élément (bannière promo) */
  image?: string;
}

export interface SxBlock {
  eyebrow?: string;
  title?: string;
  text?: string;
  button?: string;
  items?: SxItem[];
  /** images choisies par le marchand (sinon : photos des produits) */
  image?: string;
  image2?: string;
  /** sections Produits : catégorie affichée (vide = tous les produits) */
  category?: string;
  /** section Carte : adresse affichée sur Google Maps */
  address?: string;
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
  /** bandeau d'annonce affiché à la création (par défaut : oui) */
  showAnnouncement?: boolean;
  /** appel à l'action avec photo détourée en biais (section « Appel à l'action ») */
  ctaPhoto?: boolean;
  /** section « Présentation + chiffres » : chiffres en lignes sous la photo, ou en ligne à côté */
  statement?: "rows" | "inline";
  copy: { fr: SxCopy; ar: SxCopy };
}

/** Couleurs et formes réglables par le marchand (en plus des couleurs principale / CTA). */
export interface SxThemeOverride {
  bg?: string;
  surface?: string;
  text?: string;
  dark?: string;
  radius?: number;
}

/**
 * Réglages enregistrés dans stores.settings.sx.
 * Les sections de l'accueil sont désignées par une clé : le type ("promos"),
 * une copie ("promos~2"), ou un bloc personnalisé ("custom:<id>").
 */
export interface SxSettings {
  order?: string[];
  hidden?: string[];
  /** sections du template supprimées (elles ne sont pas rajoutées automatiquement) */
  removed?: string[];
  content?: Record<string, SxBlock>;
  /** mise en page choisie pièce par pièce (sinon celle du template) */
  layout?: Partial<SxLayout>;
  hero?: SxHeroVariant;
  theme?: SxThemeOverride;
  /** image de chaque catégorie (nom → URL) */
  categoryImages?: Record<string, string>;
}
