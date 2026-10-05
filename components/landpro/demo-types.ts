export type Lang = "fr" | "ar" | "en";

export interface DemoFeature {
  icon: string; // emoji ou caractère (remplaçable par une icône SVG)
  title: string;
  text: string;
}

export interface DemoReview {
  name: string;
  city: string;
  rating: number; // 1..5
  text: string;
  date?: string;
}

export interface DemoBundle {
  qty: number;
  label: string;
  price: number;
  badge?: string;
}

export interface DemoVariant {
  name: string;
  color?: string; // pastille couleur
  image?: string;
}

export interface DemoComparisonRow {
  label: string;
  us: boolean | string;
  them: boolean | string;
}

/** Contenu traduisible d'un produit (sert pour les templates arabes / darija). */
export interface DemoCopy {
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  features: DemoFeature[];
  reviews: DemoReview[];
  faq: { q: string; a: string }[];
}

export interface DemoProduct {
  id: string;
  sku?: string;
  category: string;
  price: number;
  oldPrice?: number;
  currency: string; // "DH", "€", "$"…
  images: string[]; // 1re image = image principale
  rating: number;
  reviewsCount: number;
  stock?: number;
  whatsapp: string; // numéro international sans "+" ex: 212600000000
  specs: { label: string; value: string }[];
  bundles: DemoBundle[];
  variants?: DemoVariant[];
  comparison: DemoComparisonRow[];
  stats?: { value: string; label: string }[];
  steps?: { title: string; text: string }[];
  problem?: { pains: string[]; solution: string };
  /** URL d'intégration vidéo (YouTube /embed/…, Vimeo…) — optionnelle */
  video?: string;
  /** Contenu FR par défaut */
  copy: DemoCopy;
  /** Traductions optionnelles */
  i18n?: Partial<Record<Lang, Partial<DemoCopy>>>;
}
