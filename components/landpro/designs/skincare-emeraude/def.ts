// Design « Skincare Émeraude » : soins naturels, teal profond et blanc, titres serif.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "skincare-emeraude";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Soin Émeraude",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#f6faf9",
      surface: "#eef6f4",
      surface2: "#e2efeb",
      text: "#163a35",
      muted: "#5d7470",
      border: "#d9e8e4",
      primary: "#1d6b62",
      primaryText: "#ffffff",
      accent: "#1d6b62",
      radius: 10,
      font: "sans",
      heading: "elegant",
      headingWeight: 400,
    }),
    hero: {
      variant: "design",
      eyebrow: "Naturellement radieuse",
      title: "Des soins purs, une beauté qui rayonne.",
      subtitle: "Le parfait équilibre entre nature et science pour une peau saine et lumineuse, chaque jour.",
    },
    titles: {
      benefits: "Nos soins",
      variants: "Produits phares",
      final_cta: "Offre spéciale",
      trust: "Nos engagements",
      reviews: "Elles en parlent",
      faq: "Questions fréquentes",
      order: "Commander votre routine",
    },
    sections: ["announcement", "features", "benefits", "variants", "final_cta", "trust", "order", "reviews", "faq"],
    options: { announcement: "Livraison gratuite partout au Maroc · Paiement à la livraison" },
  },
  demo: demoProduct({
    category: "Soin visage",
    price: 349,
    oldPrice: 440,
    images: [
      img("hero"),
      img("cat-serum"),
      img("cat-moisturizer"),
      img("cat-cleanser"),
      img("cat-toner"),
      img("cat-eye"),
      img("cat-sun"),
      img("feat-gel"),
      img("feat-serum"),
      img("feat-night"),
      img("feat-spf"),
      img("offer"),
    ],
    specs: [
      { label: "Contenance", value: "50 ml" },
      { label: "Type de peau", value: "Tous types de peau" },
      { label: "Formule", value: "Sans parabènes ni sulfates" },
    ],
    bundles: [
      { qty: 1, label: "1 soin", price: 349 },
      { qty: 2, label: "2 soins", price: 620, badge: "Le plus choisi" },
      { qty: 3, label: "Routine complète (3)", price: 849, badge: "-35%" },
    ],
    variants: [
      { name: "Gel-crème Hydra Glow", color: "#1d6b62" },
      { name: "Sérum Éclat Radiance", color: "#11564d" },
      { name: "Crème de nuit réparatrice", color: "#a8d4ca" },
      { name: "Écran solaire SPF 50", color: "#b9ddd4" },
    ],
    copy: {
      name: "Verdélia",
      tagline: "Des soins naturels pour une peau éclatante.",
      description:
        "Les soins Verdélia associent extraits de plantes et actifs testés pour hydrater, apaiser et révéler l'éclat naturel de votre peau, jour après jour.",
      benefits: [
        "Sérums : Éclat & hydratation",
        "Hydratants : Confort 24h",
        "Nettoyants : Doux & frais",
        "Toniques : Peau équilibrée",
        "Contour des yeux : Regard reposé",
        "Protection solaire : SPF 50",
      ],
      features: [
        { icon: "", title: "Ingrédients naturels", text: "Sûrs & efficaces" },
        { icon: "", title: "Testé dermatologiquement", text: "Pour tous types de peau" },
        { icon: "", title: "Sans parabènes ni sulfates", text: "Clean & doux" },
        { icon: "", title: "Cruelty free", text: "Non testé sur les animaux" },
      ],
      reviews: [
        "Ma peau n'a jamais été aussi douce. Le gel-crème pénètre vite et ne colle pas du tout.",
        "J'ai pris la routine complète, livraison rapide et paiement à la réception. Je recommande !",
        "Le sérum a vraiment unifié mon teint en quelques semaines. Odeur légère et agréable.",
      ],
    },
  }),
};
export default d;
