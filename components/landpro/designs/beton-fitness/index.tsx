"use client";
// Design « Béton Fitness » : page encadrée d'un filet orange sur fond grille sombre,
// petit en-tête sombre, grande scène béton enfumée (athlète en soulevé de terre),
// titre condensé usé, bouton orange, lignes à icônes, chaînes et pied de page 4 colonnes.
// Images : 0 = scène du hero, 1 = kit complet (vitrine + commande), 2 = disques,
// 3 = manchon + collier, 4 = vue de dessus. Déco fixe : chains.svg, grunge.svg (CSS).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import {
  Buy,
  discount,
  Go,
  goTo,
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

const FEAT_ICONS = ["dumbbell", "shield", "target", "award", "bolt", "flame"];

/** Emblème du logo (bouclier orange + éclair). */
const Mark = () => (
  <svg className="bf-mark" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M4 6h32l-3 20-13 10L7 26z" fill="currentColor" />
    <path d="M22 9 13 23h6l-2 9 10-15h-6z" fill="#141517" />
  </svg>
);

function Logo({ vm }: { vm: SectionProps["vm"] }) {
  const words = vm.name.trim().split(/\s+/);
  const a = words.length > 1 ? words.slice(0, -1).join(" ") : vm.name;
  const b = words.length > 1 ? words[words.length - 1] : "";
  return (
    <span className="bf-logo">
      <Mark />
      <span>
        <b>{a}</b>
        {b ? <b>{b}</b> : null}
      </span>
    </span>
  );
}

