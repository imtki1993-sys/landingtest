// Design « Support magnétique » : fiche produit type A+ (bleu électrique sur fond nuit),
// pour un accessoire tech vendu à l'unité avec paiement à la livraison.
import type { DesignDef } from "../types";
import { darkTheme as D } from "../../theme";
import { asset, demoProduct } from "../demo-kit";

const ID = "support-magnetique";
const img = (n: string) => asset(ID, n);

const d: DesignDef = {
  def: {
    id: ID,
    name: "Support magnétique",
    category: "Tech",
    lang: "fr",
    demoProduct: "d-" + ID,
    theme: D({
      bg: "#04070d",
      surface: "#0a1220",
      surface2: "#0f1a2d",
      text: "#ffffff",
      muted: "#a9b8cc",
      border: "#1c3456",
      primary: "#1e8fff",
      primaryText: "#ffffff",
      accent: "#1e8fff",
      radius: 10,
      font: "display",
      heading: "display",
      headingWeight: 800,
    }),
    hero: {
      variant: "design",
      eyebrow: "Version améliorée",
      title: "360° Ventouse Magnétique Support téléphone voiture",
      highlight: "Magnétique",
      subtitle: "Tenue plus forte | Design plus malin | Plus de possibilités",
    },
    titles: {
      features: "Pensé pour la route",
      showcase: "Utilisable partout",
      specs: "Votre téléphone partout",
      reviews: "Ils roulent avec",
      order: "Commander votre support",
      faq: "Questions fréquentes",
    },
    sections: ["features", "showcase", "specs", "trust", "reviews", "order", "faq"],
  },
  demo: demoProduct({
    category: "Accessoire auto",
    price: 199,
    oldPrice: 299,
    images: [
      img("hero"),
      img("feat-suction"),
      img("feat-rotation"),
      img("feat-hold"),
      img("feat-pad"),
      img("use-dashboard"),
      img("use-windshield"),
      img("use-gym"),
      img("use-mirror"),
      img("use-shower"),
      img("phones"),
      img("ring"),
    ],
    imageLabels: ["Tableau de bord", "Pare-brise", "Salle de sport", "Miroir", "Douche", "Anneau métallique (inclus)"],
    specs: [
      {
        label: "Compatibilité universelle",
        value: "Fonctionne avec tous les téléphones magnétiques (avec l'anneau métallique) et les coques.",
      },
      { label: "Écrans", value: "4,7 à 7 pouces" },
      { label: "Rotation", value: "360°" },
      { label: "Aimants", value: "N52 renforcés" },
      { label: "Matière", value: "Alliage d'aluminium" },
    ],
    bundles: [
      { qty: 1, label: "1 support", price: 199 },
      { qty: 2, label: "2 supports", price: 349, badge: "Le plus choisi" },
      { qty: 3, label: "3 supports", price: 469, badge: "-22%" },
    ],
    copy: {
      name: "Magnéo Grip",
      tagline: "Collez. Fixez. Roulez !",
      description:
        "Support magnétique à ventouse sous vide : il tient sur le tableau de bord, le pare-brise, un miroir ou le carrelage, et tourne à 360° pour garder votre téléphone sous les yeux.",
      benefits: [
        "Maintien magnétique puissant : Le téléphone se fixe d'une main, en un clic.",
        "Base à ventouse : Adhérence sous vide, sans perçage.",
        "Rotation 360° : Portrait ou paysage, au bon angle.",
        "Compatibilité universelle : Tous les téléphones, avec anneau inclus.",
      ],
      features: [
        {
          icon: "",
          title: "Ventouse sous vide",
          text: "Adhérence très forte sur tableau de bord, pare-brise et surfaces lisses.",
        },
        { icon: "", title: "Rotation 360°", text: "Orientez votre téléphone sous l'angle parfait." },
        {
          icon: "",
          title: "Maintien magnétique",
          text: "Votre téléphone reste en place, même sur les routes abîmées.",
        },
        { icon: "", title: "Pastille adhésive", text: "Une stabilité en plus pour un usage durable." },
      ],
      reviews: [
        "Il ne bouge pas du tout, même sur les routes de montagne. Le GPS est toujours sous mes yeux.",
        "Je l'utilise dans la voiture et sur le miroir de la salle de bain. Livraison rapide, payé à la réception.",
        "La ventouse tient vraiment bien et l'aimant est très fort. Je recommande.",
      ],
    },
  }),
};
export default d;
