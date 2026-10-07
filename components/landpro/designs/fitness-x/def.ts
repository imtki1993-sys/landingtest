// Design « Fitness X » : salle de sport sombre, orange vif, titres larges géométriques.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "fitness-x";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Fitness X",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#0d0d0e",
      surface: "#161618",
      surface2: "#1f1f22",
      text: "#f4f4f5",
      muted: "#a1a1aa",
      border: "#2a2a2e",
      primary: "#ff5a1f",
      primaryText: "#ffffff",
      accent: "#ff5a1f",
      radius: 4,
      font: "display",
      heading: "tech",
      headingWeight: 800,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Haltères ajustables 2 à 24 kg",
      title: "Objectif fitness atteint",
      highlight: "fitness",
      subtitle:
        "Toute une salle de musculation dans une paire d'haltères. Réglez le poids en 2 secondes, entraînez-vous où vous voulez.",
    },
    titles: {
      benefits: "Nos programmes",
      stats: "Nous repoussons les limites de votre force",
      features: "Pourquoi nous choisir",
      showcase: "Nos coachs vous accompagnent",
      reviews: "Témoignage client",
      specs: "Fiche technique",
      trust: "Nos engagements",
      offers: "Choisissez le pack qui vous convient",
      how: "Commandez en 4 étapes",
      story: "Dernières actus",
      order: "Commander mes haltères",
      faq: "Questions fréquentes",
    },
    sections: [
      "benefits",
      "stats",
      "features",
      "showcase",
      "reviews",
      "specs",
      "trust",
      "offers",
      "how",
      "story",
      "order",
      "faq",
    ],
  },
  demo: demoProduct({
    category: "Sport",
    price: 1290,
    oldPrice: 1690,
    images: [
      img("hero"),
      img("card-rack"),
      img("card-press"),
      img("card-bench"),
      img("about"),
      img("why"),
      img("coach-1"),
      img("coach-2"),
      img("coach-3"),
      img("coach-4"),
      img("coach-5"),
      img("coach-6"),
      img("news-1"),
      img("news-2"),
    ],
    imageLabels: ["", "", "", "", "", "", "Force", "Musculation", "Mobilité", "Cardio", "Hypertrophie", "Gainage"],
    stats: [
      { value: "15", label: "Poids en 1 haltère" },
      { value: "2 s", label: "Pour changer de poids" },
      { value: "24 kg", label: "Charge maximale" },
    ],
    specs: [
      { label: "Charge", value: "2 à 24 kg" },
      { label: "Réglages", value: "15 positions" },
      { label: "Changement", value: "2 secondes" },
      { label: "Poignée", value: "Acier moleté" },
      { label: "Disques", value: "Acier + gaine TPU" },
      { label: "Dimensions", value: "42 × 21 × 23 cm" },
      { label: "Support", value: "Berceau inclus" },
      { label: "Garantie", value: "2 ans" },
    ],
    steps: [
      { title: "Choisissez votre pack", text: "1 haltère, la paire ou deux paires." },
      { title: "Remplissez le formulaire", text: "Nom, téléphone et ville, c'est tout." },
      { title: "Confirmation par téléphone", text: "Un conseiller vous appelle sous 24h." },
      { title: "Payez à la livraison", text: "Vous vérifiez le colis avant de payer." },
    ],
    bundles: [
      { qty: 1, label: "1 haltère", price: 1290 },
      { qty: 2, label: "La paire", price: 2390, badge: "Le plus choisi" },
      { qty: 4, label: "2 paires", price: 4490, badge: "-34%" },
    ],
    copy: {
      name: "Ironix X24",
      tagline: "Toute une salle de musculation dans une paire d'haltères.",
      description:
        "Votre corps change, votre matériel aussi. Avec Ironix X24, passez de 2 à 24 kg d'un simple tour de molette et entraînez-vous chez vous, sans abonnement, aussi souvent que vous le voulez.",
      benefits: [
        "Entraînement perso : un programme à votre rythme, à la maison.",
        "Prise de masse : des charges progressives jusqu'à 24 kg.",
        "Cardio & HIIT : des charges légères pour brûler plus.",
      ],
      features: [
        {
          icon: "",
          title: "15 haltères en un",
          text: "Remplace tout un rack d'haltères et libère de la place chez vous.",
        },
        {
          icon: "",
          title: "Réglage en 2 secondes",
          text: "Tournez la molette, le poids est verrouillé : aucune vis, aucun disque à manipuler.",
        },
        {
          icon: "",
          title: "Programmes inclus",
          text: "Des séances guidées pour perdre du poids, se muscler ou se tonifier.",
        },
        {
          icon: "",
          title: "Acier robuste",
          text: "Disques en acier gainés : silencieux et sans danger pour vos sols.",
        },
      ],
      reviews: [
        "Super haltères ! Le réglage est vraiment rapide et ça prend très peu de place dans l'appartement. Je m'entraîne tous les jours.",
        "Livraison en 48h à Casablanca, j'ai payé à la réception. Qualité top, la poignée est très agréable.",
        "J'ai annulé mon abonnement de salle. Avec la paire je fais tous mes exercices à la maison.",
      ],
    },
  }),
};
export default d;
