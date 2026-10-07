// Design « Fleur Printemps » : parfumerie aérienne, gris bleuté très pâle, serif fin, magnolias.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "fleur-printemps";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Fleur Printemps",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#edf1f3",
      surface: "#f4f7f8",
      surface2: "#e3e9ec",
      text: "#25323a",
      muted: "#6f7c84",
      border: "#d3dbdf",
      primary: "#25323a",
      primaryText: "#ffffff",
      accent: "#b97a66",
      radius: 0,
      font: "sans",
      heading: "elegant",
      headingWeight: 400,
    }),
    hero: {
      variant: "design",
      title: "L'art du parfum, l'essence du printemps",
      subtitle:
        "Des eaux de parfum florales, légères et lumineuses, composées autour du magnolia. Livrées partout au Maroc.",
    },
    titles: {
      variants: "Les préférées",
      showcase: "Découvrir la nouveauté",
      features: "La maison",
      reviews: "Elles en parlent",
      order: "Commander votre parfum",
      faq: "Questions fréquentes",
    },
    sections: ["variants", "showcase", "features", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Parfum",
    price: 390,
    oldPrice: 490,
    images: [img("hero"), img("fav-1"), img("fav-2"), img("fav-3"), img("portrait"), img("air")],
    imageLabels: ["Flacon", "Magnolia blanc", "Rosée d'avril", "Figue azur", "Printemps", "Collection Air"],
    specs: [
      { label: "Concentration", value: "Eau de parfum" },
      { label: "Contenance", value: "50 ml" },
      { label: "Tenue", value: "6 à 8 heures" },
    ],
    bundles: [
      { qty: 1, label: "1 flacon", price: 390 },
      { qty: 2, label: "2 flacons", price: 720, badge: "Le duo" },
      { qty: 3, label: "Coffret 3 flacons", price: 990, badge: "-33%" },
    ],
    variants: [
      { name: "Magnolia Blanc", color: "#f3e3dc" },
      { name: "Rosée d'Avril", color: "#efc3c8" },
      { name: "Figue Azur", color: "#5c2d48" },
    ],
    copy: {
      name: "Fleur",
      tagline: "L'art du parfum, l'essence du printemps.",
      description:
        "Chaque eau de parfum Fleur capture un instant de printemps : magnolia, pétales de rose et figue fraîche, dans un flacon de verre épais pensé pour être gardé.",
      benefits: [
        "Notes florales : Magnolia, pivoine et rose fraîche.",
        "Longue tenue : Un sillage délicat toute la journée.",
        "Flacon en verre : Épais, rechargeable et élégant.",
      ],
      features: [
        { icon: "", title: "Matières florales", text: "Absolus de fleurs sélectionnés" },
        { icon: "", title: "Composé avec soin", text: "Par de petites séries" },
        { icon: "", title: "Flacon à garder", text: "Verre épais, bouchon or rose" },
        { icon: "", title: "Paiement à la livraison", text: "Partout au Maroc" },
      ],
      reviews: [
        "Un parfum léger et lumineux, exactement l'odeur du printemps. On me demande toujours ce que je porte.",
        "Le flacon est superbe et la tenue étonnante pour un parfum aussi frais. Livrée en 48h, payée à la réception.",
        "Rosée d'Avril est devenu mon parfum de tous les jours. Délicat sans être discret.",
      ],
    },
  }),
};
export default d;
