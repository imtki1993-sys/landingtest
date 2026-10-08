// Design « Vélo Vitesse » : vélo de route carbone, éditorial gris clair, noir et rouge,
// grand titre large, traînées de vent, sections numérotées 01 / 02 / 03.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "velo-vitesse";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Vélo Vitesse",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#efeff0",
      surface: "#e7e7e9",
      surface2: "#dededf",
      text: "#141416",
      muted: "#5f6066",
      border: "#d4d4d7",
      primary: "#c8231e",
      primaryText: "#ffffff",
      accent: "#141416",
      radius: 4,
      font: "sans",
      heading: "sans",
      headingWeight: 600,
    }),
    hero: {
      variant: "design",
      eyebrow: "La vitesse vient de l'intérieur",
      title: "Roulez au-delà",
      subtitle:
        "Ingénierie, performance et passion en parfaite harmonie. Un vélo de route carbone conçu pour aller plus vite, plus loin.",
    },
    titles: {
      story: "Technologie",
      final_cta: "Plus loin, ensemble",
      specs: "Fiche technique",
      variants: "Choisissez votre finition",
      reviews: "Ils roulent avec nous",
      order: "Commander votre vélo",
      faq: "Questions fréquentes",
    },
    sections: ["stats", "story", "final_cta", "specs", "variants", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Vélo de route",
    price: 24900,
    oldPrice: 29900,
    images: [
      img("hero"),
      img("frame"),
      img("thumb"),
      img("mountain"),
      img("bike-carbon"),
      img("bike-rouge"),
      img("bike-blanc"),
    ],
    imageLabels: ["", "", "Aérodynamique pour les vraies routes"],
    stats: [
      { value: "6,8 kg", label: "Vélo complet" },
      { value: "24", label: "Vitesses" },
      { value: "1 but", label: "Aller plus vite" },
    ],
    specs: [
      { label: "Cadre", value: "Carbone haut module, profil aéro" },
      { label: "Fourche", value: "Carbone monocoque, pivot conique" },
      { label: "Transmission", value: "2 × 12 vitesses, pédalier 52/36" },
      { label: "Freins", value: "Disques hydrauliques 160 / 140 mm" },
      { label: "Roues", value: "Carbone 50 mm, pneus 28 mm" },
      { label: "Poids", value: "6,8 kg (taille M)" },
    ],
    bundles: [
      { qty: 1, label: "Vélo seul", price: 24900 },
      { qty: 2, label: "2 vélos (duo)", price: 46900, badge: "-2 900 DH" },
    ],
    variants: [
      { name: "Noir carbone", color: "#16161a" },
      { name: "Rouge course", color: "#b51f1a" },
      { name: "Blanc glacier", color: "#e9e9ec" },
    ],
    copy: {
      name: "Velaro Aero",
      tagline: "L'air dans notre ADN",
      description:
        "Chaque courbe, chaque détail, chaque gramme. Conçu avec un seul objectif : transformer votre effort en vitesse.",
      benefits: [
        "Aérodynamique : Profils de tubes dessinés en soufflerie.",
        "Légèreté : Cadre carbone haut module de 890 g.",
        "Rigidité : Chaque watt transmis à la route.",
        "Confort : Pneus 28 mm pour les longues sorties.",
      ],
      features: [
        { icon: "", title: "Plus léger", text: "Cadre carbone de 890 g" },
        { icon: "", title: "Plus rapide", text: "Tubes profilés en soufflerie" },
        { icon: "", title: "Plus solide", text: "Carbone haut module" },
        { icon: "", title: "Ensemble", text: "Pensé pour rouler en groupe" },
      ],
      reviews: [
        "Livré monté et réglé à Casablanca, payé à la réception. Je gagne 2 km/h de moyenne sur mes sorties.",
        "Très rigide en montée et stable en descente. La finition carbone est superbe.",
        "Léger, nerveux et confortable sur 120 km. Le service client m'a aidé à choisir la taille.",
      ],
      faq: [
        {
          q: "Quelle taille choisir ?",
          a: "Indiquez votre taille au téléphone lors de la confirmation : nous vous conseillons entre S, M, L et XL.",
        },
        { q: "Comment se passe le paiement ?", a: "Vous payez à la livraison, après avoir vérifié votre vélo." },
        { q: "Le vélo arrive-t-il monté ?", a: "Oui, il est livré monté et réglé, prêt à rouler." },
        {
          q: "Quel est le délai de livraison ?",
          a: "24 à 48h dans les grandes villes, 2 à 4 jours ailleurs au Maroc.",
        },
      ],
    },
  }),
};
export default d;
