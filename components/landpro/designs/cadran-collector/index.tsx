"use client";
// Design « Cadran collector » : en-tête blanc (logo à esperluette, menu centré en petites
// capitales, icônes au trait), hero « pièce à la une » + grand diaporama sombre, bandeau gris
// avec une phrase, grille « Nouveautés » (variantes) sur photos carrées gris clair, bandeau
// gris façon newsletter (→ appel à commander) et pied de page noir.
// Plan des images : 0 scène sombre (diaporama 1), 1 pièce à la une, 2–9 variantes (une par
// variante, en boucle), 10 et 11 scènes sombres (diaporama 2 et 3).
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
  pic,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const FEAT_ICONS = ["case", "papers", "eye", "drop"];

/** Petites icônes au trait propres au design (écrin, certificat). */
function Ico({ name }: { name: string }) {
  if (name === "case")
    return (
      <svg className="cc-ico" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="9" width="17" height="11" rx="1" />
        <path d="M3.5 9 6 4h12l2.5 5M3.5 13h17" />
        <circle cx="12" cy="16.3" r="2" />
      </svg>
    );
  if (name === "papers")
    return (
      <svg className="cc-ico" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="3.5" width="13" height="17" rx="1" />
        <path d="M4 6.5v16h12M9 8h7M9 11h7M9 14h4" />
      </svg>
    );
  return <Icon name={name} className="cc-ico" />;
}

/** Logo : le « & » du nom devient une grande esperluette calligraphiée. */
function Logo({ vm, className }: { vm: VM; className?: string }) {
  const parts = vm.name.split(/\s*&\s*/);
  return (
    <a
      className={"cc-logo " + (className || "")}
      href="#"
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      {parts.length > 1 ? (
        <>
          <span>{parts[0]}</span>
          <i aria-hidden="true">&amp;</i>
          <span>{parts.slice(1).join(" & ")}</span>
        </>
      ) : (
        <span>{vm.name}</span>
      )}
    </a>
  );
}

function Header({ vm }: SectionProps) {
  return (
    <header className="cc-header">
      <div className="cc-wrap cc-header-row">
        <Logo vm={vm} />
        <nav className="cc-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <span className="cc-icons">
          <button type="button" aria-label={vm.titles.variants} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          {vm.whatsapp ? (
            <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Icon name="whatsapp" />
            </a>
          ) : null}
          <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="mail" />
          </button>
          <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
          </button>
        </span>
      </div>
    </header>
  );
}

