// Design « Yoga Néon » : studio de yoga, fond noir, lettres serif rose-violet néon.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "yoga-neon";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Yoga Néon",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#000000",
      surface: "#141016",
      surface2: "#1d1720",
      text: "#ffffff",
      muted: "#b9adc0",
      border: "#2f2533",
      primary: "#c84ee6",
      primaryText: "#ffffff",
      accent: "#f08cf6",
      radius: 24,
      font: "sans",
      heading: "serif",
      headingWeight: 600,
    }),
    hero: {
      variant: "design",
      eyebrow: "Le yoga, bien plus que du fitness",
      title: "Yoga",
      highlight: "Yoga",
      subtitle:
        "Le yoga, c'est la danse de chaque cellule sur la musique de chaque respiration : il crée le calme intérieur et l'harmonie",
    },
    titles: {
      benefits: "Le choix de nos clients",
      features: "Pourquoi c'est utile ?",
      reviews: "Ils pratiquent avec nous",
      order: "Réserver mon tapis",
      faq: "Questions fréquentes",
    },
    sections: ["benefits", "features", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Yoga",
    price: 349,
    oldPrice: 450,
    images: [img("hero"), img("pose-flow"), img("pose-split"), img("pose-dancer"), img("pose-reach")],
    specs: [
      { label: "Dimensions", value: "183 × 61 cm" },
      { label: "Épaisseur", value: "6 mm" },
      { label: "Matière", value: "TPE double couche antidérapant" },
      { label: "Poids", value: "1,1 kg avec sangle" },
    ],
    bundles: [
      { qty: 1, label: "1 tapis + sangle", price: 349 },
      { qty: 2, label: "2 tapis + sangles", price: 649, badge: "Duo" },
      { qty: 3, label: "Kit studio : 3 tapis", price: 899, badge: "-33%" },
    ],
    variants: [
      { name: "Lilas", color: "#b88ad0" },
      { name: "Prune", color: "#5b2a6e" },
      { name: "Noir", color: "#151216" },
      { name: "Rose poudré", color: "#e7a9c9" },
    ],
    copy: {
      name: "Pranaya",
      tagline: "Le tapis qui accompagne chaque respiration.",
      description:
        "Le tapis Pranaya est pensé pour toutes les pratiques : une adhérence parfaite même en sueur, un amorti de 6 mm pour les articulations et une sangle pour l'emporter au studio.",
      benefits: [
        "6 mm · Vinyasa : Pratique active et dynamique : l'adhérence reste totale, même quand on transpire.",
        "Grip · Hatha : Postures tenues longtemps, appuis stables pour renforcer le corps et le système nerveux.",
        "Confort · Yin yoga : Amorti moelleux pour les genoux et le dos pendant les postures au sol.",
        "Léger · Power yoga : Seulement 1,1 kg : roulé, attaché, il vous suit au studio comme au parc.",
      ],
      features: [
        { icon: "", title: "Harmonie intérieure", text: "Respirer, se poser" },
        { icon: "", title: "Moins de stress et d'anxiété", text: "Lâcher prise" },
        { icon: "", title: "Plus de souplesse", text: "Jour après jour" },
      ],
      reviews: [
        "Je pratique le vinyasa trois fois par semaine : plus aucune glissade, même en été. Livré en 48h, payé à la réception.",
        "Très confortable pour les genoux, et la couleur lilas est encore plus jolie en vrai.",
        "Léger, facile à rouler, il ne sent pas le plastique. Je l'emporte partout.",
      ],
      faq: [
        {
          q: "Le tapis glisse-t-il quand on transpire ?",
          a: "Non : la surface TPE double couche garde son adhérence, même pendant un vinyasa intense.",
        },
        {
          q: "Comment l'entretenir ?",
          a: "Un chiffon humide et un peu de savon doux suffisent. Laissez sécher à plat, à l'ombre.",
        },
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
