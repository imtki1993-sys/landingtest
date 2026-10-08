// Design « Bracelet citron » : boutique de bracelets pour montre connectée, blanc,
// minuscules, pilules arrondies et accent citron vert.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "bracelet-lime";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Bracelet citron",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f1f1f1",
      surface2: "#e9e9e9",
      text: "#111111",
      muted: "#8a8a8a",
      border: "#e6e6e6",
      primary: "#c6f45e",
      primaryText: "#111111",
      accent: "#111111",
      radius: 22,
      font: "sans",
      heading: "sans",
      headingWeight: 400,
    }),
    hero: {
      variant: "design",
      eyebrow: "meilleure vente",
      title: "legacy acier noir sport pro bracelet",
      highlight: "noir",
      subtitle:
        "bracelet legacy noir pour montre connectée, en acier inoxydable brossé, pensé pour tout ce que la journée vous réserve.",
    },
    titles: {
      variants: "nos collections",
      features: "pourquoi l'acier legacy ?",
      reviews: "avis clients",
      faq: "service & livraison",
      order: "commander mon bracelet",
      final_cta: "prêt à changer de style ?",
    },
    sections: ["variants", "features", "reviews", "faq", "order", "final_cta"],
  },
  demo: demoProduct({
    category: "Bracelets montre",
    price: 349,
    oldPrice: 449,
    images: [
      img("hero"),
      img("sport-sable"),
      img("sport-marine"),
      img("cuir-noir"),
      img("milanaise"),
      img("maillons-noir"),
      img("lifestyle"),
    ],
    imageLabels: ["acier noir", "sport sable", "sport marine", "cuir robuste", "milanaise", "maillons"],
    specs: [
      { label: "style du boîtier", value: "38/40/41 · 42/44/45 mm" },
      { label: "matière", value: "acier inoxydable" },
      { label: "fermoir", value: "boucle déployante" },
    ],
    bundles: [
      { qty: 1, label: "1 bracelet", price: 349 },
      { qty: 2, label: "2 bracelets", price: 599, badge: "-15%" },
    ],
    variants: [
      { name: "sport sable", color: "#bdb3a6" },
      { name: "sport bleu marine", color: "#5d7d93" },
      { name: "cuir robuste noir", color: "#1e1e1f" },
      { name: "milanaise acier", color: "#a9abae" },
      { name: "maillons noir de jais", color: "#2b2b2b" },
    ],
    copy: {
      name: "pro straps",
      tagline: "legacy acier noir sport pro bracelet",
      description:
        "la déclaration de style de la saison : un bracelet en acier brossé, ajusté maillon par maillon, qui se change en quelques secondes et s'adapte à toutes les montres connectées compatibles.",
      benefits: [
        "Livraison express : 24 à 48h partout au Maroc.",
        "Échange facile : la taille ne va pas ? on l'échange.",
        "Paiement à la livraison : vous payez à la réception.",
      ],
      features: [
        { icon: "", title: "résistant à l'eau", text: "acier inoxydable traité, sans rouille" },
        { icon: "", title: "ajustement précis", text: "maillons amovibles, outil offert" },
        { icon: "", title: "changement rapide", text: "attache à glissière en 5 secondes" },
        { icon: "", title: "compatible", text: "boîtiers 38 à 45 mm" },
      ],
      reviews: [
        "j'adore ces bracelets : super confortables et faciles à ajuster.",
        "très beau rendu et simple à changer. livraison rapide, payé à la réception.",
        "l'acier noir fait vraiment haut de gamme, on me demande où je l'ai acheté.",
      ],
    },
  }),
};
export default d;
