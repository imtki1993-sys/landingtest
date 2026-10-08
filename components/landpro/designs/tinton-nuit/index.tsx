"use client";
// Design « Montre nuit » : barre fine (aide · annonces défilantes · pays/langue),
// en-tête posé sur une grande photo de nuit, mosaïque de 5 bannières sombres,
// 4 engagements à icônes vertes, cartes « collection » sur halo vert,
// bandeau photo plein écran, formulaire COD, avis, FAQ et pied de page noir.
//
// Photos : 0 = hero (scène de nuit) · 1–5 = bannières de la mosaïque
// (1 haute, 2 large, 3 promo, 4 petite, 5 large) · 6–8 (+) = cartes variantes
// · 9 = bandeau final · 1 = visuel du formulaire.
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

const FEATURE_ICONS = ["truck", "cash", "headset", "award", "shield", "gift"];

/** Croissant vert (le « O » du logo et la marque des titres). */
const Crescent = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.5 6.2A8 8 0 1 0 17.5 17.8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="18.6" cy="12" r="1.6" fill="currentColor" />
  </svg>
);

/** Nom de la boutique en capitales ; le dernier « o » devient le croissant vert. */
function Logo({ vm, className }: { vm: SectionProps["vm"]; className?: string }) {
  const n = vm.name || "";
  const i = n.toLowerCase().lastIndexOf("o");
  return (
    <a
      className={className}
      href="#"
      aria-label={n}
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      {i > 0 && /^[\x20-\x7e]+$/.test(n) ? (
        <>
          {n.slice(0, i)}
          <Crescent className="tn-logo-o" />
          {n.slice(i + 1)}
        </>
      ) : (
        n
      )}
    </a>
  );
}

/** En-tête de section centré : marque verte, sur-titre, titre. */
const Head = ({ eyebrow, children, mark = false }: { eyebrow?: string; children: React.ReactNode; mark?: boolean }) => (
  <div className="tn-head">
    {mark ? <Crescent className="tn-head-mark" /> : null}
    {eyebrow ? <small className="tn-eyebrow">{eyebrow}</small> : null}
    <h2>{children}</h2>
  </div>
);

function TopBar({ vm }: SectionProps) {
  const parts = announceParts(vm);
  const [k, setK] = React.useState(0);
  React.useEffect(() => {
    if (parts.length < 2) return;
    const t = window.setInterval(() => setK((x) => x + 1), 4500);
    return () => window.clearInterval(t);
  }, [parts.length]);
  const n = parts.length || 1;
  const cur = parts[((k % n) + n) % n] || "";
  return (
    <div className="tn-top">
      <div className="tn-wrap tn-top-row">
        <span className="tn-top-help">
          {vm.whatsapp ? (
            <>
              {tr(vm, "Besoin d'aide ? Appelez-nous : ", "محتاج مساعدة؟ عيط لينا : ")}
              <a href={`tel:+${vm.whatsapp}`} dir="ltr">
                +{vm.whatsapp}
              </a>
            </>
          ) : (
            vm.u.cod
          )}
        </span>
        <div className="tn-top-mid">
          {n > 1 ? (
            <button type="button" aria-label="‹" onClick={() => setK((x) => x - 1)}>
              <Icon name={vm.rtl ? "arrow" : "back"} />
            </button>
          ) : null}
          <span key={k} className="tn-top-msg">
            <Icon name="tag" /> {cur}
          </span>
          {n > 1 ? (
            <button type="button" aria-label="›" onClick={() => setK((x) => x + 1)}>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </button>
          ) : null}
        </div>
        <span className="tn-top-end">
          <span>
            {tr(vm, "Maroc", "المغرب")} <Icon name="down" />
          </span>
          <span>
            {tr(vm, "Français", "العربية")} <Icon name="down" />
          </span>
        </span>
      </div>
    </div>
  );
}

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="tn-header">
      <div className="tn-wrap tn-header-row">
        <Logo vm={vm} className="tn-logo" />
        <nav className="tn-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="tn-tools">
          <button type="button" onClick={() => goTo("variants")}>
            <Icon name="search" />
            <span>{tr(vm, "Modèles", "الموديلات")}</span>
          </button>
          <button type="button" onClick={() => goTo("reviews")}>
            <Icon name="user" />
            <span>{tr(vm, "Avis", "الآراء")}</span>
          </button>
          <button type="button" className="tn-cart" onClick={scrollToOrder} aria-label={vm.cta}>
            <Icon name="bag" />
            <span>{tr(vm, "Panier", "السلة")}</span>
            <i>{qty}</i>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="tn-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="tn-hero-bg" />
      <div className="tn-wrap tn-hero-in">
        <div className="tn-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="tn-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="tn-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="tn-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="tn-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              {discount(vm) ? <em>-{discount(vm)}%</em> : null}
            </p>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="tn-btn" /> : null}
        </div>
      </div>
    </section>
  );
}

