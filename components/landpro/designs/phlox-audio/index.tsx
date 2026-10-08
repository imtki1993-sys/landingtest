"use client";
// Design « Casque Bento » (classes pa-*) : en-tête blanc au logo rouge espacé, hero en grand panneau gris
// (mot fantôme géant derrière le casque, bouton pilule rouge, « Description » en bas à droite),
// grille bento de cartes colorées (noir, jaune, rouge, gris, vert, bleu), rangée d'engagements à icônes
// rouges, bandeau promo rouge, fiche technique, avis, formulaire COD, FAQ, appel final et pied de page.
//
// Images : 0 = hero (casque) · 1..6 = cartes bento (gros plan, coloris, bureau, console, porté, base de charge)
//          · 7 = vue retournée (fiche technique) · bandeau promo et commande = 0 · appel final = 1.
// Mots fantômes : vm.imageLabels[i] (légende de la photo i), sinon un mot tiré du nom / du titre.
import React from "react";
import type { Design } from "../types";
import type { VM } from "../../model";
import type { SectionProps } from "../../Sections";
import { Countdown } from "../../parts";
import {
  Buy,
  discount,
  Go,
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

const FEATURE_ICONS = ["truck", "award", "headset", "cash"];
const CARD_LABELS: [string, string][] = [
  ["Profitez", "استمتع"],
  ["Nouveau", "جديد"],
  ["Tendance", "رائج"],
  ["Le meilleur", "الأفضل"],
  ["Bougez", "تحرك"],
  ["Nouveau", "جديد"],
];

/** Mot fantôme : légende de la photo i, sinon premier mot du texte de secours. */
const ghost = (vm: VM, i: number, fallback: string) =>
  (vm.imageLabels[i] || fallback.split(/\s+/).find((w) => w.length > 2) || fallback).trim();

const Ghost = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={"pa-ghost" + (className ? " " + className : "")} aria-hidden="true">
    {children}
  </span>
);

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="pa-header">
      <div className="pa-wrap pa-header-row">
        <a
          className="pa-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          {vm.name}
        </a>
        <nav className="pa-nav">
          <a
            href="#"
            className="pa-on"
            onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
          >
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {navOf(vm, 4).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="pa-header-end">
          <Go to="order" className="pa-login">
            {tr(vm, "Commander", "اطلب")}
          </Go>
          <Go to="benefits" className="pa-icon-btn">
            <Icon name="search" />
          </Go>
          <button type="button" className="pa-icon-btn pa-cart" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="pa-hero-sec" id={sid("hero")}>
      <div className="pa-wrap">
        <div className="pa-hero">
          <Ghost className="pa-hero-ghost">{ghost(vm, 0, vm.name)}</Ghost>
          <div className="pa-hero-copy">
            {vm.eyebrow && vm.show.badge ? <p className="pa-hero-eyebrow">{vm.eyebrow}</p> : null}
            <Headline vm={vm} className="pa-h1" />
          </div>
          <div className="pa-hero-media">
            <Img vm={vm} i={0} className="pa-hero-img" />
          </div>
          <div className="pa-hero-cta">
            {vm.show.cta ? <Buy vm={vm} className="pa-pill pa-pill-red" /> : null}
            {vm.show.price && vm.price ? (
              <span className="pa-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            ) : null}
          </div>
          {vm.show.subtitle && vm.subheadline ? (
            <div className="pa-hero-desc">
              <b>{tr(vm, "Description", "الوصف")}</b>
              <p>{vm.subheadline}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Bento({ vm }: SectionProps) {
  return (
    <section className="pa-sec pa-bento-sec" id={sid("benefits")}>
      <div className="pa-wrap">
        <h2 className="pa-sr">{vm.titles.benefits}</h2>
        <div className="pa-bento">
          {vm.benefits.slice(0, 6).map((b, i) => (
            <article key={i} className={"pa-card pa-c" + (i % 6)}>
              <small className="pa-card-label">{tr(vm, CARD_LABELS[i % 6][0], CARD_LABELS[i % 6][1])}</small>
              <h3 className="pa-card-title">{b.title}</h3>
              <Ghost className="pa-card-ghost">{ghost(vm, 1 + i, b.title)}</Ghost>
              {b.text ? <p className="pa-card-text">{b.text}</p> : null}
              <Buy vm={vm} className="pa-pill pa-card-btn">
                {tr(vm, "Découvrir", "اكتشف")}
              </Buy>
              <Img vm={vm} i={1 + i} className="pa-card-img" alt={b.title} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="pa-sec pa-feat-sec" id={sid("features")}>
      <div className="pa-wrap">
        <h2 className="pa-sr">{vm.titles.features}</h2>
        <ul className="pa-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEATURE_ICONS, i)} className="pa-feat-ico" />
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

function Promo({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="pa-sec" id={sid("countdown")}>
      <div className="pa-wrap">
        <div className="pa-promo">
          <Ghost className="pa-promo-ghost">{d ? `-${d}%` : tr(vm, "Offre", "عرض")}</Ghost>
          <div className="pa-promo-media">
            <span className="pa-promo-disc" aria-hidden="true" />
            <Img vm={vm} i={0} className="pa-promo-img" alt="" />
          </div>
          <div className="pa-promo-copy">
            <small className="pa-card-label">{tr(vm, "Offre limitée", "عرض محدود")}</small>
            <h2>{vm.titles.countdown}</h2>
            {vm.price ? (
              <p className="pa-promo-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                {d ? <em>-{d}%</em> : null}
              </p>
            ) : null}
            <Countdown vm={vm} small />
            <Buy vm={vm} className="pa-pill pa-pill-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="pa-sec" id={sid("specs")}>
      <div className="pa-wrap">
        <div className="pa-specs">
          <div className="pa-specs-media">
            <Ghost className="pa-specs-ghost">{ghost(vm, 7, "Specs")}</Ghost>
            <Img vm={vm} i={7} className="pa-specs-img" alt="" />
          </div>
          <div className="pa-specs-copy">
            <small className="pa-kicker">{vm.name}</small>
            <h2 className="pa-h2">{vm.titles.specs}</h2>
            <dl>
              {vm.specs.map((s, i) => (
                <div key={i}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <Buy vm={vm} className="pa-pill pa-pill-red" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="pa-sec" id={sid("reviews")}>
      <div className="pa-wrap">
        <div className="pa-head">
          <small className="pa-kicker">{tr(vm, "Avis clients", "آراء الزبناء")}</small>
          <h2 className="pa-h2">{vm.titles.reviews}</h2>
        </div>
        <div className="pa-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article className="pa-rev" key={i}>
              <Stars n={r.rating} className="pa-stars" />
              <p>{r.text}</p>
              <div className="pa-who">
                <span className="pa-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  {r.city ? <small>{r.city}</small> : null}
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
    <div className="pa-sec pa-order-sec">
      <div className="pa-wrap">
        <OrderBox
          p={p}
          className="pa-order"
          title={vm.titles.order}
          aside={
            <>
              <Ghost className="pa-order-ghost">{ghost(vm, 0, vm.name)}</Ghost>
              <Img vm={vm} i={0} className="pa-order-img" />
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
      </div>
    </div>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="pa-sec" id={sid("faq")}>
      <div className="pa-wrap pa-faq-grid">
        <div className="pa-head">
          <small className="pa-kicker">FAQ</small>
          <h2 className="pa-h2">{vm.titles.faq}</h2>
          <Buy vm={vm} className="pa-pill pa-pill-red" />
        </div>
        <div className="pa-faq">
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

function Final({ vm, qty }: SectionProps) {
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping;
  return (
    <section className="pa-sec" id={sid("final_cta")}>
      <div className="pa-wrap">
        <div className="pa-final">
          <Ghost className="pa-final-ghost">{ghost(vm, 1, vm.name)}</Ghost>
          <div className="pa-final-copy">
            <small className="pa-card-label">{vm.titles.final_cta}</small>
            <h2>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
            <div className="pa-final-form">
              <span>
                {vm.name}
                {vm.price ? " · " + money(vm, total) : ""}
              </span>
              <Buy vm={vm} className="pa-pill pa-pill-red" />
            </div>
          </div>
          <Img vm={vm} i={1} className="pa-final-img" alt="" />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="pa-footer">
      <div className="pa-wrap">
        <div className="pa-foot-row">
          <span className="pa-logo">{vm.name}</span>
          <nav className="pa-nav">
            {navOf(vm, 5).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          {vm.whatsapp ? (
            <a
              className="pa-icon-btn pa-wa"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
        <div className="pa-foot-bottom">
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
  fonts: "family=Poppins:wght@400;500;600;700;800",
  font: '"Poppins", system-ui, sans-serif',
  heading: '"Poppins", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Bento {...p} />,
    features: (p) => <Features {...p} />,
    countdown: (p) => <Promo {...p} />,
    specs: (p) => <Specs {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
