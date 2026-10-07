"use client";
// Design « Lime Sneaker » : boutique de sneakers noire à accent citron.
// En-tête logo éclair + nav centrée, hero titre condensé géant + scène sneaker,
// cartes lifestyle à pied citron, barre de réassurance, angles produit, avis,
// formulaire COD, FAQ et pied de page noir.
// Plan des images : 0 = hero, 1-3 = cartes lifestyle (benefits),
// 4-6 = angles produit (showcase ; 4 = aussi visuel du formulaire).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
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

const BENEFIT_ICONS = ["sparkle", "up", "diamond"];
const TRUST_ICONS = ["truck", "shield", "swap", "headset"];

/** Logo éclair (plein, citron). */
const Bolt = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.5 1h9l-4.2 7.2H20L7 23l3.6-10.6H5.2z" fill="currentColor" />
  </svg>
);

/** Icône de carte : liste du kit + losange plein. */
function CardIcon({ name }: { name: string }) {
  if (name === "diamond")
    return (
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M12 3.5 20.5 12 12 20.5 3.5 12z" fill="currentColor" />
      </svg>
    );
  if (name === "sparkle")
    return (
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path
          d="M12 2.5 13.6 9l5.2-3.8L15 10.4l6.5 1.6-6.5 1.6 3.8 5.2-5.2-3.8L12 21.5 10.4 15l-5.2 3.8L9 13.6 2.5 12 9 10.4 5.2 5.2 10.4 9z"
          fill="currentColor"
        />
      </svg>
    );
  return <Icon name={name} />;
}

/** Trait de pinceau sous le mot script. */
const Brush = () => (
  <svg className="ls-brush" viewBox="0 0 220 34" preserveAspectRatio="none" aria-hidden="true">
    <path d="M4 26 C60 18 130 10 214 6 L150 16 C120 20 90 24 60 30 L120 24 C90 30 40 32 4 30 Z" fill="currentColor" />
  </svg>
);

