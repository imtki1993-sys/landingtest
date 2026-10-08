// Design « Cadran collector » : marchand de montres de collection, minimal noir et blanc,
// logo à esperluette, pièce à la une + diaporama sombre, grille « Nouveautés » sur fond gris clair.
import type { DesignDef } from "../types";
import { lightTheme as L } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "cadran-collector";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Cadran collector",
    category: "Premium",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: L({
      bg: "#ffffff",
      surface: "#f2f2f2",
      surface2: "#ebebeb",
      text: "#111111",
      muted: "#6f6f6f",
      border: "#e3e3e3",
      primary: "#000000",
      primaryText: "#ffffff",
      accent: "#111111",
      radius: 0,
      font: "sans",
      heading: "sans",
      headingWeight: 400,
    }),
    hero: {
      variant: "design",
      eyebrow: "Pièce à la une",
      title: "Meridian Cosmographe Réf. 6263 « Panda noir »",
      subtitle:
        "Acier inoxydable, lunette tachymétrique noire et mouvement automatique : le chronographe de collection par excellence.",
    },
    titles: {
      story: "La maison",
      variants: "Nouveautés",
      features: "Chaque pièce est livrée avec",
      specs: "Fiche technique",
      reviews: "Ils nous ont fait confiance",
      order: "Réserver cette pièce",
      faq: "Questions fréquentes",
      final_cta: "Commander",
    },
    sections: ["story", "variants", "features", "specs", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Montres",
    price: 3490,
    oldPrice: 4200,
    images: [
      img("hero-nuit"),
      img("featured"),
      img("w-squelette"),
      img("w-gmt-bleu-rouge"),
      img("w-pvd-reserve"),
      img("w-plongee-jaune"),
      img("w-panda"),
      img("w-vintage"),
      img("w-gmt-bleu-corail"),
      img("w-panda-inverse"),
      img("hero-reflet"),
      img("hero-macro"),
    ],
    specs: [
      { label: "Boîtier", value: "Acier 316L, 40 mm" },
      { label: "Mouvement", value: "Automatique, réserve 48 h" },
      { label: "Verre", value: "Saphir anti-reflets" },
      { label: "Étanchéité", value: "100 mètres" },
      { label: "Bracelet", value: "Acier massif, boucle déployante" },
      { label: "Garantie", value: "2 ans" },
    ],
    bundles: [
      { qty: 1, label: "1 montre", price: 3490 },
      { qty: 2, label: "2 montres", price: 6590, badge: "-300 DH" },
    ],
    variants: [
      { name: "Meridian Squelette Or Réf. 99 Phase de lune", color: "#c79a4a" },
      { name: "Meridian GMT Réf. 1675 Bleu & Rouge", color: "#24508f" },
      { name: "Meridian Grande Date Réf. 403 PVD Noir", color: "#1c1c1c" },
      { name: "Meridian Plongée 1000 m Réf. 430 Jaune", color: "#f2d21b" },
      { name: "Meridian Chronographe Réf. 3019 Tricolore", color: "#f4f4f2" },
      { name: "Meridian Télémètre Réf. 1948 Grains de riz", color: "#121212" },
      { name: "Meridian GMT Réf. 1675 Bleu & Corail", color: "#d89a7c" },
      { name: "Meridian Chronographe Réf. 7734 Panda inversé", color: "#111111" },
    ],
    copy: {
      name: "Aiguilles & Cadrans",
      tagline: "Sélectionnées pour les collectionneurs exigeants : des garde-temps d'exception, rien d'ordinaire.",
      description:
        "Des garde-temps choisis pour leur caractère et leur valeur. Chaque montre est contrôlée, réglée et livrée partout au Maroc.",
      benefits: [
        "Contrôlée : Chaque montre est vérifiée et réglée avant l'envoi.",
        "Livrée : Partout au Maroc en 24 à 72 h.",
        "Payée à la réception : Vous réglez après avoir vu votre montre.",
      ],
      features: [
        { icon: "", title: "Écrin d'origine", text: "Coffret en bois et coussin" },
        { icon: "", title: "Certificat", text: "Garantie internationale 2 ans" },
        { icon: "", title: "Verre saphir", text: "Inrayable, traité anti-reflets" },
        { icon: "", title: "Étanche 100 m", text: "Couronne vissée" },
      ],
      reviews: [
        "Montre conforme aux photos, finitions impeccables. Livrée en 48h à Rabat, j'ai payé à la réception.",
        "Le cadran est encore plus beau en vrai. L'écrin et le certificat étaient bien dans le colis.",
        "Service très sérieux, ils m'ont appelé pour confirmer le modèle avant l'envoi. Je recommande.",
      ],
    },
  }),
};
export default d;
