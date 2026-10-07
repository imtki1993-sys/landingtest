// Design « GlowCare Rose » : boutique santé & beauté, rose vif sur blanc et rose pâle, sans-serif moderne.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "glowcare-rose";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Rose Éclat",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#fff5f8",
      surface2: "#fde8ef",
      text: "#14141f",
      muted: "#5f6170",
      border: "#f3dfe6",
      primary: "#e6386f",
      primaryText: "#ffffff",
      accent: "#e6386f",
      radius: 14,
      font: "sans",
      heading: "sans",
      headingWeight: 700,
    }),
    hero: {
      variant: "design",
      eyebrow: "Rayonnez de confiance chaque jour",
      title: "Beauté & bien-être pour un éclat unique",
      highlight: "éclat unique",
      subtitle: "Découvrez des soins santé & beauté de qualité pour une peau, des cheveux et un corps en pleine forme.",
    },
    titles: {
      benefits: "Nos univers",
      variants: "Meilleures ventes",
      countdown: "Offre à durée limitée",
      reviews: "Elles en parlent",
      faq: "Questions fréquentes",
      order: "Finaliser ma commande",
    },
    sections: ["features", "benefits", "countdown", "variants", "trust", "order", "reviews", "faq"],
  },
  demo: demoProduct({
    category: "Beauté",
    price: 249,
    oldPrice: 349,
    images: [
      img("hero"),
      img("product-serum"),
      img("product-cream"),
      img("product-shampoo"),
      img("product-aloe"),
      img("product-lipstick"),
      img("cat-skin"),
      img("cat-hair"),
      img("cat-body"),
      img("cat-makeup"),
      img("cat-wellness"),
      img("promo"),
    ],
    specs: [
      { label: "Contenu", value: "Coffret 5 soins" },
      { label: "Type de peau", value: "Tous types de peau" },
      { label: "Origine", value: "Formules testées dermatologiquement" },
    ],
    bundles: [
      { qty: 1, label: "1 coffret", price: 249 },
      { qty: 2, label: "2 coffrets", price: 459, badge: "Le plus choisi" },
      { qty: 3, label: "3 coffrets", price: 649, badge: "-38%" },
    ],
    variants: [
      { name: "Sérum Vitamine C · 30 ml", color: "#f0a020" },
      { name: "Crème Hydratante · 50 g", color: "#f4f4f4" },
      { name: "Shampoing Kératine · 200 ml", color: "#f0948c" },
      { name: "Gel Aloe Vera · 150 ml", color: "#8bdc72" },
      { name: "Rouge à Lèvres Mat · 4,2 g", color: "#a51d3c" },
    ],
    copy: {
      name: "Glowéa",
      tagline: "Sur votre coffret beauté & bien-être",
      description:
        "Le coffret Glowéa réunit les soins essentiels d'une routine éclat : visage, cheveux et corps. Des formules douces, testées dermatologiquement, livrées partout au Maroc avec paiement à la livraison.",
      benefits: [
        "Soin du visage : Éclat & hydratation",
        "Soin des cheveux : Force & brillance",
        "Soin du corps : Douceur au quotidien",
        "Maquillage : Couleur longue tenue",
        "Santé & bien-être : Vitalité de l'intérieur",
      ],
      features: [
        { icon: "", title: "100% authentique", text: "Produits d'origine garantie" },
        { icon: "", title: "Approuvé par des experts", text: "Testé dermatologiquement" },
        { icon: "", title: "Livraison rapide", text: "Jusqu'à votre porte" },
        { icon: "", title: "Retours faciles", text: "Échange sous 7 jours" },
      ],
      reviews: [
        "Le sérum a changé ma peau en deux semaines : teint plus lumineux, taches atténuées. Je recommande !",
        "Coffret très bien présenté, les produits sentent bon et la livraison a été rapide. Paiement à la réception, parfait.",
        "La crème hydratante est légère et ne graisse pas. Mes cheveux sont aussi plus doux avec le shampoing.",
      ],
    },
  }),
};
export default d;
