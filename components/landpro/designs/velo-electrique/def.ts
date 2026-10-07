// Design « Vélo Électrique » : boutique de vélos électriques, barre sombre + menu blanc,
// grand mot filigrane, tuiles catégories colorées, offres spéciales, bandeau bleu.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "velo-electrique";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Vélo Électrique",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f4f6f8",
      surface2: "#eef1f4",
      text: "#2f3337",
      muted: "#7c8389",
      border: "#e3e7eb",
      primary: "#3aa9dc",
      primaryText: "#ffffff",
      accent: "#e84c3d",
      radius: 20,
      font: "sans",
      heading: "sans",
      headingWeight: 800,
    }),
    hero: {
      variant: "design",
      eyebrow: "Nouveauté 2025",
      title: "Volta F5",
      subtitle: "Vélo électrique avec batterie haute capacité et mécanisme de pliage unique.",
    },
    titles: {
      benefits: "Nos univers",
      variants: "Offres spéciales",
      order: "Commander votre vélo",
      faq: "Questions fréquentes",
    },
    sections: ["features", "benefits", "variants", "final_cta", "order", "faq"],
  },
  demo: demoProduct({
    category: "Vélo électrique",
    price: 12990,
    oldPrice: 15990,
    images: [
      img("hero"),
      img("tile-premium"),
      img("tile-city"),
      img("bike-city"),
      img("bike-mtb"),
      img("bike-premium"),
      img("promo-mtb"),
    ],
    specs: [
      { label: "Autonomie", value: "70 km" },
      { label: "Moteur", value: "250 W" },
      { label: "Batterie", value: "36 V · 10,4 Ah" },
      { label: "Poids", value: "16,3 kg" },
    ],
    bundles: [
      { qty: 1, label: "1 vélo", price: 12990 },
      { qty: 2, label: "2 vélos", price: 24490, badge: "-1 490 DH" },
    ],
    variants: [
      { name: "Ville · cadre ouvert", color: "#1f2124" },
      { name: "Tout-terrain · VTT", color: "#d6262e" },
      { name: "Premium · bleu nuit", color: "#2a3046" },
    ],
    copy: {
      name: "Volta F5",
      tagline: "Déstockage de la série tout-terrain : cadre renforcé et pneus crantés, à prix cassé.",
      description: "Vélo électrique pliant avec batterie haute capacité et mécanisme de pliage unique.",
      benefits: [
        "Équipement de route : Protections pour rouler en sécurité, accessoires sport.",
        "Vélos premium : Structure ultra-légère, matériaux d'exception.",
        "Vélos urbains : Le ticket d'entrée le plus abordable vers l'électrique.",
        "Accessoires et pièces : Catalogue de pièces pour tous les vélos.",
      ],
      features: [
        { icon: "", title: "Selle anatomique", text: "Confort sur les longs trajets" },
        { icon: "", title: "Aluminium aviation", text: "Cadre léger et rigide" },
        { icon: "", title: "Pliage rapide", text: "Plié en 10 secondes" },
        { icon: "", title: "70 km sans recharge", text: "Batterie haute capacité" },
      ],
      reviews: [
        "Plié en 10 secondes, il rentre dans le coffre. Livré en 48h à Rabat, payé à la livraison.",
        "Batterie qui tient vraiment 60 km en ville. Je ne prends plus le taxi.",
        "Très bien fini, léger et silencieux. Le service client m'a appelé pour confirmer.",
      ],
      faq: [
        { q: "Quelle est l'autonomie réelle ?", a: "Jusqu'à 70 km selon le mode d'assistance, le poids et le relief." },
        { q: "Comment se passe le paiement ?", a: "Vous payez à la livraison, après avoir vérifié votre vélo." },
        { q: "Combien de temps pour recharger ?", a: "4 heures sur une prise classique, batterie amovible." },
        {
          q: "Quel est le délai de livraison ?",
          a: "24 à 48h dans les grandes villes, 2 à 4 jours ailleurs au Maroc.",
        },
      ],
    },
  }),
};
export default d;
