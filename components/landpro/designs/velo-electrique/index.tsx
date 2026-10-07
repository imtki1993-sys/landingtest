"use client";
// Design « Vélo Électrique » : barre sombre (logo, recherche, téléphone, icônes) + menu blanc,
// hero avec grand mot filigrane, vélo légendé (lignes vers les pièces = caractéristiques),
// câble de recharge, points du diaporama ; 4 tuiles catégories colorées (bleu / sombre /
// clair / rouge) ; « offres spéciales » à onglets + 3 cartes produit ; bandeau bleu avec
// un grand vélo qui déborde ; formulaire ; FAQ ; pied de page sombre en colonnes.
// Hashtags verticaux décoratifs sur les côtés.
// Images : 0 = hero, 1 = tuile sombre, 2 = tuile claire, 3-5 = cartes produit (variantes),
// 6 = vélo du bandeau promo. Diaporama du hero : images 0, 3, 4, 5, 6.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import { Buy, discount, Go, goTo, Headline, Icon, Img, money, OrderBox, pic, scrollToOrder, sid, tr } from "../kit";
import "./style.css";

const shown = (vm: VM, k: string) => vm.order.includes(k) && !vm.hidden.has(k);
const slug = (vm: VM) =>
  vm.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "") || "ebike";
/** mot filigrane : premier mot du nom */
const water = (vm: VM) => (vm.name.trim().split(/\s+/)[0] || "").toLowerCase();

/** Légendes du vélo (coordonnées dans l'image 1240 × 780) : point, coude, sens du trait. */
const CALLOUTS: { dot: [number, number]; elbow: [number, number]; dir: 1 | -1 }[] = [
  { dot: [470, 132], elbow: [560, 52], dir: 1 },
  { dot: [800, 384], elbow: [860, 300], dir: 1 },
  { dot: [560, 470], elbow: [470, 318], dir: -1 },
  { dot: [585, 545], elbow: [650, 708], dir: 1 },
];
const LINE_W = 210;

function Logo({ vm }: { vm: VM }) {
  return (
    <a
      className="ve-logo"
      href="#"
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      <svg viewBox="0 0 40 30" aria-hidden="true">
        <path
          d="M6 18c6 1 18 0 26-6 3-3 2-7-3-7C19 5 9 13 9 20c0 6 8 7 16 3"
          fill="none"
          stroke="#3aa9dc"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M2 16c10 2 24 0 36-7"
          fill="none"
          stroke="#3aa9dc"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".6"
        />
      </svg>
      <b>{vm.name}</b>
    </a>
  );
}

