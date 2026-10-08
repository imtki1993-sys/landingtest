"use client";
// Design « Nexora Sneaker » : en-tête (logo X, nav centrée, pastille citron sur grande forme
// courbe citron), barre latérale noire d'icônes, hero titre condensé 3 lignes + sneaker en
// diagonale, bande noire de 4 atouts, bestsellers (cartes variantes), bande citron de chiffres,
// grande carte noire (photo + citation + encadré « Rejoins la famille »), formulaire, avis, FAQ.
// Images : 0 = hero (sneaker détourée, aussi au formulaire), 1-4 = cartes variantes,
// 5 = photo de la carte noire (jambes en ville).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
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

/** Icônes au trait propres au design (chaussure, plume, vagues). */
const Glyph = ({ name }: { name: string }) => {
  const p: Record<string, React.ReactNode> = {
    shoe: (
      <>
        <path d="M3 17.5V9.2c0-.6.5-1 1-.9 1.6.4 3.1.1 4.2-1l.6-.6 2.5 3.1c1.6 2 3.9 3.1 6.4 3.4l1.5.2c1 .1 1.8 1 1.8 2v2.1z" />
        <path d="M3 17.5h18M9.5 10.6l1.3-1.2M11.3 12.3l1.3-1.1" />
      </>
    ),
    feather: (
      <>
        <path d="M20 4c-6 0-11 3.8-12.4 9.6L6 20" />
        <path d="M20 4c.3 7-4 12.6-10.6 12.6M15 9.5H11M17.4 6.7h-3.6M12.8 12.8H9" />
      </>
    ),
    waves: (
      <>
        <path d="M3 7c2-1.4 4-1.4 6 0s4 1.4 6 0l3-1M3 12c2-1.4 4-1.4 6 0s4 1.4 6 0l3-1M3 17c2-1.4 4-1.4 6 0s4 1.4 6 0l3-1" />
        <path d="m19 4 2 2-2 2M19 9l2 2-2 2M19 14l2 2-2 2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
        <path d="M15.5 4.8a3.4 3.4 0 0 1 0 6.4M17.8 14.8c2 .7 3.3 2.4 3.7 5.2" />
      </>
    ),
  };
  return p[name] ? (
    <svg
      className="lpx-ico"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p[name]}
    </svg>
  ) : (
    <Icon name={name} />
  );
};

const FEAT_ICONS = ["shoe", "feather", "shield", "waves"];
const STAT_ICONS = ["cube", "users", "award", "headset"];

/** Logo « X » en deux traits (noir + citron). */
const Mark = () => (
  <svg className="nx-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M5 4h6l16 24h-6z" fill="currentColor" />
    <path d="M27 4h-6L5 28h6z" fill="var(--nx-lime)" />
  </svg>
);

const Arrow = ({ vm }: { vm: SectionProps["vm"] }) => (
  <span className="nx-arr">
    <Icon name={vm.rtl ? "back" : "arrow"} />
  </span>
);

function Header({ vm }: SectionProps) {
  const links = [
    { key: "variants", label: tr(vm, "Modèles", "الموديلات") },
    ...navOf(vm, 4, ["features", "reviews", "faq", "order"]),
  ].filter((l) => l.key !== "variants" || (vm.variants.length && !vm.hidden.has("variants")));
  return (
    <header className="nx-header">
      <div className="nx-wrap nx-header-row">
        <a
          className="nx-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <Mark />
          <b>{vm.name}</b>
        </a>
        <nav className="nx-nav">
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <button type="button" className="nx-pill" onClick={scrollToOrder}>
          <span>{tr(vm, "Commander", "اطلب دابا")}</span>
          <Icon name={vm.rtl ? "back" : "arrow"} />
        </button>
      </div>
    </header>
  );
}

function Rail({ vm }: SectionProps) {
  const items: [string, string, () => void][] = [
    ["home", tr(vm, "Accueil", "الرئيسية"), () => window.scrollTo({ top: 0, behavior: "smooth" })],
    ["grid", tr(vm, "Atouts", "المميزات"), () => goTo("features")],
    ["shoe", tr(vm, "Modèles", "الموديلات"), () => goTo("variants")],
    ["heart", tr(vm, "Avis", "الآراء"), () => goTo("reviews")],
    ["user", tr(vm, "Commander", "اطلب"), scrollToOrder],
  ];
  return (
    <nav className="nx-rail" aria-label="Menu">
      {items.map(([ic, label, fn], i) => (
        <button key={ic} type="button" className={i === 0 ? "on" : ""} aria-label={label} onClick={fn}>
          {ic === "home" ? (
            <svg
              className="lpx-ico"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />
            </svg>
          ) : (
            <Glyph name={ic} />
          )}
        </button>
      ))}
    </nav>
  );
}

