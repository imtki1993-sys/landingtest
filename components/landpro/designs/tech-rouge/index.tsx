"use client";
// Design « Tech Rouge » : boutique high-tech blanche (accent rouge-orangé, Jost).
// Barre du haut, en-tête logo + menu + recherche, hero gris avec éventail de téléphones,
// grilles de produits, bannières promo grises, liste + cartes produit, pastilles,
// bande d'infos et pied de page noir.
// Images : 0 hero (éventail) · 1-5 cartes « populaires » (variantes) · 6-7 bannières offres ·
// [1,8,9,10,11,4,3,5] cartes « tendance » (showcase) · 2 et 12 cartes de la liste (features) ·
// 10 visuel du formulaire.
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
  tr,
} from "../kit";
import "./style.css";

const SHOW_IMGS = [1, 8, 9, 10, 11, 4, 3, 5];
const PILL_ICONS = [
  "bolt",
  "drop",
  "eye",
  "globe",
  "lock",
  "award",
  "truck",
  "swap",
  "star",
  "moon",
  "sparkle",
  "cube",
];
const INFO_ICONS = ["cart", "phone", "truck", "cash"];

/** Logo : pastille rouge avec l'initiale et un éclair, nom en gras et sous-titre. */
function Logo({ vm, foot }: { vm: SectionProps["vm"]; foot?: boolean }) {
  return (
    <a
      className={"tr-logo" + (foot ? " tr-logo-foot" : "")}
      href="#"
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      <span className="tr-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <circle cx="21" cy="20" r="17" fill="currentColor" />
          <path d="M4 26 L12 22 L9 34z" fill="currentColor" />
          <path d="M18 11h4.5a9 9 0 0 1 0 18H18z" fill="none" stroke="#fff" strokeWidth="3.4" />
          <path d="M20 14l-5 8h4l-2 6 6-9h-4z" fill="#fff" />
        </svg>
      </span>
      <span className="tr-logo-txt">
        <b>{vm.name}</b>
        <small>{tr(vm, "Boutique high-tech", "متجر التكنولوجيا")}</small>
      </span>
    </a>
  );
}

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="tr-header">
      <div className="tr-wrap tr-header-row">
        <Logo vm={vm} />
        <nav className="tr-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
              {l.key !== "order" ? <Icon name="down" className="tr-chev" /> : null}
            </Go>
          ))}
        </nav>
        <div className="tr-header-end">
          <button type="button" className="tr-search" onClick={() => goTo("variants")}>
            <span>{tr(vm, "Rechercher un produit", "قلب على منتج")}</span>
            <Icon name="search" />
          </button>
          <button type="button" className="tr-ic" aria-label={vm.titles.variants} onClick={() => goTo("variants")}>
            <Icon name="heart" />
          </button>
          <button type="button" className="tr-ic tr-bag" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
          <button type="button" className="tr-ic tr-user" aria-label={vm.orderTitle} onClick={scrollToOrder}>
            <Icon name="user" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="tr-hero" id={sid("hero")}>
      <div className="tr-wrap tr-hero-in">
        <div className="tr-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="tr-hero-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="tr-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="tr-lead">{vm.subheadline}</p> : null}
          <div className="tr-hero-act">
            {vm.show.cta ? <Buy vm={vm} className="tr-btn-dark" arrow /> : null}
            {vm.show.price && vm.price ? (
              <span className="tr-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="tr-hero-art">
        <Img vm={vm} i={0} className="tr-hero-img" />
        <span className="tr-dots" aria-hidden="true">
          <i className="on" />
          <i />
          <i />
        </span>
      </div>
    </section>
  );
}

/** Étoiles vides décoratives des fiches produit (aucune note inventée). */
const Rate = () => (
  <span className="tr-rate" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 24 24">
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </svg>
    ))}
  </span>
);

