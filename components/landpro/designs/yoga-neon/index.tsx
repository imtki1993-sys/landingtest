"use client";
// Design « Yoga Néon » : fond noir, en-tête à 4 liens et petit logo violet centré,
// hero « YOGA » géant (lettres néon rose-violet) traversé par la photo détourée,
// bouton pilule, citation en mono, cartes « choix des clients », rangée de cercles
// néon (avantages), avis, formulaire COD, FAQ et pied de page néon.
//
// Images : 0 = hero (silhouette détourée posée sur les lettres),
//          1..4 = photos des cartes « choix des clients » (benefits), 1 = visuel du formulaire.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Buy, Go, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

/** Petit chat stylisé du logo. */
const CatLogo = () => (
  <svg className="yn-logo-cat" viewBox="0 0 40 20" aria-hidden="true">
    <path d="M3 17c4-1 7-4 10-4h11c3 0 5-2 6-5l1-4 2 3 2-2v5c0 3-2 6-6 7M13 13l-2 4M20 13l1 4M29 15l1 2" />
  </svg>
);

/** Icônes néon au trait (méditation, visage et mains, chat qui s'étire). */
const NEON: React.ReactNode[] = [
  <>
    <circle cx="32" cy="12" r="5" />
    <path d="M32 17c-2 5-2 10 0 15 2-5 2-10 0-15" />
    <path d="M27 21c-4 3-6 8-9 12l6 1M37 21c4 3 6 8 9 12l-6 1" />
    <path d="M24 34c3 3 5 4 8 4s5-1 8-4" />
    <path d="M14 46c6-5 12-7 18-7s12 2 18 7c-6 2-12 3-18 3s-12-1-18-3z" />
    <path d="M8 40l3-2M56 40l-3-2M12 28l-3-1M52 28l3-1M32 4v-2" />
  </>,
  <>
    <path d="M32 12c-8 0-13 7-13 17 0 10 6 20 13 20s13-10 13-20c0-10-5-17-13-17z" />
    <path d="M24 28q3 2 6 0M34 28q3 2 6 0M32 31v6l-2 1M28 42q4 2 8 0" />
    <path d="M20 34c-4-6-6-14-4-21l3 10M17 38c-6-5-9-12-9-19l4 8" />
    <path d="M44 34c4-6 6-14 4-21l-3 10M47 38c6-5 9-12 9-19l-4 8" />
    <path d="M24 49c-2 4-3 8-3 11M40 49c2 4 3 8 3 11" />
  </>,
  <>
    <path d="M14 52c-4-10-2-22 6-30" />
    <path d="M20 22l-3-8 7 4 6-3 1 8" />
    <path d="M31 23c4 4 8 6 14 6 6 0 9 4 9 10 0 7-5 12-12 13l-14 0" />
    <path d="M28 52c-3-4-2-10 2-14M42 52l-1-6M54 40c4 2 6 6 5 11" />
    <path d="M22 18h.5M27 17h.5" />
  </>,
];

/** Lettres du mot géant : découpées seulement en écriture latine (l'arabe doit rester lié). */
function Word({ vm, front }: { vm: SectionProps["vm"]; front?: boolean }) {
  const word = (vm.highlight || vm.headline.split(/\s+/)[0] || vm.name).slice(0, 9);
  const latin = !/[؀-ۿ]/.test(word);
  if (!latin) return front ? null : <span className="yn-letters yn-letters-ar">{word}</span>;
  const chars = Array.from(word.toUpperCase());
  return (
    <span
      className={"yn-letters" + (front ? " yn-front" : "")}
      aria-hidden={front ? true : undefined}
      data-n={chars.length}
    >
      {chars.map((c, i) => (
        <span key={i} className={"yn-l yn-l" + (i % 4)}>
          {c}
        </span>
      ))}
    </span>
  );
}

