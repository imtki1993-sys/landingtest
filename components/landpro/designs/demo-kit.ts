// Produits de démonstration des designs sur mesure (galerie et aperçu avant création).
import type { DemoCopy, DemoProduct } from "../demo-types";

const reviewers: [string, string][] = [
  ["Salma E.", "Rabat"],
  ["Yassine B.", "Casablanca"],
  ["Imane K.", "Tanger"],
  ["Mehdi A.", "Marrakech"],
];

export const codFaq = [
  { q: "Comment se passe le paiement ?", a: "Vous payez à la livraison, après avoir vérifié votre colis." },
  { q: "Quel est le délai de livraison ?", a: "24 à 48h dans les grandes villes, 2 à 4 jours ailleurs au Maroc." },
  { q: "Puis-je échanger ou retourner le produit ?", a: "Oui, vous avez 7 jours pour l'échanger ou le retourner." },
];

/**
 * Produit de démo avec les valeurs communes (DH, FAQ COD, WhatsApp de démo).
 * Les avis ne servent qu'à la démo : une vraie page n'affiche que ses vrais avis.
 */
export function demoProduct(
  p: Omit<DemoProduct, "id" | "currency" | "whatsapp" | "rating" | "reviewsCount" | "comparison" | "copy"> & {
    copy: Omit<DemoCopy, "reviews" | "faq"> & { reviews: string[]; faq?: DemoCopy["faq"] };
    comparison?: DemoProduct["comparison"];
  },
): DemoProduct {
  return {
    id: "",
    currency: "DH",
    whatsapp: "212600000000",
    rating: 4.8,
    reviewsCount: 128,
    comparison: [],
    ...p,
    copy: {
      ...p.copy,
      faq: p.copy.faq || codFaq,
      reviews: p.copy.reviews.map((text, i) => ({
        name: reviewers[i % reviewers.length][0],
        city: reviewers[i % reviewers.length][1],
        rating: 5,
        text,
      })),
    },
  };
}

/** Chemin d'une image de démo (public/template-assets/landpro/designs/<id>/<nom>.svg). */
export const asset = (id: string, name: string) => `/template-assets/landpro/designs/${id}/${name}.svg`;