function Header({ vm, qty }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  const links = navOf(vm, 4);
  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <header className="ls-header">
      <div className="ls-wrap ls-header-row">
        <a
          className="ls-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            top();
          }}
        >
          <Bolt className="ls-logo-bolt" />
          <b>{vm.name}</b>
        </a>
        <nav className={"ls-nav" + (open ? " ls-open" : "")} onClick={() => setOpen(false)}>
          <a
            href="#"
            className="ls-on"
            onClick={(e) => {
              e.preventDefault();
              top();
            }}
          >
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <span className="ls-icons">
          <button type="button" aria-label={tr(vm, "Produit", "المنتج")} onClick={() => goTo("showcase")}>
            <Icon name="search" />
          </button>
          <button type="button" className="ls-bag" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
          <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const d = discount(vm);
  const stat = vm.stats[0];
  const faces = vm.reviews.slice(0, 4);
  return (
    <section className="ls-hero" id={sid("hero")}>
      <div className="ls-hero-art">
        <Img vm={vm} i={0} className="ls-hero-img" />
        <div className="ls-flash">
          <Bolt className="ls-flash-bolt" />
          <small>{tr(vm, "Vente flash", "عرض خاص")}</small>
          {d ? <b>-{d}%</b> : <b className="ls-flash-cod">COD</b>}
          <small>
            {d ? tr(vm, "Sur ce modèle", "على هذا الموديل") : tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}
          </small>
        </div>
      </div>
      <div className="ls-wrap ls-hero-in">
        <div className="ls-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="ls-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="ls-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="ls-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="ls-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          <div className="ls-ctas">
            {vm.show.cta ? <Buy vm={vm} className="ls-btn" arrow /> : null}
            <Go to="showcase" className="ls-btn-out">
              {tr(vm, "Voir les modèles", "شوف الموديلات")}
            </Go>
          </div>
          {stat ? (
            <div className="ls-proof">
              {faces.length ? (
                <span className="ls-faces" aria-hidden="true">
                  {faces.map((r, i) => (
                    <i key={i} className={"ls-face ls-face-" + i}>
                      {r.name.charAt(0)}
                    </i>
                  ))}
                </span>
              ) : null}
              <button type="button" className="ls-plus" aria-label={vm.titles.reviews} onClick={() => goTo("reviews")}>
                <Icon name="plus" />
              </button>
              <span className="ls-proof-txt">
                {tr(vm, "Ils nous font confiance", "وثقو فينا")}
                <span>
                  <b>{stat.value}</b> {stat.label}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Lifestyle({ vm }: SectionProps) {
  const items = vm.benefits.slice(0, 4);
  return (
    <section className="ls-life" id={sid("benefits")}>
      <div className="ls-wrap ls-life-in">
        <div className="ls-life-copy">
          <h2 className="ls-h2">{vm.titles.benefits}</h2>
          <span className="ls-script">{tr(vm, "Un style de vie", "أسلوب حياة")}</span>
          <Brush />
          {vm.description ? <p>{vm.description}</p> : null}
          <Go to="showcase" className="ls-link">
            {tr(vm, "Voir la collection", "شوف المجموعة")} <Icon name={vm.rtl ? "back" : "arrow"} />
          </Go>
        </div>
        <div className="ls-cards" style={{ ["--n" as string]: items.length }}>
          {items.map((b, i) => (
            <article key={i} className="ls-card">
              <Img vm={vm} i={1 + i} className="ls-card-img" alt={b.title} />
              <div className="ls-card-foot">
                <span className="ls-card-ico">
                  <CardIcon name={iconAt(BENEFIT_ICONS, i)} />
                </span>
                <span>
                  <h3>{b.title}</h3>
                  {b.text ? <small>{b.text}</small> : null}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar({ vm }: SectionProps) {
  return (
    <section className="ls-trust" id={sid("features")}>
      <div className="ls-wrap">
        <ul className="ls-trust-row">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(TRUST_ICONS, i)} className="ls-trust-ico" />
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

function SecHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="ls-head">
      {sub ? <small className="ls-eyebrow">{sub}</small> : null}
      <h2 className="ls-h2">{title}</h2>
    </div>
  );
}

function Drops({ vm, setVariant }: SectionProps) {
  const n = Math.min(3, Math.max(1, vm.images.length > 4 ? 3 : vm.images.length));
  const v = vm.variants;
  return (
    <section className="ls-sec" id={sid("showcase")}>
      <div className="ls-wrap">
        <SecHead title={vm.titles.showcase} sub={vm.name} />
        <div className="ls-drops">
          {Array.from({ length: n }, (_, i) => (
            <article key={i} className="ls-drop">
              <div className="ls-drop-pic">
                <Img vm={vm} i={4 + i} className="ls-drop-img" alt={vm.imageLabels[4 + i] || vm.name} />
                {i === 0 && discount(vm) ? <span className="ls-tag">-{discount(vm)}%</span> : null}
              </div>
              <div className="ls-drop-body">
                <small>{vm.imageLabels[4 + i] || (v[i] ? v[i].name : vm.name)}</small>
                <h3>{v[i] ? v[i].name : vm.name}</h3>
                <div className="ls-drop-row">
                  {vm.price ? (
                    <span className="ls-drop-price">
                      <b>{money(vm, vm.price)}</b>
                      {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="ls-round"
                    aria-label={vm.cta}
                    onClick={() => {
                      if (v[i]) setVariant(i);
                      scrollToOrder();
                    }}
                  >
                    <Icon name="bag" />
                  </button>
                </div>
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
    <section className="ls-sec ls-sec-alt" id={sid("reviews")}>
      <div className="ls-wrap">
        <SecHead title={vm.titles.reviews} />
        <div className="ls-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="ls-rev">
              <Stars n={r.rating} className="ls-stars" />
              <p>« {r.text} »</p>
              <div className="ls-who">
                <i className={"ls-face ls-face-" + (i % 4)}>{r.name.charAt(0)}</i>
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
      className="ls-order"
      aside={
        <div className="ls-order-card">
          <Img vm={vm} i={4} className="ls-order-img" />
          <h3>{vm.name}</h3>
          {vm.specs.length ? (
            <dl className="ls-specs">
              {vm.specs.slice(0, 4).map((s, i) => (
                <div key={i}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
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
    <section className="ls-sec" id={sid("faq")}>
      <div className="ls-wrap ls-faq">
        <SecHead title={vm.titles.faq} />
        <div>
          {vm.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                {f.question}
                <span className="ls-faq-ico">
                  <Icon name="plus" />
                </span>
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
  const links = navOf(vm, 6);
  return (
    <footer className="ls-footer">
      <div className="ls-wrap">
        <div className="ls-foot-cta">
          <h2 className="ls-h2">{vm.headline}</h2>
          <Buy vm={vm} className="ls-btn" arrow />
        </div>
        <div className="ls-foot-grid">
          <div className="ls-foot-brand">
            <span className="ls-logo">
              <Bolt className="ls-logo-bolt" />
              <b>{vm.name}</b>
            </span>
            <p>{vm.delivery}</p>
            {vm.whatsapp ? (
              <a
                className="ls-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          <nav className="ls-foot-col">
            <b>{tr(vm, "Boutique", "المتجر")}</b>
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <ul className="ls-foot-col ls-foot-trust">
            <li>
              <b>{tr(vm, "Nos garanties", "ضماناتنا")}</b>
            </li>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name="check" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="ls-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <small>{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</small>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Anton&family=Permanent+Marker&family=Poppins:wght@400;500;600;700",
  font: '"Poppins", system-ui, sans-serif',
  heading: '"Anton", "Bebas Neue", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Lifestyle {...p} />,
    features: (p) => <TrustBar {...p} />,
    showcase: (p) => <Drops {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
