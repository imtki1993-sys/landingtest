"use client";
// Design « Parfum Bordeaux » : barre d'annonce bordeaux, logo serif centré,
// hero photo crème, cartes collections, fiches flacons, histoire, bandeau promo,
// avis, formulaire et grand pied de page bordeaux.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Countdown } from "../../parts";
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
  pic,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const TRUST_ICONS = ["leaf", "award", "globe", "gift"];
const STORY_ICONS = ["star", "award", "leaf", "pen"];

/** Petit ornement doré sous les titres de section. */
const Orn = () => (
  <svg className="pb-orn" viewBox="0 0 80 10" aria-hidden="true">
    <path d="M0 5h32M48 5h32" stroke="currentColor" strokeWidth="1" />
    <path d="M40 1l4 4-4 4-4-4z" fill="currentColor" />
  </svg>
);
const Title = ({ children }: { children: React.ReactNode }) => (
  <div className="pb-title">
    <h2>{children}</h2>
    <Orn />
  </div>
);

function Header({ vm, qty }: SectionProps) {
  const links = navOf(vm, 6).map((l) => (
    <Go key={l.key} to={l.key}>
      {l.label}
    </Go>
  ));
  const left = links.slice(0, 3);
  const right = links.slice(3, 6);
  return (
    <header className="pb-header">
      <div className="pb-wrap pb-header-row">
        <nav className="pb-nav">{left}</nav>
        <a
          className="pb-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <b>{vm.name}</b>
        </a>
        <div className="pb-header-end">
          <nav className="pb-nav">{right}</nav>
          <span className="pb-icons">
            <button type="button" aria-label={tr(vm, "Avis", "الآراء")} onClick={() => goTo("reviews")}>
              <Icon name="user" />
            </button>
            <button type="button" aria-label={tr(vm, "Produit", "المنتج")} onClick={() => goTo("variants")}>
              <Icon name="search" />
            </button>
            <button type="button" className="pb-bag" aria-label={vm.cta} onClick={scrollToOrder}>
              <Icon name="bag" />
              <i>{qty}</i>
            </button>
          </span>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="pb-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="pb-hero-bg" />
      <div className="pb-wrap pb-hero-in">
        <div className="pb-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="pb-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="pb-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="pb-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="pb-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="pb-btn" /> : null}
        </div>
        <ul className="pb-hero-trust">
          {vm.trust.slice(0, 4).map((t, i) => (
            <li key={i}>
              <Icon name={iconAt(TRUST_ICONS, i)} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Collections({ vm }: SectionProps) {
  return (
    <section className="pb-sec" id={sid("benefits")}>
      <div className="pb-wrap">
        <Title>{vm.titles.benefits}</Title>
        <div className="pb-colls">
          {vm.benefits.slice(0, 4).map((b, i) => (
            <article key={i} className={"pb-coll pb-coll-" + (i % 4)}>
              <Img vm={vm} i={6 + i} className="pb-coll-img" alt="" />
              <div className="pb-coll-copy">
                <h3>{b.title}</h3>
                {b.text ? <p>{b.text}</p> : null}
                <Buy vm={vm} className="pb-btn-line">
                  {tr(vm, "Découvrir", "اكتشف")}
                </Buy>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fragrances({ vm, setVariant }: SectionProps) {
  const sub = vm.specs.find((s) => /concentr|type|نوع/i.test(s.label))?.value || "";
  return (
    <section className="pb-sec pb-sec-tight" id={sid("variants")}>
      <div className="pb-wrap">
        <Title>{vm.titles.variants}</Title>
        <div className="pb-cards">
          {vm.variants.slice(0, 5).map((v, i) => (
            <article key={v.name + i} className="pb-card">
              <span className="pb-heart" aria-hidden="true">
                <Icon name="heart" />
              </span>
              <Img vm={vm} i={1 + i} className="pb-card-img" alt={v.name} />
              <h3>{v.name}</h3>
              {sub ? <small>{sub}</small> : null}
              {vm.price ? <b className="pb-card-price">{money(vm, vm.price)}</b> : null}
              <button
                type="button"
                className="pb-btn pb-btn-sm"
                onClick={() => {
                  setVariant(i);
                  scrollToOrder();
                }}
              >
                {tr(vm, "Choisir", "اختار")}
              </button>
            </article>
          ))}
        </div>
        <Go to="order" className="pb-more">
          {tr(vm, "Commander maintenant", "اطلب دابا")} <Icon name="arrow" />
        </Go>
      </div>
    </section>
  );
}

function Story({ vm }: SectionProps) {
  return (
    <section className="pb-story" id={sid("story")}>
      <Img vm={vm} i={10} className="pb-story-img" alt="" />
      <div className="pb-wrap pb-story-in">
        <div className="pb-story-copy">
          <small className="pb-eyebrow">{vm.titles.story}</small>
          <h2>{vm.story.title}</h2>
          <p>{vm.story.text}</p>
          <Buy vm={vm} className="pb-btn" />
          {vm.features.length ? (
            <ul className="pb-story-feats">
              {vm.features.slice(0, 4).map((f, i) => (
                <li key={i}>
                  <Icon name={iconAt(STORY_ICONS, i)} />
                  <span>
                    <b>{f.title}</b>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Promo(p: SectionProps) {
  const { vm } = p;
  const d = discount(vm);
  return (
    <section className="pb-promo-sec" id={sid("countdown")}>
      <div className="pb-wrap">
        <div className="pb-promo">
          <div className="pb-promo-num">
            {d ? (
              <>
                <b>{d}</b>
                <span>
                  <i>%</i>
                  {tr(vm, "OFF", "تخفيض")}
                </span>
              </>
            ) : (
              <b className="pb-promo-cod">{tr(vm, "COD", "COD")}</b>
            )}
          </div>
          <div className="pb-promo-copy">
            <h2>{vm.finalCta.title}</h2>
            <p>{vm.titles.countdown}</p>
            <Countdown vm={vm} small />
          </div>
          <Buy vm={vm} className="pb-btn-light" />
          <svg className="pb-promo-flower" viewBox="0 0 100 100" aria-hidden="true">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="50" cy="28" rx="10" ry="22" transform={`rotate(${a} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="5" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const move = (d: number) =>
    ref.current?.scrollBy({ left: d * ref.current.clientWidth * (vm.rtl ? -1 : 1), behavior: "smooth" });
  return (
    <section className="pb-sec" id={sid("reviews")}>
      <div className="pb-wrap">
        <Title>{vm.titles.reviews}</Title>
        <div className="pb-revs">
          <button type="button" className="pb-arrow" aria-label="‹" onClick={() => move(-1)}>
            <Icon name={vm.rtl ? "arrow" : "back"} />
          </button>
          <div className="pb-revs-track" ref={ref}>
            {vm.reviews.map((r, i) => (
              <article className="pb-rev" key={i}>
                <div className="pb-rev-top">
                  <span className="pb-quote">“</span>
                  <Stars n={r.rating} className="pb-stars" />
                </div>
                <p>{r.text}</p>
                <div className="pb-who">
                  <span className="pb-avatar">{r.name.charAt(0)}</span>
                  <span>
                    <b>{r.name}</b>
                    <small>{r.city || tr(vm, "Cliente vérifiée", "زبونة")}</small>
                  </span>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="pb-arrow" aria-label="›" onClick={() => move(1)}>
            <Icon name={vm.rtl ? "back" : "arrow"} />
          </button>
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
      className="pb-order"
      aside={
        <>
          <Img vm={vm} i={2} className="pb-order-img" />
          <ul>
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
    <section className="pb-sec" id={sid("faq")}>
      <div className="pb-wrap pb-faq">
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

function Final({ vm, qty }: SectionProps) {
  return (
    <section className="pb-final-sec" id={sid("final_cta")}>
      <div className="pb-wrap">
        <div className="pb-final">
          <Img vm={vm} i={11} className="pb-final-img" alt="" />
          <div className="pb-final-copy">
            <h2>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
          </div>
          <div className="pb-final-form">
            <span>
              {vm.name}
              {vm.price
                ? " · " + money(vm, (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping)
                : ""}
            </span>
            <Buy vm={vm} className="pb-final-btn" />
          </div>
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
        ["benefits", vm.titles.benefits],
        ["order", tr(vm, "Commander", "اطلب")],
      ],
    ],
    [
      tr(vm, "Service client", "خدمة الزبناء"),
      [
        ["faq", vm.titles.faq],
        ["order", tr(vm, "Livraison", "التوصيل")],
        ["reviews", vm.titles.reviews],
      ],
    ],
  ];
  return (
    <footer className="pb-footer">
      <div className="pb-wrap">
        <div className="pb-foot-grid">
          <div className="pb-foot-brand">
            <b className="pb-logo-foot">{vm.name}</b>
            <p>{vm.description ? vm.description.split(/[.!]/)[0] + "." : ""}</p>
            {vm.whatsapp ? (
              <a
                className="pb-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          {cols.map(([h, links]) => (
            <nav key={h} className="pb-foot-col">
              <b>{h}</b>
              {links.map(([k, l]) => (
                <Go key={k + l} to={k}>
                  {l}
                </Go>
              ))}
            </nav>
          ))}
          <ul className="pb-foot-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "box", "lock"], i)} />
                <b>{t}</b>
              </li>
            ))}
          </ul>
        </div>
        <div className="pb-foot-bottom">
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
  fonts: "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@400;500;600;700",
  font: '"Montserrat", system-ui, sans-serif',
  heading: '"Cormorant Garamond", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: ({ vm }) => (
      <div className="pb-announce">
        {announceParts(vm).map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    ),
    benefits: (p) => <Collections {...p} />,
    variants: (p) => <Fragrances {...p} />,
    story: (p) => <Story {...p} />,
    countdown: (p) => <Promo {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
