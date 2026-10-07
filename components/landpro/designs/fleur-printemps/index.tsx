"use client";
// Design « Fleur Printemps » : fond gris bleuté très pâle, fleurs au trait, logo serif fin,
// grand titre serif sur trois lignes, flacon or rose et magnolias, « préférées » en
// trois cartes, bloc « découvrir » portrait + flacon, maison, avis, formulaire, FAQ.
// Photos (vm.images) : 0 = hero (flacon détouré), 1-3 = cartes variantes,
// 4 = portrait « découvrir », 5 = flacon « découvrir » (légende : vm.imageLabels[5]).
// Décors fixes (fleurs au trait, branche de magnolia) : /template-assets/…/fleur-printemps/.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { asset } from "../demo-kit";
import { Buy, Go, Headline, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

const deco = (n: string) => asset("fleur-printemps", n);
const FEAT_ICONS = ["leaf", "pen", "drop", "cash"];

/** Décor au trait (purement visuel). */
const Deco = ({ n, className }: { n: string; className: string }) => (
  <img className={"fp-deco " + className} src={deco(n)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
);

/** Lien souligné + flèche fine (« NEW SCENTS HERE → »). */
const Arrow = () => (
  <svg className="fp-arrow" viewBox="0 0 22 10" aria-hidden="true">
    <path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const specOf = (p: SectionProps, re: RegExp) => p.vm.specs.find((s) => re.test(s.label))?.value || "";

function Header({ vm }: SectionProps) {
  return (
    <header className="fp-header">
      <div className="fp-wrap fp-header-row">
        <a
          className="fp-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          {vm.name}
        </a>
        <nav className="fp-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <span className="fp-icons">
          <Go to="variants">
            <Icon name="search" />
            <span className="fp-sr">{vm.titles.variants}</span>
          </Go>
          <Go to="reviews">
            <Icon name="user" />
            <span className="fp-sr">{vm.titles.reviews}</span>
          </Go>
          <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="fp-hero" id={sid("hero")}>
      <Deco n="line-flower" className="fp-hero-line" />
      <Deco n="line-petal" className="fp-hero-petal" />
      <Img vm={vm} i={0} className="fp-hero-img" />
      <div className="fp-wrap fp-hero-in">
        <Headline vm={vm} className="fp-h1" />
        <div className="fp-hero-cta">
          {vm.show.subtitle && vm.subheadline ? <p className="fp-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="fp-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? (
            <Buy vm={vm} className="fp-link">
              {vm.cta}
              <Arrow />
            </Buy>
          ) : null}
        </div>
      </div>
      <Deco n="branch" className="fp-hero-branch" />
    </section>
  );
}

function Favorites(p: SectionProps) {
  const { vm, variant, setVariant } = p;
  const kind = specOf(p, /concentr|type|نوع/i);
  const size = specOf(p, /contenan|volume|taille|ml|حجم/i);
  return (
    <section className="fp-favs" id={sid("variants")}>
      <div className="fp-head">
        <h2 className="fp-h2">{vm.titles.variants}</h2>
        <Go to="order" className="fp-link">
          {tr(vm, "Toutes nos offres ici", "جميع العروض هنا")}
          <Arrow />
        </Go>
      </div>
      <hr className="fp-rule" />
      <div className="fp-wrap">
        <div className="fp-cards">
          {vm.variants.slice(0, 3).map((v, i) => (
            <article key={v.name + i} className={"fp-card" + (variant === i ? " is-on" : "")}>
              <button
                type="button"
                className="fp-card-pic"
                aria-label={v.name}
                onClick={() => {
                  setVariant(i);
                  scrollToOrder();
                }}
              >
                <Img vm={vm} i={1 + i} className="fp-card-img" alt={v.name} />
              </button>
              <h3>{v.name}</h3>
              {kind || size ? (
                <small className="fp-meta">
                  {kind ? <span>{kind}</span> : null}
                  {size ? <span>{size}</span> : null}
                </small>
              ) : null}
              {vm.price ? <b className="fp-card-price">{money(vm, vm.price)}</b> : null}
              <button
                type="button"
                className="fp-link fp-link-sm"
                onClick={() => {
                  setVariant(i);
                  scrollToOrder();
                }}
              >
                {tr(vm, "Ajouter au panier", "أضف إلى السلة")}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Discover({ vm }: SectionProps) {
  const label = vm.imageLabels[5] || vm.name;
  return (
    <section className="fp-disc" id={sid("showcase")}>
      <Deco n="line-flower-2" className="fp-disc-line" />
      <div className="fp-disc-grid">
        <Img vm={vm} i={4} className="fp-disc-portrait" alt="" />
        <div className="fp-disc-copy">
          <h2 className="fp-h2 fp-disc-title">{vm.titles.showcase}</h2>
          <button type="button" className="fp-disc-pic" aria-label={label} onClick={scrollToOrder}>
            <Img vm={vm} i={5} className="fp-disc-img" alt={label} />
          </button>
          <h3 className="fp-caption">{label}</h3>
          {vm.description ? <p className="fp-disc-text">{vm.description}</p> : null}
          <Buy vm={vm} className="fp-link">
            {vm.cta}
            <Arrow />
          </Buy>
        </div>
      </div>
    </section>
  );
}

function House({ vm }: SectionProps) {
  return (
    <section className="fp-sec" id={sid("features")}>
      <div className="fp-wrap">
        <h2 className="fp-h2 fp-center">{vm.titles.features}</h2>
        <ul className="fp-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEAT_ICONS, i)} />
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="fp-sec fp-revs-sec" id={sid("reviews")}>
      <Deco n="line-flower" className="fp-revs-line" />
      <div className="fp-wrap">
        <h2 className="fp-h2 fp-center">{vm.titles.reviews}</h2>
        <div className="fp-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <figure key={i} className="fp-rev">
              <Stars n={r.rating} className="fp-stars" />
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
  const v = vm.variants[p.variant];
  return (
    <OrderBox
      p={p}
      className="fp-order"
      aside={
        <>
          <Img vm={vm} i={vm.variants.length ? 1 + Math.min(p.variant, 2) : 1} className="fp-order-img" />
          <div className="fp-order-meta">
            <h3>{v?.name || vm.name}</h3>
            <ul>
              {vm.trust.slice(0, 3).map((t, i) => (
                <li key={i}>
                  <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="fp-sec" id={sid("faq")}>
      <div className="fp-wrap fp-faq">
        <h2 className="fp-h2 fp-center">{vm.titles.faq}</h2>
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

function Final({ vm, qty }: SectionProps) {
  const price = vm.offers.find((o) => o.qty === qty)?.price ?? vm.price;
  return (
    <section className="fp-final" id={sid("final_cta")}>
      <Deco n="line-flower-2" className="fp-final-line" />
      <div className="fp-wrap fp-final-in">
        <h2 className="fp-h2">{vm.finalCta.title}</h2>
        {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
        <div className="fp-final-box">
          <span>
            {vm.name}
            {price ? " · " + money(vm, price) : ""}
          </span>
          <Buy vm={vm} className="fp-link">
            {vm.cta}
            <Arrow />
          </Buy>
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
        ["showcase", vm.titles.showcase],
        ["order", tr(vm, "Commander", "اطلب")],
      ],
    ],
    [
      tr(vm, "Aide", "مساعدة"),
      [
        ["faq", vm.titles.faq],
        ["order", tr(vm, "Livraison & paiement", "التوصيل والدفع")],
        ["reviews", vm.titles.reviews],
      ],
    ],
  ];
  return (
    <footer className="fp-footer">
      <div className="fp-wrap">
        <div className="fp-foot-grid">
          <div className="fp-foot-brand">
            <b className="fp-logo fp-logo-foot">{vm.name}</b>
            {vm.description ? <p>{vm.description.split(/[.!؟?]/)[0] + "."}</p> : null}
          </div>
          {cols.map(([h, links]) => (
            <nav key={h} className="fp-foot-col">
              <b>{h}</b>
              {links.map(([k, l]) => (
                <Go key={k + l} to={k}>
                  {l}
                </Go>
              ))}
            </nav>
          ))}
          <div className="fp-foot-col">
            <b>{tr(vm, "Contact", "تواصل")}</b>
            {vm.whatsapp ? (
              <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> WhatsApp
              </a>
            ) : null}
            {vm.trust.slice(0, 2).map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
        <div className="fp-foot-bottom">
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
  fonts: "family=Italiana&family=Jost:wght@300;400;500",
  font: '"Jost", system-ui, sans-serif',
  heading: '"Italiana", "Cormorant Garamond", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    variants: (p) => <Favorites {...p} />,
    showcase: (p) => <Discover {...p} />,
    features: (p) => <House {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
