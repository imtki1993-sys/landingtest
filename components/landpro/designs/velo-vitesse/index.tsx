"use client";
// Design « Vélo Vitesse » : en-tête clair (logo large, nav centrée, panier, pilule noire),
// hero cycliste + traînées de vent, chiffres séparés, 02 technologie (gros plan cadre),
// 03 bandeau montagne N&B avec ligne manuscrite, fiche technique, finitions, avis,
// formulaire COD, FAQ et pied de page noir.
// Images : 0 hero · 1 gros plan cadre · 2 vignette abstraite · 3 route de montagne ·
// 4-6 vélo de profil (une par finition ; 4 aussi pour la fiche technique et la commande).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import {
  Buy,
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

/** Numéro « 0n » d'une section dans la page (hero = 01). */
const NUMBERED = ["hero", "story", "final_cta", "specs", "variants", "reviews", "order", "faq"];
const num = (vm: VM, key: string) => {
  const list = vm.order.filter((k) => NUMBERED.includes(k) && !vm.hidden.has(k));
  const i = list.indexOf(key);
  return String((i < 0 ? 0 : i) + 1).padStart(2, "0");
};

/** Rail vertical : numéro, trait, petits mots en capitales. */
function Rail({ n, words, className }: { n: string; words: string[]; className?: string }) {
  return (
    <div className={"vv-rail " + (className || "")}>
      <small>{n}</small>
      <i aria-hidden="true" />
      {words.length ? (
        <ul>
          {words.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <small className="vv-eyebrow">{children}</small>;

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="vv-header">
      <div className="vv-wrap vv-header-row">
        <a
          className="vv-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          {vm.name}
        </a>
        <nav className="vv-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="vv-header-end">
          <button
            type="button"
            className="vv-icon-btn"
            aria-label={tr(vm, "Fiche technique", "التفاصيل")}
            onClick={() => goTo("specs")}
          >
            <Icon name="search" />
          </button>
          <button type="button" className="vv-cart" onClick={scrollToOrder}>
            {tr(vm, "Panier", "السلة")} ({qty})
          </button>
          <Buy vm={vm} className="vv-pill" arrow>
            {tr(vm, "Commander", "اطلب")}
          </Buy>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="vv-hero" id={sid("hero")}>
      <div className="vv-hero-media">
        <Img vm={vm} i={0} className="vv-hero-img" />
      </div>
      <Rail n={num(vm, "hero")} words={vm.trust.slice(0, 4)} className="vv-hero-rail" />
      <div className="vv-hero-copy">
        {vm.eyebrow && vm.show.badge ? <small className="vv-eyebrow vv-eyebrow-wide">{vm.eyebrow}</small> : null}
        <Headline vm={vm} className="vv-h1" />
        {vm.show.subtitle && vm.subheadline ? <p className="vv-lead">{vm.subheadline}</p> : null}
        {vm.show.price && vm.price ? (
          <p className="vv-hero-price">
            <b>{money(vm, vm.price)}</b>
            {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
          </p>
        ) : null}
        <div className="vv-hero-ctas">
          {vm.show.cta ? <Buy vm={vm} className="vv-btn" arrow /> : null}
          <button type="button" className="vv-play" onClick={() => goTo("story")}>
            <span className="vv-play-ring">
              <Icon name="play" />
            </span>
            <span>{tr(vm, "Découvrir la technologie", "اكتشف التكنولوجيا")}</span>
          </button>
        </div>
      </div>
      <div className="vv-scroll" aria-hidden="true">
        <small>{tr(vm, "Défiler", "مرر")}</small>
        <i />
      </div>
    </section>
  );
}

function Stats({ vm }: SectionProps) {
  return (
    <section className="vv-stats" id={sid("stats")}>
      <div className="vv-stats-row">
        {vm.stats.slice(0, 4).map((s, i) => (
          <div key={i} className="vv-stat">
            <b>{s.value}</b>
            <small>{s.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function Story({ vm }: SectionProps) {
  const caption = vm.imageLabels[2] || vm.features[0]?.text || "";
  return (
    <section className="vv-tech" id={sid("story")}>
      <div className="vv-tech-media">
        <Img vm={vm} i={1} className="vv-cover" alt="" />
      </div>
      <div className="vv-tech-body">
        <div className="vv-tech-copy">
          <Eyebrow>{vm.titles.story}</Eyebrow>
          <h2 className="vv-h2">{vm.story.title}</h2>
          {vm.story.text ? <p>{vm.story.text}</p> : null}
          <Go to={vm.order.includes("specs") ? "specs" : "order"} className="vv-link">
            {tr(vm, "Voir la technologie", "شوف التكنولوجيا")} <Icon name="arrow" />
          </Go>
        </div>
        <div className="vv-tech-side">
          <Rail n={num(vm, "story")} words={vm.features.slice(0, 4).map((f) => f.title)} className="vv-rail-end" />
          <figure className="vv-thumb">
            <Img vm={vm} i={2} alt="" />
            {caption ? <figcaption>{caption}</figcaption> : null}
          </figure>
        </div>
      </div>
    </section>
  );
}

function Further({ vm }: SectionProps) {
  const text = vm.finalCta.text && vm.finalCta.text !== vm.story.title ? vm.finalCta.text : vm.guarantee.text;
  const words = [
    vm.price ? money(vm, vm.price) : "",
    tr(vm, "Paiement", "الدفع"),
    tr(vm, "à la livraison", "عند الاستلام"),
  ];
  return (
    <section className="vv-further" id={sid("final_cta")}>
      <Img vm={vm} i={3} className="vv-further-img" alt="" />
      <div className="vv-further-in">
        <div className="vv-further-copy">
          <Eyebrow>{tr(vm, "La route devant nous", "الطريق قدامنا")}</Eyebrow>
          <h2 className="vv-h2">{vm.titles.final_cta}</h2>
          {text ? <p>{text}</p> : null}
        </div>
        <Buy vm={vm} className="vv-script">
          {vm.finalCta.title !== vm.titles.final_cta ? vm.finalCta.title : vm.cta}
        </Buy>
        <Rail n={num(vm, "final_cta")} words={words.filter(Boolean)} className="vv-rail-end vv-rail-light" />
      </div>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="vv-sec vv-specs" id={sid("specs")}>
      <div className="vv-wrap vv-specs-in">
        <div className="vv-specs-media">
          <Img vm={vm} i={4} className="vv-specs-img" alt="" />
        </div>
        <div className="vv-specs-copy">
          <div className="vv-sec-head">
            <Eyebrow>{num(vm, "specs")}</Eyebrow>
            <h2 className="vv-h2">{vm.titles.specs}</h2>
          </div>
          <dl className="vv-spec-list">
            {vm.specs.map((s, i) => (
              <div key={i}>
                <dt>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                </dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Variants({ vm, setVariant }: SectionProps) {
  return (
    <section className="vv-sec vv-variants" id={sid("variants")}>
      <div className="vv-wrap">
        <div className="vv-sec-head vv-sec-head-row">
          <div>
            <Eyebrow>{num(vm, "variants")}</Eyebrow>
            <h2 className="vv-h2">{vm.titles.variants}</h2>
          </div>
          {vm.price ? (
            <p className="vv-from">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
        </div>
        <div className="vv-cards">
          {vm.variants.slice(0, 6).map((v, i) => (
            <article key={v.name + i} className="vv-card">
              <span className="vv-card-n">{String(i + 1).padStart(2, "0")}</span>
              <Img vm={vm} i={4 + i} className="vv-card-img" alt={v.name} />
              <div className="vv-card-foot">
                <span className="vv-card-name">
                  {v.color ? <i style={{ background: v.color }} /> : null}
                  {v.name}
                </span>
                <button
                  type="button"
                  className="vv-card-btn"
                  aria-label={v.name}
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  {tr(vm, "Choisir", "اختار")} <Icon name="arrow" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="vv-sec vv-reviews" id={sid("reviews")}>
      <div className="vv-wrap">
        <div className="vv-sec-head">
          <Eyebrow>{num(vm, "reviews")}</Eyebrow>
          <h2 className="vv-h2">{vm.titles.reviews}</h2>
        </div>
        <div className="vv-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <figure key={i} className="vv-rev">
              <Stars n={r.rating} className="vv-stars" />
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <b>{r.name}</b>
                {r.city ? <span>{r.city}</span> : null}
              </figcaption>
            </figure>
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
      className="vv-order"
      title={
        <>
          <small className="vv-eyebrow">{num(vm, "order")}</small>
          {vm.orderTitle}
        </>
      }
      aside={
        <>
          <h2 className="vv-h2 vv-order-h">{vm.titles.order}</h2>
          <Img vm={vm} i={4 + p.variant} className="vv-order-img" />
          <ul className="vv-order-trust">
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap", "headset"], i)} />
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
    <section className="vv-sec vv-faq" id={sid("faq")}>
      <div className="vv-wrap vv-faq-in">
        <div className="vv-sec-head">
          <Eyebrow>{num(vm, "faq")}</Eyebrow>
          <h2 className="vv-h2">{vm.titles.faq}</h2>
        </div>
        <div className="vv-faq-list">
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
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="vv-footer">
      <div className="vv-wrap">
        <div className="vv-foot-top">
          <b className="vv-foot-logo">{vm.name}</b>
          <Buy vm={vm} className="vv-btn" arrow />
        </div>
        <div className="vv-foot-row">
          <nav className="vv-foot-nav">
            {navOf(vm, 6).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          {vm.whatsapp ? (
            <a
              className="vv-foot-wa"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
        <div className="vv-foot-bottom">
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
  fonts: "family=Unbounded:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600",
  font: '"DM Sans", system-ui, sans-serif',
  heading: '"Unbounded", "DM Sans", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    stats: (p) => <Stats {...p} />,
    story: (p) => <Story {...p} />,
    final_cta: (p) => <Further {...p} />,
    specs: (p) => <Specs {...p} />,
    variants: (p) => <Variants {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