function Price({ vm }: { vm: SectionProps["vm"] }) {
  if (!vm.price) return null;
  return (
    <p className="tr-price">
      <b>{money(vm, vm.price)}</b>
      {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
    </p>
  );
}

function SecHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="tr-sec-head">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Popular({ vm, setVariant }: SectionProps) {
  return (
    <section className="tr-sec" id={sid("variants")}>
      <div className="tr-wrap">
        <SecHead title={vm.titles.variants}>
          <Go to="order" className="tr-more">
            {tr(vm, "Commander maintenant", "اطلب دابا")} <Icon name="arrow" />
          </Go>
        </SecHead>
        <div className="tr-grid5">
          {vm.variants.slice(0, 5).map((v, i) => (
            <button
              type="button"
              key={v.name + i}
              className="tr-card"
              onClick={() => {
                setVariant(i);
                scrollToOrder();
              }}
            >
              <span className="tr-card-img">
                <Img vm={vm} i={1 + i} alt={v.name} />
              </span>
              <Rate />
              <span className="tr-card-name">
                {v.color ? <i className="tr-swatch" style={{ background: v.color }} /> : null}
                {v.name}
              </span>
              <Price vm={vm} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Offers({ vm, setQty }: SectionProps) {
  return (
    <section className="tr-sec tr-sec-flat" id={sid("offers")}>
      <div className="tr-wrap">
        <div className="tr-banners">
          {vm.offers.slice(0, 4).map((o, i) => (
            <article key={o.qty + o.label} className="tr-banner">
              <small>{o.badge || vm.name}</small>
              <h3>{o.label}</h3>
              <b className="tr-banner-price">{money(vm, o.price)}</b>
              <button
                type="button"
                className="tr-pill"
                onClick={() => {
                  setQty(o.qty);
                  scrollToOrder();
                }}
              >
                {tr(vm, "Commander", "اطلب")}
              </button>
              <Img vm={vm} i={6 + i} className="tr-banner-img" alt="" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trending({ vm }: SectionProps) {
  const [tab, setTab] = React.useState(0);
  const tabs = [tr(vm, "Nouveautés", "الجديد"), tr(vm, "Populaires", "الأكثر طلبا"), tr(vm, "Promos", "التخفيضات")];
  const n = SHOW_IMGS.length;
  const list = SHOW_IMGS.map((_, k) => SHOW_IMGS[(k + tab * 3) % n]);
  return (
    <section className="tr-sec" id={sid("showcase")}>
      <div className="tr-wrap">
        <SecHead title={vm.titles.showcase}>
          <div className="tr-tabs" role="tablist">
            {tabs.map((t, i) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === i}
                key={t}
                className={tab === i ? "on" : ""}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
        </SecHead>
        <div className="tr-grid4">
          {list.map((ix, k) => (
            <button type="button" key={k} className="tr-card tr-card-lg" onClick={scrollToOrder}>
              <span className="tr-card-img">
                <Img vm={vm} i={ix} alt={vm.imageLabels[ix % Math.max(1, vm.images.length)] || vm.name} />
              </span>
              <Rate />
              <span className="tr-card-name">{vm.imageLabels[ix % Math.max(1, vm.images.length)] || vm.name}</span>
              <Price vm={vm} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="tr-feat-sec" id={sid("features")}>
      <div className="tr-wrap tr-feat">
        <div className="tr-feat-list">
          <h3>{vm.titles.features}</h3>
          <ul>
            {vm.features.slice(0, 8).map((f, i) => (
              <li key={i}>{f.title}</li>
            ))}
          </ul>
        </div>
        {vm.benefits.slice(0, 2).map((b, i) => (
          <article key={i} className="tr-feat-card">
            <Img vm={vm} i={i ? 12 : 2} className="tr-feat-img" alt={b.title} />
            <h3>{b.title}</h3>
            {b.text ? <p>{b.text}</p> : null}
            <Buy vm={vm} className="tr-link" arrow />
          </article>
        ))}
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  const d = discount(vm);
  return (
    <OrderBox
      p={p}
      className="tr-order"
      aside={
        <div className="tr-order-card">
          <small>{d ? tr(vm, `Économisez ${d}%`, `وفر ${d}%`) : vm.eyebrow || vm.name}</small>
          <h3>{vm.name}</h3>
          <Price vm={vm} />
          <Img vm={vm} i={10} className="tr-order-img" />
          <ul>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap", "headset"], i)} /> {t}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function Pills({ vm }: SectionProps) {
  const items = [...vm.stats.map((s) => [s.value, s.label]), ...vm.trust.map((t) => ["", t])].slice(0, 12);
  return (
    <section className="tr-sec" id={sid("stats")}>
      <div className="tr-wrap">
        <SecHead title={vm.titles.stats} />
        <div className="tr-pills">
          {items.map(([v, l], i) => (
            <span key={i} className="tr-pill-mark">
              <Icon name={iconAt(PILL_ICONS, i)} />
              <span>
                {v ? <b>{v}</b> : null} {l}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="tr-sec tr-sec-flat" id={sid("faq")}>
      <div className="tr-wrap">
        <SecHead title={vm.titles.faq} />
        <div className="tr-faq">
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

function Info({ vm }: SectionProps) {
  return (
    <section className="tr-info" id={sid("how")}>
      <div className="tr-wrap tr-info-row">
        {vm.steps.slice(0, 4).map((s, i) => (
          <div key={i} className="tr-info-col">
            <Icon name={iconAt(INFO_ICONS, i)} />
            <b>{s.title}</b>
            {s.text ? <span>{s.text}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const cols: [string, [string, string][]][] = [
    [
      tr(vm, "Informations", "معلومات"),
      [
        ["variants", vm.titles.variants],
        ["showcase", vm.titles.showcase],
        ["features", vm.titles.features],
        ["offers", vm.titles.offers],
      ],
    ],
    [
      tr(vm, "Service client", "خدمة الزبناء"),
      [
        ["faq", vm.titles.faq],
        ["how", vm.titles.how],
        ["order", tr(vm, "Commander", "اطلب")],
        ["stats", vm.titles.stats],
      ],
    ],
  ];
  return (
    <footer className="tr-footer">
      <div className="tr-wrap tr-foot-grid">
        <div className="tr-foot-brand">
          <Logo vm={vm} foot />
          <p>
            © {new Date().getFullYear()} {vm.name}. {vm.description ? vm.description.split(/[.!]/)[0] + "." : ""}
          </p>
        </div>
        {cols.map(([h, links]) => (
          <nav key={h} className="tr-foot-col">
            <b>{h}</b>
            {links.map(([k, l]) => (
              <Go key={k} to={k}>
                {l}
              </Go>
            ))}
          </nav>
        ))}
        <div className="tr-foot-col tr-foot-app">
          <b>{tr(vm, "Commandez en 1 minute", "اطلب ف دقيقة")}</b>
          <p>{vm.delivery}</p>
          <div className="tr-badges">
            <button type="button" className="tr-badge" onClick={scrollToOrder}>
              <Icon name="cash" />
              <span>
                <small>{tr(vm, "Payez à la", "خلص عند")}</small>
                {tr(vm, "Livraison", "الاستلام")}
              </span>
            </button>
            {vm.whatsapp ? (
              <a className="tr-badge" href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" />
                <span>
                  <small>{tr(vm, "Écrivez-nous sur", "راسلنا ف")}</small>
                  WhatsApp
                </span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

function TopBar({ vm }: SectionProps) {
  const parts = announceParts(vm);
  return (
    <div className="tr-top">
      <div className="tr-wrap tr-top-row">
        <span className="tr-top-msg">{parts.join(" · ")}</span>
        <span className="tr-top-end">
          <span>
            {vm.currency} <Icon name="down" />
          </span>
          <Go to="how">
            <Icon name="pin" /> {tr(vm, "Livraison", "التوصيل")}
          </Go>
          {vm.whatsapp ? (
            <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
              <Icon name="phone" /> +{vm.whatsapp}
            </a>
          ) : null}
        </span>
      </div>
    </div>
  );
}

const design: Design = {
  fonts: "family=Jost:wght@400;500;600;700",
  font: '"Jost", "Poppins", system-ui, sans-serif',
  heading: '"Jost", "Poppins", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: (p) => <TopBar {...p} />,
    variants: (p) => <Popular {...p} />,
    offers: (p) => <Offers {...p} />,
    showcase: (p) => <Trending {...p} />,
    features: (p) => <Features {...p} />,
    order: (p) => <Order {...p} />,
    stats: (p) => <Pills {...p} />,
    faq: (p) => <Faq {...p} />,
    how: (p) => <Info {...p} />,
  },
};
export default design;
