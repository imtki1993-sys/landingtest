// Textes communs aux templates de boutique (FR / AR), complétés par chaque template.
import type { SxBlock, SxSectionType } from "./types";

type Blocks = Partial<Record<SxSectionType, SxBlock>>;

export const SHARED_FR: Blocks = {
  trust: {
    items: [
      { title: "Livraison partout au Maroc", text: "Expédition rapide dans toutes les villes" },
      { title: "Paiement à la livraison", text: "Vous payez à la réception" },
      { title: "Échange facile", text: "Un souci ? On trouve une solution" },
      { title: "Service client", text: "Réponse rapide sur WhatsApp" },
    ],
  },
  stats: {
    title: "Une boutique pensée pour vous",
    items: [
      { value: "{products}", title: "Produits disponibles" },
      { value: "{categories}", title: "Catégories" },
      { value: "100%", title: "Paiement à la livraison" },
    ],
  },
  testimonials: {
    eyebrow: "Avis clients",
    title: "Ce que disent nos clients",
    items: [
      { title: "Prénom du client · Ville", text: "Ajoutez ici un vrai avis client depuis l'éditeur de la boutique." },
      { title: "Prénom du client · Ville", text: "Ajoutez ici un vrai avis client depuis l'éditeur de la boutique." },
      { title: "Prénom du client · Ville", text: "Ajoutez ici un vrai avis client depuis l'éditeur de la boutique." },
    ],
  },
  newsletter: {
    title: "Une question avant de commander ?",
    text: "Notre équipe vous répond rapidement et vous aide à choisir.",
    button: "Nous contacter",
  },
  faq: { eyebrow: "FAQ", title: "Questions fréquentes" },
  map: {
    eyebrow: "Nous trouver",
    title: "Venez nous rendre visite",
    text: "Retrouvez-nous à cette adresse ou contactez-nous sur WhatsApp avant de passer.",
    button: "Itinéraire",
  },
  categories: { title: "Acheter par catégorie" },
  products: {},
  catalog: { title: "Tous les produits" },
  deals: { eyebrow: "Offres du jour", title: "Les bonnes affaires du jour", button: "Commander" },
  mosaic: {
    items: [
      { value: "Nouveau", title: "Les nouveautés", text: "Découvrez les derniers arrivages.", image: "" },
      { value: "Sélection", title: "Nos coups de cœur", text: "Les produits que nos clients préfèrent.", image: "" },
      { value: "Offre", title: "Petits prix", text: "Des produits utiles à prix doux.", image: "" },
    ],
  },
  specs: {
    title: "En bref",
    items: [
      { title: "Livraison", value: "Partout au Maroc" },
      { title: "Paiement", value: "À la livraison" },
      { title: "Échange", value: "Facile" },
      { title: "Service client", value: "WhatsApp" },
    ],
  },
  gallery: { title: "Nos produits en images", text: "Un aperçu de la boutique." },
  zigzag: {
    title: "Caractéristiques",
    button: "Acheter ce modèle",
    items: [
      {
        title: "Des finitions soignées",
        text: "Chaque produit est vérifié avant l'envoi : coutures, matières et détails.",
        image: "",
      },
      {
        title: "Confort au quotidien",
        text: "Des matières choisies pour durer et rester agréables jour après jour.",
        image: "",
      },
      { title: "Un style qui dure", text: "Des lignes simples et des couleurs faciles à porter avec tout.", image: "" },
    ],
  },
  welcome: {
    eyebrow: "Bienvenue chez",
    title: "",
    text: "Nous sélectionnons des produits de qualité et nous les livrons partout au Maroc. Vous payez à la réception.",
    button: "En savoir plus",
    items: [
      {
        title: "Commandez",
        value: "sur WhatsApp",
        text: "Envoyez-nous la référence du produit qui vous plaît : nous confirmons la taille, la couleur et la livraison.",
      },
    ],
  },
  shelf: {
    title: "Catégories de produits",
    text: "Des produits choisis avec soin, livrés partout au Maroc et payés à la livraison.",
  },
  filmstrip: { title: "", button: "Voir la vidéo", url: "" },
  coverflow: { title: "", button: "Voir le produit" },
};

