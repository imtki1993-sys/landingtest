// Design « Ironcore Lime » : salle de sport noire, accents vert citron, titres condensés.
// Produit de démo : haltères réglables connectés (fictifs) avec programmes d'entraînement inclus.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "ironcore-lime";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Ironcore Lime",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#0a0a0a",
      surface: "#141515",
      surface2: "#1b1c1c",
      text: "#f5f6f2",
      muted: "#a2a69c",
      border: "#2a2c2a",
      primary: "#b6f23a",
      primaryText: "#0b0b0b",
      accent: "#b6f23a",
      radius: 8,
      font: "sans",
      heading: "condensed",
      headingWeight: 700,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Plus fort chaque jour",
      title: "Forge ton meilleur corps",
      subtitle:
        "Transformez votre corps, gagnez en confiance et entraînez-vous chez vous avec des haltères réglables de 2,5 à 24 kg.",
    },
    titles: {
      benefits: "Entraîne-toi à ta façon",
      showcase: "L'appli coach incluse",
      specs: "En détail",
      offers: "Choisissez votre pack",
      reviews: "Ils s'entraînent avec nous",
      order: "Commander maintenant",
      faq: "Questions fréquentes",
      final_cta: "Prêt à commencer ?",
    },
    sections: ["benefits", "showcase", "offers", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Fitness",
    price: 1490,
    oldPrice: 1990,
    images: [
      img("hero"),
      img("prog-strength"),
      img("prog-fatloss"),
      img("prog-yoga"),
      img("prog-boxing"),
      img("coach-1"),
      img("coach-2"),
      img("product-pair"),
      img("product-dial"),
    ],
    imageLabels: ["", "", "", "", "", "Coach Karim · Force", "Coach Nadia · Mobilité", "La paire", "Molette rapide"],
    stats: [
      { value: "5000+", label: "Sportifs équipés" },
      { value: "75%", label: "Objectif de la semaine atteint" },
    ],
    specs: [
      { label: "Charge réglable", value: "2,5 à 24 kg" },
      { label: "Paliers", value: "15 réglages" },
      { label: "Changement de poids", value: "2 secondes" },
      { label: "Programmes vidéo", value: "4 inclus" },
    ],
    bundles: [
      { qty: 1, label: "1 haltère", price: 1490 },
      { qty: 2, label: "La paire", price: 2690, badge: "Le plus choisi" },
      { qty: 3, label: "Paire + support", price: 3390, badge: "-40%" },
    ],
    copy: {
      name: "IronVex Pro 24",
      tagline: "Une salle de sport complète dans 50 cm.",
      description:
        "IronVex Pro 24 remplace 15 paires d'haltères : tournez la molette, le poids change en 2 secondes. Avec 4 programmes vidéo guidés pour progresser chez vous, sans abonnement.",
      benefits: [
        "Musculation : Prenez du muscle et gagnez en force.",
        "Perte de poids : Brûlez des calories et affinez votre silhouette.",
        "Yoga & mobilité : Gagnez en souplesse et réduisez le stress.",
        "Boxe & HIIT : Des séances intenses pour un maximum de résultats.",
      ],
      features: [
        { icon: "", title: "Coachs experts", text: "Vidéos guidées pas à pas" },
        { icon: "", title: "Plan personnalisé", text: "Adapté à vos objectifs" },
        { icon: "", title: "Matériel solide", text: "Acier et finition anti-choc" },
        { icon: "", title: "Résultats visibles", text: "Suivez vos progrès" },
      ],
      reviews: [
        "J'ai rendu mon abonnement de salle. La molette est ultra rapide et les programmes sont bien faits.",
        "Solide, compact, ça tient sous le lit. Livré en 48h et payé à la réception.",
        "Je fais les séances perte de poids 4 fois par semaine, déjà 5 kg en moins.",
        "Le poids change en une seconde, parfait pour enchaîner les exercices.",
      ],
      faq: [
        { q: "Quelle est la charge maximale ?", a: "Chaque haltère se règle de 2,5 à 24 kg en 15 paliers." },
        { q: "Les programmes sont-ils inclus ?", a: "Oui, les 4 programmes vidéo sont inclus, sans abonnement." },
        { q: "Comment se passe le paiement ?", a: "Vous payez à la livraison, après avoir vérifié votre colis." },
        {
          q: "Quel est le délai de livraison ?",
          a: "24 à 48h dans les grandes villes, 2 à 4 jours ailleurs au Maroc.",
        },
      ],
    },
  }),
};
export default d;
