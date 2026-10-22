// Landing page COD générée par Gemini : 1) analyse des vraies photos du produit, 2) textes de vente, 3) photos
// de mise en scène (Nano Banana). Contenu au même format que le générateur d'origine (seo.ai_content) : la page
// s'ouvre et se modifie dans l'éditeur habituel.

export interface ProductAnalysis {
  product_type: string;
  niche: string;
  audience: string;
  /** caractéristiques visibles sur les photos ou données par le vendeur — rien d'inventé */
  features: string[];
  use_cases: string[];
  objections: string[];
  angle: string;
  /** promesses à ne pas faire (non vérifiables sur les photos) */
  avoid: string[];
}

export const LANGUAGES: Record<string, string> = {
  "ar-MA": "darija marocaine écrite en alphabet arabe (comme on parle à Casablanca, pas d'arabe classique)",
  "fr-MA": "français simple et direct, pour des clients marocains",
  ar: "arabe standard simple",
};

const lang = (l: string) => LANGUAGES[l] || LANGUAGES["ar-MA"];

export function analyzePrompt(p: { name: string; description?: string; language: string }) {
  return `Tu es un expert e-commerce COD (paiement à la livraison) au Maroc. Analyse les PHOTOS jointes de ce produit.

Produit : ${p.name}
${p.description ? "Infos du vendeur : " + p.description.slice(0, 2000) : ""}

Règles :
- Décris seulement ce qui se VOIT sur les photos ou ce que le vendeur a écrit. N'invente aucune caractéristique, matière, dimension, certification ou performance.
- Pense aux clients marocains : qui achète, pour quel problème du quotidien, quelles hésitations avant de commander.
- Écris les valeurs en français (c'est une fiche interne pour le vendeur).

Réponds UNIQUEMENT avec ce JSON :
{"product_type":"","niche":"","audience":"","features":["…"],"use_cases":["…"],"objections":["…"],"angle":"l'angle de vente le plus fort en une phrase","avoid":["promesses à ne pas faire"]}`;
}

export function copyPrompt(p: {
  name: string;
  price: number;
  oldPrice: number | null;
  description?: string;
  language: string;
  analysis: ProductAnalysis;
  imageCount: number;
}) {
  const a = p.analysis;
  return `Tu es le meilleur copywriter de landing pages COD au Maroc. Écris la landing page de ce produit.

Produit : ${p.name}
Prix : ${p.price} DH${p.oldPrice ? ` (au lieu de ${p.oldPrice} DH)` : ""}
Paiement à la livraison, livraison partout au Maroc.
Type : ${a.product_type} · Niche : ${a.niche}
Public : ${a.audience}
Caractéristiques RÉELLES (n'en ajoute aucune) : ${a.features.join(" ; ")}
Utilisations : ${a.use_cases.join(" ; ")}
Hésitations des clients à lever : ${a.objections.join(" ; ")}
Angle de vente : ${a.angle}
Interdit de promettre : ${a.avoid.join(" ; ") || "rien de non vérifiable"}
${p.description ? "Infos du vendeur : " + p.description.slice(0, 1500) : ""}

Langue de TOUT le texte : ${lang(p.language)}. Ne mélange pas les langues.

Règles :
- Phrases courtes, concrètes, qui parlent du quotidien du client. Une idée par phrase.
- Aucun faux avis, aucun faux chiffre de ventes, aucune fausse urgence, aucune certification ou garantie non fournie, aucune promesse médicale.
- Deux accroches différentes (headline / headline_b) pour un test A/B : une sur le problème, une sur le résultat.
- image_briefs : ${p.imageCount} idées de photos de mise en scène du MÊME produit, en anglais, réalistes (décor marocain quand c'est naturel), sans texte dans l'image.

Réponds UNIQUEMENT avec ce JSON :
{"headline":"","headline_b":"","subheadline":"","description":"","problem":"","solution":"","benefits":["","","",""],"cta":"","delivery":"","features_title":"","features":["","",""],"how_title":"","how_steps":["","",""],"trust_title":"","trust_points":["","",""],"faq":[{"question":"","answer":""},{"question":"","answer":""},{"question":"","answer":""}],"image_briefs":[{"kind":"hero|usage|detail|lifestyle","prompt":""}]}`;
}

/** Consigne Nano Banana : le produit des photos de référence, identique, mis en scène. */
export function imagePrompt(brief: string, productName: string) {
  return `Professional e-commerce product photo for a Moroccan online store. Use the product shown in the reference photos (${productName}) and keep it EXACTLY identical: same shape, colors, materials, proportions, buttons and details. Do not add features, accessories, logos, brand names or any text. Scene: ${brief.slice(0, 500)}. Photorealistic, natural light, sharp focus on the product, clean composition, high quality.`;
}

const str = (x: unknown, max = 400) =>
  String(x ?? "")
    .trim()
    .slice(0, max);
const list = (x: unknown, n: number, max = 220) =>
  (Array.isArray(x) ? x : [])
    .map((v) => str(v, max))
    .filter(Boolean)
    .slice(0, n);

export function cleanAnalysis(x: any): ProductAnalysis {
  return {
    product_type: str(x?.product_type, 120),
    niche: str(x?.niche, 120),
    audience: str(x?.audience, 300),
    features: list(x?.features, 10),
    use_cases: list(x?.use_cases, 6),
    objections: list(x?.objections, 6),
    angle: str(x?.angle, 300),
    avoid: list(x?.avoid, 6),
  };
}

export interface LandingCopy {
  headline: string;
  headline_b: string;
  subheadline: string;
  description: string;
  problem: string;
  solution: string;
  benefits: string[];
  cta: string;
  delivery: string;
  features_title: string;
  features: string[];
  how_title: string;
  how_steps: string[];
  trust_title: string;
  trust_points: string[];
  faq: { question: string; answer: string }[];
  image_briefs: { kind: string; prompt: string }[];
}

export function cleanCopy(x: any, fallbackName: string): LandingCopy {
  return {
    headline: str(x?.headline, 160) || fallbackName,
    headline_b: str(x?.headline_b, 160),
    subheadline: str(x?.subheadline, 300),
    description: str(x?.description, 1200),
    problem: str(x?.problem, 600),
    solution: str(x?.solution, 600),
    benefits: list(x?.benefits, 6),
    cta: str(x?.cta, 60),
    delivery: str(x?.delivery, 120),
    features_title: str(x?.features_title, 120),
    features: list(x?.features, 8),
    how_title: str(x?.how_title, 120),
    how_steps: list(x?.how_steps, 5),
    trust_title: str(x?.trust_title, 120),
    trust_points: list(x?.trust_points, 5),
    faq: (Array.isArray(x?.faq) ? x.faq : [])
      .map((f: any) => ({ question: str(f?.question, 200), answer: str(f?.answer, 600) }))
      .filter((f: any) => f.question && f.answer)
      .slice(0, 6),
    image_briefs: (Array.isArray(x?.image_briefs) ? x.image_briefs : [])
      .map((b: any) => ({ kind: str(b?.kind, 20) || "lifestyle", prompt: str(b?.prompt, 500) }))
      .filter((b: any) => b.prompt)
      .slice(0, 6),
  };
}
