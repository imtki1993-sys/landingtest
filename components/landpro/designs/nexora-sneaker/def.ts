// Design « Nexora Sneaker » : fond gris clair, noir et vert citron, titres condensés,
// barre latérale noire, hero sneaker tricot en diagonale, cartes bestsellers, bande de chiffres.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "nexora-sneaker";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Sneaker Nexora",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#efeff0",
      surface: "#e6e6e8",
      surface2: "#dcdcdf",
      text: "#0e0e0f",
      muted: "#5b5d62",
      border: "#d8d8db",
      primary: "#c6e526",
      primaryText: "#0e0e0f",
      accent: "#c6e526",
      radius: 14,
      font: "sans",
      heading: "condensed",
      headingWeight: 700,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Nouvelle génération",
      title: "Avance en confort. Garde l'avance.",
      highlight: "confort.",
      subtitle: "Des sneakers premium pensées pour chacun de tes pas.",
    },
    titles: {
      features: "Pourquoi elle",
      variants: "Nos meilleures ventes",
      stats: "En chiffres",
      final_cta: "Rejoins la famille Nexora",
      order: "Commander ma paire",
      reviews: "Ils marchent avec nous",
      faq: "Questions fréquentes",
    },
    sections: ["features", "variants", "stats", "final_cta", "order", "reviews", "faq"],
  },
  demo: demoProduct({
    category: "Sneakers",
    price: 549,
    oldPrice: 749,
    images: [img("hero"), img("flex-run"), img("street-max"), img("ultra-glide"), img("classic"), img("street")],
    imageLabels: ["Flex Run", "Flex Run", "Street Max", "Ultra Glide", "Classic 2.0", "En ville"],
    stats: [
      { value: "150+", label: "Modèles premium" },
      { value: "25K+", label: "Clients satisfaits" },
      { value: "98%", label: "Taux de satisfaction" },
      { value: "7j/7", label: "Service client" },
    ],
    specs: [
      { label: "Tige", value: "Tricot respirant" },
      { label: "Semelle", value: "Mousse sculptée amortissante" },
      { label: "Pointures", value: "39 à 46" },
    ],
    bundles: [
      { qty: 1, label: "1 paire", price: 549 },
      { qty: 2, label: "2 paires", price: 999, badge: "-9%" },
    ],
    variants: [
      { name: "Flex Run Noir", color: "#1c1c1e" },
      { name: "Street Max Blanc", color: "#f3f3f1" },
      { name: "Ultra Glide Gris", color: "#77797d" },
      { name: "Classic 2.0 Sable", color: "#dccbb0" },
    ],
    copy: {
      name: "Nexora",
      tagline: "Des chaussures qui suivent ton style et ton rythme de vie.",
      description:
        "Nexora, c'est la sneaker de running en tricot respirant, posée sur une semelle sculptée qui amortit chaque pas. Légère, solide et livrée partout au Maroc avec paiement à la livraison.",
      benefits: [
        "Confort absolu : Semelle amortissante toute la journée.",
        "Légère : Bouge plus vite, sans effort.",
        "Respirante : Le pied reste au frais.",
      ],
      features: [
        { icon: "", title: "Ultra confort", text: "Semelle amortissante pour toute la journée." },
        { icon: "", title: "Design léger", text: "Bouge plus vite avec une paire plume." },
        { icon: "", title: "Solide et durable", text: "Matières premium faites pour durer." },
        { icon: "", title: "Tissu respirant", text: "Reste au frais à chaque pas." },
      ],
      reviews: [
        "Super légères et très confortables, je les porte toute la journée sans fatigue.",
        "Reçues en 48h à Casa, la qualité du tricot est top. J'ai payé à la livraison.",
        "Parfaites pour courir le matin et sortir le soir. Je recommande.",
      ],
    },
  }),
};
export default d;
