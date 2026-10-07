// Design « Gander Orange » : agence noire et orange, halo, casque-visière, chiffres en police pixel.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "gander-orange";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Halo Orange",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#000000",
      surface: "#0b0b0c",
      surface2: "#141416",
      text: "#ffffff",
      muted: "#8d8d92",
      border: "#1f1f22",
      primary: "#ff5a1f",
      primaryText: "#ffffff",
      accent: "#ff5a1f",
      radius: 24,
      font: "sans",
      heading: "sans",
      headingWeight: 500,
    }),
    hero: {
      variant: "design",
      eyebrow: "Nouvelle génération",
      title: "Entrez dans >360° de réalité",
      highlight: ">360°",
      subtitle:
        "Vyzor One est un casque immersif tout-en-un : visière 4K et audio spatial intégré, pensé pour jouer, regarder et créer.",
    },
    titles: {
      stats: "Livré partout au Maroc, payé à la réception",
      benefits: "Plus de 12 h d'autonomie",
      showcase: "Sous tous les angles",
      features: "Ce qui le rend unique",
      offers: "Choisissez votre pack",
      reviews: "Ils l'ont adopté",
      order: "Commander votre casque",
      faq: "Questions fréquentes",
    },
    sections: ["stats", "benefits", "showcase", "features", "offers", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Casque VR",
    price: 1890,
    oldPrice: 2390,
    // 0 portrait détouré (hero) · 1 face · 2 profil · 3 vue 3/4
    images: [img("hero"), img("front"), img("side"), img("top")],
    imageLabels: ["Portrait", "Face", "Profil", "Dessus"],
    stats: [
      { value: "900+", label: "Clients au Maroc" },
      { value: "86+", label: "Jeux & apps inclus" },
      { value: "98%", label: "Avis positifs" },
      { value: "120°", label: "Champ de vision" },
    ],
    specs: [
      { label: "Écran", value: "Micro-OLED 4K par œil" },
      { label: "Champ de vision", value: "120°" },
      { label: "Audio", value: "Spatial 360°, écouteurs intégrés" },
      { label: "Autonomie", value: "12 heures" },
      { label: "Poids", value: "480 g" },
    ],
    bundles: [
      { qty: 1, label: "1 casque", price: 1890 },
      { qty: 2, label: "Pack duo", price: 3490, badge: "Le plus choisi" },
      { qty: 3, label: "Pack famille", price: 4990, badge: "-30%" },
    ],
    variants: [
      { name: "Noir Halo", color: "#ff5a1f" },
      { name: "Noir Total", color: "#2a2a2e" },
      { name: "Blanc Lunaire", color: "#e9e6e1" },
    ],
    copy: {
      name: "Vyzor One",
      tagline: "L'immersion totale, livrée chez vous.",
      description:
        "Nous concevons un casque immersif exigeant, passionné par chaque détail : une image nette, un son qui vous entoure et un confort pensé pour des heures de jeu.",
      benefits: [
        "Audio spatial : Son 3D intégré",
        "Écran 4K : Net à chaque image",
        "Confort : Mousse à mémoire",
        "12 h : D'autonomie",
        "Sans fil : Bluetooth 5.3",
        "Pliable : Étui offert",
      ],
      features: [
        {
          icon: "",
          title: "Visière Micro-OLED 4K",
          text: "Des noirs profonds et des couleurs vives sur un champ de vision de 120°.",
        },
        {
          icon: "",
          title: "Audio spatial intégré",
          text: "Les écouteurs orange vous plongent dans un son 360° sans câble ni casque en plus.",
        },
        {
          icon: "",
          title: "Suivi des mouvements",
          text: "Capteurs intégrés : la scène suit chaque mouvement de tête sans latence.",
        },
        {
          icon: "",
          title: "Confort longue durée",
          text: "Mousse à mémoire de forme et arceau réglable, même après plusieurs heures.",
        },
      ],
      reviews: [
        "L'image est incroyable et le son est vraiment autour de moi. Livré à Casablanca en 2 jours, payé à la réception.",
        "Très confortable, je joue des heures sans gêne. Le design orange attire tous les regards.",
        "Je l'ai offert à mon fils, il ne le quitte plus. Service client au top.",
      ],
      faq: [
        {
          q: "Faut-il un téléphone ou une console ?",
          a: "Non, le casque fonctionne seul. Vous pouvez aussi le connecter à votre téléphone ou PC en Bluetooth.",
        },
        { q: "Comment se passe le paiement ?", a: "Vous payez à la livraison, après avoir vérifié votre colis." },
        {
          q: "Quel est le délai de livraison ?",
          a: "24 à 48h dans les grandes villes, 2 à 4 jours ailleurs au Maroc.",
        },
        { q: "Puis-je l'échanger ?", a: "Oui, vous avez 7 jours pour l'échanger ou le retourner." },
      ],
    },
  }),
};
export default d;
