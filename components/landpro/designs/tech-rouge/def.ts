// Design « Tech Rouge » : boutique high-tech blanche, accent rouge-orangé, police Jost.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "tech-rouge";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Tech Rouge",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f7f7f7",
      surface2: "#eeeeee",
      text: "#222222",
      muted: "#6b6b6b",
      border: "#ececec",
      primary: "#e8411f",
      primaryText: "#ffffff",
      accent: "#e8411f",
      radius: 6,
      font: "display",
      heading: "display",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      eyebrow: "Soldes jusqu'à -30%",
      title: "Drova Watch Series",
      subtitle:
        "Plus de fonctions, à un meilleur prix que jamais. Des capteurs puissants pour suivre votre forme au quotidien.",
    },
    titles: {
      variants: "Produits populaires",
      offers: "Nos offres",
      showcase: "Produits tendance",
      features: "Produit sur mesure",
      stats: "Pourquoi Drova",
      faq: "Questions fréquentes",
      how: "Comment commander",
      order: "Passer commande",
    },
    sections: ["announcement", "variants", "offers", "showcase", "features", "order", "stats", "faq", "how"],
    options: { announcement: "Boutique ouverte 7j/7, livraison partout au Maroc" },
  },
  demo: demoProduct({
    category: "High-tech",
    price: 349,
    oldPrice: 499,
    images: [
      img("hero"),
      img("watch"),
      img("laptop"),
      img("speaker"),
      img("charger"),
      img("tvbox"),
      img("gamepad"),
      img("camera"),
      img("headphones"),
      img("phone-back"),
      img("phone-front"),
      img("earbuds"),
      img("tablet"),
    ],
    imageLabels: [
      "Collection Drova",
      "Drova Watch Ultra",
      "Droubook Air gris",
      "Sphère mini",
      "Chargeur MagFix",
      "Box TV 4K",
      "Manette sans fil",
      "Caméra Studio",
      "DrovaPods Max",
      "Coque transparente",
      "Drova Phone 13 blanc",
      "DrovaPods Pro",
      "Drova Tab Pro",
    ],
    specs: [
      { label: "Écran", value: "AMOLED 1,9 pouce" },
      { label: "Autonomie", value: "Jusqu'à 5 jours" },
      { label: "Étanchéité", value: "5 ATM" },
      { label: "Garantie", value: "12 mois" },
    ],
    stats: [
      { value: "5 jours", label: "d'autonomie" },
      { value: "5 ATM", label: "étanche" },
      { value: "120 Hz", label: "écran fluide" },
      { value: "GPS", label: "double fréquence" },
      { value: "NFC", label: "paiement sans contact" },
      { value: "12 mois", label: "de garantie" },
      { value: "24-48h", label: "de livraison" },
      { value: "7 jours", label: "pour échanger" },
    ],
    bundles: [
      { qty: 1, label: "Drova Watch, 1 pièce", price: 349, badge: "Grand écran" },
      { qty: 2, label: "Pack duo : 2 pièces", price: 649, badge: "Offre duo" },
    ],
    variants: [
      { name: "Drova Watch Ultra", color: "#f08a3c" },
      { name: "Droubook Air gris", color: "#3a3d44" },
      { name: "Sphère mini", color: "#d9dadd" },
      { name: "Chargeur MagFix", color: "#2b2d33" },
      { name: "Box TV 4K", color: "#151618" },
    ],
    copy: {
      name: "Drova",
      tagline: "La technologie qui vous suit partout.",
      description:
        "Drova sélectionne des appareils connectés fiables et élégants, testés par notre équipe et livrés partout au Maroc avec paiement à la réception.",
      benefits: [
        "Droubook Air : -25% pour les nouveaux clients, livré avec housse offerte.",
        "Drova Tab Pro : Le meilleur prix pour les nouveaux clients, garantie 12 mois.",
      ],
      features: [
        { icon: "", title: "Service soigné", text: "Une équipe à votre écoute" },
        { icon: "", title: "Nouveautés chaque mois", text: "Les derniers modèles" },
        { icon: "", title: "Pensé pour la communauté", text: "Vos avis comptent" },
        { icon: "", title: "Durable", text: "Des appareils qui tiennent" },
        { icon: "", title: "Son puissant", text: "Haut-parleur intégré" },
        { icon: "", title: "Emballage recyclable", text: "Moins de plastique" },
        { icon: "", title: "Le choix des clients", text: "Notre meilleure vente" },
        { icon: "", title: "Support 7j/7", text: "Par téléphone et WhatsApp" },
      ],
      reviews: [
        "Montre reçue en 24h à Casablanca, l'autonomie tient vraiment 5 jours. J'ai payé au livreur.",
        "Très belle finition et l'écran est lumineux même au soleil. Je recommande Drova.",
        "Service client réactif sur WhatsApp, ils m'ont aidé à la configurer.",
      ],
    },
  }),
};
export default d;
