"use client";
// Design « Glow Rose » : en-tête blanc rosé (logo lotus, menu centré souligné, icônes),
// hero dégradé rose (portrait + trio de produits, pastille remise), catégories (benefits),
// bannière promo rose avec chiffres (countdown + stats), best-sellers (variants), avis,
// formulaire COD, FAQ et pied de page rose poudré.
// Images : 0 = hero, 1–5 = cartes catégories, 6 = bannière (gamme sur socle),
// 7–10 = best-sellers (une par variante), 2 = visuel du bloc commande.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import { Countdown } from "../../parts";
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
  OrderBox,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const TRUST_ICONS = ["spa", "flask", "rabbit"];

/** Logo lotus au trait. */
const Lotus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M16 2c3.4 3.2 3.4 9.6 0 14-3.4-4.4-3.4-10.8 0-14z" />
    <path d="M15 16C9 15.6 5.4 11.6 5 7c4 .4 7.6 2.6 9.4 6.4M17 16c6-.4 9.6-4.4 10-9-4 .4-7.6 2.6-9.4 6.4" />
    <path d="M14 17c-5 .6-9.4-1.4-12-5 3-.8 6.4-.4 8.6 1.2M18 17c5 .6 9.4-1.4 12-5-3-.8-6.4-.4-8.6 1.2" />
  </svg>
);

/** Liens d'en-tête : sections réellement affichées. */
function links(vm: VM) {
  const all: [string, string][] = [
    ["benefits", tr(vm, "Catégories", "الأصناف")],
    ["variants", tr(vm, "Boutique", "المتجر")],
    ["reviews", tr(vm, "Avis", "الآراء")],
    ["faq", tr(vm, "FAQ", "أسئلة")],
    ["order", tr(vm, "Contact", "اطلب")],
  ];
  return all.filter(([k]) => k === "order" || (vm.order.includes(k) && !vm.hidden.has(k)));
}