function Header({ vm }: SectionProps) {
  const links = navOf(vm, 4);
  const L = (k: number) =>
    links[k] ? (
      <Go to={links[k].key} className="yn-nav">
        {links[k].label}
      </Go>
    ) : (
      <span />
    );
  return (
    <header className="yn-header">
      <div className="yn-wrap yn-header-row">
        {L(0)}
        {L(1)}
        <a
          className="yn-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <CatLogo />
          <b>{vm.name}</b>
        </a>
        {L(2)}
        {L(3)}
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const word = vm.highlight || vm.headline.split(/\s+/)[0] || vm.name;
  const rest = vm.headline.trim().toLowerCase() === word.trim().toLowerCase() ? "" : vm.headline;
  return (
    <section className="yn-hero" id={sid("hero")}>
      <h1 className="yn-sr">{vm.headline}</h1>
      <div className="yn-stage" aria-hidden="true">
        <Word vm={vm} />
        <Img vm={vm} i={0} className="yn-person" alt="" />
        <Word vm={vm} front />
      </div>
      <div className="yn-wrap yn-hero-end">
        {rest ? <p className="yn-hero-line">{rest}</p> : null}
        {vm.show.cta ? <Buy vm={vm} className="yn-pill" /> : null}
        {vm.show.price && vm.price ? (
          <p className="yn-hero-price">
            <b>{money(vm, vm.price)}</b>
            {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
          </p>
        ) : null}
        {vm.show.subtitle && vm.subheadline ? <p className="yn-quote">{vm.subheadline}</p> : null}
      </div>
    </section>
  );
}

const Head = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="yn-head">
    <h2>{title}</h2>
    {sub ? <p>{sub}</p> : null}
  </div>
);

function Choice({ vm }: SectionProps) {
  return (
    <section className="yn-sec" id={sid("benefits")}>
      <div className="yn-wrap">
        <Head title={vm.titles.benefits} sub={tr(vm, "Nos clients choisissent ceci", "زبناؤنا كيختارو هادا")} />
        <div className="yn-cards">
          {vm.benefits.slice(0, 4).map((b, i) => {
            const m = b.title.split(/\s*·\s*/);
            const tag = m.length > 1 ? m[0] : String(i + 1).padStart(2, "0");
            const title = m.length > 1 ? m.slice(1).join(" · ") : b.title;
            return (
              <button type="button" key={i} className="yn-card" onClick={scrollToOrder}>
                <Img vm={vm} i={1 + i} className="yn-card-img" alt="" />
                <span className="yn-card-top">
                  <span>{tag}</span>
                  <span>{title}</span>
                </span>
                {b.text ? <span className="yn-card-text">{b.text}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Useful({ vm }: SectionProps) {
  const feats = vm.features.slice(0, 4);
  return (
    <section className="yn-sec" id={sid("features")}>
      <div className="yn-wrap">
        <Head title={vm.titles.features} sub={vm.show.badge && vm.eyebrow ? vm.eyebrow : undefined} />
        <ul className="yn-circles" data-n={feats.length}>
          {feats.map((f, i) => (
            <React.Fragment key={i}>
              <li className="yn-circle yn-circle-pink">
                <b>{f.title}</b>
                {f.text ? <small>{f.text}</small> : null}
              </li>
              <li className="yn-circle yn-circle-dark" aria-hidden="true">
                <svg viewBox="0 0 64 64" className="yn-neon">
                  {NEON[i % NEON.length]}
                </svg>
              </li>
            </React.Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="yn-sec" id={sid("reviews")}>
      <div className="yn-wrap">
        <Head title={vm.titles.reviews} />
        <div className="yn-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="yn-rev">
              <Stars n={r.rating} className="yn-stars" />
              <p>{r.text}</p>
              <span className="yn-who">
                <i>{r.name.charAt(0)}</i>
                <span>
                  <b>{r.name}</b>
                  {r.city ? <small>{r.city}</small> : null}
                </span>
              </span>
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
      className="yn-order"
      title={vm.titles.order || vm.orderTitle}
      aside={
        <div className="yn-order-aside">
          <Img vm={vm} i={1} className="yn-order-img" alt="" />
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="yn-sec" id={sid("faq")}>
      <div className="yn-wrap yn-faq">
        <Head title={vm.titles.faq} />
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
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
  return (
    <footer className="yn-footer">
      <div className="yn-wrap">
        <div className="yn-foot-top">
          <span className="yn-logo yn-logo-foot">
            <CatLogo />
            <b>{vm.name}</b>
          </span>
          <nav className="yn-foot-nav">
            {navOf(vm, 5).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <Buy vm={vm} className="yn-pill yn-pill-sm" />
        </div>
        <div className="yn-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <small>{vm.delivery}</small>
          {vm.whatsapp ? (
            <a
              className="yn-wa"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts:
    "family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@500;600&family=Space+Mono:wght@400;700",
  font: '"Barlow", system-ui, sans-serif',
  heading: '"Barlow Semi Condensed", "Barlow", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Choice {...p} />,
    features: (p) => <Useful {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