/** Mosaïque de 5 bannières : 4 avantages (ou caractéristiques) + une bannière promo. */
function Mosaic({ vm }: SectionProps) {
  const items = [...vm.benefits, ...vm.features].slice(0, 4);
  const d = discount(vm);
  const promo = {
    eyebrow: d ? tr(vm, "Offre spéciale", "عرض خاص") : vm.u.cod,
    title: d ? tr(vm, `Économisez jusqu'à ${d}%`, `وفر حتى ${d}%`) : vm.price ? money(vm, vm.price) : vm.name,
  };
  const tiles = [
    ...items.slice(0, 2).map((b) => ({ eyebrow: b.text, title: b.title })),
    promo,
    ...items.slice(2).map((b) => ({ eyebrow: b.text, title: b.title })),
  ];
  return (
    <section className="tn-mosaic-sec" id={sid("benefits")}>
      <div className={"tn-mosaic tn-mosaic-" + tiles.length}>
        {tiles.map((t, i) => (
          <article key={i} className={"tn-tile tn-tile-" + i}>
            <Img vm={vm} i={1 + i} className="tn-tile-img" alt="" />
            <div className="tn-tile-copy">
              {t.eyebrow ? <small className="tn-eyebrow">{t.eyebrow}</small> : null}
              <h3>{t.title}</h3>
              <Buy vm={vm} className="tn-btn tn-btn-sm">
                {tr(vm, "Acheter", "اشري دابا")}
              </Buy>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="tn-feats-sec" id={sid("features")}>
      <div className="tn-wrap">
        <h2 className="tn-sr">{vm.titles.features}</h2>
        <ul className="tn-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEATURE_ICONS, i)} className="tn-feat-ico" />
              <b>{f.title}</b>
              {f.text ? <span>{f.text}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Collections({ vm, setVariant }: SectionProps) {
  return (
    <section className="tn-sec tn-colls-sec" id={sid("variants")}>
      <div className="tn-wrap">
        <Head mark eyebrow={tr(vm, "Collection ", "تشكيلة ") + vm.name}>
          {vm.titles.variants}
        </Head>
        <div className="tn-colls">
          {vm.variants.slice(0, 6).map((v, i) => (
            <button
              type="button"
              key={v.name + i}
              className="tn-coll"
              onClick={() => {
                setVariant(i);
                scrollToOrder();
              }}
            >
              <Img vm={vm} i={6 + i} className="tn-coll-img" alt={v.name} />
              <b>{v.name}</b>
              <span className="tn-coll-n">
                {v.color ? <i style={{ background: v.color }} /> : null}
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Band({ vm, qty }: SectionProps) {
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price * qty) + vm.shipping;
  return (
    <section className="tn-band" id={sid("final_cta")}>
      <Img vm={vm} i={9} className="tn-band-img" alt="" />
      <div className="tn-band-copy">
        <small className="tn-eyebrow">{vm.finalCta.title}</small>
        <h2>{vm.titles.final_cta}</h2>
        {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
        <Buy vm={vm} className="tn-btn" />
        {vm.price ? (
          <small className="tn-band-price">
            {vm.name} · {money(vm, total)}
          </small>
        ) : null}
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="tn-order"
      title={vm.titles.order}
      aside={
        <div className="tn-order-card">
          <Img vm={vm} i={1} className="tn-order-img" />
          <div className="tn-order-over">
            <small className="tn-eyebrow">{vm.eyebrow || vm.u.cod}</small>
            <b>{vm.name}</b>
            {vm.price ? (
              <span>
                {money(vm, vm.price)}
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            ) : null}
          </div>
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

function Reviews({ vm }: SectionProps) {
  return (
    <section className="tn-sec" id={sid("reviews")}>
      <div className="tn-wrap">
        <Head eyebrow={tr(vm, "Avis clients", "آراء الزبناء")}>{vm.titles.reviews}</Head>
        <div className="tn-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="tn-rev">
              <Stars n={r.rating} className="tn-stars" />
              <p>{r.text}</p>
              <span className="tn-who">
                <b>{r.name}</b>
                {r.city ? <small>{r.city}</small> : null}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="tn-sec" id={sid("faq")}>
      <div className="tn-wrap tn-faq">
        <Head eyebrow={tr(vm, "Aide", "مساعدة")}>{vm.titles.faq}</Head>
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
  const links = navOf(vm, 6);
  return (
    <footer className="tn-footer">
      <div className="tn-wrap">
        <div className="tn-foot-grid">
          <div className="tn-foot-brand">
            <Logo vm={vm} className="tn-logo" />
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
          </div>
          <nav className="tn-foot-col">
            <b>{tr(vm, "Boutique", "المتجر")}</b>
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <div className="tn-foot-col">
            <b>{tr(vm, "Service client", "خدمة الزبناء")}</b>
            {vm.trust.slice(0, 4).map((t, i) => (
              <span key={i}>{t}</span>
            ))}
            {vm.whatsapp ? (
              <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>
        <div className="tn-foot-bottom">
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
  fonts: "family=Jost:wght@300;400;500;600",
  font: '"Jost", "Montserrat", system-ui, sans-serif',
  heading: '"Jost", "Montserrat", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: (p) => <TopBar {...p} />,
    benefits: (p) => <Mosaic {...p} />,
    features: (p) => <Features {...p} />,
    variants: (p) => <Collections {...p} />,
    final_cta: (p) => <Band {...p} />,
    order: (p) => <Order {...p} />,
    reviews: (p) => <Reviews {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
