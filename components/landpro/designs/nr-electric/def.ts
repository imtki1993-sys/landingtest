// Design « NR Electric » : affiche studio gris clair, moto électrique blanche et noire, typographie fine très espacée.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "nr-electric";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Moto Électrique",
    category: "Premium",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#e6e6e9",
      surface: "#dcdce0",
      surface2: "#d2d3d8",
      text: "#141518",
      muted: "#5f6168",
      border: "#c9cad0",
      primary: "#141518",
      primaryText: "#ffffff",
      accent: "#141518",
      radius: 12,
      font: "sans",
      heading: "sans",
      headingWeight: 300,
    }),
    hero: {
      variant: "design",
      eyebrow: "Mobilité nouvelle génération",
      title: "Moto électrique",
      highlight: "l'au-delà",
      subtitle: "Conçue pour l'au-delà.",
    },
    titles: {
      showcase: "Vues",
      specs: "Fiche technique",
      offers: "Choisissez votre pack",
      order: "Réserver votre moto",
      faq: "Questions fréquentes",
      final_cta: "Au-delà des limites.",
    },
    sections: ["features", "showcase", "specs", "offers", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Mobilité électrique",
    price: 38900,
    oldPrice: 42900,
    images: [img("hero"), img("view-front"), img("view-side"), img("view-rear"), img("view-top")],
    imageLabels: ["Face", "Profil", "Arrière", "Dessus"],
    specs: [
      { label: "Moteur", value: "Moyeu central 8 kW (pointe 11 kW)" },
      { label: "Autonomie", value: "Jusqu'à 140 km" },
      { label: "Vitesse max.", value: "95 km/h" },
      { label: "Batterie", value: "72 V · 4,2 kWh amovible" },
      { label: "Recharge", value: "0 à 80 % en 2 h 30" },
      { label: "Poids", value: "118 kg" },
      { label: "Freinage", value: "Disques 4 pistons + ABS" },
      { label: "Garantie", value: "2 ans · batterie 3 ans" },
    ],
    bundles: [
      { qty: 1, label: "Moto seule", price: 38900 },
      { qty: 2, label: "Duo · 2 motos", price: 74900, badge: "-4 000 DH" },
      { qty: 3, label: "Flotte · 3 motos", price: 109900, badge: "Pro" },
    ],
    copy: {
      name: "Nova Ride",
      tagline: "Silencieuse, rapide, 100 % électrique.",
      description: "Silencieuse. Agile. Électrique. Partout.",
      benefits: [],
      features: [
        { icon: "", title: "Moteur Quantum", text: "Silencieux. Instantané. Sans limite." },
        { icon: "", title: "Batterie solide", text: "Ultra-dense. Ignifugée. Des semaines d'autonomie." },
        { icon: "", title: "Assistance IA", text: "Apprend. S'adapte. Protège." },
        { icon: "", title: "Suspension adaptative", text: "Tous terrains. Équilibre parfait." },
        { icon: "", title: "Sécurité neurale", text: "Vision 360°. Protection active." },
        { icon: "", title: "Design modulaire", text: "Personnalisez. Évoluez." },
      ],
      reviews: [
        "Silencieuse et puissante, je traverse Casablanca sans bruit et sans essence.",
        "Finitions impeccables, livraison et essai à domicile, paiement à la réception.",
        "La recharge à la maison change tout. Je ne reviendrai pas au thermique.",
      ],
      faq: [
        {
          q: "Faut-il un permis pour la conduire ?",
          a: "Oui, un permis moto A1 ou A est nécessaire selon la version (bridée 45 km/h disponible sur demande).",
        },
        {
          q: "Comment se passe le paiement ?",
          a: "Vous réservez avec le formulaire, notre conseiller vous appelle, puis vous payez à la livraison après vérification.",
        },
        {
          q: "Où recharger la batterie ?",
          a: "Sur une prise domestique 220 V : la batterie est amovible et se recharge chez vous ou au bureau.",
        },
        {
          q: "Quel est le délai de livraison ?",
          a: "5 à 10 jours partout au Maroc, livraison et mise en route à domicile.",
        },
      ],
    },
  }),
};
export default d;