const toTop = (e: React.MouseEvent) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function Header({ vm, qty }: SectionProps) {
  return (
    <header className="gr-header">
      <div className="gr-wrap gr-header-row">
        <a className="gr-logo" href="#" onClick={toTop}>
          <Lotus className="gr-lotus" />
          <b>{vm.name}</b>
        </a>
        <nav className="gr-nav">
          <a href="#" className="gr-on" onClick={toTop}>
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {links(vm).map(([k, l]) => (
            <Go key={k} to={k}>
              {l}
            </Go>
          ))}
        </nav>
        <span className="gr-icons">
          <button type="button" aria-label={tr(vm, "Produits", "المنتجات")} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          <button type="button" aria-label={tr(vm, "Avis", "الآراء")} onClick={() => goTo("reviews")}>
            <Icon name="user" />
          </button>
          <button type="button" className="gr-bag" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const d = discount(vm);
  const hasVideo = !!vm.videoUrl && vm.order.includes("video") && !vm.hidden.has("video");
  const trust = vm.features.length
    ? vm.features.slice(0, 3).map((f) => [f.title, f.text])
    : vm.trust.slice(0, 3).map((t) => [t, ""]);
  return (
    <section className="gr-hero" id={sid("hero")}>
      <div className="gr-hero-art">
        <Img vm={vm} i={0} className="gr-hero-img" />
        <span className="gr-badge">
          {d ? (
            <>
              <b>-{d}%</b>
              <small>{tr(vm, "Offre de lancement", "عرض الإطلاق")}</small>
            </>
          ) : (
            <>
              <b>{tr(vm, "COD", "COD")}</b>
              <small>{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</small>
            </>
          )}
        </span>
      </div>
      <div className="gr-wrap gr-hero-in">
        <div className="gr-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="gr-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="gr-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="gr-lead">{vm.subheadline}</p> : null}
          <div className="gr-hero-ctas">
            {vm.show.cta ? <Buy vm={vm} className="gr-btn" arrow /> : null}
            <button type="button" className="gr-play" onClick={() => goTo(hasVideo ? "video" : "benefits")}>
              <span>
                <Icon name="play" />
              </span>
              {hasVideo ? tr(vm, "Voir la vidéo", "شوف الفيديو") : tr(vm, "Découvrir", "اكتشف")}
            </button>
          </div>
          <ul className="gr-hero-trust">
            {trust.map(([t, s], i) => (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} />
                <span>
                  <b>{t}</b>
                  {s ? <small>{s}</small> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Categories({ vm }: SectionProps) {
  return (
    <section className="gr-sec" id={sid("benefits")}>
      <div className="gr-wrap">
        <h2 className="gr-title gr-center">{vm.titles.benefits}</h2>
        <div className="gr-cats">
          {vm.benefits.slice(0, 5).map((b, i) => (
            <button type="button" key={i} className="gr-cat" onClick={scrollToOrder}>
              <Img vm={vm} i={1 + i} className="gr-cat-img" alt={b.title} />
              <span className="gr-cat-copy">
                <b>{b.title}</b>
                {b.text ? <small>{b.text}</small> : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Titre en deux lignes, premier mot de la 2e ligne en rose. */
function TwoLine({ text }: { text: string }) {
  const w = text.split(/\s+/).filter(Boolean);
  if (w.length < 3) return <>{text}</>;
  const cut = Math.ceil(w.length / 2);
  return (
    <>
      {w.slice(0, cut).join(" ")}
      <br />
      <em>{w[cut]}</em> {w.slice(cut + 1).join(" ")}
    </>
  );
}

function Promo({ vm }: SectionProps) {
  const d = discount(vm);
  const stats = vm.stats.slice(0, 2);
  return (
    <section className="gr-sec gr-sec-promo" id={sid("countdown")}>
      <div className="gr-wrap">
        <div className="gr-promo">
          <div className="gr-promo-copy">
            <small className="gr-promo-eye">
              {tr(vm, "L'éclat au quotidien", "إشراقة كل يوم")} <Icon name="sparkle" />
            </small>
            <h2>
              <TwoLine text={vm.titles.countdown} />
            </h2>
            <p>
              {d
                ? tr(vm, `-${d}% sur ${vm.name}. Offre à durée limitée !`, `-${d}% على ${vm.name}. عرض محدود!`)
                : vm.finalCta.text}
            </p>
            <Countdown vm={vm} small />
            <Buy vm={vm} className="gr-btn gr-btn-sm" arrow />
          </div>
          <Img vm={vm} i={6} className="gr-promo-img" alt="" />
          {stats.length ? (
            <ul className="gr-promo-stats">
              {stats.map((s, i) => (
                <li key={i}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                  {/^[0-5]([.,]\d)?$/.test(s.value) ? (
                    <Stars n={Number(s.value.replace(",", "."))} className="gr-stars" />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Bestsellers({ vm, setVariant }: SectionProps) {
  const [liked, setLiked] = React.useState<number[]>([]);
  const n = vm.reviews.length;
  const avg = n ? vm.reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  return (
    <section className="gr-sec gr-sec-best" id={sid("variants")}>
      <div className="gr-wrap">
        <div className="gr-head">
          <h2 className="gr-title">{vm.titles.variants}</h2>
          <Go to="order" className="gr-pill">
            {tr(vm, "Voir tout", "شوف الكل")}
          </Go>
        </div>
        <div className="gr-best">
          {vm.variants.slice(0, 4).map((v, i) => (
            <article key={v.name + i} className="gr-card">
              <div className="gr-card-media">
                <Img vm={vm} i={7 + i} className="gr-card-img" alt={v.name} />
                <button
                  type="button"
                  className={"gr-heart" + (liked.includes(i) ? " is-on" : "")}
                  aria-label="♥"
                  onClick={() => setLiked((l) => (l.includes(i) ? l.filter((x) => x !== i) : [...l, i]))}
                >
                  <Icon name="heart" />
                </button>
              </div>
              <div className="gr-card-body">
                <h3>{v.name}</h3>
                {n ? (
                  <span className="gr-rate">
                    <Stars n={avg} className="gr-stars" />
                    <small>({n})</small>
                  </span>
                ) : null}
                <div className="gr-card-foot">
                  {vm.price ? (
                    <span className="gr-price">
                      <b>{money(vm, vm.price)}</b>
                      {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="gr-cart"
                    aria-label={vm.cta}
                    onClick={() => {
                      setVariant(i);
                      scrollToOrder();
                    }}
                  >
                    <Icon name="cart" />
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
    <section className="gr-sec" id={sid("reviews")}>
      <div className="gr-wrap">
        <h2 className="gr-title gr-center">{vm.titles.reviews}</h2>
        <div className="gr-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="gr-rev">
              <Stars n={r.rating} className="gr-stars" />
              <p>“{r.text}”</p>
              <div className="gr-who">
                <span className="gr-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  <small>{r.city || tr(vm, "Cliente vérifiée", "زبونة")}</small>
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
      className="gr-order"
      aside={
        <>
          <Img vm={vm} i={2} className="gr-order-img" />
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
    <section className="gr-sec" id={sid("faq")}>
      <div className="gr-wrap gr-faq">
        <h2 className="gr-title gr-center">{vm.titles.faq}</h2>
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
    <footer className="gr-footer">
      <div className="gr-wrap">
        <div className="gr-foot-grid">
          <div className="gr-foot-brand">
            <span className="gr-logo">
              <Lotus className="gr-lotus" />
              <b>{vm.name}</b>
            </span>
            {vm.description ? <p>{vm.description.split(/[.!]/)[0] + "."}</p> : null}
            {vm.whatsapp ? (
              <a
                className="gr-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          <nav className="gr-foot-col">
            <b>{tr(vm, "Boutique", "المتجر")}</b>
            {links(vm).map(([k, l]) => (
              <Go key={k} to={k}>
                {l}
              </Go>
            ))}
          </nav>
          <ul className="gr-foot-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "headset"], i)} />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="gr-foot-bottom">
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
  fonts: "family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,500&family=Poppins:wght@400;500;600",
  font: '"Poppins", system-ui, sans-serif',
  heading: '"Playfair Display", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Categories {...p} />,
    countdown: (p) => <Promo {...p} />,
    variants: (p) => <Bestsellers {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
