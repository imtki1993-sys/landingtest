// ─────────────────────────────────────────────────────────────
// Modèle de rendu : transforme les données d'une page (LandingV4Data +
// content/ai_content) en un objet prêt à afficher par les templates.
// Toute la logique « quel champ du contenu alimente quelle section »
// est ici. En mode démo (galerie, aperçu avant création), les champs
// vides sont complétés avec le produit de démonstration du template.
// ─────────────────────────────────────────────────────────────
import type { LandingV4Data, SectionKey, TemplateDef } from "./types";
import { CORE_SECTIONS, LANDPRO_SECTIONS } from "./types";
import { defaultSectionOrder, getTemplate, SECTION_LABELS } from "./registry";
import { getDemoProduct } from "./demo-products";
import { ui, type UI } from "./i18n";

export interface Item {
  icon: string;
  title: string;
  text: string;
}
export interface Offer {
  qty: number;
  price: number;
  label: string;
  badge?: string;
}

export interface VM {
  t: TemplateDef;
  rtl: boolean;
  lang: "fr" | "ar";
  u: UI;
  demo: boolean;
  name: string;
  headline: string;
  highlight?: string;
  subheadline: string;
  description: string;
  eyebrow: string;
  price: number;
  oldPrice?: number;
  currency: string;
  /** Frais de livraison ajoutés au total (0 = livraison gratuite) */
  shipping: number;
  images: string[];
  cta: string;
  delivery: string;
  show: { badge: boolean; cta: boolean; price: boolean; subtitle: boolean; address: boolean };
  benefits: Item[];
  features: Item[];
  steps: Item[];
  trust: string[];
  faq: { question: string; answer: string }[];
  problem: { pains: string[]; solution: string };
  reviews: { name: string; city: string; rating: number; text: string }[];
  stats: { value: string; label: string }[];
  ugc: { handle: string; text: string }[];
  comparison: { label: string; us: string; them: string }[];
  specs: { label: string; value: string }[];
  variants: { name: string; color: string }[];
  offers: Offer[];
  defaultQty: number;
  countdownMinutes: number;
  videoUrl: string;
  whatsapp: string;
  story: { title: string; text: string };
  beforeImage: string;
  afterImage: string;
  guarantee: { title: string; text: string };
  finalCta: { title: string; text: string };
  announcement: string;
  orderTitle: string;
  orderMode: "form" | "whatsapp" | "both";
  titles: Record<string, string>;
  order: string[];
  hidden: Set<string>;
  custom: Record<string, any>;
  sectionStyles: Record<string, any>;
  themeOverride: { primary?: string; accent?: string };
}

const ICONS = ["⚡", "🛡️", "✨", "🚚", "💎", "🎯", "🔒", "💡"];
const emojiStart = /^(\p{Extended_Pictographic}️?)\s*/u;

const str = (v: any) => (typeof v === "string" ? v.trim() : "");
const arr = (v: any): any[] => (Array.isArray(v) ? v.filter((x) => x !== null && x !== undefined && x !== "") : []);
const num = (v: any, d = 0) => (Number.isFinite(Number(v)) && v !== "" && v !== null ? Number(v) : d);

/** "Titre : texte" / "Titre - texte" / {title,text} → Item */
export function toItem(x: any, i: number): Item {
  if (x && typeof x === "object") {
    const title = str(x.title || x.name || x.question || x.label);
    return { icon: str(x.icon) || ICONS[i % ICONS.length], title, text: str(x.text || x.description || x.answer) };
  }
  let s = String(x || "").trim();
  let icon = ICONS[i % ICONS.length];
  const m = s.match(emojiStart);
  if (m) {
    icon = m[1];
    s = s.slice(m[0].length);
  }
  const parts = s.split(/\s+[:–—-]\s+|\s*:\s+/);
  return parts.length > 1 ? { icon, title: parts[0], text: parts.slice(1).join(" : ") } : { icon, title: s, text: "" };
}

const DEFAULT_TRUST = {
  fr: ["Livraison gratuite", "Paiement à la livraison", "Satisfait ou remboursé", "Service client 7j/7"],
  ar: ["توصيل مجاني", "الدفع عند الاستلام", "ضمان استرجاع المال", "خدمة الزبناء 7/7"],
};
const DEFAULT_STEPS = {
  fr: [
    "Commandez : remplissez le formulaire en 30 secondes",
    "Confirmation : notre équipe vous appelle",
    "Livraison : recevez votre colis en 24–48h",
    "Paiement : vous payez à la réception",
  ],
  ar: [
    "اطلب : عمر الاستمارة ف 30 ثانية",
    "التأكيد : غادي نتاصلو بيك",
    "التوصيل : كتوصلك السلعة ف 24–48 ساعة",
    "الخلاص : كتخلص عند الاستلام",
  ],
};

