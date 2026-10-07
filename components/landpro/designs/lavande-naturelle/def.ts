// Design « Lavande Naturelle » : soins naturels, lavande et violet profond, titres serif.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "lavande-naturelle";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Lavande Naturelle",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f5f0fc",
      surface2: "#ece3f8",
      text: "#2a2140",
      muted: "#6f6784",
      border: "#ebe4f5",
      primary: "#5b3f9e",
      primaryText: "#ffffff",
      accent: "#8f6bcf",
      radius: 18,
      font: "sans",
      heading: "serif",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      eyebrow: "Soins de la peau naturels",
      title: "Une peau éclatante, naturellement",
      highlight: "naturellement",
      subtitle:
        "Découvrez notre collection de soins naturels, conçus pour révéler la beauté de votre peau tout en la protégeant.",
    },
    titles: {
      benefits: "Explorez nos univers",
      variants: "Les plus aimés",
      countdown: "Prenez soin de vous, vous le méritez !",
      features: "Nos engagements",
      reviews: "Elles nous font confiance",
      order: "Commander votre soin",
      faq: "Questions fréquentes",
    },
    sections: ["benefits", "variants", "countdown", "features", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Soins naturels",
    price: 239,
    oldPrice: 299,
    images: [img("hero"), img("creme"), img("serum"), img("nettoyant"), img("parfum"), img("portrait")],
    imageLabels: ["Beauté Naturelle"],
    specs: [
      { label: "Contenance", value: "50 ml" },
      { label: "Type de peau", value: "Tous types de peau" },
      { label: "Actifs", value: "Lavande bio, acide hyaluronique" },
    ],
    bundles: [
      { qty: 1, label: "1 soin", price: 239 },
      { qty: 2, label: "2 soins", price: 429, badge: "Le plus choisi" },
      { qty: 3, label: "Rituel complet (3 soins)", price: 599, badge: "-33%" },
    ],
    variants: [
      { name: "Crème hydratante visage", color: "#dccbf1" },
      { name: "Sérum éclat visage", color: "#cdb3ee" },
      { name: "Nettoyant doux visage", color: "#e7dbf6" },
      { name: "Eau de parfum floral", color: "#d7a8d9" },
    ],
    copy: {
      name: "Lavélia",
      tagline: "Votre beauté, notre priorité",
      description:
        "Des soins à la lavande bio et aux actifs d'origine naturelle, pensés pour hydrater, apaiser et sublimer votre peau au quotidien.",
      benefits: [
        "Soins du visage : Hydratation et éclat",
        "Soins du corps : Douceur au quotidien",
        "Cheveux : Nutrition et brillance",
        "Maquillage : Un teint naturel",
        "Parfums : Notes florales",
        "Accessoires : Le rituel complet",
      ],
      features: [
        { icon: "", title: "Produits 100% naturels", text: "Pour une beauté saine et durable" },
        { icon: "", title: "Livraison rapide", text: "48h partout au Maroc" },
        { icon: "", title: "Paiement à la livraison", text: "Vous payez à la réception" },
        { icon: "", title: "Service client", text: "À votre écoute 7j/7" },
      ],
      reviews: [
        "Ma peau est plus douce et lumineuse dès la première semaine. L'odeur de lavande est un vrai moment de détente.",
        "Texture légère qui pénètre vite, aucune réaction sur ma peau sensible. Livrée en 2 jours, payée à la réception.",
        "J'ai offert le rituel complet à ma sœur, elle l'adore. Les flacons sont magnifiques.",
      ],
    },
  }),
};
export default d;
