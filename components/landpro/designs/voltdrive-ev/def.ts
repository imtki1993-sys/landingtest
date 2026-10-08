// Design « Voiture électrique » : constructeur EV, page blanche lumineuse, accent vert lime,
// SUV électrique en scène architecturale, gamme en carrousel, impact, avis, bandeau recharge.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "voltdrive-ev";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Voiture Électrique",
    category: "Premium",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f6f7f8",
      surface2: "#eef0f2",
      text: "#121417",
      muted: "#5f656d",
      border: "#e7e9ec",
      primary: "#8fd11e",
      primaryText: "#0f1a04",
      accent: "#7cc313",
      radius: 14,
      font: "sans",
      heading: "sans",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      title: "Conduisez le futur. Dès aujourd'hui.",
      highlight: "Dès aujourd'hui.",
      subtitle:
        "Lumora EV allie performances intelligentes, zéro émission et une conduite plus sereine. Réservez votre essai partout au Maroc.",
    },
    titles: {
      specs: "Fiche technique",
      features: "Un écosystème de recharge intelligent",
      variants: "Pensée pour chaque trajet",
      stats: "Conduire le changement pour un avenir meilleur",
      reviews: "Vraies histoires. Vrais conducteurs.",
      order: "Réserver votre Lumora",
      faq: "Questions fréquentes",
      final_cta: "Restez chargé. Roulez serein.",
    },
    sections: ["specs", "features", "variants", "stats", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Voiture électrique",
    price: 349900,
    oldPrice: 369900,
    images: [
      img("hero"),
      img("charger-home"),
      img("charger-app"),
      img("charger-station"),
      img("model-s"),
      img("model-x"),
      img("model-gt"),
      img("car-rear"),
    ],
    imageLabels: [
      "Vue avant",
      "Borne murale",
      "Application mobile",
      "Station de recharge",
      "Compacte. Agile. Efficace.",
      "Polyvalente. Puissante. Intelligente.",
      "La performance redéfinie.",
      "Prise de recharge",
    ],
    specs: [
      { label: "Autonomie", value: "620 km · Cycle WLTP" },
      { label: "0 à 100 km/h", value: "4,2 s · Double moteur AWD" },
      { label: "Recharge ultra-rapide", value: "800 V · 10 à 80 % en 18 min" },
      { label: "Pilotée par l'IA", value: "SmartDrive OS · Mises à jour à distance" },
      { label: "Sécurité", value: "5 étoiles · Aides à la conduite de série" },
    ],
    bundles: [{ qty: 1, label: "Réservation · 1 véhicule", price: 349900 }],
    variants: [
      { name: "Lumora S", color: "#e9ecef" },
      { name: "Lumora X", color: "#f7f8f9" },
      { name: "Lumora GT", color: "#dfe3e7" },
    ],
    stats: [
      { value: "0", label: "Émission à l'échappement · 100 % électrique" },
      { value: "8 ans", label: "Garantie batterie · Kilométrage illimité" },
      { value: "100 %", label: "Batterie recyclable · Seconde vie assurée" },
      { value: "24h/7", label: "Assistance routière · Partout au Maroc" },
    ],
    copy: {
      name: "Lumora EV",
      tagline: "Recevez votre conseiller, réservez votre essai et payez seulement à la livraison du véhicule.",
      description:
        "Lumora vous offre une liberté totale : recharge à la maison, bornes partenaires sur la route et recharge ultra-rapide en quelques minutes.",
      benefits: [],
      features: [
        { icon: "", title: "Recharge à domicile", text: "Pratique. Rapide. Fiable." },
        { icon: "", title: "Réseau public", text: "Bornes partenaires dans tout le Maroc" },
        { icon: "", title: "Recharge ultra-rapide", text: "Prête en quelques minutes." },
      ],
      reviews: [
        "La Lumora X a changé ma vision de la voiture électrique. Autonomie incroyable, recharge rapide et un vrai plaisir de conduite.",
        "Design soigné, technologie de pointe et zéro essence. L'essai à domicile m'a convaincue, je suis fière de rouler en Lumora.",
        "Recharger à la maison est un jeu d'enfant et les performances sont bluffantes. La Lumora GT est dans une autre catégorie.",
      ],
      faq: [
        {
          q: "Comment fonctionne la réservation ?",
          a: "Vous envoyez le formulaire, un conseiller vous appelle sous 24h pour confirmer la version, la couleur et fixer l'essai.",
        },
        {
          q: "Comment se passe le paiement ?",
          a: "Aucun paiement en ligne : vous réglez à la livraison du véhicule, après l'avoir vérifié avec notre conseiller.",
        },
        {
          q: "Où puis-je recharger ma voiture ?",
          a: "Sur une prise domestique ou la borne murale fournie, et sur les bornes rapides partenaires partout au Maroc.",
        },
        {
          q: "Quel est le délai de livraison ?",
          a: "2 à 4 semaines selon la version, avec livraison et prise en main à domicile dans tout le Maroc.",
        },
      ],
    },
  }),
};
export default d;