function Slider({ vm }: { vm: VM }) {
  const slides = Array.from(new Set([pic(vm, 0), pic(vm, 10), pic(vm, 11)].filter(Boolean)));
  const [i, setI] = React.useState(0);
  const n = slides.length;
  React.useEffect(() => {
    if (n < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [n, i]);
  const go = (d: number) => setI((x) => (x + d + n) % n);
  return (
    <div className="cc-slider">
      {slides.map((s, k) => (
        <Img key={s} vm={vm} src={s} i={k} className={"cc-slide" + (k === i ? " on" : "")} alt={k ? "" : vm.name} />
      ))}
      {n > 1 ? (
        <div className="cc-slider-nav">
          <button type="button" aria-label="‹" onClick={() => go(vm.rtl ? 1 : -1)}>
            <Icon name="back" />
          </button>
          {slides.map((s, k) => (
            <button
              key={s}
              type="button"
              className={"cc-dash" + (k === i ? " on" : "")}
              aria-label={String(k + 1)}
              onClick={() => setI(k)}
            />
          ))}
          <button type="button" aria-label="›" onClick={() => go(vm.rtl ? -1 : 1)}>
            <Icon name="arrow" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="cc-hero" id={sid("hero")}>
      <div className="cc-wrap cc-hero-grid">
        <div className="cc-feat">
          <p className="cc-feat-label">
            {vm.eyebrow && vm.show.badge ? vm.eyebrow : tr(vm, "Pièce à la une", "قطعة مميزة")}
          </p>
          <div className="cc-feat-img">
            <Img vm={vm} i={1} />
          </div>
          <Headline vm={vm} className="cc-feat-name" />
          {vm.show.subtitle && vm.subheadline ? <p className="cc-feat-desc">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="cc-feat-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="cc-link" /> : null}
        </div>
        <Slider vm={vm} />
      </div>
    </section>
  );
}

function Band({ vm }: SectionProps) {
  return (
    <section className="cc-band-sec" id={sid("story")}>
      <div className="cc-wrap">
        <p className="cc-band">{vm.story.title}</p>
      </div>
    </section>
  );
}

const Title = ({ children, more }: { children: React.ReactNode; more?: React.ReactNode }) => (
  <div className="cc-title">
    <h2>{children}</h2>
    {more}
  </div>
);

function Arrivals({ vm, setVariant }: SectionProps) {
  const inc = vm.features.slice(0, 2);
  return (
    <section className="cc-sec" id={sid("variants")}>
      <div className="cc-wrap">
        <Title
          more={
            <Go to="order" className="cc-more">
              {tr(vm, "Commander", "اطلب")} <Icon name={vm.rtl ? "back" : "arrow"} />
            </Go>
          }
        >
          {vm.titles.variants}
        </Title>
        <div className="cc-grid">
          {vm.variants.slice(0, 8).map((v, i) => (
            <button
              type="button"
              key={v.name + i}
              className="cc-card"
              onClick={() => {
                setVariant(i);
                scrollToOrder();
              }}
            >
              <span className="cc-card-img">
                <Img vm={vm} i={2 + i} alt={v.name} />
              </span>
              <span className="cc-card-name">{v.name}</span>
              {inc.length ? (
                <span className="cc-inc">
                  {inc.map((f, k) => (
                    <span key={k}>
                      <Ico name={iconAt(FEAT_ICONS, k)} />
                      {f.title}
                    </span>
                  ))}
                </span>
              ) : null}
              {vm.price ? <b className="cc-card-price">{money(vm, vm.price)}</b> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="cc-sec cc-sec-tight" id={sid("features")}>
      <div className="cc-wrap">
        <Title>{vm.titles.features}</Title>
        <ul className="cc-feats">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Ico name={iconAt(FEAT_ICONS, i)} />
              <b>{f.title}</b>
              {f.text ? <span>{f.text}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="cc-sec" id={sid("specs")}>
      <div className="cc-wrap cc-specs">
        <div className="cc-specs-img">
          <Img vm={vm} i={1} alt="" />
        </div>
        <div>
          <Title>{vm.titles.specs}</Title>
          <dl className="cc-dl">
            {vm.specs.map((s, i) => (
              <div key={i}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <Buy vm={vm} className="cc-btn" />
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="cc-sec" id={sid("reviews")}>
      <div className="cc-wrap">
        <Title>{vm.titles.reviews}</Title>
        <div className="cc-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="cc-rev">
              <Stars n={r.rating} className="cc-stars" />
              <p>« {r.text} »</p>
              <small>
                {r.name}
                {r.city ? " · " + r.city : ""}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm, variant } = p;
  const v = vm.variants[variant];
  const inc = vm.features.slice(0, 2);
  return (
    <OrderBox
      p={p}
      className="cc-order"
      aside={
        <>
          <div className="cc-order-img">
            <Img vm={vm} i={v ? 2 + variant : 1} />
          </div>
          <b className="cc-order-name">{v ? v.name : vm.headline}</b>
          {inc.length ? (
            <span className="cc-inc">
              {inc.map((f, k) => (
                <span key={k}>
                  <Ico name={iconAt(FEAT_ICONS, k)} />
                  {f.title}
                </span>
              ))}
            </span>
          ) : null}
          <ul className="cc-order-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
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
    <section className="cc-sec" id={sid("faq")}>
      <div className="cc-wrap cc-faq">
        <Title>{vm.titles.faq}</Title>
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

function Final({ vm, qty, variant }: SectionProps) {
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price * qty) + vm.shipping;
  const v = vm.variants[variant];
  return (
    <section className="cc-news" id={sid("final_cta")}>
      <div className="cc-wrap cc-news-row">
        <p className="cc-news-text">
          <Icon name="mail" />
          <span>{vm.finalCta.title}</span>
        </p>
        <div className="cc-news-form">
          <button type="button" className="cc-news-input" onClick={scrollToOrder}>
            {v ? v.name : vm.name}
            {vm.price ? " · " + money(vm, total) : ""}
          </button>
          <Buy vm={vm} className="cc-news-btn" />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const links: [string, string][] = [
    ["faq", vm.titles.faq],
    ["reviews", tr(vm, "Avis clients", "آراء الزبناء")],
    ["order", tr(vm, "Livraison & paiement", "التوصيل والدفع")],
  ];
  return (
    <footer className="cc-footer">
      <div className="cc-wrap cc-foot-row">
        <Logo vm={vm} className="cc-logo-foot" />
        <nav className="cc-foot-links">
          {links.map(([k, l]) => (
            <Go key={k} to={k}>
              {l}
            </Go>
          ))}
        </nav>
        {vm.whatsapp ? (
          <a className="cc-foot-social" href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" />
            {tr(vm, "Écrivez-nous sur WhatsApp", "راسلنا على واتساب")}
          </a>
        ) : (
          <span className="cc-foot-social">{vm.delivery}</span>
        )}
      </div>
      <small className="cc-copy">
        © {new Date().getFullYear()} {vm.name}
      </small>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Jost:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,500",
  font: '"Jost", "Futura", system-ui, sans-serif',
  heading: '"Jost", "Futura", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    story: (p) => <Band {...p} />,
    variants: (p) => <Arrivals {...p} />,
    features: (p) => <Features {...p} />,
    specs: (p) => <Specs {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
