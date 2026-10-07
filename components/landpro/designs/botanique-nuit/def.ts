// Design « Botanique Nuit » : soins capillaires botaniques sur fond de forêt sombre et moussue.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "botanique-nuit";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Botanique Nuit",
    category: "Beauté",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#12170f",
      surface: "#1f251b",
      surface2: "#2a3125",
      text: "#ecebe2",
      muted: "#a9ab9b",
      border: "#343b2e",
      primary: "#6f7a3f",
      primaryText: "#f3f1e6",
      accent: "#b4bd8c",
      radius: 20,
      font: "sans",
      heading: "elegant",
      headingWeight: 400,
    }),
    hero: {
      variant: "design",
      eyebrow: "Chez Orée, nous croyons qu'une belle chevelure commence par l'équilibre.",
      title: "Ancrée dans la nature",
      subtitle:
        "Notre gamme capillaire botanique associe huiles végétales, actifs doux et science cosmétique moderne pour rendre force, douceur et brillance naturelle.",
    },
    titles: {
      variants: "Nos best-sellers",
      story: "Des soins inspirés par la nature",
      problem: "Une belle chevelure commence par l'équilibre. La nature connaît déjà la réponse.",
      features: "Des actifs guidés par la science",
      reviews: "Elles et ils en parlent",
      order: "Commander votre soin",
      faq: "Questions fréquentes",
    },
    sections: ["variants", "story", "problem", "features", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Soin capillaire",
    price: 189,
    oldPrice: 249,
    images: [img("hero"), img("serum"), img("oil"), img("mask"), img("shampoo"), img("story"), img("ingredients")],
    specs: [
      { label: "Contenance", value: "100 ml" },
      { label: "Type de cheveux", value: "Tous types" },
      { label: "Origine", value: "Actifs d'origine naturelle à 96 %" },
    ],
    bundles: [
      { qty: 1, label: "1 soin", price: 189 },
      { qty: 2, label: "2 soins", price: 339, badge: "Le plus choisi" },
      { qty: 3, label: "Rituel 3 soins", price: 459, badge: "-20%" },
    ],
    variants: [
      { name: "Sérum botanique cuir chevelu", color: "#7a3a12" },
      { name: "Huile botanique cheveux abîmés", color: "#a2541b" },
      { name: "Masque revitalisant botanique", color: "#5f6a3a" },
      { name: "Shampooing hydratant aux herbes", color: "#7d8f3f" },
    ],
    problem: {
      pains: ["Cuir chevelu déséquilibré", "Cheveux ternes et cassants", "Formules trop agressives"],
      solution:
        "Un mélange soigneusement choisi de vitamines et d'actifs botaniques, pensé pour la santé du cuir chevelu et la force du cheveu, de la racine aux pointes.",
    },
    copy: {
      name: "Orée",
      tagline:
        "Inspirée par la nature, pensée pour la vie moderne. Orée est née d'une idée simple : prendre soin de ses cheveux doit être calme, naturel et sans effort.",
      description:
        "Nos formules associent extraits botaniques, huiles végétales et actifs doux pour rééquilibrer le cuir chevelu et rendre au cheveu sa vitalité naturelle.",
      benefits: [
        "Origine naturelle : 96 % d'ingrédients d'origine naturelle",
        "Sans sulfates : Lavage doux, respect du cuir chevelu",
        "Flacons ambrés : Protègent les actifs de la lumière",
      ],
      features: [
        {
          icon: "",
          title: "Biotine",
          text: "Renforce la fibre et limite la casse. Améliore la structure du cheveu et sa vitalité.",
        },
        {
          icon: "",
          title: "Panthénol",
          text: "Hydrate tous les types de cheveux et retient l'humidité. Souplesse, élasticité et brillance.",
        },
        {
          icon: "",
          title: "Niacinamide",
          text: "Équilibre le cuir chevelu et crée un environnement plus sain, tout en fortifiant dès la racine.",
        },
        {
          icon: "",
          title: "Complexe botanique",
          text: "Extraits de plantes qui nourrissent le cuir chevelu et protègent le cheveu des agressions.",
        },
      ],
      reviews: [
        "Mes cheveux sont plus doux et brillants dès la deuxième semaine. L'odeur boisée est divine.",
        "Enfin un shampooing qui n'irrite pas mon cuir chevelu. Livraison rapide, payé à la réception.",
        "Le sérum a vraiment réduit ma chute de cheveux. Les flacons sont superbes dans ma salle de bain.",
      ],
    },
  }),
};
export default d;
