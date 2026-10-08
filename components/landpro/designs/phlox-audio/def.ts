// Design « Casque Bento » : blanc, grille bento colorée, accent rouge, Poppins (casque sans fil noir et rouge).
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "phlox-audio";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Casque Bento",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f1f1f2",
      surface2: "#e8e8ea",
      text: "#111111",
      muted: "#8d8d93",
      border: "#e6e6e8",
      primary: "#ef2b36",
      primaryText: "#ffffff",
      accent: "#ef2b36",
      radius: 22,
      font: "sans",
      heading: "sans",
      headingWeight: 700,
    }),
    hero: {
      variant: "design",
      eyebrow: "Aurix Solo³",
      title: "Sans fil",
      subtitle:
        "Un casque léger au son ample et aux basses profondes, 40 heures d'autonomie et un micro antibruit. Livré partout au Maroc, payé à la réception.",
    },
    titles: {
      benefits: "Pensé pour chaque moment",
      features: "Nos engagements",
      countdown: "Offre de lancement : se termine bientôt",
      specs: "Fiche technique",
      reviews: "Ils écoutent Aurix",
      order: "Commander votre casque",
      faq: "Questions fréquentes",
      final_cta: "Prêt à monter le son ?",
    },
    sections: ["benefits", "features", "countdown", "specs", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Tech",
    price: 299,
    oldPrice: 449,
    images: [
      img("hero"),
      img("closeup"),
      img("yellow"),
      img("laptop"),
      img("console"),
      img("listen"),
      img("dock"),
      img("side"),
    ],
    imageLabels: ["Casque", "Basses", "Couleur", "Bureau", "Console", "Confort", "Batterie", "Specs"],
    specs: [
      { label: "Haut-parleurs", value: "40 mm, basses renforcées" },
      { label: "Autonomie", value: "Jusqu'à 40 heures" },
      { label: "Recharge rapide", value: "10 min = 5 h d'écoute (USB-C)" },
      { label: "Connexion", value: "Bluetooth 5.3, multipoint" },
      { label: "Micro", value: "Antibruit, appels clairs" },
      { label: "Poids", value: "185 g, pliable" },
    ],
    bundles: [
      { qty: 1, label: "1 casque", price: 299 },
      { qty: 2, label: "2 casques", price: 549, badge: "Le plus choisi" },
      { qty: 3, label: "3 casques", price: 769, badge: "-43%" },
    ],
    variants: [
      { name: "Noir & rouge", color: "#161616" },
      { name: "Jaune soleil", color: "#f5c31c" },
      { name: "Bleu océan", color: "#1d86f5" },
    ],
    copy: {
      name: "Aurix Solo",
      tagline: "Le son qui vous suit partout.",
      description:
        "Aurix Solo³ réunit un son ample, des basses profondes et un confort qui dure toute la journée. Pliable, léger et prêt pour la musique, les appels et le jeu.",
      benefits: [
        "Son immersif : Haut-parleurs 40 mm et basses profondes.",
        "Trois coloris : Noir & rouge, jaune soleil ou bleu océan.",
        "Télétravail : Micro antibruit pour des appels et visios nets.",
        "Mode jeu : Latence réduite, aucun décalage avec l'image.",
        "Ultra léger : 185 g et coussinets à mémoire de forme.",
        "40 h d'autonomie : 10 minutes de charge pour 5 heures d'écoute.",
      ],
      features: [
        { icon: "", title: "Livraison gratuite", text: "Partout au Maroc" },
        { icon: "", title: "Satisfait ou remboursé", text: "7 jours pour changer d'avis" },
        { icon: "", title: "Support 7j/7", text: "Par téléphone et WhatsApp" },
        { icon: "", title: "Paiement à la livraison", text: "Vous payez à la réception" },
      ],
      reviews: [
        "Le son est vraiment puissant et les basses sont propres. Je le porte toute la journée sans gêne.",
        "Parfait pour mes réunions en ligne : on m'entend très bien même dans un café.",
        "Livré en 24h à Tanger, payé à la réception. Le jaune est encore plus beau en vrai.",
      ],
    },
  }),
};
export default d;
