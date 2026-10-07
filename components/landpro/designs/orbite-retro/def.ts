// Design « Orbite Rétro » : rétro-futuriste crème, orange brûlé et brun foncé (mini projecteur rétro).
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "orbite-retro";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Orbite Rétro",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#f1e7d5",
      surface: "#ebdfca",
      surface2: "#e3d4bb",
      text: "#1f1a14",
      muted: "#6e604f",
      border: "#d9c9ad",
      primary: "#d4602a",
      primaryText: "#ffffff",
      accent: "#c9b083",
      radius: 22,
      font: "sans",
      heading: "condensed",
      headingWeight: 700,
    }),
    hero: {
      variant: "design",
      eyebrow: "Un projecteur rétro pour un",
      title: "Ciné partout.",
      subtitle:
        "Kinéo Orbit transforme n'importe quel mur en grand écran : une image chaleureuse, un son enveloppant et un style vintage qui ne passe pas inaperçu.",
    },
    titles: {
      story: "À propos",
      stats: "En chiffres",
      features: "Fonctions",
      specs: "Performances",
      how: "Comment commander",
      showcase: "Séances à la une",
      reviews: "Ils en parlent",
      order: "Commander votre Kinéo",
      faq: "Questions fréquentes",
    },
    sections: ["story", "stats", "features", "specs", "how", "showcase", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Projecteur",
    price: 899,
    oldPrice: 1290,
    images: [
      img("hero"),
      img("work-1"),
      img("work-2"),
      img("work-3"),
      img("work-4"),
      img("work-5"),
      img("story"),
      img("arch"),
      img("product"),
    ],
    imageLabels: [
      "Kinéo Orbit",
      "Ciné sur le toit · Soirée plein air",
      "Mode rétro · Rendu pellicule",
      "Orbite · Projection au plafond",
      "Portail · Écran jusqu'à 150″",
      "Nexus · Connexion sans fil",
    ],
    stats: [
      { value: "150″", label: "Image maximale" },
      { value: "4h+", label: "D'autonomie vidéo" },
      { value: "1,2 kg", label: "Léger, toujours avec vous" },
    ],
    specs: [
      { label: "Luminosité", value: "95%" },
      { label: "Netteté de l'image", value: "90%" },
      { label: "Qualité du son", value: "85%" },
      { label: "Autonomie", value: "80%" },
      { label: "Portabilité", value: "98%" },
    ],
    bundles: [
      { qty: 1, label: "1 projecteur", price: 899 },
      { qty: 2, label: "2 projecteurs", price: 1690, badge: "Le plus choisi" },
      { qty: 3, label: "Pack famille (3)", price: 2390, badge: "-38%" },
    ],
    variants: [
      { name: "Crème & cuir brun", color: "#e8dbc1" },
      { name: "Noir & cuir caramel", color: "#2a2420" },
    ],
    copy: {
      name: "Kinéo Orbit",
      tagline: "Kinéo Orbit, le cinéma rétro qui tient dans vos mains.",
      description:
        "Né d'une passion pour les vieux projecteurs de famille, Kinéo Orbit allie un design vintage à la technologie d'aujourd'hui : image nette, son stéréo et batterie intégrée pour vos soirées ciné, partout.",
      benefits: [
        "Grand écran partout : Jusqu'à 150 pouces sur un simple mur.",
        "Style vintage : Un objet déco qui se remarque.",
        "Sans fil : Votre téléphone se connecte en un geste.",
      ],
      features: [
        {
          icon: "",
          title: "Mode ciné rétro",
          text: "Un rendu chaleureux façon pellicule, pour vos films et vos souvenirs.",
        },
        { icon: "", title: "Projection plafond", text: "Inclinez l'objectif et regardez vos films allongé." },
        {
          icon: "",
          title: "Connexion sans fil",
          text: "Wi-Fi et Bluetooth : votre téléphone se connecte en un geste.",
        },
        { icon: "", title: "Mise au point auto", text: "Une image nette en une seconde, sans réglage." },
      ],
      reviews: [
        "Le plus bel objet de mon salon. L'image est superbe et le son me suffit largement. Les soirées ciné en famille ont changé.",
        "Livré en 48h à Casablanca, payé à la réception. On l'emporte partout, même au camping !",
        "Rapide à installer, image nette et un style rétro magnifique. Tout le monde me demande où je l'ai trouvé.",
      ],
    },
  }),
};
export default d;
