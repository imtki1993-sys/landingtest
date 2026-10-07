"use client";
// Design « Lavande Naturelle » : en-tête blanc (logo lotus), hero dans un panneau lavande
// avec arche produit, tuiles « univers » (benefits), fiches produits (variants),
// bandeau offre lavande avec portrait (countdown), carte d'engagements (features),
// avis, formulaire COD, FAQ et pied de page violet à vague.
// Images : 0 = hero (aussi formulaire), 1..4 = fiches variantes, 5 = portrait du bandeau offre.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Countdown } from "../../parts";
import {
  Buy,
  discount,
  Go,
  goTo,
  Headline,
  Icon,
  iconAt,
  Img,
  money,
  OrderBox,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const TRUST_ICONS = ["leaf", "truck", "heart"];
const FEAT_ICONS = ["leaf", "truck", "shield", "headset"];

/** Logo lotus au trait. */
const Lotus = ({ className = "ln-lotus" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 48 40"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M24 4c5 5 6.5 12 0 22C17.5 16 19 9 24 4z" />
    <path d="M22 26C17 20 10 17 5 17c1 6 7 11 17 11" />
    <path d="M26 26c5-6 12-9 17-9-1 6-7 11-17 11" />
    <path d="M21 20c-3-5-8-8-12-9 0 4 2 8 6 11M27 20c3-5 8-8 12-9 0 4-2 8-6 11" />
    <path d="M10 33c4 2 9 3 14 3s10-1 14-3" />
  </svg>
);

/** Icônes au trait des tuiles « univers » (visage, lotus, cheveux, maquillage, parfum, sac). */
const CAT_ICONS: React.ReactNode[] = [
  <>
    <path d="M24 8c-8 0-13 6-13 14 0 9 6 17 13 17s13-8 13-17c0-8-5-14-13-14z" />
    <path d="M11 20c5 0 10-3 13-8 3 5 8 8 13 8" />
    <path d="M19 24h.01M29 24h.01M20 31c2.5 2 5.5 2 8 0" />
  </>,
  <>
    <path d="M24 9c5 5 6 12 0 21-6-9-5-16 0-21z" />
    <path d="M22 30c-5-5-11-8-16-8 1 6 7 10 16 10M26 30c5-5 11-8 16-8-1 6-7 10-16 10" />
    <path d="M12 38h24" />
  </>,
  <>
    <path d="M24 7c-9 0-14 7-14 16v17h7M24 7c9 0 14 7 14 16v17h-7" />
    <path d="M17 18c0 0 2 6 7 6s7-6 7-6M17 18v8c0 5 3 9 7 9s7-4 7-9v-8" />
    <path d="M14 42c2-4 5-6 10-6s8 2 10 6" />
  </>,
  <>
    <path d="M14 20h8v20h-8zM15 20l1-8 4-3v11" />
    <path d="M28 26h10v14H28zM31 26v-5h4v5M33 21v-6" />
  </>,
  <>
    <path d="M16 18h16a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V21a3 3 0 0 1 3-3z" />
    <path d="M20 18v-4h8v4M21 10h6v4h-6z" />
    <path d="M19 28c2-3 8-3 10 0-2 3-8 3-10 0z" />
  </>,
  <>
    <path d="M12 18h24l-2 22H14z" />
    <path d="M18 18v-3a6 6 0 0 1 12 0v3" />
    <path d="M19 24c0 3 2 5 5 5s5-2 5-5" />
  </>,
];

const Chevron = () => (
  <svg
    className="ln-chev"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const Head = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) => (
  <div className="ln-head">
    <div>
      <small className="ln-kicker">{eyebrow}</small>
      <h2 className="ln-h2">{title}</h2>
    </div>
    {children}
  </div>
);

/** Note moyenne des vrais avis (sinon rien). */
function ratingOf(vm: SectionProps["vm"]) {
  if (!vm.reviews.length) return null;
  const avg = vm.reviews.reduce((a, r) => a + r.rating, 0) / vm.reviews.length;
  return { avg, count: vm.reviews.length };
}

const short = (s: string, max: number) => (s && s.length <= max ? s : "");

const NAV: [string, string, string][] = [
  ["variants", "Boutique", "المتجر"],
  ["benefits", "Univers", "عالمنا"],
  ["features", "À propos", "علينا"],
  ["reviews", "Avis", "الآراء"],
  ["faq", "FAQ", "أسئلة"],
  ["order", "Contact", "اطلب"],
];
/** Liens de navigation : sections présentes et visibles, dans l'ordre de la page. */
function links(vm: SectionProps["vm"], max: number, keys = NAV.map((n) => n[0])) {
  const shown = vm.order.filter((k) => keys.includes(k) && !vm.hidden.has(k));
  return shown.slice(0, max).map((k) => {
    const n = NAV.find((x) => x[0] === k)!;
    return { key: k, label: tr(vm, n[1], n[2]) };
  });
}

function Header({ vm, qty }: SectionProps) {
  const nav = links(vm, 4, ["variants", "benefits", "features", "order"]);
  return (
    <header className="ln-header">
      <div className="ln-wrap ln-header-row">
        <a
          className="ln-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Lotus />
          <span>
            <b>{vm.name}</b>
            {short(vm.eyebrow, 40) ? <small>{vm.eyebrow}</small> : null}
          </span>
        </a>
        <nav className="ln-nav">
          <a
            href="#"
            className="on"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {nav.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <span className="ln-icons">
          <button type="button" aria-label={tr(vm, "Produits", "المنتجات")} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          <button type="button" aria-label={tr(vm, "Avis", "الآراء")} onClick={() => goTo("reviews")}>
            <Icon name="user" />
          </button>
          <button type="button" className="ln-bag" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const badge = vm.imageLabels[0];
  return (
    <section className="ln-hero-sec" id={sid("hero")}>
      <div className="ln-hero">
        <div className="ln-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="ln-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="ln-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="ln-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="ln-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? (
            <button type="button" className="ln-btn" onClick={scrollToOrder}>
              <span>{vm.cta}</span>
              <Chevron />
            </button>
          ) : null}
          <ul className="ln-hero-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ln-hero-art">
          <div className="ln-arch">
            <Img vm={vm} i={0} className="ln-hero-img" />
          </div>
          {badge ? (
            <span className="ln-badge">
              <Lotus />
              <b>{badge}</b>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Univers({ vm }: SectionProps) {
  return (
    <section className="ln-sec" id={sid("benefits")}>
      <div className="ln-wrap">
        <Head eyebrow={tr(vm, "Nos atouts", "مميزاتنا")} title={vm.titles.benefits}>
          <Go to="variants" className="ln-link">
            {tr(vm, "Voir toute la collection", "شوف المجموعة كاملة")} <Chevron />
          </Go>
        </Head>
        <div className="ln-cats">
          {vm.benefits.slice(0, 6).map((b, i) => (
            <button type="button" key={i} className="ln-cat" title={b.text || undefined} onClick={scrollToOrder}>
              <span className="ln-cat-ico">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {CAT_ICONS[i % CAT_ICONS.length]}
                </svg>
              </span>
              <b>{b.title}</b>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products({ vm, setVariant }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const d = discount(vm);
  const rating = ratingOf(vm);
  const move = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth / 2) * (vm.rtl ? -1 : 1), behavior: "smooth" });
  };
  return (
    <section className="ln-sec ln-sec-tight" id={sid("variants")}>
      <div className="ln-wrap">
        <Head eyebrow={tr(vm, "Produits phares", "الأكثر طلبا")} title={vm.titles.variants}>
          <span className="ln-arrows">
            <button type="button" aria-label="‹" onClick={() => move(-1)}>
              <Icon name={vm.rtl ? "arrow" : "back"} />
            </button>
            <button type="button" aria-label="›" onClick={() => move(1)}>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </button>
          </span>
        </Head>
        <div className="ln-cards" ref={ref}>
          {vm.variants.map((v, i) => (
            <article key={v.name + i} className="ln-card">
              <div className="ln-card-media">
                <Img vm={vm} i={1 + (i % 4)} className="ln-card-img" alt={v.name} />
                {d ? <span className="ln-off">-{d}%</span> : null}
                <span className="ln-heart" aria-hidden="true">
                  <Icon name="heart" />
                </span>
              </div>
              <div className="ln-card-body">
                <h3>{v.name}</h3>
                {rating ? (
                  <span className="ln-rating">
                    <Stars n={rating.avg} className="ln-stars" />
                    <small>({rating.count})</small>
                  </span>
                ) : null}
                {vm.price ? (
                  <p className="ln-price">
                    <b>{money(vm, vm.price)}</b>
                    {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="ln-btn ln-btn-block"
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  <Icon name="cart" />
                  <span>{tr(vm, "Ajouter au panier", "زيد للسلة")}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offer({ vm }: SectionProps) {
  const d = discount(vm);
  const script = short(vm.story.title, 48);
  return (
    <section className="ln-offer-sec" id={sid("countdown")}>
      <div className="ln-wrap">
        <div className="ln-offer">
          <span className="ln-offer-sprig" aria-hidden="true" />
          <div className="ln-offer-copy">
            <small className="ln-eyebrow">{tr(vm, "Offre spéciale", "عرض خاص")}</small>
            <h2>{d ? tr(vm, `Jusqu'à -${d}% sur ${vm.name}`, `تخفيض حتى ${d}% على ${vm.name}`) : vm.finalCta.title}</h2>
            <p>{vm.titles.countdown}</p>
            <div className="ln-offer-act">
              <button type="button" className="ln-btn" onClick={scrollToOrder}>
                <span>{tr(vm, "Voir l'offre", "شوف العرض")}</span>
                <Chevron />
              </button>
              <Countdown vm={vm} small />
            </div>
          </div>
          <div className="ln-offer-art">
            <Img vm={vm} i={5} className="ln-offer-img" alt="" />
          </div>
          {script ? (
            <p className="ln-script">
              {script}
              <Icon name="heart" />
            </p>
          ) : null}
          <span className="ln-offer-sprig ln-offer-sprig-end" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function Engagements({ vm }: SectionProps) {
  return (
    <section className="ln-feat-sec" id={sid("features")}>
      <div className="ln-wrap">
        <h2 className="ln-sr">{vm.titles.features}</h2>
        <ul className="ln-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEAT_ICONS, i)} />
              <b>{f.title}</b>
              {f.text ? <span>{f.text}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="ln-sec" id={sid("reviews")}>
      <div className="ln-wrap">
        <Head eyebrow={tr(vm, "Avis clientes", "آراء الزبناء")} title={vm.titles.reviews} />
        <div className="ln-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="ln-rev">
              <Stars n={r.rating} className="ln-stars" />
              <p>{r.text}</p>
              <div className="ln-who">
                <span className="ln-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  <small>{r.city || tr(vm, "Cliente vérifiée", "زبونة")}</small>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="ln-order"
      aside={
        <>
          <div className="ln-order-art">
            <Img vm={vm} i={0} className="ln-order-img" />
          </div>
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} />
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="ln-sec" id={sid("faq")}>
      <div className="ln-wrap ln-faq">
        <Head eyebrow={tr(vm, "Besoin d'aide ?", "عندك سؤال؟")} title={vm.titles.faq} />
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              {f.question}
              <Icon name="plus" />
            </summary>
            {f.answer ? <p>{f.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer({ vm, qty }: SectionProps) {
  const footLinks = links(vm, 4, ["variants", "benefits", "reviews", "faq"]);
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping;
  return (
    <footer className="ln-footer">
      <svg className="ln-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60V34C240 6 480 0 720 18s480 30 720 4v38z" />
      </svg>
      <span className="ln-foot-art" aria-hidden="true" />
      <span className="ln-foot-art ln-foot-art-end" aria-hidden="true" />
      <div className="ln-wrap">
        <div className="ln-foot-grid">
          <div className="ln-foot-brand">
            <span className="ln-logo ln-logo-foot">
              <Lotus />
              <span>
                <b>{vm.name}</b>
                {short(vm.eyebrow, 40) ? <small>{vm.eyebrow}</small> : null}
              </span>
            </span>
          </div>
          <nav className="ln-foot-col">
            <b>{tr(vm, "Liens utiles", "روابط مفيدة")}</b>
            {footLinks.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <div className="ln-foot-col">
            <b>{vm.whatsapp ? tr(vm, "Contactez-nous", "تواصل معنا") : tr(vm, "Livraison", "التوصيل")}</b>
            {vm.whatsapp ? (
              <a
                className="ln-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
            <span className="ln-foot-note">{vm.delivery}</span>
          </div>
          <div className="ln-foot-cta">
            <b>{tr(vm, "Commandez en 30 secondes", "اطلب ف 30 ثانية")}</b>
            <button type="button" className="ln-fake-input" onClick={scrollToOrder}>
              <span>
                {vm.name}
                {vm.price ? " · " + money(vm, total) : ""}
              </span>
              <i>
                <Icon name={vm.rtl ? "back" : "arrow"} />
              </i>
            </button>
          </div>
        </div>
        <div className="ln-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}. {tr(vm, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
          </small>
          <span>
            <Go to="faq">{vm.titles.faq}</Go>
            <Go to="order">{tr(vm, "Commander", "اطلب")}</Go>
          </span>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts:
    "family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600",
  font: '"DM Sans", system-ui, sans-serif',
  heading: '"Playfair Display", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Univers {...p} />,
    variants: (p) => <Products {...p} />,
    countdown: (p) => <Offer {...p} />,
    features: (p) => <Engagements {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
