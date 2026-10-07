// Design « Parfum Bordeaux » : maison de parfum, crème et bordeaux, serif élégant.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "parfum-bordeaux";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Parfum Bordeaux",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#fbf6f3",
      surface: "#f5ebe7",
      surface2: "#efe0da",
      text: "#2b1218",
      muted: "#7b6168",
      border: "#eadbd5",
      primary: "#5a0f22",
      primaryText: "#ffffff",
      accent: "#b48a4f",
      radius: 4,
      font: "sans",
      heading: "elegant",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      eyebrow: "Créé pour séduire",
      title: "Des parfums qui laissent une trace.",
      highlight: "laissent une trace.",
      subtitle:
        "Des fragrances intemporelles qui célèbrent l'élégance, la féminité et une présence inoubliable. Livrées partout au Maroc.",
    },
    titles: {
      benefits: "Nos collections",
      variants: "Nos fragrances",
      reviews: "Elles l'adorent",
      faq: "Questions fréquentes",
      order: "Commander votre parfum",
    },
    sections: ["announcement", "benefits", "variants", "story", "countdown", "reviews", "order", "faq", "final_cta"],
    options: { announcement: "Livraison offerte partout au Maroc · Échantillon offert · Écrin cadeau" },
  },
  demo: demoProduct({
    category: "Parfum",
    price: 459,
    oldPrice: 590,
    images: [
      img("hero"),
      img("bottle-amour"),
      img("bottle-noir"),
      img("bottle-lumiere"),
      img("bottle-jardin"),
      img("bottle-intense"),
      img("coll-floral"),
      img("coll-warm"),
      img("coll-fresh"),
      img("coll-exclusive"),
      img("story"),
      img("peonies"),
    ],
    specs: [
      { label: "Contenance", value: "100 ml" },
      { label: "Concentration", value: "Eau de parfum" },
      { label: "Tenue", value: "8 à 10 heures" },
    ],
    bundles: [
      { qty: 1, label: "1 flacon", price: 459 },
      { qty: 2, label: "2 flacons", price: 849, badge: "Le plus offert" },
      { qty: 3, label: "Coffret 3 flacons", price: 1190, badge: "-35%" },
    ],
    variants: [
      { name: "L'Amour", color: "#e9a69a" },
      { name: "Rose Noir", color: "#6d0f22" },
      { name: "Lumière", color: "#f3e3c3" },
      { name: "Jardin Secret", color: "#efb9ad" },
      { name: "Intense", color: "#c98a3a" },
    ],
    copy: {
      name: "Élya Parfums",
      tagline: "Des parfums qui laissent une trace.",
      description:
        "Chaque fragrance Élya est composée avec des matières choisies avec soin : une tenue longue, un sillage raffiné et un flacon pensé pour être offert.",
      benefits: [
        "Bouquets floraux : Doux. Romantiques. Intemporels.",
        "Chauds & sensuels : Riches. Envoûtants. Addictifs.",
        "Frais & lumineux : Légers. Élégants. Énergisants.",
        "Collection exclusive : Rares. Uniques. Inoubliables.",
      ],
      features: [
        { icon: "", title: "Matières nobles", text: "Sélectionnées avec soin" },
        { icon: "", title: "Savoir-faire", text: "Composés par des parfumeurs" },
        { icon: "", title: "Luxe responsable", text: "Des choix plus durables" },
        { icon: "", title: "Qualité durable", text: "Pensés pour durer" },
      ],
      reviews: [
        "Un vrai parfum de luxe. Il tient toute la journée et on me demande toujours ce que je porte.",
        "Le flacon est magnifique et l'odeur encore plus. Livraison rapide, j'ai payé à la réception.",
        "J'ai trouvé mon parfum signature. Je n'en change plus.",
      ],
    },
  }),
};
export default d;
