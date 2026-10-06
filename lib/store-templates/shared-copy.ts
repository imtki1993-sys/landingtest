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
  categories: { title: "Acheter par catégorie" },
  products: {},
  catalog: { title: "Tous les produits" },
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
  categories: { title: "تسوق حسب التصنيف" },
  products: {},
  catalog: { title: "جميع المنتجات" },
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
