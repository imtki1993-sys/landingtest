// Design « Arctic Puffer » : doudounes grand froid, bleu acier, titres condensés, textes mono entre crochets.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "arctic-puffer";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Arctic Puffer",
    category: "Mode",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#5d7a95",
      surface: "#6a87a1",
      surface2: "#4f6b86",
      text: "#ffffff",
      muted: "#d2deea",
      border: "#8aa3bb",
      primary: "#ffffff",
      primaryText: "#33506b",
      accent: "#cfe0ef",
      radius: 4,
      font: "grotesk",
      heading: "condensed",
      headingWeight: 700,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Série : Stasis MK.I · Hiver 26",
      title: "Collection Arctic 01™",
      subtitle:
        "Doudoune matelassée grand froid, garnissage duvet et coupe oversize. Paiement à la livraison partout au Maroc.",
    },
    titles: {
      variants: "Nouvelle collection",
      features: "Conçue pour le froid extrême",
      reviews: "Ils la portent",
      order: "Commander votre doudoune",
      faq: "Questions fréquentes",
    },
    sections: ["variants", "features", "reviews", "order", "faq", "final_cta"],
  },
  demo: demoProduct({
    category: "Doudoune",
    price: 899,
    oldPrice: 1199,
    images: [
      img("hero"),
      img("side-helmet"),
      img("side-close"),
      img("aurora"),
      img("look-glacier"),
      img("look-orbit"),
      img("look-stealth"),
      img("look-polar"),
      img("look-navy"),
      img("look-icefield"),
      img("look-creme"),
      img("look-gris"),
    ],
    specs: [
      { label: "Tailles", value: "S · M · L · XL" },
      { label: "Type", value: "Doudoune matelassée" },
      { label: "Garnissage", value: "Duvet 90/10" },
      { label: "Confort", value: "Jusqu'à -25 °C" },
    ],
    bundles: [
      { qty: 1, label: "1 doudoune", price: 899 },
      { qty: 2, label: "2 doudounes", price: 1690, badge: "-6%" },
    ],
    variants: [
      { name: "Glacier Blanc", color: "#eef1f4" },
      { name: "Orbit Argent", color: "#c9d2dc" },
      { name: "Stealth Noir", color: "#1f2733" },
      { name: "Polar Glace", color: "#a9c4dc" },
      { name: "Nuit Marine", color: "#1e2f4d" },
      { name: "Icefield Bleu", color: "#5f86b0" },
      { name: "Polar Crème", color: "#ece3d3" },
      { name: "Brume Grise", color: "#b8bfc7" },
    ],
    copy: {
      name: "KRYO Aurora",
      tagline: "Collection Arctic 01™",
      description:
        "La doudoune KRYO Aurora est pensée pour les hivers les plus rudes : boudins de duvet généreux, col montant, capuche enveloppante et tissu déperlant. Chaude, légère, et taillée oversize.",
      benefits: [
        "Chaleur extrême : Garnissage duvet 90/10 jusqu'à -25 °C.",
        "Déperlante : Tissu traité contre la neige et la pluie fine.",
        "Coupe oversize : Volume généreux, se porte sur un sweat.",
      ],
      features: [
        { icon: "", title: "Duvet 90/10", text: "Un gonflant maximal pour garder la chaleur sans le poids." },
        { icon: "", title: "Tissu déperlant", text: "La neige et la pluie fine glissent sur la surface." },
        { icon: "", title: "Col montant", text: "Col haut et capuche enveloppante contre le vent." },
        { icon: "", title: "Poches zippées", text: "Poches chaudes doublées et poche intérieure sécurisée." },
      ],
      reviews: [
        "Ultra chaude, je l'ai portée à Ifrane par -8 °C sans avoir froid. Le volume est exactement comme sur la photo.",
        "Livrée en 48h, j'ai payé à la réception. La couleur argent est encore plus belle en vrai.",
        "Coupe oversize parfaite, je prends un M et ça tombe très bien sur un sweat.",
      ],
    },
  }),
};
export default d;
