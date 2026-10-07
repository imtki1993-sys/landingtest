"use client";
// Briques communes des designs sur mesure : images, boutons, icônes au trait,
// navigation interne, prix, étoiles et bloc de commande COD.
import React from "react";
import type { VM } from "../model";
import type { SectionProps } from "../Sections";
import { formatPrice } from "../i18n";
import { cx, OrderForm, scrollToOrder } from "../parts";

export { cx, scrollToOrder };

/** id d'ancre d'une section (navigation interne des en-têtes). */
export const sid = (key: string) => "lpx-s-" + key;

/** Fait défiler jusqu'à une section ; à défaut, jusqu'au formulaire. */
export function goTo(key: string) {
  const el = document.getElementById(sid(key)) || document.getElementById("order");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Photo n° i du produit (les photos tournent s'il y en a moins). */
export const pic = (vm: VM, i = 0): string => (vm.images.length ? vm.images[i % vm.images.length] : "");

export function Img({
  vm,
  i = 0,
  src,
  className,
  alt,
}: {
  vm: VM;
  i?: number;
  src?: string;
  className?: string;
  alt?: string;
}) {
  const s = src || pic(vm, i);
  if (!s) return null;
  return <img className={className} src={s} alt={alt ?? vm.name} loading={i ? "lazy" : "eager"} decoding="async" />;
}

export const money = (vm: VM, v: number) => formatPrice(v, vm.currency);
export const discount = (vm: VM) =>
  vm.oldPrice && vm.oldPrice > vm.price ? Math.round((1 - vm.price / vm.oldPrice) * 100) : 0;
export const tr = (vm: VM, fr: string, ar: string) => (vm.lang === "ar" ? ar : fr);

/** Bouton qui mène au formulaire de commande. */
export function Buy({
  vm,
  className,
  children,
  arrow = false,
}: {
  vm: VM;
  className?: string;
  children?: React.ReactNode;
  arrow?: boolean;
}) {
  return (
    <button type="button" className={className} onClick={scrollToOrder}>
      <span>{children ?? vm.cta}</span>
      {arrow ? <Icon name="arrow" /> : null}
    </button>
  );
}

/** Lien interne vers une section (ou le formulaire). */
export function Go({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      className={className}
      href={"#" + (to === "order" ? "order" : sid(to))}
      onClick={(e) => {
        e.preventDefault();
        goTo(to);
      }}
    >
      {children}
    </a>
  );
}

const NAV_LABELS: Record<string, [string, string]> = {
  showcase: ["Produit", "المنتج"],
  features: ["Caractéristiques", "المميزات"],
  benefits: ["Avantages", "الفوائد"],
  story: ["À propos", "علينا"],
  specs: ["Fiche technique", "التفاصيل"],
  offers: ["Offres", "العروض"],
  reviews: ["Avis", "الآراء"],
  how: ["Livraison", "التوصيل"],
  faq: ["FAQ", "أسئلة"],
  order: ["Commander", "اطلب"],
};

/** Liens d'en-tête : les sections présentes dans la page (dans l'ordre affiché). */
export function navOf(vm: VM, max = 5, keys = Object.keys(NAV_LABELS)): { key: string; label: string }[] {
  const shown = vm.order.filter((k) => keys.includes(k) && !vm.hidden.has(k));
  return shown.slice(0, max).map((k) => ({ key: k, label: NAV_LABELS[k][vm.lang === "ar" ? 1 : 0] }));
}

export function Nav({ vm, max = 5, className, keys }: { vm: VM; max?: number; className?: string; keys?: string[] }) {
  return (
    <nav className={className}>
      {navOf(vm, max, keys).map((l) => (
        <Go key={l.key} to={l.key}>
          {l.label}
        </Go>
      ))}
    </nav>
  );
}

/** Étoiles (seulement pour de vrais avis : vm.reviews). */
export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <span className={className} aria-label={`${n}/5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
          <path
            d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
            fill={i < Math.round(n) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      ))}
    </span>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  battery: (
    <>
      <rect x="7" y="4" width="10" height="17" rx="2" />
      <path d="M10 2h4M10 9h4M10 13h4" />
    </>
  ),
  chip: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.9 2.9M15.5 15.5l2.9 2.9M5.6 18.4l2.9-2.9M15.5 8.5l2.9-2.9" />
    </>
  ),
  spring: <path d="M8 3h8M8 21h8M7 6l10 2-10 2 10 2-10 2 10 2-10 2" />,
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  swap: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 10 5 20 4c0 9-5 15-14 15z" />
      <path d="M5 19 14 10" />
    </>
  ),
  drop: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" />,
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  rabbit: (
    <>
      <path d="M9 10C7 7 7 3 8.5 3S11 6 11 9M13 9c0-3 1-6 2.5-6S17 7 15 10" />
      <ellipse cx="12" cy="15" rx="5" ry="5" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  cart: (
    <>
      <path d="M3 4h2l2.4 11h10.2L20 8H6.2" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  up: <path d="M7 17 17 7M9 7h8v8" />,
  down: <path d="m6 9 6 6 6-6" />,
  play: <path d="M8 5v14l11-7z" />,
  check: <path d="m5 12 4 4 10-10" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sparkle: <path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7z" />,
  dumbbell: <path d="M3 10v4M6 7v10M6 12h12M18 7v10M21 10v4" />,
  flame: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2 2 2 3 1-2 1-4 1-6z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11M12 9c-1-3-5-4-5-1.5S10 9 12 9zM12 9c1-3 5-4 5-1.5S14 9 12 9z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m9 13-2 8 5-3 5 3-2-8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  pen: <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />,
  cube: (
    <>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  spa: (
    <>
      <path d="M12 20c-4 0-8-2.5-8-7 3 0 6 1.5 8 4 2-2.5 5-4 8-4 0 4.5-4 7-8 7z" />
      <path d="M12 17c-2-3-2-7 0-11 2 4 2 8 0 11z" />
    </>
  ),
  moon: <path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17" cy="7" r="0.8" />
    </>
  ),
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" />
      <path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1-1-2z" />
    </>
  ),
};

/** Icône au trait (couleur = currentColor). */
export function Icon({ name, className, size }: { name: string; className?: string; size?: number }) {
  return (
    <svg
      className={className ?? "lpx-ico"}
      viewBox="0 0 24 24"
      width={size ?? "1em"}
      height={size ?? "1em"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] || ICONS.check}
    </svg>
  );
}

/** Icône de la liste i (les designs choisissent leur liste). */
export const iconAt = (list: string[], i: number) => list[i % list.length];

/**
 * Bloc de commande : à utiliser par les designs qui redessinent la section « order ».
 * Garde l'ancre #order (boutons « Commander ») et le formulaire COD commun.
 */
export function OrderBox({
  p,
  className,
  title,
  aside,
}: {
  p: SectionProps;
  className?: string;
  title?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const { vm } = p;
  return (
    <section className={className} id="order">
      <div className={cx("d-order-in")}>
        {aside ? <div className={cx("d-order-aside")}>{aside}</div> : null}
        <div className={cx("d-order-form")}>
          {title !== null ? <h2 className={cx("d-order-title")}>{title ?? vm.orderTitle}</h2> : null}
          <OrderForm
            vm={vm}
            qty={p.qty}
            setQty={p.setQty}
            variant={p.variant}
            setVariant={p.setVariant}
            preview={p.preview}
            onSubmit={p.onSubmit}
          />
        </div>
      </div>
    </section>
  );
}

/** Titre du hero : la partie mise en valeur (vm.highlight) est entourée d'un <em>. */
export function Headline({ vm, as: Tag = "h1", className }: { vm: VM; as?: any; className?: string }) {
  const h = vm.highlight || "";
  const t = vm.headline;
  const i = h ? t.toLowerCase().indexOf(h.toLowerCase()) : -1;
  return (
    <Tag className={className}>
      {i >= 0 ? (
        <>
          {t.slice(0, i)}
          <em>{t.slice(i, i + h.length)}</em>
          {t.slice(i + h.length)}
        </>
      ) : (
        t
      )}
    </Tag>
  );
}

/** Parties d'une annonce « a · b · c ». */
export const announceParts = (vm: VM) =>
  vm.announcement
    .split(/\s*[·|•]\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Total affiché pour la quantité choisie (offre + livraison). */
export const totalFor = (vm: VM, qty: number) =>
  (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price * qty) + vm.shipping;
