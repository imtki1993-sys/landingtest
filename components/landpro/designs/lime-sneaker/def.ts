// Design « Lime Sneaker » : boutique de sneakers noire, accent vert citron, titres condensés.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "lime-sneaker";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Sneaker Citron",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#050505",
      surface: "#111111",
      surface2: "#1a1a1a",
      text: "#ffffff",
      muted: "#a3a3a3",
      border: "#262626",
      primary: "#d4ee14",
      primaryText: "#0a0a0a",
      accent: "#d4ee14",
      radius: 8,
      font: "display",
      heading: "condensed",
      headingWeight: 400,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Trouve ton élément",
      title: "Confort réinventé",
      highlight: "réinventé",
      subtitle: "Pensée pour chaque humeur, chaque mouvement et chaque version de toi.",
    },
    titles: {
      benefits: "Plus que des baskets",
      features: "Nos engagements",
      showcase: "Sous tous les angles",
      reviews: "Ils la portent",
      faq: "Questions fréquentes",
      order: "Commander ma paire",
    },
    sections: ["benefits", "features", "showcase", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Sneakers",
    price: 499,
    oldPrice: 669,
    images: [
      img("hero"),
      img("card-everyday"),
      img("card-performance"),
      img("card-lifestyle"),
      img("shoe-side"),
      img("shoe-pair"),
      img("shoe-sole"),
    ],
    imageLabels: ["En situation", "Au quotidien", "En mouvement", "Style", "Profil", "La paire", "Semelle"],
    stats: [
      { value: "12 000+", label: "clients" },
      { value: "4,8/5", label: "note moyenne" },
    ],
    specs: [
      { label: "Tige", value: "Daim synthétique noir" },
      { label: "Semelle", value: "Caoutchouc citron antidérapant" },
      { label: "Pointures", value: "36 à 45" },
    ],
    bundles: [
      { qty: 1, label: "1 paire", price: 499 },
      { qty: 2, label: "2 paires", price: 899, badge: "-10%" },
    ],
    variants: [
      { name: "Noir / Citron", color: "#d4ee14" },
      { name: "Noir / Blanc", color: "#f2f2f2" },
    ],
    copy: {
      name: "Voltstep",
      tagline: "Confort réinventé",
      description:
        "Voltstep, c'est la sneaker noire à semelle citron qui suit ton rythme : amorti épais, accroche franche et un style qui ne passe pas inaperçu. Paiement à la livraison partout au Maroc.",
      benefits: [
        "Au quotidien : Toute la journée, tous les jours.",
        "Performance : Bouge sans limites.",
        "Lifestyle : Un style qui parle.",
      ],
      features: [
        { icon: "", title: "Livraison gratuite", text: "Partout au Maroc" },
        { icon: "", title: "Paiement sécurisé", text: "À la livraison" },
        { icon: "", title: "Retours faciles", text: "Sous 7 jours" },
        { icon: "", title: "Support 7j/7", text: "On répond vite" },
      ],
      reviews: [
        "La semelle citron fait tourner les têtes. Super confortable dès le premier jour.",
        "Taille normale, livrée en 48h à Casa. J'ai payé à la réception, rien à redire.",
        "Je les porte au boulot et à la salle. L'amorti est vraiment top.",
      ],
    },
  }),
};
export default d;