const SecHead = ({ eyebrow, title }: { eyebrow?: string; title: string }) => (
  <div className="bf-head">
    {eyebrow ? <small>{eyebrow}</small> : null}
    <h2 className="bf-grunge">{title}</h2>
  </div>
);

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="bf-header">
      <a
        className="bf-logo-link"
        href="#"
        onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
      >
        <Logo vm={vm} />
      </a>
      <nav className="bf-nav">
        {navOf(vm, 6).map((l) => (
          <Go key={l.key} to={l.key}>
            {l.label}
          </Go>
        ))}
      </nav>
      <div className="bf-header-end">
        <button
          type="button"
          className="bf-ico-btn"
          aria-label={tr(vm, "Questions", "أسئلة")}
          onClick={() => goTo("faq")}
        >
          <Icon name="search" />
        </button>
        <button type="button" className="bf-ico-btn bf-bag" aria-label={vm.cta} onClick={scrollToOrder}>
          <Icon name="bag" />
          <i>{qty}</i>
        </button>
        <Buy vm={vm} className="bf-btn bf-btn-sm">
          {tr(vm, "Commander", "اطلب")}
        </Buy>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const lines = vm.headline.split(/(?<=[.!?؟])\s+/).filter(Boolean);
  const d = discount(vm);
  return (
    <section className="bf-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="bf-hero-bg" />
      <div className="bf-hero-shade" aria-hidden="true" />
      <div className="bf-side bf-side-start" aria-hidden="true">
        <span>
          <Icon name="back" />
        </span>
        <span>
          <Icon name="up" />
        </span>
        <span>
          <Icon name="down" />
        </span>
      </div>
      <div className="bf-side bf-side-end">
        <button type="button" className="bf-tab" onClick={scrollToOrder}>
          {tr(vm, "Commander", "اطلب")}
        </button>
        {vm.whatsapp ? (
          <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <Icon name="whatsapp" />
          </a>
        ) : null}
        <Go to="reviews">
          <Icon name="star" />
        </Go>
        <Go to="faq">
          <Icon name="chat" />
        </Go>
      </div>
      <div className="bf-hero-in">
        <h1 className="bf-h1 bf-grunge">
          {lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h1>
        {vm.show.cta ? <Buy vm={vm} className="bf-btn bf-btn-hero" /> : null}
        <div className="bf-hero-copy">
          {vm.show.subtitle && vm.subheadline ? <p className="bf-lead">{vm.subheadline}</p> : null}
          {vm.eyebrow && vm.show.badge ? <b className="bf-eyebrow">{vm.eyebrow}</b> : null}
          <ul className="bf-lines">
            <li>
              <span className="bf-ring" aria-hidden="true" />
              <span>{vm.delivery}</span>
            </li>
            {vm.show.price && vm.price ? (
              <li>
                <span className="bf-badge">{d ? `-${d}%` : tr(vm, "COD", "COD")}</span>
                <span>
                  <b>{money(vm, vm.price)}</b>
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  {vm.trust[1] ? <em>{vm.trust[1]}</em> : null}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="bf-sec bf-feat-sec" id={sid("features")}>
      <SecHead eyebrow={vm.name} title={vm.titles.features} />
      <div className="bf-feats">
        {vm.features.slice(0, 4).map((f, i) => (
          <article key={i} className="bf-feat">
            <span className="bf-feat-ico">
              <Icon name={iconAt(FEAT_ICONS, i)} />
            </span>
            <b className="bf-feat-n">{String(i + 1).padStart(2, "0")}</b>
            <h3>{f.title}</h3>
            {f.text ? <p>{f.text}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Showcase({ vm }: SectionProps) {
  const n = Math.min(4, Math.max(1, vm.images.length - 1));
  const idx = Array.from({ length: n }, (_, k) => (vm.images.length > 1 ? 1 + k : 0));
  return (
    <section className="bf-sec" id={sid("showcase")}>
      <SecHead eyebrow={tr(vm, "Le produit", "المنتج")} title={vm.titles.showcase} />
      <div className={"bf-gallery bf-gallery-" + n}>
        {idx.map((i, k) => (
          <figure key={k} className="bf-shot">
            <Img vm={vm} i={i} alt={vm.imageLabels[i] || vm.name} />
            <figcaption>
              <b>{String(k + 1).padStart(2, "0")}</b>
              {vm.imageLabels[i] || vm.name}
            </figcaption>
          </figure>
        ))}
      </div>
      {vm.specs.length ? (
        <dl className="bf-specs">
          {vm.specs.slice(0, 4).map((s, i) => (
            <div key={i}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function Story({ vm }: SectionProps) {
  return (
    <section className="bf-story" id={sid("story")}>
      <div className="bf-chains" aria-hidden="true" />
      <div className="bf-story-copy">
        <small className="bf-kicker">{vm.titles.story}</small>
        <h2 className="bf-grunge">{vm.story.title}</h2>
        <p>{vm.story.text}</p>
        {vm.stats.length ? (
          <ul className="bf-stats">
            {vm.stats.slice(0, 3).map((s, i) => (
              <li key={i}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <Buy vm={vm} className="bf-btn-line" arrow />
      </div>
    </section>
  );
}

function Offers({ vm, qty, setQty }: SectionProps) {
  const unit = vm.offers.find((o) => o.qty === 1)?.price || vm.price;
  return (
    <section className="bf-sec bf-offers-sec" id={sid("offers")}>
      <SecHead eyebrow={tr(vm, "Offres", "العروض")} title={vm.titles.offers} />
      <div className="bf-offers">
        {vm.offers.map((o) => (
          <button
            type="button"
            key={o.qty + o.label}
            className={"bf-offer" + (o.qty === qty ? " is-on" : "")}
            onClick={() => {
              setQty(o.qty);
              scrollToOrder();
            }}
          >
            {o.badge ? <span className="bf-offer-badge">{o.badge}</span> : null}
            <span className="bf-offer-qty">×{o.qty}</span>
            <b className="bf-offer-label">{o.label}</b>
            <span className="bf-offer-price">{money(vm, o.price)}</span>
            {o.qty > 1 && unit * o.qty > o.price ? (
              <small>
                {vm.u.save} {money(vm, unit * o.qty - o.price)}
              </small>
            ) : (
              <small>{vm.delivery}</small>
            )}
            <span className="bf-offer-cta">
              {tr(vm, "Choisir", "اختار")} <Icon name={vm.rtl ? "back" : "arrow"} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="bf-sec" id={sid("reviews")}>
      <SecHead eyebrow={tr(vm, "Avis clients", "آراء الزبناء")} title={vm.titles.reviews} />
      <div className="bf-revs">
        {vm.reviews.slice(0, 6).map((r, i) => (
          <article key={i} className="bf-rev">
            <span className="bf-quote" aria-hidden="true">
              “
            </span>
            <Stars n={r.rating} className="bf-stars" />
            <p>{r.text}</p>
            <footer>
              <b>{r.name}</b>
              {r.city ? <small>{r.city}</small> : null}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="bf-order"
      title={<span className="bf-grunge">{vm.orderTitle}</span>}
      aside={
        <>
          <Img vm={vm} i={1} className="bf-order-img" />
          <ul>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap", "headset"], i)} /> {t}
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
    <section className="bf-sec" id={sid("faq")}>
      <SecHead eyebrow="FAQ" title={vm.titles.faq} />
      <div className="bf-faq">
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <span>{f.question}</span>
              <Icon name="plus" />
            </summary>
            {f.answer ? <p>{f.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const links = navOf(vm, 5);
  return (
    <footer className="bf-footer">
      <div className="bf-foot-grid">
        <div className="bf-foot-col">
          <Logo vm={vm} />
          <ul className="bf-foot-list">
            {vm.trust.slice(0, 5).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="bf-foot-col">
          <b className="bf-foot-h">{tr(vm, "Le kit", "المنتج")}</b>
          <p>{vm.description}</p>
        </div>
        <nav className="bf-foot-col">
          <b className="bf-foot-h">{tr(vm, "Navigation", "روابط")}</b>
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="bf-foot-col">
          <b className="bf-foot-h">{tr(vm, "Contact", "تواصل")}</b>
          <small className="bf-foot-sub">{vm.delivery}</small>
          {vm.whatsapp ? (
            <a className="bf-foot-ico" href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> WhatsApp
            </a>
          ) : null}
          <span className="bf-foot-ico">
            <Icon name="truck" /> {vm.trust[0]}
          </span>
          <Buy vm={vm} className="bf-btn bf-foot-btn">
            {tr(vm, "Commander ›", "اطلب ‹")}
          </Buy>
        </div>
      </div>
      <div className="bf-foot-bottom">
        <small>
          © {new Date().getFullYear()} {vm.name}
        </small>
        <small>{tr(vm, "Paiement à la livraison partout au Maroc", "الدفع عند الاستلام فجميع المدن")}</small>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Oswald:wght@500;600;700&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@1,800",
  font: '"Barlow", "Inter", system-ui, sans-serif',
  heading: '"Oswald", "Bebas Neue", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    showcase: (p) => <Showcase {...p} />,
    story: (p) => <Story {...p} />,
    offers: (p) => <Offers {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