export const SHARED_AR: Blocks = {
  trust: {
    items: [
      { title: "التوصيل لجميع المدن", text: "شحن سريع لكل مدن المغرب" },
      { title: "الدفع عند الاستلام", text: "خلص ملي توصلك السلعة" },
      { title: "تبديل سهل", text: "إلا كان شي مشكل كنلقاو الحل" },
      { title: "خدمة الزبناء", text: "جواب سريع فواتساب" },
    ],
  },
  stats: {
    title: "متجر مصمم ليك",
    items: [
      { value: "{products}", title: "منتج متوفر" },
      { value: "{categories}", title: "تصنيفات" },
      { value: "100%", title: "الدفع عند الاستلام" },
    ],
  },
  testimonials: {
    eyebrow: "آراء الزبناء",
    title: "شنو كيقولو زبناءنا",
    items: [
      { title: "اسم الزبون · المدينة", text: "زيد هنا رأي حقيقي ديال زبون من محرر المتجر." },
      { title: "اسم الزبون · المدينة", text: "زيد هنا رأي حقيقي ديال زبون من محرر المتجر." },
      { title: "اسم الزبون · المدينة", text: "زيد هنا رأي حقيقي ديال زبون من محرر المتجر." },
    ],
  },
  newsletter: {
    title: "عندك سؤال قبل الطلب؟",
    text: "الفريق ديالنا كيجاوبك بسرعة وكيعاونك تختار.",
    button: "تواصل معنا",
  },
  faq: { eyebrow: "الأسئلة", title: "الأسئلة الشائعة" },
  map: {
    eyebrow: "فين تلقانا",
    title: "مرحبا بيك عندنا",
    text: "لقانا فهاد العنوان ولا تواصل معانا فواتساب قبل ما تجي.",
    button: "الطريق",
  },
  categories: { title: "تسوق حسب التصنيف" },
  products: {},
  catalog: { title: "جميع المنتجات" },
  deals: { eyebrow: "عروض اليوم", title: "همزات اليوم", button: "اطلب دابا" },
  mosaic: {
    items: [
      { value: "جديد", title: "الجديد عندنا", text: "اكتشف آخر السلعة اللي وصلات.", image: "" },
      { value: "اختيار", title: "اللي عجبونا", text: "المنتجات اللي كيبغيوها الزبناء.", image: "" },
      { value: "عرض", title: "أثمنة مزيانة", text: "منتجات مفيدة بثمن مناسب.", image: "" },
    ],
  },
  specs: {
    title: "باختصار",
    items: [
      { title: "التوصيل", value: "لجميع المدن" },
      { title: "الدفع", value: "عند الاستلام" },
      { title: "التبديل", value: "ساهل" },
      { title: "خدمة الزبناء", value: "واتساب" },
    ],
  },
  gallery: { title: "منتجاتنا بالصور", text: "نظرة على المتجر." },
  zigzag: {
    title: "المميزات",
    button: "شري هاد الموديل",
    items: [
      { title: "تشطيب متقن", text: "كل منتج كيتشاف قبل الإرسال: الخياطة، المواد والتفاصيل.", image: "" },
      { title: "راحة كل نهار", text: "مواد مختارة باش تدوم وتبقى مريحة.", image: "" },
      { title: "ستيل كيدوم", text: "خطوط بسيطة وألوان ساهلة تلبسها مع كلشي.", image: "" },
    ],
  },
  welcome: {
    eyebrow: "مرحبا بيك ف",
    title: "",
    text: "كنختارو منتجات ديال الجودة وكنوصلوها لجميع المدن. وكتخلص ملي توصلك.",
    button: "عرف كثر",
    items: [
      { title: "طلب", value: "فواتساب", text: "صيفط لينا المنتج اللي عجبك: كنأكدو معاك المقاس، اللون والتوصيل." },
    ],
  },
  shelf: {
    title: "تصنيفات المنتجات",
    text: "منتجات مختارة بعناية، التوصيل لجميع المدن والدفع عند الاستلام.",
  },
  filmstrip: { title: "", button: "شوف الفيديو", url: "" },
  coverflow: { title: "", button: "شوف المنتج" },
};

export const DEFAULT_FAQ = {
  fr: [
    {
      q: "Comment passer commande ?",
      a: "Ajoutez vos produits au panier puis remplissez le formulaire : nom, téléphone et ville.",
    },
    {
      q: "Comment se passe le paiement ?",
      a: "Vous payez en espèces à la livraison, au moment où vous recevez votre commande.",
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "Nous vous appelons pour confirmer la commande puis l'expédions dans votre ville.",
    },
  ],
  ar: [
    { q: "كيفاش ندير الطلب؟", a: "زيد المنتجات للسلة وعمر الاستمارة: الاسم، الهاتف والمدينة." },
    { q: "كيفاش كيكون الخلاص؟", a: "كتخلص كاش ملي كتوصلك الطلبية." },
    { q: "شحال كتاخد مدة التوصيل؟", a: "كنعيطو ليك باش نأكدو الطلب ومن بعد كنصيفطوه لمدينتك." },
  ],
};

/** Fusionne les blocs communs et ceux du template (le template l'emporte, champ par champ). */
export function withShared(shared: Blocks, own: Blocks): Blocks {
  const out: Blocks = { ...shared };
  for (const k of Object.keys(own) as SxSectionType[]) out[k] = { ...(shared[k] || {}), ...own[k] };
  return out;
}