function Header({ vm, qty }: SectionProps) {
  const links: [string, string][] = (
    [
      ["benefits", vm.titles.benefits],
      ["variants", vm.titles.variants],
      ["final_cta", tr(vm, "Promotions", "العروض")],
      ["order", tr(vm, "Livraison et paiement", "التوصيل والأداء")],
      ["faq", vm.titles.faq],
    ] as [string, string][]
  ).filter(([k]) => shown(vm, k));
  return (
    <header className="ve-header">
      <div className="ve-top">
        <div className="ve-wrap ve-top-row">
          <Logo vm={vm} />
          <button type="button" className="ve-search" onClick={() => goTo("variants")}>
            <span>{tr(vm, "Trouver un vélo", "قلب على بشكليت")}</span>
            <Icon name="search" />
          </button>
          <span className="ve-city">
            {tr(vm, "Maroc", "المغرب")} <Icon name="down" />
          </span>
          {vm.whatsapp ? (
            <a
              className="ve-phone"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
            >
              +{vm.whatsapp.replace(/^(\d{3})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5 $6")}
            </a>
          ) : (
            <span className="ve-phone">{vm.u.cod}</span>
          )}
          <span className="ve-icons">
            <button type="button" aria-label={tr(vm, "Avis", "الآراء")} onClick={() => goTo("faq")}>
              <Icon name="user" />
            </button>
            <button type="button" aria-label={vm.titles.variants} onClick={() => goTo("variants")}>
              <Icon name="heart" />
            </button>
            <button type="button" className="ve-cart" aria-label={vm.cta} onClick={scrollToOrder}>
              <Icon name="cart" />
              <i>{qty}</i>
            </button>
          </span>
        </div>
      </div>
      <nav className="ve-menu">
        <div className="ve-wrap ve-menu-row">
          {links.map(([k, l]) => (
            <Go key={k} to={k}>
              {l}
            </Go>
          ))}
          <button type="button" className="ve-burger" aria-label="Menu" onClick={scrollToOrder}>
            <Icon name="menu" />
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const slides = vm.images.length > 1 ? [0, 3, 4, 5, 6].slice(0, Math.min(5, vm.images.length)) : [0];
  const [cur, setCur] = React.useState(0);
  const feats = shown(vm, "features") ? vm.features.slice(0, 4) : [];
  const isMain = slides[cur] === 0;
  return (
    <section className="ve-hero" id={sid("hero")}>
      <span className="ve-water" aria-hidden="true">
        {water(vm)}
      </span>
      <div className="ve-wrap ve-hero-in">
        <div className="ve-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="ve-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="ve-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="ve-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="ve-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="ve-btn" /> : null}
          <svg className="ve-cable" viewBox="0 0 600 150" aria-hidden="true">
            <rect x="0" y="0" width="22" height="26" rx="4" fill="#fff" stroke="#d6dbe0" />
            <rect x="5" y="6" width="12" height="12" rx="2" fill="#111" />
            <path
              d="M11 26v14c0 70 -20 90 60 92 120 3 160 -40 300 -30 90 6 160 20 230 6"
              fill="none"
              stroke="#151617"
              strokeWidth="3"
            />
          </svg>
        </div>
        <div className="ve-bike-box">
          <img className="ve-bike" src={pic(vm, slides[cur])} alt={vm.name} />
          {isMain && feats.length ? (
            <>
              <svg className="ve-lines" viewBox="0 0 1240 780" aria-hidden="true" id={sid("features")}>
                {feats.map((_, i) => {
                  const c = CALLOUTS[i];
                  return (
                    <g key={i}>
                      <path
                        d={`M${c.dot[0]} ${c.dot[1]}L${c.elbow[0]} ${c.elbow[1]}h${LINE_W * c.dir}`}
                        fill="none"
                        stroke="#3aa9dc"
                        strokeWidth="1.6"
                      />
                      <circle cx={c.dot[0]} cy={c.dot[1]} r="6" fill="#3aa9dc" />
                    </g>
                  );
                })}
              </svg>
              {feats.map((f, i) => {
                const c = CALLOUTS[i];
                const x0 = c.dir === 1 ? c.elbow[0] : c.elbow[0] - LINE_W;
                return (
                  <span
                    key={i}
                    className="ve-callout"
                    style={{
                      left: `${(x0 / 1240) * 100}%`,
                      top: `${(c.elbow[1] / 780) * 100}%`,
                      width: `${(LINE_W / 1240) * 100}%`,
                    }}
                  >
                    {f.title}
                  </span>
                );
              })}
            </>
          ) : null}
        </div>
      </div>
      <div className="ve-wrap ve-hero-foot">
        <span className="ve-socials">
          {vm.whatsapp ? (
            <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Icon name="whatsapp" />
            </a>
          ) : null}
          <span>
            <Icon name="facebook" />
          </span>
          <span>
            <Icon name="instagram" />
          </span>
        </span>
        <span className="ve-dots">
          {slides.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-label={String(i + 1)}
              className={i === cur ? "is-on" : ""}
              onClick={() => setCur(i)}
            />
          ))}
        </span>
        <span className="ve-lang">{vm.lang === "ar" ? "ع" : "Fr"}</span>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return shown(vm, "features") ? <span className="ve-anchor" aria-hidden="true" /> : null;
}

function Tiles({ vm }: SectionProps) {
  return (
    <section className="ve-tiles-sec" id={sid("benefits")}>
      <span className="ve-tag ve-tag-end" aria-hidden="true">
        #{slug(vm)}catalogue
      </span>
      <div className="ve-wrap">
        <div className="ve-tiles">
          {vm.benefits.slice(0, 4).map((b, i) => (
            <article key={i} className={"ve-tile ve-tile-" + (i % 4)}>
              {i % 4 === 1 || i % 4 === 2 ? <Img vm={vm} i={i % 4} className="ve-tile-img" alt="" /> : null}
              <div className="ve-tile-copy">
                <h3>{b.title}</h3>
                {b.text ? <p>{b.text}</p> : null}
                <Buy vm={vm} className="ve-btn-line">
                  {tr(vm, "Commander", "اطلب")}
                </Buy>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products({ vm, setVariant }: SectionProps) {
  const tabs = [
    tr(vm, "Meilleures ventes", "الأكثر مبيعا"),
    tr(vm, "Nouveautés", "الجديد"),
    tr(vm, "En promo", "التخفيضات"),
  ];
  const [tab, setTab] = React.useState(0);
  const [start, setStart] = React.useState(0);
  const n = vm.variants.length;
  const list = vm.variants.map((v, i) => ({ v, i }));
  const rot = (tab + start) % n;
  const items = [...list.slice(rot), ...list.slice(0, rot)].slice(0, 3);
  return (
    <section className="ve-sec" id={sid("variants")}>
      <span className="ve-tag ve-tag-start" aria-hidden="true">
        #{slug(vm)}hits
      </span>
      <div className="ve-wrap">
        <h2 className="ve-title">{vm.titles.variants}</h2>
        <div className="ve-tabs-row">
          <div className="ve-tabs" role="tablist">
            {tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={i === tab}
                className={i === tab ? "is-on" : ""}
                onClick={() => setTab(i)}
              >
                {t}
              </button>
            ))}
          </div>
          {n > 3 ? (
            <div className="ve-pager">
              <button type="button" onClick={() => setStart((s) => (s - 1 + n) % n)}>
                {tr(vm, "Préc", "السابق")}
              </button>
              <i />
              <button type="button" onClick={() => setStart((s) => (s + 1) % n)}>
                {tr(vm, "Suiv", "التالي")}
              </button>
            </div>
          ) : null}
        </div>
        <div className="ve-cards">
          {items.map(({ v, i }, k) => (
            <article key={v.name + i} className="ve-card">
              <Img vm={vm} i={3 + i} className="ve-card-img" alt={v.name} />
              <small className="ve-card-cat">
                {v.color ? <i style={{ background: v.color }} /> : null}
                {vm.name}
              </small>
              <h3>{v.name}</h3>
              {vm.price ? (
                <p className="ve-card-price">
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  <b>{money(vm, vm.price)}</b>
                </p>
              ) : null}
              <div className="ve-card-actions">
                <button
                  type="button"
                  className={k === 0 ? "ve-btn ve-btn-sm" : "ve-btn ve-btn-sm ve-btn-grey"}
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  {tr(vm, "Commander", "اطلب")}
                </button>
                <span className={k === 0 ? "ve-fav is-on" : "ve-fav"} aria-hidden="true">
                  <Icon name="heart" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Promo({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="ve-promo-sec" id={sid("final_cta")}>
      <span className="ve-tag ve-tag-end ve-tag-light" aria-hidden="true">
        #{slug(vm)}bigsale
      </span>
      <div className="ve-promo">
        <div className="ve-wrap ve-promo-in">
          <div className="ve-promo-media">
            <Img vm={vm} i={6} className="ve-promo-img" alt="" />
          </div>
          <div className="ve-promo-copy">
            <h2>{d ? tr(vm, `Remises jusqu'à -${d} %`, `تخفيضات حتى ${d}%-`) : vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
            <Buy vm={vm} className="ve-btn-white">
              {vm.cta}
            </Buy>
          </div>
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
      className="ve-order"
      title={vm.titles.order}
      aside={
        <div className="ve-order-card">
          <Img vm={vm} i={0} className="ve-order-img" />
          {vm.specs.length ? (
            <dl>
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
                <Icon name="check" /> {t}
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
    <section className="ve-sec ve-sec-grey" id={sid("faq")}>
      <div className="ve-wrap ve-faq">
        <h2 className="ve-title">{vm.titles.faq}</h2>
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
  const cols: [string, [string, string][]][] = [
    [
      tr(vm, "Entreprise", "الشركة"),
      [
        ["benefits", vm.titles.benefits],
        ["variants", vm.titles.variants],
        ["faq", vm.titles.faq],
      ],
    ],
    [
      tr(vm, "Clients", "الزبناء"),
      [
        ["order", tr(vm, "Livraison", "التوصيل")],
        ["order", vm.u.cod],
        ["faq", tr(vm, "Garantie et retours", "الضمان والإرجاع")],
      ],
    ],
  ];
  return (
    <footer className="ve-footer">
      <span className="ve-water ve-water-foot" aria-hidden="true">
        {water(vm)}
      </span>
      <div className="ve-wrap ve-foot-grid">
        <div className="ve-foot-brand">
          <Logo vm={vm} />
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
        </div>
        {cols.map(([h, links]) => (
          <nav key={h} className="ve-foot-col">
            <b>{h}</b>
            {links.map(([k, l], i) => (
              <Go key={k + i} to={k}>
                {l}
              </Go>
            ))}
          </nav>
        ))}
        <div className="ve-foot-col ve-foot-offer">
          <b>{tr(vm, "Promos et offres spéciales", "العروض والتخفيضات")}</b>
          <small>{vm.delivery}</small>
          <button type="button" className="ve-foot-input" onClick={scrollToOrder}>
            <span>
              {vm.name}
              {vm.price ? " · " + money(vm, vm.price) : ""}
            </span>
            <Icon name="cart" />
          </button>
          <span className="ve-foot-soc">
            <Icon name="facebook" />
            <Icon name="instagram" />
            <Icon name="whatsapp" />
          </span>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Montserrat:wght@400;500;600;700;800",
  font: '"Montserrat", system-ui, sans-serif',
  heading: '"Montserrat", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    benefits: (p) => <Tiles {...p} />,
    variants: (p) => <Products {...p} />,
    final_cta: (p) => <Promo {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