function Hero(p: SectionProps) {
  const { vm } = p;
  return (
    <section className="nx-hero" id={sid("hero")}>
      <div className="nx-hero-deco" aria-hidden="true">
        <span className="nx-blob" />
        <span className="nx-dots" />
        <span className="nx-ring" />
        <span className="nx-arc" />
      </div>
      <Rail {...p} />
      <div className="nx-wrap nx-hero-in">
        <div className="nx-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="nx-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="nx-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="nx-lead">{vm.subheadline}</p> : null}
          <div className="nx-hero-actions">
            {vm.show.cta ? (
              <button type="button" className="nx-btn" onClick={scrollToOrder}>
                <span>{vm.cta}</span>
                <Arrow vm={vm} />
              </button>
            ) : null}
            {vm.show.price && vm.price ? (
              <p className="nx-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </p>
            ) : null}
          </div>
        </div>
        <div className="nx-hero-media">
          <Img vm={vm} i={0} className="nx-hero-img" />
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="nx-sec nx-feat-sec" id={sid("features")}>
      <div className="nx-wrap">
        <h2 className="nx-sr">{vm.titles.features}</h2>
        <div className="nx-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <article key={i} className="nx-feat">
              <Glyph name={iconAt(FEAT_ICONS, i)} />
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bestsellers({ vm, setVariant }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const move = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 240) + 14) * (vm.rtl ? -1 : 1), behavior: "smooth" });
  };
  return (
    <section className="nx-sec nx-best-sec" id={sid("variants")}>
      <div className="nx-wrap nx-best">
        <div className="nx-best-head">
          <h2 className="nx-h2">{vm.titles.variants}</h2>
          <i className="nx-bar" />
          <div className="nx-best-arrows">
            <button type="button" className="nx-round" aria-label="‹" onClick={() => move(-1)}>
              <Icon name={vm.rtl ? "arrow" : "back"} />
            </button>
            <button type="button" className="nx-round nx-round-dark" aria-label="›" onClick={() => move(1)}>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </button>
          </div>
        </div>
        <div className="nx-cards" ref={ref}>
          {vm.variants.map((v, i) => (
            <button
              key={v.name + i}
              type="button"
              className="nx-card"
              onClick={() => {
                setVariant(i);
                scrollToOrder();
              }}
            >
              <Img vm={vm} i={1 + i} className="nx-card-img" alt={v.name} />
              <span className="nx-card-name">
                {v.color ? <i style={{ background: v.color }} /> : null}
                {v.name}
              </span>
              <span className="nx-card-foot">
                {vm.price ? <b>{money(vm, vm.price)}</b> : <b />}
                <span className="nx-arr nx-arr-sm">
                  <Icon name={vm.rtl ? "back" : "arrow"} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ vm }: SectionProps) {
  return (
    <section className="nx-stats" id={sid("stats")}>
      <div className="nx-wrap">
        <h2 className="nx-sr">{vm.titles.stats}</h2>
        <div className="nx-stats-band">
          {vm.stats.slice(0, 4).map((s, i) => (
            <div key={i} className="nx-stat">
              <Glyph name={iconAt(STAT_ICONS, i)} />
              <span>
                <b>{s.value}</b>
                <small>{s.label}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final({ vm, qty }: SectionProps) {
  const quote = vm.story.title || vm.finalCta.text;
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping;
  return (
    <section className="nx-final-sec" id={sid("final_cta")}>
      <div className="nx-wrap-wide">
        <div className="nx-final">
          <div className="nx-final-photo">
            <Img vm={vm} i={5} alt="" />
          </div>
          <blockquote className="nx-quote">
            <span className="nx-qmark" aria-hidden="true">
              “
            </span>
            <p>{quote}</p>
            <cite>— {tr(vm, `L'équipe ${vm.name}`, `فريق ${vm.name}`)}</cite>
          </blockquote>
          <div className="nx-join">
            <h2>{vm.titles.final_cta}</h2>
            <p>{vm.finalCta.text && vm.finalCta.text !== quote ? vm.finalCta.text : vm.finalCta.title}</p>
            {vm.price ? (
              <span className="nx-join-price">
                {vm.name} · {money(vm, total)}
              </span>
            ) : null}
            <Buy vm={vm} className="nx-pill nx-pill-lg" arrow />
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
      className="nx-order"
      aside={
        <div className="nx-order-card">
          <small className="nx-eyebrow">{vm.name}</small>
          <div className="nx-order-stage">
            <i className="nx-order-blob" />
            <Img vm={vm} i={0} className="nx-order-img" />
          </div>
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

function Reviews({ vm }: SectionProps) {
  return (
    <section className="nx-sec" id={sid("reviews")}>
      <div className="nx-wrap">
        <div className="nx-sec-head">
          <h2 className="nx-h2">{vm.titles.reviews}</h2>
          <i className="nx-bar" />
        </div>
        <div className="nx-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="nx-rev">
              <span className="nx-qmark" aria-hidden="true">
                “
              </span>
              <p>{r.text}</p>
              <div className="nx-rev-foot">
                <span className="nx-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  {r.city ? <small>{r.city}</small> : null}
                </span>
                <Stars n={r.rating} className="nx-stars" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="nx-sec" id={sid("faq")}>
      <div className="nx-wrap nx-faq">
        <div className="nx-sec-head">
          <h2 className="nx-h2">{vm.titles.faq}</h2>
          <i className="nx-bar" />
        </div>
        <div className="nx-faq-list">
          {vm.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                {f.question}
                <span className="nx-plus">
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
  return (
    <footer className="nx-footer">
      <div className="nx-wrap nx-foot-row">
        <span className="nx-logo">
          <Mark />
          <b>{vm.name}</b>
        </span>
        <small>{vm.delivery}</small>
        <small>
          © {new Date().getFullYear()} {vm.name}
        </small>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Fraunces:wght@400;500",
  font: '"Inter", system-ui, sans-serif',
  heading: '"Barlow Condensed", "Oswald", sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    variants: (p) => <Bestsellers {...p} />,
    stats: (p) => <Stats {...p} />,
    final_cta: (p) => <Final {...p} />,
    order: (p) => <Order {...p} />,
    reviews: (p) => <Reviews {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
