"use client";
// Design « GlowCare Rose » : boutique santé & beauté rose vif (#e6386f) sur blanc.
// En-tête avec logo lotus, recherche en pilule et panier rond ; hero dégradé rose
// avec portrait, carte de réassurance flottante, univers (catégories), bannière promo,
// meilleures ventes, bande d'avantages, formulaire COD, avis, FAQ et pied de page.
//
// Images : 0 = hero (portrait), 1-5 = fiches produits (variantes),
// 6-10 = cartes univers (benefits), 11 = bannière promo. Les photos tournent s'il y en a moins.
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
  navOf,
  OrderBox,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const FEAT_ICONS = ["shield", "user", "truck", "swap"];
const TRUST_ICONS = ["cash", "sparkle", "headset", "gift"];

const top = (e: React.MouseEvent) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/** Logo lotus (couleur = currentColor). */
const Lotus = ({ className = "gc-lotus" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 40" aria-hidden="true">
    <path d="M24 4c5 5 6.5 12 4.5 19.5L24 30l-4.5-6.5C17.5 16 19 9 24 4z" fill="currentColor" />
    <path
      d="M6 10c7 1 12.5 5.5 15.5 13l2.5 7c-8 .5-14-2.5-16.5-9C6.5 18 6 14 6 10z"
      fill="currentColor"
      opacity=".82"
    />
    <path
      d="M42 10c-7 1-12.5 5.5-15.5 13L24 30c8 .5 14-2.5 16.5-9 1-3 1.5-7 1.5-11z"
      fill="currentColor"
      opacity=".82"
    />
    <path d="M24 30v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Petite grille de points (bouton « Explorer »). */
const Dots = () => (
  <svg className="gc-dots" viewBox="0 0 18 18" aria-hidden="true">
    {[3, 9, 15].flatMap((y) => [3, 9, 15].map((x) => <circle key={x + "-" + y} cx={x} cy={y} r="1.8" />))}
  </svg>
);

/** Branche translucide décorative (hero, bannière). */
const Fern = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 200 240" aria-hidden="true">
    <path d="M30 236C70 170 110 100 180 8" fill="none" stroke="currentColor" strokeWidth="2" />
    {[0, 1, 2, 3, 4, 5, 6].map((k) => {
      const t = 0.12 + k * 0.12;
      const x = 30 + 150 * t;
      const y = 236 - 228 * t;
      const s = 1.15 - t * 0.7;
      return (
        <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 0C-10-22-34-30-52-26C-40-10-18-2 0 0z" fill="currentColor" />
          <path d="M0 0C22-6 38-26 40-46C20-42 4-24 0 0z" fill="currentColor" />
        </g>
      );
    })}
  </svg>
);

/** « Titre : sous-titre » → [titre, sous-titre] */
const split = (t: string): [string, string] => {
  const m = t.split(/\s+[:–—-]\s+|\s*:\s+/);
  return m.length > 1 ? [m[0], m.slice(1).join(" : ")] : [t, ""];
};

function Head({ title, to, more }: { title: string; to: string; more: string }) {
  return (
    <div className="gc-head">
      <h2>{title}</h2>
      <Go to={to} className="gc-more">
        {more} <Icon name="arrow" />
      </Go>
    </div>
  );
}

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="gc-header">
      <div className="gc-wrap gc-header-row">
        <a className="gc-logo" href="#" onClick={top}>
          <Lotus />
          <span>
            <b>{vm.name}</b>
            <small>{tr(vm, "Santé & Beauté", "الصحة والجمال")}</small>
          </span>
        </a>
        <nav className="gc-nav">
          <a href="#" className="gc-on" onClick={top}>
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="gc-tools">
          <button type="button" className="gc-search" onClick={() => goTo("variants")}>
            <span>{tr(vm, "Rechercher un produit…", "قلب على منتج…")}</span>
            <Icon name="search" />
          </button>
          <button type="button" className="gc-user" aria-label={vm.titles.reviews} onClick={() => goTo("reviews")}>
            <Icon name="user" />
          </button>
          <button type="button" className="gc-cart" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="cart" />
            <i>{qty}</i>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="gc-hero" id={sid("hero")}>
      <div className="gc-hero-media">
        <Img vm={vm} i={0} className="gc-hero-img" />
      </div>
      <Fern className="gc-hero-fern gc-hero-fern-a" />
      <Fern className="gc-hero-fern gc-hero-fern-b" />
      <div className="gc-wrap gc-hero-in">
        <div className="gc-hero-copy">
          {vm.eyebrow && vm.show.badge ? (
            <span className="gc-pill">
              <Icon name="sparkle" />
              {vm.eyebrow}
            </span>
          ) : null}
          <Headline vm={vm} className="gc-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="gc-lead">{vm.subheadline}</p> : null}
          <div className="gc-hero-btns">
            {vm.show.cta ? <Buy vm={vm} className="gc-btn" arrow /> : null}
            <Go to="benefits" className="gc-btn-white">
              {vm.titles.benefits} <Dots />
            </Go>
          </div>
        </div>
        {vm.show.price && vm.price ? (
          <div className="gc-seal">
            <Lotus />
            <b>{d ? `-${d}%` : money(vm, vm.price)}</b>
            <small>{d ? money(vm, vm.price) : vm.u.cod}</small>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="gc-feat-sec" id={sid("features")}>
      <div className="gc-wrap">
        <ul className="gc-feat">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEAT_ICONS, i)} />
              <span>
                <b>{f.title}</b>
                {f.text ? <small>{f.text}</small> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Categories({ vm }: SectionProps) {
  return (
    <section className="gc-sec" id={sid("benefits")}>
      <div className="gc-wrap">
        <Head title={vm.titles.benefits} to="variants" more={tr(vm, "Voir tous les produits", "شوف جميع المنتجات")} />
        <div className="gc-cats">
          {vm.benefits.slice(0, 5).map((b, i) => (
            <button type="button" key={i} className="gc-cat" onClick={() => goTo("variants")}>
              <span className="gc-cat-img">
                <Img vm={vm} i={6 + i} alt={b.title} />
              </span>
              <b>{b.title}</b>
              {b.text ? <small>{b.text}</small> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Promo({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="gc-promo-sec" id={sid("countdown")}>
      <div className="gc-wrap">
        <div className="gc-promo">
          <Img vm={vm} i={11} className="gc-promo-img" alt="" />
          <Fern className="gc-promo-fern" />
          <div className="gc-promo-copy">
            <span className="gc-promo-tag">
              <Icon name="flame" />
              {vm.titles.countdown}
            </span>
            <h2>{d ? tr(vm, `Jusqu'à -${d}%`, `حتى -${d}%`) : vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
            <div className="gc-promo-row">
              <Buy vm={vm} className="gc-btn-light" arrow />
              <Countdown vm={vm} small />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Products({ vm, setVariant }: SectionProps) {
  const n = vm.reviews.length;
  const avg = n ? vm.reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  return (
    <section className="gc-sec gc-sec-tight" id={sid("variants")}>
      <div className="gc-wrap">
        <Head title={vm.titles.variants} to="order" more={tr(vm, "Commander maintenant", "اطلب دابا")} />
        <div className="gc-prods">
          {vm.variants.slice(0, 5).map((v, i) => {
            const [name, size] = v.name.split(/\s+·\s+/);
            return (
              <article key={v.name + i} className="gc-prod">
                <span className="gc-prod-img">
                  <Img vm={vm} i={1 + i} alt={name} />
                </span>
                <h3>{name}</h3>
                <small className="gc-size">
                  {size ||
                    (v.color ? <i className="gc-swatch" style={{ background: v.color }} aria-hidden="true" /> : null)}
                </small>
                {n ? (
                  <span className="gc-rate">
                    <Stars n={avg} className="gc-stars" />
                    <em>({n})</em>
                  </span>
                ) : null}
                {vm.price ? (
                  <span className="gc-price">
                    <b>{money(vm, vm.price)}</b>
                    {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="gc-add"
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  <Icon name="cart" />
                  <span>{tr(vm, "Ajouter au panier", "زيد للسلة")}</span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Trust({ vm }: SectionProps) {
  return (
    <section className="gc-trust-sec" id={sid("trust")}>
      <div className="gc-wrap">
        <ul className="gc-trust">
          {vm.trust.slice(0, 4).map((t, i) => {
            const [title, sub] = split(t);
            return (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} />
                <span>
                  <b>{title}</b>
                  {sub ? <small>{sub}</small> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="gc-order"
      aside={
        <>
          <span className="gc-pill">
            <Icon name="sparkle" />
            {vm.delivery}
          </span>
          <h2 className="gc-order-name">{vm.name}</h2>
          {vm.price ? (
            <span className="gc-price gc-price-lg">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </span>
          ) : null}
          <span className="gc-order-img">
            <Img vm={vm} i={1 + (vm.variants.length ? p.variant : 0)} />
          </span>
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {split(t)[0]}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="gc-sec" id={sid("reviews")}>
      <div className="gc-wrap">
        <Head title={vm.titles.reviews} to="order" more={tr(vm, "Commander", "اطلب")} />
        <div className="gc-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article className="gc-rev" key={i}>
              <Stars n={r.rating} className="gc-stars" />
              <p>{r.text}</p>
              <div className="gc-who">
                <span className="gc-avatar">{r.name.charAt(0)}</span>
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

function Faq({ vm }: SectionProps) {
  return (
    <section className="gc-sec" id={sid("faq")}>
      <div className="gc-wrap gc-faq">
        <div className="gc-faq-side">
          <h2>{vm.titles.faq}</h2>
          <p>{vm.delivery}</p>
          <Buy vm={vm} className="gc-btn" arrow />
        </div>
        <div className="gc-faq-list">
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
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const cols: [string, [string, string][]][] = [
    [
      tr(vm, "Boutique", "المتجر"),
      [
        ["variants", vm.titles.variants],
        ["benefits", vm.titles.benefits],
        ["order", tr(vm, "Commander", "اطلب")],
      ],
    ],
    [
      tr(vm, "Aide", "المساعدة"),
      [
        ["faq", vm.titles.faq],
        ["reviews", vm.titles.reviews],
        ["order", tr(vm, "Livraison", "التوصيل")],
      ],
    ],
  ];
  return (
    <footer className="gc-footer">
      <div className="gc-wrap">
        <div className="gc-foot-grid">
          <div className="gc-foot-brand">
            <a className="gc-logo" href="#" onClick={top}>
              <Lotus />
              <span>
                <b>{vm.name}</b>
                <small>{tr(vm, "Santé & Beauté", "الصحة والجمال")}</small>
              </span>
            </a>
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
            {vm.whatsapp ? (
              <a
                className="gc-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          {cols.map(([h, links]) => (
            <nav key={h} className="gc-foot-col">
              <b>{h}</b>
              {links.map(([k, l]) => (
                <Go key={k + l} to={k}>
                  {l}
                </Go>
              ))}
            </nav>
          ))}
          <div className="gc-foot-cta">
            <b>{vm.finalCta.title}</b>
            <Buy vm={vm} className="gc-btn" arrow />
          </div>
        </div>
        <div className="gc-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <small>{vm.delivery}</small>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Inter:wght@400;500;600;700;800&family=Poppins:wght@500;600;700",
  font: '"Inter", system-ui, sans-serif',
  heading: '"Inter", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    benefits: (p) => <Categories {...p} />,
    countdown: (p) => <Promo {...p} />,
    variants: (p) => <Products {...p} />,
    trust: (p) => <Trust {...p} />,
    order: (p) => <Order {...p} />,
    reviews: (p) => <Reviews {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
