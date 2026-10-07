"use client";
// Design « Botanique Nuit » : page entière sur fond de forêt sombre et moussue.
// En-tête transparent (initiale en cercle olive, menu centré, panier pilule), hero
// « Ancrée dans la nature » avec flacons ambrés sur rocher moussu, cartes givrées
// best-sellers, histoire avec photo panoramique, grande phrase manifeste, actifs
// disposés de part et d'autre du flacon, avis, formulaire et FAQ.
//
// Images (vm.images) : 0 hero · 1-4 cartes produits (variantes) · 5 histoire ·
// 6 actifs · 2 formulaire. Décor fixe (racines moussues) : decor-roots.svg.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { asset } from "../demo-kit";
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

const DECOR = { backgroundImage: `url(${asset("botanique-nuit", "decor-roots")})` };

/** Initiale de la marque dans un cercle olive (comme le logo de la référence). */
function Logo({ vm }: { vm: SectionProps["vm"] }) {
  return (
    <a
      className="bn-logo"
      href="#"
      aria-label={vm.name}
      title={vm.name}
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 5c15 0 26 11.5 26 27S47 59 32 59 6 47.5 6 32 17 5 32 5zm0 7c-10 0-17 8.6-17 20s7 20 17 20 17-8.6 17-20-7-20-17-20z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
      <span>{vm.name}</span>
    </a>
  );
}

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="bn-header">
      <div className="bn-wrap bn-header-row">
        <Logo vm={vm} />
        <nav className="bn-nav">
          {navOf(vm, 4).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <button type="button" className="bn-cart" aria-label={vm.cta} onClick={scrollToOrder}>
          <Icon name="cart" />
          {qty > 1 ? <i>{qty}</i> : null}
        </button>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="bn-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="bn-hero-img" />
      <div className="bn-wrap bn-hero-in">
        <div className="bn-hero-copy">
          <Headline vm={vm} className="bn-h1" />
          {vm.eyebrow && vm.show.badge ? <p className="bn-hero-eyebrow">{vm.eyebrow}</p> : null}
          {vm.show.subtitle && vm.subheadline ? <p className="bn-lead">{vm.subheadline}</p> : null}
          <div className="bn-hero-act">
            {vm.show.cta ? <Buy vm={vm} className="bn-btn" /> : null}
            {vm.show.price && vm.price ? (
              <span className="bn-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function BestSellers({ vm, setVariant }: SectionProps) {
  return (
    <section className="bn-sec bn-best" id={sid("variants")}>
      <div className="bn-decor bn-decor-best" style={DECOR} aria-hidden="true" />
      <div className="bn-wrap">
        <h2 className="bn-title">{vm.titles.variants}</h2>
        <div className="bn-cards">
          {vm.variants.slice(0, 8).map((v, i) => (
            <article key={v.name + i} className="bn-card">
              <Img vm={vm} i={1 + i} className="bn-card-img" alt={v.name} />
              <div className="bn-card-top">
                <h3>{v.name}</h3>
                {vm.price ? <b>{money(vm, vm.price)}</b> : null}
              </div>
              <div className="bn-card-act">
                <button
                  type="button"
                  className="bn-btn-sm"
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  {tr(vm, "Ajouter au panier", "زيد للسلة")}
                </button>
                <button type="button" className="bn-more" onClick={() => goTo("features")}>
                  {tr(vm, "Plus", "المزيد")} <Icon name={vm.rtl ? "back" : "arrow"} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story({ vm }: SectionProps) {
  return (
    <section className="bn-sec bn-story" id={sid("story")}>
      <div className="bn-decor bn-decor-story" style={DECOR} aria-hidden="true" />
      <div className="bn-wrap">
        <h2 className="bn-title">{vm.titles.story}</h2>
        <div className="bn-story-row">
          <Img vm={vm} i={5} className="bn-story-img" alt="" />
          <div className="bn-story-copy">
            {vm.story.title ? <p>{vm.story.title}</p> : null}
            <p>{vm.story.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Grande phrase : les derniers mots de la 1re phrase et le 1er mot de la suivante en vert sauge. */
function Statement({ text }: { text: string }) {
  const parts = text.split(/(?<=[.!?؟])\s+/).filter(Boolean);
  return (
    <h2 className="bn-statement">
      {parts.map((p, k) => {
        const w = p.split(/\s+/);
        if (k === 0 && w.length > 3) {
          return (
            <span key={k}>
              {w.slice(0, -2).join(" ")} <em>{w.slice(-2).join(" ")}</em>{" "}
            </span>
          );
        }
        if (k === 1 && w.length > 2) {
          return (
            <span key={k}>
              <em>{w[0]}</em> {w.slice(1).join(" ")}{" "}
            </span>
          );
        }
        return <span key={k}>{p} </span>;
      })}
    </h2>
  );
}

function Manifesto({ vm }: SectionProps) {
  const text = vm.titles.problem || vm.problem.solution;
  return (
    <section className="bn-sec bn-manifesto" id={sid("problem")}>
      <div className="bn-decor bn-decor-man" style={DECOR} aria-hidden="true" />
      <div className="bn-wrap">
        <Statement text={text} />
        {vm.problem.pains.length ? (
          <ul className="bn-pains">
            {vm.problem.pains.slice(0, 4).map((p, i) => (
              <li key={i}>
                <Icon name="leaf" /> {p}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Ingredients({ vm }: SectionProps) {
  const n = vm.features.length;
  const half = Math.ceil(n / 2);
  const left = vm.features.slice(0, Math.min(half, 3));
  const right = vm.features.slice(half, half + 3);
  const intro = vm.problem.solution && vm.problem.solution !== vm.story.text ? vm.problem.solution : vm.description;
  const item = (f: (typeof vm.features)[number], i: number, side: string) => (
    <div key={i} className={"bn-ing bn-ing-" + side}>
      <h3>{f.title}</h3>
      {f.text ? <p>{f.text}</p> : null}
    </div>
  );
  return (
    <section className="bn-sec bn-ings" id={sid("features")}>
      <div className="bn-wrap bn-ings-grid">
        <div className="bn-ings-col bn-ings-left">
          <div className="bn-ings-head">
            <h2 className="bn-title">{vm.titles.features}</h2>
            {intro ? <p>{intro}</p> : null}
          </div>
          {left.map((f, i) => item(f, i, "l"))}
        </div>
        <Img vm={vm} i={6} className="bn-ings-img" alt="" />
        <div className="bn-ings-col bn-ings-right">{right.map((f, i) => item(f, i, "r"))}</div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="bn-sec bn-revs-sec" id={sid("reviews")}>
      <div className="bn-wrap">
        <h2 className="bn-title">{vm.titles.reviews}</h2>
        <div className="bn-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article className="bn-rev" key={i}>
              <Stars n={r.rating} className="bn-stars" />
              <p>{r.text}</p>
              <div className="bn-who">
                <span className="bn-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  <small>{r.city || tr(vm, "Client vérifié", "زبون")}</small>
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
      className="bn-order"
      aside={
        <>
          <Img vm={vm} i={2} className="bn-order-img" />
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "leaf"], i)} /> {t}
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
    <section className="bn-sec bn-faq-sec" id={sid("faq")}>
      <div className="bn-wrap bn-faq">
        <h2 className="bn-title">{vm.titles.faq}</h2>
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

function Footer({ vm }: SectionProps) {
  return (
    <footer className="bn-footer">
      <div className="bn-decor bn-decor-foot" style={DECOR} aria-hidden="true" />
      <div className="bn-wrap">
        <div className="bn-foot-cta">
          <h2>{vm.finalCta.title}</h2>
          <Buy vm={vm} className="bn-btn" />
        </div>
        <div className="bn-foot-grid">
          <div className="bn-foot-brand">
            <Logo vm={vm} />
            <b>{vm.name}</b>
          </div>
          <nav className="bn-foot-nav">
            {navOf(vm, 6).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <ul className="bn-foot-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bn-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <small>{vm.delivery}</small>
          {vm.whatsapp ? (
            <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Marcellus&family=Urbanist:wght@300;400;500;600;700",
  font: '"Urbanist", system-ui, sans-serif',
  heading: '"Marcellus", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    variants: (p) => <BestSellers {...p} />,
    story: (p) => <Story {...p} />,
    problem: (p) => <Manifesto {...p} />,
    features: (p) => <Ingredients {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
