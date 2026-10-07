// Design « Vortex Rouge » : studio motion noir / blanc / rouge, titres condensés très gras.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "vortex-rouge";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Vortex Rouge",
    category: "Mode",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#060606",
      surface: "#111111",
      surface2: "#1a1a1a",
      text: "#ffffff",
      muted: "#a3a3a3",
      border: "#262626",
      primary: "#e10600",
      primaryText: "#ffffff",
      accent: "#e10600",
      radius: 4,
      font: "sans",
      heading: "condensed",
      headingWeight: 700,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Lunettes polarisées · Édition Vortex",
      title: "Un regard qui fait tourner les têtes.",
      highlight: "fait tourner",
      subtitle:
        "Vortex X, c'est une monture ultra-légère et des verres polarisés UV400 pensés pour voir net et marquer les esprits. Livrées partout au Maroc, payées à la réception.",
    },
    titles: {
      story: "À propos",
      features: "Des détails qui font l'impact.",
      showcase: "Quelques looks choisis.",
      how: "De la commande à vos yeux.",
      reviews: "Choisies par nos clients. Adorées au quotidien.",
      order: "Commandez votre Vortex X.",
      faq: "Questions fréquentes.",
      final_cta: "Passez à l'action",
    },
    sections: ["story", "features", "showcase", "how", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Lunettes",
    price: 349,
    oldPrice: 499,
    images: [
      img("hero"),
      img("about"),
      img("work-sprint"),
      img("work-lens"),
      img("work-stage"),
      img("work-product"),
      img("product"),
      img("product-fold"),
    ],
    imageLabels: [
      "Sprint urbain — Sport",
      "Verres miroir — Détail",
      "Nuit rouge — Lifestyle",
      "Noir carbone — Produit",
    ],
    stats: [
      { value: "2 ans", label: "Garantie monture" },
      { value: "UV400", label: "Protection totale" },
      { value: "24 g", label: "Ultra-légères" },
      { value: "100%", label: "Verres polarisés" },
    ],
    specs: [
      { label: "Verres", value: "Polarisés UV400" },
      { label: "Monture", value: "TR90 · 24 g" },
      { label: "Livré avec", value: "Étui rigide + chiffon" },
    ],
    bundles: [
      { qty: 1, label: "1 paire", price: 349 },
      { qty: 2, label: "2 paires", price: 599, badge: "Duo -40%" },
      { qty: 3, label: "3 paires", price: 799, badge: "Le meilleur prix" },
    ],
    variants: [
      { name: "Noir Carbone", color: "#111111" },
      { name: "Rouge Miroir", color: "#e10600" },
      { name: "Gris Fumé", color: "#6b6b6b" },
      { name: "Bleu Glacier", color: "#4f7fb8" },
      { name: "Or Désert", color: "#c79a4a" },
      { name: "Vert Forêt", color: "#3f5a3a" },
    ],
    copy: {
      name: "Vortex X",
      tagline: "Des verres qui transforment chaque regard.",
      description:
        "Vortex X est née d'une idée simple : des lunettes de soleil aussi solides que stylées. Verres polarisés anti-reflets, monture flexible et finitions premium, pour la ville, la route et la plage.",
      benefits: [
        "Vision nette : Les verres polarisés coupent les reflets.",
        "Confort : Seulement 24 g sur le nez.",
        "Style : Un look qui ne passe pas inaperçu.",
      ],
      features: [
        {
          icon: "",
          title: "Verres polarisés HD",
          text: "Les reflets disparaissent, les couleurs deviennent plus vives.",
        },
        { icon: "", title: "Protection UV400", text: "100 % des UVA et UVB filtrés pour protéger vos yeux." },
        { icon: "", title: "Monture TR90", text: "Ultra-légère et flexible, elle se fait oublier toute la journée." },
        { icon: "", title: "Charnières flex", text: "Des charnières à ressort qui suivent la forme du visage." },
        { icon: "", title: "Anti-rayures", text: "Un traitement durci qui garde les verres comme neufs." },
        { icon: "", title: "Étui offert", text: "Étui rigide et chiffon microfibre inclus dans la boîte." },
      ],
      reviews: [
        "Vortex X a changé ma conduite : plus aucun reflet sur la route. La qualité, le style et le confort sont au top.",
        "Très légères, je les oublie sur le nez. Livraison rapide à Casablanca et paiement à la réception, parfait.",
        "Le rouge miroir est magnifique, tout le monde me demande où je les ai achetées.",
      ],
    },
  }),
};
export default d;
