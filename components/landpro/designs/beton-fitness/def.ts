// Design « Béton Fitness » : salle brute en béton, cadre orange, fumée, titre condensé usé.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "beton-fitness";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Béton Fitness",
    category: "Sport",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#141517",
      surface: "#1c1d20",
      surface2: "#26272b",
      text: "#ececea",
      muted: "#9b9c9f",
      border: "#2f3034",
      primary: "#f07a1a",
      primaryText: "#ffffff",
      accent: "#f07a1a",
      radius: 2,
      font: "sans",
      heading: "condensed",
      headingWeight: 700,
      uppercaseHeadings: true,
    }),
    hero: {
      variant: "design",
      eyebrow: "Le matériel des salles pro, chez vous",
      title: "Zéro excuse. Que des résultats.",
      subtitle:
        "Une barre olympique de 20 kg et des disques bumper pensés pour encaisser chaque séance, chaque chute et chaque record. Montez votre coin musculation en quelques minutes.",
    },
    titles: {
      features: "Forgé pour durer",
      showcase: "Le kit en détail",
      story: "Pas de raccourci",
      offers: "Choisissez votre charge",
      reviews: "Ils soulèvent avec nous",
      order: "Commander mon kit",
      faq: "Questions fréquentes",
    },
    sections: ["features", "showcase", "story", "offers", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Musculation",
    price: 3490,
    oldPrice: 4290,
    images: [img("hero"), img("kit"), img("plates"), img("sleeve"), img("flatlay")],
    imageLabels: ["La scène", "Kit complet", "Disques bumper", "Manchon et collier", "Vue d'ensemble"],
    specs: [
      { label: "Barre", value: "Olympique 20 kg · 220 cm · Ø 28 mm" },
      { label: "Disques", value: "2 × 25 kg + 2 × 10 kg + 2 × 5 kg" },
      { label: "Charge maximale", value: "300 kg" },
      { label: "Matière", value: "Acier traité + caoutchouc haute densité" },
    ],
    bundles: [
      { qty: 1, label: "Kit 100 kg", price: 3490 },
      { qty: 2, label: "Kit 100 kg + 2 colliers pro", price: 3790, badge: "Le plus choisi" },
      { qty: 3, label: "Kit 140 kg complet", price: 4690, badge: "Meilleure offre" },
    ],
    stats: [
      { value: "300 kg", label: "Charge maximale" },
      { value: "20 kg", label: "Barre olympique" },
      { value: "7 j", label: "Pour changer d'avis" },
    ],
    copy: {
      name: "FORGEX Fitness",
      tagline: "Pas d'excuse, pas de raccourci : juste la barre et vous.",
      description:
        "Le kit FORGEX réunit une barre olympique en acier traité, des disques bumper en caoutchouc haute densité et deux colliers à serrage rapide. Le même matériel que dans les salles de force, prêt à l'emploi chez vous, sans abîmer votre sol.",
      benefits: [
        "Sol protégé : le caoutchouc amortit chaque reposé de barre.",
        "Progression : ajoutez des disques au rythme de vos records.",
        "Silence : des disques qui ne claquent pas sur le béton.",
      ],
      features: [
        { icon: "", title: "Acier traité", text: "Barre de 20 kg, moletage précis, roulements fluides." },
        { icon: "", title: "Bumper haute densité", text: "Disques en caoutchouc qui encaissent les chutes." },
        { icon: "", title: "Colliers rapides", text: "Serrage en une seconde, aucun jeu pendant le lift." },
        { icon: "", title: "300 kg de charge", text: "Testée pour le soulevé de terre et le squat lourds." },
      ],
      reviews: [
        "Barre très solide, le moletage accroche bien. J'ai monté mon garage gym en une soirée.",
        "Les disques ne font presque pas de bruit sur le sol. Livré à Casa en 48h, payé à la réception.",
        "Rapport qualité-prix imbattable. J'ai déjà battu mon record au soulevé de terre.",
      ],
    },
  }),
};
export default d;
