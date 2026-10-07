// Design « Glow Rose » : soin de la peau rose poudré, serif élégant, portrait + trio de produits.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "glow-rose";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Glow Rose",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#fdf3f3",
      surface2: "#f9e4e5",
      text: "#1d1617",
      muted: "#6f6466",
      border: "#f1e2e3",
      primary: "#1d1617",
      primaryText: "#ffffff",
      accent: "#c9667a",
      radius: 14,
      font: "display",
      heading: "serif",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      eyebrow: "Nouvelle collection",
      title: "Révélez votre éclat naturel",
      highlight: "éclat naturel",
      subtitle: "Des soins qui subliment votre beauté naturelle. Doux, efficaces et pensés pour vous.",
    },
    titles: {
      benefits: "Nos soins par besoin",
      countdown: "Des soins qui vous aiment en retour",
      variants: "Nos best-sellers",
      reviews: "Elles l'adorent",
      faq: "Questions fréquentes",
      order: "Commander votre rituel",
    },
    sections: ["benefits", "countdown", "variants", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Soin visage",
    price: 249,
    oldPrice: 319,
    images: [
      img("hero"),
      img("cat-cleanser"),
      img("cat-moisturizer"),
      img("cat-serum"),
      img("cat-sunscreen"),
      img("cat-mask"),
      img("banner"),
      img("best-vitc"),
      img("best-moist"),
      img("best-spf"),
      img("best-mask"),
    ],
    specs: [
      { label: "Contenance", value: "30 ml" },
      { label: "Type de peau", value: "Toutes peaux" },
      { label: "Origine", value: "Formulé en France" },
    ],
    stats: [
      { value: "10K+", label: "Clientes ravies" },
      { value: "4.8", label: "Note moyenne" },
    ],
    bundles: [
      { qty: 1, label: "1 soin", price: 249 },
      { qty: 2, label: "2 soins", price: 449, badge: "Le plus choisi" },
      { qty: 3, label: "Rituel 3 soins", price: 599, badge: "-37%" },
    ],
    variants: [
      { name: "Sérum Vitamine C", color: "#f19a3a" },
      { name: "Crème Hydratante", color: "#f2b3b8" },
      { name: "Écran Éclat SPF 50", color: "#fbf6f5" },
      { name: "Masque Argile Rose", color: "#eea3ad" },
    ],
    copy: {
      name: "Lunéa",
      tagline: "Une peau qui vous dit merci",
      description:
        "Lunéa formule des soins doux à l'eau de rose et aux actifs d'origine naturelle : une peau nette, hydratée et lumineuse, jour après jour.",
      benefits: [
        "Nettoyer : Peau nette et douce",
        "Hydrater : Confort toute la journée",
        "Illuminer : Teint frais et éclatant",
        "Protéger : Bouclier anti-UV",
        "Purifier : Pores resserrés",
      ],
      features: [
        { icon: "", title: "Ingrédients naturels", text: "Doux et sains" },
        { icon: "", title: "Testé dermatologiquement", text: "Cliniquement prouvé" },
        { icon: "", title: "Non testé sur les animaux", text: "Cruelty free" },
      ],
      reviews: [
        "Ma peau n'a jamais été aussi lumineuse. La texture est légère et le parfum de rose est divin.",
        "Livraison rapide à Casablanca, j'ai payé à la réception. Le sérum a vraiment unifié mon teint.",
        "Je l'utilise matin et soir depuis un mois : peau douce, hydratée et plus aucun tiraillement.",
      ],
    },
  }),
};
export default d;
