// Design « Street Orange » : boutique streetwear / sneakers, noir + orange, titres condensés.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "street-orange";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Street Orange",
    category: "Mode",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#0d0d0e",
      surface: "#18181a",
      surface2: "#202023",
      text: "#f5f5f4",
      muted: "#a3a3a6",
      border: "#2c2c30",
      primary: "#ec5a1c",
      primaryText: "#ffffff",
      accent: "#ec5a1c",
      radius: 6,
      font: "display",
      heading: "condensed",
      headingWeight: 800,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Règne sur la rue",
      title: "Nées pour le bitume",
      highlight: "le bitume",
      subtitle: "Sneakers montantes et streetwear pour la culture. Pour les audacieux. Pour toi.",
    },
    titles: {
      benefits: "Taillée pour la rue",
      variants: "Nouveaux coloris",
      countdown: "Sur une sélection de coloris",
      story: "Notre culture",
      reviews: "Ce que disent nos clients",
      stats: "Ils nous suivent",
      order: "Commande ta paire",
      faq: "Questions fréquentes",
    },
    sections: ["announcement", "benefits", "variants", "countdown", "story", "reviews", "stats", "order", "faq"],
    options: {
      announcement: "Livraison gratuite partout au Maroc · Nouveaux drops chaque vendredi · Paiement à la livraison",
    },
  },
  demo: demoProduct({
    category: "Sneakers",
    price: 449,
    oldPrice: 749,
    images: [
      img("hero"),
      img("cat-sneakers"),
      img("cat-hoodies"),
      img("cat-caps"),
      img("cat-tees"),
      img("v-shadow"),
      img("v-bone"),
      img("v-noir"),
      img("v-sand"),
      img("v-ice"),
      img("v-blaze"),
      img("strip-1"),
      img("strip-2"),
      img("strip-3"),
      img("strip-4"),
      img("strip-5"),
      img("product"),
    ],
    specs: [
      { label: "Modèle", value: "Montante 87" },
      { label: "Tige", value: "Cuir pleine fleur" },
      { label: "Pointures", value: "39 à 46" },
    ],
    bundles: [
      { qty: 1, label: "1 paire", price: 449 },
      { qty: 2, label: "2 paires", price: 849, badge: "Le duo" },
      { qty: 3, label: "3 paires", price: 1190, badge: "-47%" },
    ],
    variants: [
      { name: "Shadow", color: "#a7aaae" },
      { name: "Bone", color: "#e9e1d1" },
      { name: "Noir Total", color: "#1d1d1f" },
      { name: "Sand", color: "#c9b28e" },
      { name: "Ice", color: "#bcd2e6" },
      { name: "Blaze", color: "#ec5a1c" },
    ],
    stats: [
      { value: "12K+", label: "Clients" },
      { value: "4.9/5", label: "Note moyenne" },
      { value: "48h", label: "Livraison" },
      { value: "100%", label: "Cuir véritable" },
      { value: "6", label: "Coloris" },
      { value: "7J", label: "Pour échanger" },
    ],
    copy: {
      name: "Medina Kicks",
      tagline: "Plus qu'une marque. C'est une culture.",
      description:
        "Medina Kicks est né dans les rues de Casablanca : passion, créativité et communauté. Tague-nous avec #MedinaKicks pour être mis en avant.",
      benefits: [
        "Sneakers montantes : Cuir pleine fleur, maintien de la cheville",
        "Look complet : Va avec tous tes hoodies",
        "Logo brodé : Finitions signées Medina",
        "Taillée pour la rue : Du skatepark au café",
      ],
      features: [
        { icon: "", title: "Cuir premium", text: "Tige en cuir pleine fleur" },
        { icon: "", title: "Semelle grip", text: "Caoutchouc antidérapant" },
        { icon: "", title: "Confort", text: "Semelle intérieure amortie" },
      ],
      reviews: [
        "Livraison rapide, paire authentique et finitions au top. J'ai payé à la réception, zéro stress.",
        "La qualité est au rendez-vous et la taille est parfaite. Ma nouvelle paire préférée pour la rue.",
        "Le coloris Blaze est encore plus beau en vrai. Tout le monde me demande où je l'ai trouvée.",
      ],
    },
  }),
};
export default d;