export function buildVM(data: LandingV4Data, opts: { demo?: boolean } = {}): VM {
  const t = getTemplate(data.templateId);
  const c = data.content || {};
  const demo = !!opts.demo;
  const rtl = String(data.locale || (t.lang === "ar" ? "ar" : "")).startsWith("ar");
  const lang: "fr" | "ar" = rtl ? "ar" : "fr";
  const u = ui[lang];
  const p = getDemoProduct(t.demoProduct);
  const dc = { ...p.copy, ...(rtl ? p.i18n?.ar || {} : {}) };
  /** en démo, complète un champ vide avec la valeur de démonstration */
  const fill = <T>(real: T[], demoVal: () => T[]): T[] => (real.length || !demo ? real : demoVal());

  const price = num(data.price, demo ? p.price : 0);
  const old = num(data.oldPrice, 0) || (demo && !num(data.price) ? p.oldPrice || 0 : 0);
  const images = arr(data.images).length ? arr(data.images).map(String) : demo ? p.images : [p.images[0]];

  const offersRaw = arr(c.quantity_offers)
    .map((o: any) => ({
      qty: num(o.qty, 1),
      price: num(o.price, price * num(o.qty, 1)),
      label: str(o.label) || `${num(o.qty, 1)}`,
      badge: str(o.badge) || undefined,
    }))
    .filter((o: Offer) => o.qty > 0);
  const offers: Offer[] = offersRaw.length
    ? offersRaw
    : demo && !num(data.price)
      ? p.bundles.map((b) => ({ qty: b.qty, price: b.price, label: b.label, badge: b.badge }))
      : [1, 2, 3].map((q) => ({
          qty: q,
          price: price * q,
          label: lang === "ar" ? `${q} قطعة` : `${q} pièce${q > 1 ? "s" : ""}`,
        }));

  const order = (() => {
    const saved = arr(c.section_order).map(String);
    const base = saved.length ? saved : defaultSectionOrder(t);
    const known = new Set<string>([...CORE_SECTIONS, ...LANDPRO_SECTIONS]);
    const list = base.filter((k) => known.has(k) || (k.startsWith("custom-") && c.custom_sections?.[k]));
    if (!list.includes("hero")) list.unshift("hero");
    if (!list.includes("order")) list.push("order");
    return Array.from(new Set(list));
  })();

  const titles: Record<string, string> = {};
  const key2ui: Record<string, keyof UI> = {
    benefits: "benefits",
    features: "features",
    how: "steps",
    problem: "problem",
    trust: "guarantee",
    faq: "faq",
    showcase: "gallery",
    story: "story",
    before_after: "beforeAfter",
    stats: "stats",
    ugc: "ugc",
    reviews: "testimonials",
    comparison: "comparison",
    specs: "specs",
    variants: "variants",
    offers: "bundles",
    countdown: "countdown",
    video: "video",
    whatsapp: "whatsapp",
    order: "order",
    final_cta: "finalCta",
  };
  for (const k of [...CORE_SECTIONS, ...LANDPRO_SECTIONS]) {
    const saved = str(c[`${k}_title`]);
    const fallback = key2ui[k] ? String(u[key2ui[k]]) : SECTION_LABELS[k as SectionKey];
    titles[k] = saved || fallback;
  }

  const benefits = fill(arr(c.benefits), () => dc.benefits).map(toItem);
  const features = fill(arr(c.features), () => dc.features.map((f) => `${f.icon} ${f.title} : ${f.text}`)).map(toItem);
  const stepsRaw = arr(c.how_steps);
  const steps = (stepsRaw.length ? stepsRaw : DEFAULT_STEPS[lang]).map(toItem);
  const trustRaw = arr(c.trust_points).map((x: any) => (typeof x === "string" ? x : str(x.title || x.text)));
  const faq = fill(
    arr(c.faq).map((f: any) =>
      typeof f === "string"
        ? { question: f, answer: "" }
        : { question: str(f.question || f.q), answer: str(f.answer || f.a) },
    ),
    () => dc.faq.map((f) => ({ question: f.q, answer: f.a })),
  );
  const pains = str(c.problem)
    ? str(c.problem)
        .split(/\n|•|;/)
        .map((s) => s.trim())
        .filter(Boolean)
    : demo
      ? p.problem?.pains || []
      : [];

  const reviews = fill(
    arr(c.reviews)
      .map((r: any) => ({
        name: str(r.name) || "Client",
        city: str(r.city),
        rating: Math.min(5, Math.max(1, num(r.rating, 5))),
        text: str(r.text),
      }))
      .filter((r) => r.text),
    () => dc.reviews.map((r) => ({ name: r.name, city: r.city, rating: r.rating, text: r.text })),
  );

  const yes = (v: any) =>
    v === true || /^(oui|yes|✓|نعم)$/i.test(str(v))
      ? "✓"
      : v === false || /^(non|no|✕|لا)$/i.test(str(v))
        ? "✕"
        : str(v);

  const whatsapp = String(data.whatsappPhone || c.whatsapp_phone || "").replace(/\D/g, "");
  const orderModeWanted: "form" | "whatsapp" | "both" =
    (["form", "whatsapp", "both"].includes(c.order_mode) ? c.order_mode : t.options?.orderMode) || "form";

  // « Livraison gratuite » seulement si la page ne facture pas la livraison
  const shipping = Math.max(0, num(c.delivery_price, 0));
  const deliveryWord =
    shipping > 0 ? (lang === "ar" ? "توصيل لجميع المدن" : "Livraison partout au Maroc") : u.freeDelivery;

  return {
    t,
    rtl,
    lang,
    u,
    demo,
    name: str(data.name) || (demo ? dc.name : ""),
    headline: str(c.headline) || (demo ? t.hero.title : str(data.name)),
    highlight: !str(c.headline) && demo ? t.hero.highlight : undefined,
    subheadline:
      str(c.subheadline) ||
      str(data.description) ||
      str(c.description) ||
      (demo ? t.hero.subtitle || dc.description : ""),
    description: str(c.description) || str(data.description) || (demo ? dc.description : ""),
    eyebrow: str(c.hero_badge_text) || (demo ? t.hero.eyebrow || "" : str(c.delivery)),
    price,
    oldPrice: old > price ? old : undefined,
    currency: str(c.currency) || "DH",
    shipping,
    images,
    cta: str(c.cta) || u.orderNow,
    delivery: str(c.delivery) || `${u.cod} · ${deliveryWord}`,
    show: {
      badge: c.hero_show_badge !== false,
      cta: c.hero_show_cta !== false,
      price: c.hero_show_price !== false,
      subtitle: c.hero_show_subtitle !== false,
      address: c.order_show_address !== false,
    },
    benefits,
    features,
    steps,
    trust: trustRaw.length ? trustRaw : [deliveryWord, ...DEFAULT_TRUST[lang].slice(1)],
    faq,
    problem: { pains, solution: str(c.solution) || (demo ? p.problem?.solution || dc.description : "") },
    reviews,
    stats: fill(
      arr(c.stats)
        .map((s: any) => ({ value: str(s.value), label: str(s.label) }))
        .filter((s) => s.value),
      () => p.stats || [],
    ),
    ugc: fill(
      arr(c.ugc_items)
        .map((x: any) => ({ handle: str(x.handle), text: str(x.text) }))
        .filter((x) => x.handle || x.text),
      () =>
        ["@salma.beauty", "@mehdi.tech", "@imane.vlog", "@omar.unbox"].map((h, i) => ({
          handle: h,
          text: dc.reviews[i % dc.reviews.length]?.text || "",
        })),
    ),
    comparison: fill(
      arr(c.comparison_rows)
        .map((r: any) => ({ label: str(r.label), us: yes(r.us), them: yes(r.them) }))
        .filter((r) => r.label),
      () => p.comparison.map((r) => ({ label: r.label, us: yes(r.us), them: yes(r.them) })),
    ),
    specs: fill(
      arr(c.specs)
        .map((s: any) => ({ label: str(s.label), value: str(s.value) }))
        .filter((s) => s.label),
      () => p.specs,
    ),
    variants: fill(
      arr(c.variants)
        .map((v: any) => (typeof v === "string" ? { name: v, color: "" } : { name: str(v.name), color: str(v.color) }))
        .filter((v) => v.name),
      () => (p.variants || []).map((v) => ({ name: v.name, color: v.color || "" })),
    ),
    offers,
    defaultQty: num(c.quantity_default_qty, offers[0]?.qty || 1),
    countdownMinutes: num(c.countdown_minutes, t.options?.countdownMinutes || 360),
    videoUrl: str(c.video_url),
    whatsapp,
    story: {
      title: str(c.story_title) || (demo ? dc.tagline : str(c.subheadline) || str(data.name)),
      text: str(c.story_text) || str(c.description) || (demo ? dc.description : ""),
    },
    beforeImage: str(c.before_image) || images[0],
    afterImage: str(c.after_image) || images[1] || images[0],
    guarantee: {
      title: str(c.guarantee_title) || u.guarantee,
      text: str(c.guarantee_text) || `${deliveryWord} · ${u.cod} · ${u.support}`,
    },
    finalCta: {
      title: str(c.final_cta_title) || u.finalCta,
      text: str(c.final_cta_text) || str(c.subheadline) || (demo ? dc.tagline : ""),
    },
    announcement:
      str(c.announcement_text) || (shipping > 0 ? "" : t.options?.announcement) || `🚚 ${deliveryWord} · 💵 ${u.cod}`,
    orderTitle: str(c.order_title) || u.order,
    // Sans numéro WhatsApp, le formulaire reste toujours disponible (jamais de page sans moyen de commander)
    orderMode: whatsapp || demo ? orderModeWanted : "form",
    titles,
    order,
    hidden: new Set(arr(c.hidden_sections).map(String)),
    custom: c.custom_sections && typeof c.custom_sections === "object" ? c.custom_sections : {},
    sectionStyles: c.section_styles && typeof c.section_styles === "object" ? c.section_styles : {},
    themeOverride: { primary: str(c.theme_primary) || undefined, accent: str(c.theme_accent) || undefined },
  };
}
