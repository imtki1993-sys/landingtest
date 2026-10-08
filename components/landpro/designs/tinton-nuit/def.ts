// Design « Montre nuit » : boutique horlogère de luxe, fond noir, accent vert,
// titres fins en capitales (Jost), photos de montres dans des scènes nocturnes.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "tinton-nuit";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Montre nuit",
    category: "Premium",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#0f0f0f",
      surface: "#181818",
      surface2: "#1f201e",
      text: "#f2f2f0",
      muted: "#9a9b98",
      border: "#2a2b29",
      primary: "#ffffff",
      primaryText: "#111111",
      accent: "#86c35c",
      radius: 0,
      font: "sans",
      heading: "sans",
      headingWeight: 300,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Nouvelle édition · Phase de lune",
      title: "Découvrez la nouvelle édition",
      subtitle: "Mouvement automatique, phase de lune et verre saphir. Livrée partout au Maroc, payée à la réception.",
    },
    titles: {
      benefits: "Nos collections",
      features: "Nos engagements",
      variants: "Choisissez votre modèle",
      final_cta: "Nos plus belles collections horlogères",
      reviews: "Ils la portent déjà",
      faq: "Questions fréquentes",
      order: "Commander votre montre",
    },
    sections: ["announcement", "benefits", "features", "variants", "final_cta", "order", "reviews", "faq"],
    options: {
      announcement: "Livraison gratuite partout au Maroc · Paiement à la livraison · Garantie 2 ans",
    },
  },
  demo: demoProduct({
    category: "Montre",
    price: 1290,
    oldPrice: 1690,
    images: [
      img("hero"),
      img("tile-gold"),
      img("tile-blue"),
      img("tile-promo"),
      img("tile-steel"),
      img("tile-silver"),
      img("var-ladies"),
      img("var-smart"),
      img("var-chrono"),
      img("band-diver"),
    ],
    specs: [
      { label: "Mouvement", value: "Automatique" },
      { label: "Diamètre", value: "41 mm" },
      { label: "Verre", value: "Saphir" },
      { label: "Étanchéité", value: "5 ATM" },
    ],
    bundles: [
      { qty: 1, label: "1 montre", price: 1290 },
      { qty: 2, label: "2 montres (duo)", price: 2390, badge: "-8 %" },
    ],
    variants: [
      { name: "Collection femme", color: "#c9cdd1" },
      { name: "Montre connectée", color: "#1d1e20" },
      { name: "Collection homme", color: "#8b9096" },
    ],
    copy: {
      name: "Lunor",
      tagline: "Une montre qui traverse le temps.",
      description:
        "Lunor dessine des montres automatiques au style intemporel : boîtier en acier, verre saphir et phase de lune, pour celles et ceux qui aiment les beaux objets.",
      benefits: [
        "La montre la plus désirée : Édition limitée",
        "L'élégance d'une grande maison : Montre classique",
        "L'acier au quotidien : Collection acier",
        "La nouvelle collection de luxe : Saison 2026",
      ],
      features: [
        { icon: "", title: "Livraison gratuite", text: "Partout au Maroc en 24 à 48 h" },
        { icon: "", title: "Paiement à la livraison", text: "Vous payez à la réception du colis" },
        { icon: "", title: "Service 7j/7", text: "Une équipe à votre écoute" },
        { icon: "", title: "Garantie 2 ans", text: "Échange gratuit sous 7 jours" },
      ],
      reviews: [
        "Magnifique montre, encore plus belle en vrai. La phase de lune fait son effet à chaque fois.",
        "Livraison rapide à Casablanca, j'ai pu vérifier la montre avant de payer. Très sérieux.",
        "Offerte à mon mari pour notre anniversaire, il ne la quitte plus. Finitions impeccables.",
      ],
    },
  }),
};
export default d;
