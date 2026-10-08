"use client";
// Design « Zenova Montre » : barre noire, en-tête blanc (logo espacé, menu centré, bouton
// recherche orange), hero panneau gris avec la montre debout au centre, rangée de « logos »
// (stats), trois cartes collections, modèles tendance, gros plan bracelet avec points
// interactifs (features), fiche technique, avis, formulaire COD, FAQ, bandeau final, pied de page.
//
// Images : 0 hero · 1-3 cartes collections (benefits) · 4-7 modèles tendance (variants)
//          · 8 gros plan bracelet (features) · 0 aside du formulaire.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import {
  announceParts,
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

/** Trait « manuscrit » orange qui barre le lien actif du menu. */
const Strike = () => (
  <svg className="zn-strike" viewBox="0 0 40 16" aria-hidden="true">
    <path d="M3 13 C 12 9, 22 6, 37 2" />
  </svg>
);

const avgRating = (p: SectionProps) =>
  p.vm.reviews.length ? p.vm.reviews.reduce((a, r) => a + r.rating, 0) / p.vm.reviews.length : 0;

function Header({ vm, qty }: SectionProps) {
  const links = navOf(vm, 6);
  return (
    <header className="zn-header">
      <div className="zn-wrap zn-header-row">
        <a
          className="zn-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          {vm.name}
        </a>
        <nav className="zn-nav">
          {links.map((l, i) => (
            <Go key={l.key} to={l.key} className={i === 0 ? "zn-on" : undefined}>
              {l.label}
              {i === 0 ? <Strike /> : null}
            </Go>
          ))}
        </nav>
        <div className="zn-icons">
          <button type="button" className="zn-cart" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="cart" />
            <i>{qty}</i>
          </button>
          <button type="button" aria-label={vm.titles.reviews} onClick={() => goTo("reviews")}>
            <Icon name="user" />
          </button>
          <button type="button" className="zn-search" aria-label={vm.titles.variants} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="zn-hero" id={sid("hero")}>
      <div className="zn-wrap zn-hero-in">
        <div className="zn-hero-panel" aria-hidden="true" />
        <svg className="zn-arc" viewBox="0 0 200 440" aria-hidden="true">
          <path d="M20 10 A 260 260 0 0 1 20 430" />
          <path className="zn-arc-t" d="M10 30 L 60 0 M 6 210 L 80 210 M 10 400 L 64 440" />
        </svg>
        <div className="zn-hero-copy">
          {vm.eyebrow && vm.show.badge ? (
            <p className="zn-eyebrow">
              <span>{vm.eyebrow}</span>
              <i />
            </p>
          ) : null}
          <Headline vm={vm} className="zn-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="zn-lead">{vm.subheadline}</p> : null}
        </div>
        <div className="zn-hero-watch">
          <Img vm={vm} i={0} className="zn-hero-img" />
        </div>
        <div className="zn-hero-offer">
          <small>
            {d ? tr(vm, `Offre exclusive -${d}% cette semaine`, `عرض حصري -${d}% هاد السيمانة`) : vm.delivery}
          </small>
          {vm.show.price && vm.price ? (
            <p className="zn-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? (
            <button type="button" className="zn-btn-dark" onClick={scrollToOrder}>
              <span>{vm.cta}</span>
              <Icon name="bag" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Rangée de « logos » : chaque stat dessinée comme un mot-symbole. */
function Marks({ vm }: SectionProps) {
  return (
    <section className="zn-marks" id={sid("stats")} aria-label={vm.titles.stats}>
      <div className="zn-wrap">
        <ul className="zn-marks-row">
          {vm.stats.slice(0, 7).map((s, i) => (
            <li key={i} className={"zn-wm zn-wm-" + (i % 7)}>
              <b>{s.value}</b>
              {s.label ? <small>{s.label}</small> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Collections({ vm }: SectionProps) {
  return (
    <section className="zn-colls-sec" id={sid("benefits")} aria-label={vm.titles.benefits}>
      <div className="zn-wrap zn-colls">
        {vm.benefits.slice(0, 3).map((b, i) => (
          <article key={i} className={"zn-coll zn-coll-" + i}>
            <div className="zn-coll-img">
              <Img vm={vm} i={1 + i} alt={b.title} />
            </div>
            <div className="zn-coll-copy">
              {b.text ? <small>{b.title}</small> : null}
              <h3>{b.text || b.title}</h3>
              <Buy vm={vm} className="zn-btn-line">
                {tr(vm, "Commander", "اطلب")}
              </Buy>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SecTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="zn-title">
      <h2>{title}</h2>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

function Trending(p: SectionProps) {
  const { vm, setVariant } = p;
  const rating = avgRating(p);
  const d = discount(vm);
  return (
    <section className="zn-sec" id={sid("variants")}>
      <div className="zn-wrap">
        <SecTitle title={vm.titles.variants} sub={vm.delivery} />
        <div className="zn-prods">
          {vm.variants.slice(0, 4).map((v, i) => {
            const sale = i === 2 && d > 0;
            return (
              <button
                type="button"
                key={v.name + i}
                className="zn-prod"
                onClick={() => {
                  setVariant(i);
                  scrollToOrder();
                }}
              >
                {i !== 1 ? <span className="zn-badge">{tr(vm, "TOP", "مميز")}</span> : null}
                {sale ? <span className="zn-badge zn-badge-sale">-{d}%</span> : null}
                <span className="zn-prod-img">
                  <Img vm={vm} i={4 + i} alt={v.name} />
                </span>
                {rating ? <Stars n={rating} className="zn-stars" /> : null}
                <span className="zn-prod-name">
                  {v.color ? <i style={{ background: v.color }} /> : null}
                  {v.name}
                </span>
                {vm.price ? (
                  <span className="zn-prod-price">
                    <b>{money(vm, vm.price)}</b>
                    {sale && vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  </span>
                ) : null}
                <span className="zn-prod-cta">{tr(vm, "Choisir ce modèle", "اختار هاد الموديل")}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Points « + » sur la photo (positions en % de l'image) : feature 0 = bracelet, 1 = couronne, 2 = cadran. */
const SPOTS = [
  { left: "84%", top: "60%" },
  { left: "53.5%", top: "12%" },
  { left: "41%", top: "74%" },
];

function Details({ vm }: SectionProps) {
  const [on, setOn] = React.useState(0);
  const feats = vm.features.slice(0, 3);
  const f = feats[Math.min(on, feats.length - 1)];
  return (
    <section className="zn-detail" id={sid("features")}>
      <div className="zn-wrap zn-detail-in">
        <div className="zn-detail-stage">
          <Img vm={vm} i={8} className="zn-detail-img" alt={vm.titles.features} />
          {feats.map((x, i) => (
            <button
              type="button"
              key={i}
              className={"zn-spot" + (i === on ? " zn-spot-on" : "")}
              style={SPOTS[i]}
              aria-label={x.title}
              aria-pressed={i === on}
              onClick={() => setOn(i)}
            >
              <Icon name="plus" />
            </button>
          ))}
        </div>
        <div className="zn-detail-box" aria-live="polite">
          <small>{vm.titles.features}</small>
          <h3>{f.title}</h3>
          {f.text ? <p>{f.text}</p> : null}
          <div className="zn-detail-dots">
            {feats.map((x, i) => (
              <button
                type="button"
                key={i}
                aria-label={x.title}
                className={i === on ? "zn-on" : undefined}
                onClick={() => setOn(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="zn-specs" id={sid("specs")}>
      <div className="zn-wrap">
        <h2 className="zn-specs-title">{vm.titles.specs}</h2>
        <dl className="zn-specs-grid">
          {vm.specs.slice(0, 6).map((s, i) => (
            <div key={i}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="zn-sec" id={sid("reviews")}>
      <div className="zn-wrap">
        <SecTitle title={vm.titles.reviews} />
        <div className="zn-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="zn-rev">
              <Stars n={r.rating} className="zn-stars" />
              <p>{r.text}</p>
              <div className="zn-who">
                <span className="zn-avatar">{r.name.charAt(0)}</span>
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
    <OrderBox
      p={p}
      className="zn-order"
      aside={
        <>
          <div className="zn-order-stage">
            <Img vm={vm} i={0} className="zn-order-img" />
          </div>
          {vm.price ? (
            <p className="zn-order-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          <ul className="zn-order-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "shield"], i)} /> {t}
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
    <section className="zn-sec" id={sid("faq")}>
      <div className="zn-wrap zn-faq">
        <SecTitle title={vm.titles.faq} />
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

function Final({ vm }: SectionProps) {
  return (
    <section className="zn-final-sec" id={sid("final_cta")}>
      <div className="zn-wrap">
        <div className="zn-final">
          <div className="zn-final-copy">
            <small>{vm.titles.final_cta}</small>
            <h2>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
          </div>
          <div className="zn-final-form">
            <span>
              {vm.name}
              {vm.price ? " · " + money(vm, vm.price) : ""}
            </span>
            <Buy vm={vm} className="zn-btn-dark" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const links = navOf(vm, 8);
  return (
    <footer className="zn-footer">
      <div className="zn-wrap zn-foot-grid">
        <div className="zn-foot-brand">
          <b className="zn-logo">{vm.name}</b>
          {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
          {vm.whatsapp ? (
            <a
              className="zn-social"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
        <nav className="zn-foot-col">
          <b>{tr(vm, "Boutique", "المتجر")}</b>
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <ul className="zn-foot-col zn-foot-trust">
          <li>
            <b>{tr(vm, "Nos engagements", "التزاماتنا")}</b>
          </li>
          {vm.trust.slice(0, 4).map((t, i) => (
            <li key={i}>
              <Icon name={iconAt(["truck", "cash", "swap", "headset"], i)} /> {t}
            </li>
          ))}
        </ul>
        <div className="zn-foot-cta">
          <b>{vm.orderTitle}</b>
          <p>{vm.delivery}</p>
          <Buy vm={vm} className="zn-btn-orange" arrow>
            {tr(vm, "Commander", "اطلب")}
          </Buy>
        </div>
      </div>
      <div className="zn-foot-bottom">
        <div className="zn-wrap">
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
  fonts:
    "family=Cormorant+Garamond:wght@500;600;700&family=Roboto:wght@400;500;700&family=Caveat:wght@700&family=Archivo+Black&family=Permanent+Marker&family=Marcellus&family=DM+Serif+Display",
  font: '"Roboto", system-ui, sans-serif',
  heading: '"Cormorant Garamond", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: ({ vm }) => {
      const parts = announceParts(vm);
      return (
        <div className="zn-top">
          <div className="zn-wrap zn-top-row">
            {parts.slice(0, 3).map((t, i) => {
              if (i > 0) return <span key={i}>{t}</span>;
              const [first, ...rest] = t.split(" ");
              return (
                <span key={i}>
                  <em>{first}</em> {rest.join(" ")}
                </span>
              );
            })}
          </div>
        </div>
      );
    },
    stats: (p) => <Marks {...p} />,
    benefits: (p) => <Collections {...p} />,
    variants: (p) => <Trending {...p} />,
    features: (p) => <Details {...p} />,
    specs: (p) => <Specs {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
