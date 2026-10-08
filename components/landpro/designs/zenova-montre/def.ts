// Design « Zenova Montre » : boutique horlogère blanche et orange, titres serif, montres détourées.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "zenova-montre";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Zenova Montre",
    category: "Mode",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f7f7f7",
      surface2: "#f1f1f1",
      text: "#1d1d1d",
      muted: "#777777",
      border: "#ececec",
      primary: "#ef8a3f",
      primaryText: "#ffffff",
      accent: "#111111",
      radius: 0,
      font: "sans",
      heading: "elegant",
      headingWeight: 600,
    }),
    hero: {
      variant: "design",
      eyebrow: "Grandes soldes",
      title: "Chronographe en cuir cognac",
      subtitle: "Boîtier acier 42 mm, cadran blanc et chiffres cuivrés : une montre de caractère pour tous les jours.",
    },
    titles: {
      stats: "Pourquoi nous choisir",
      benefits: "Nos collections",
      variants: "Modèles tendance",
      features: "Détails",
      specs: "Fiche technique",
      reviews: "Ils la portent",
      order: "Commander votre montre",
      faq: "Questions fréquentes",
      final_cta: "Offrez-vous l'heure juste",
    },
    sections: [
      "announcement",
      "stats",
      "benefits",
      "variants",
      "features",
      "specs",
      "reviews",
      "order",
      "faq",
      "final_cta",
    ],
    options: {
      announcement:
        "24h/24 Commandez en ligne · Bienvenue dans notre boutique · Livraison partout au Maroc, paiement à la réception",
    },
  },
  demo: demoProduct({
    category: "Montre",
    price: 599,
    oldPrice: 749,
    // 0 hero · 1-3 collections · 4-7 modèles tendance · 8 gros plan bracelet milanais
    images: [
      img("hero"),
      img("men"),
      img("women"),
      img("kids"),
      img("steel"),
      img("band"),
      img("bronze"),
      img("rugged"),
      img("mesh"),
    ],
    specs: [
      { label: "Boîtier", value: "Acier 316L, 42 mm" },
      { label: "Mouvement", value: "Quartz chronographe" },
      { label: "Verre", value: "Minéral renforcé" },
      { label: "Étanchéité", value: "5 ATM (50 m)" },
      { label: "Bracelet", value: "Cuir véritable, 22 mm" },
      { label: "Garantie", value: "2 ans" },
    ],
    stats: [
      { value: "Zenova", label: "Atelier horloger" },
      { value: "24h", label: "Livraison express" },
      { value: "Acier", label: "Inoxydable 316L" },
      { value: "5 ATM", label: "Étanche" },
      { value: "Cuir", label: "Véritable" },
      { value: "2 ans", label: "Garantie" },
      { value: "Écrin", label: "Cadeau offert" },
    ],
    bundles: [
      { qty: 1, label: "1 montre", price: 599 },
      { qty: 2, label: "2 montres", price: 1090, badge: "Duo -10%" },
      { qty: 3, label: "Coffret 3 montres", price: 1490, badge: "-20%" },
    ],
    variants: [
      { name: "Chrono Acier Noir", color: "#1b1b1c" },
      { name: "Active Band", color: "#2a2a2c" },
      { name: "Héritage Bronze", color: "#a8653f" },
      { name: "Rugged Noir Mat", color: "#111111" },
    ],
    copy: {
      name: "Zenova",
      tagline: "Le temps, avec caractère.",
      description:
        "Chaque montre Zenova associe un boîtier en acier, un bracelet en cuir véritable et un cadran lisible en toute circonstance. Livrée dans son écrin, partout au Maroc.",
      benefits: [
        "Montre homme : Nouvelle collection",
        "Montre femme : Élégance minimale",
        "Montre enfant : Nouveautés",
      ],
      features: [
        {
          icon: "",
          title: "Bracelet milanais",
          text: "Maille en acier plaquée or rose, souple et réglable sans outil.",
        },
        {
          icon: "",
          title: "Couronne vissée",
          text: "Réglage précis de l'heure, étanchéité renforcée au quotidien.",
        },
        {
          icon: "",
          title: "Cadran noir mat",
          text: "Index appliqués or rose, lisibles de jour comme de nuit.",
        },
      ],
      reviews: [
        "Magnifique montre, le cuir est très doux et le cadran encore plus beau en vrai. Payée à la livraison, rien à redire.",
        "Je l'ai offerte à mon mari, il ne la quitte plus. Écrin très élégant et livraison en 24h à Casablanca.",
        "Excellent rapport qualité-prix. Le chronographe fonctionne parfaitement et le bracelet est confortable.",
      ],
    },
  }),
};
export default d;
