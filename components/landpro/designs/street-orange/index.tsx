"use client";
// Design « Street Orange » : barre noire d'infos, logo bicolore (mot gras + script orange),
// hero urbain de nuit avec enseigne néon, catégories sur fond clair texturé, carrousel
// « nouveautés » sombre, bandeau promo orange grunge, culture + bande photo, avis, logos (stats),
// formulaire COD sombre, FAQ et pied de page noir en colonnes.
//
// Images (vm.images) : 0 hero · 1-4 cartes avantages · 5-10 coloris · 11-15 bande photo · 16 produit (commande, pied de page)
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
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
  scrollToOrder,
  sid,
  Stars,
  totalFor,
  tr,
} from "../kit";
import "./style.css";

const shown = (vm: VM, k: string) => vm.order.includes(k) && !vm.hidden.has(k);
const pad = (n: number) => String(n).padStart(2, "0");

/** Coup de pinceau orange sous les titres. */
const Brush = () => (
  <svg className="so-brush" viewBox="0 0 160 14" preserveAspectRatio="none" aria-hidden="true">
    <path d="M2 10 C40 4 90 2 158 3 C120 6 70 9 30 13 Z" fill="currentColor" />
  </svg>
);
const Title = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <div className={"so-title" + (light ? " so-title-light" : "")}>
    <h2>{children}</h2>
    <Brush />
  </div>
);

/** Logo : premier mot en capitales grasses, la suite en script orange. */
function Logo({ vm, className }: { vm: VM; className?: string }) {
  const [a, ...rest] = vm.name.split(/\s+/);
  return (
    <span className={"so-logo " + (className || "")}>
      <b>{a}</b>
      {rest.length ? <i>{rest.join(" ")}</i> : null}
    </span>
  );
}

function Header({ vm, qty }: SectionProps) {
  const links = [
    ...(shown(vm, "variants") ? [{ key: "variants", label: tr(vm, "Nouveautés", "الجديد") }] : []),
    ...navOf(vm, 4),
  ];
  return (
    <header className="so-header">
      <div className="so-wrap so-header-row">
        <a
          href="#"
          className="so-logo-link"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <Logo vm={vm} />
        </a>
        <nav className="so-nav">
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
          {shown(vm, "countdown") ? (
            <Go to="countdown" className="so-nav-sale">
              {tr(vm, "Promo", "تخفيضات")}
            </Go>
          ) : null}
        </nav>
        <div className="so-icons">
          <button type="button" aria-label={tr(vm, "Coloris", "الألوان")} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          <button
            type="button"
            className="so-hide-sm"
            aria-label={tr(vm, "Avis", "الآراء")}
            onClick={() => goTo("reviews")}
          >
            <Icon name="user" />
          </button>
          <button
            type="button"
            className="so-hide-sm"
            aria-label={tr(vm, "Favoris", "المفضلة")}
            onClick={() => goTo("variants")}
          >
            <Icon name="heart" />
            <i>{vm.variants.length || 1}</i>
          </button>
          <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="cart" />
            <i>{qty}</i>
          </button>
        </div>
      </div>
    </header>
  );
}

function Announce({ vm }: SectionProps) {
  const parts = announceParts(vm);
  return (
    <div className="so-topbar">
      <div className="so-wrap so-topbar-row">
        <span className="so-tb-a">
          <Icon name="truck" />
          {parts[0]}
        </span>
        {parts[1] ? (
          <span className="so-tb-b">
            <Icon name="flame" />
            {parts[1]}
          </span>
        ) : null}
        <span className="so-tb-c">
          {parts[2] ? (
            <span>
              <Icon name="cash" />
              {parts[2]}
            </span>
          ) : null}
          {shown(vm, "faq") ? (
            <Go to="faq">
              <Icon name="chat" />
              {tr(vm, "Aide", "مساعدة")}
            </Go>
          ) : null}
          <span className="so-cur">
            <svg viewBox="0 0 18 12" aria-hidden="true">
              <rect width="18" height="12" rx="1.5" fill="#c1272d" />
              <path
                d="M9 3.2l.9 2.7h2.8l-2.3 1.7.9 2.7L9 8.6l-2.3 1.7.9-2.7-2.3-1.7h2.8z"
                fill="none"
                stroke="#006233"
                strokeWidth=".9"
              />
            </svg>
            {vm.currency}
          </span>
        </span>
      </div>
    </div>
  );
}

function Hero({ vm }: SectionProps) {
  const [a, ...rest] = vm.name.split(/\s+/);
  return (
    <section className="so-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="so-hero-bg" />
      <div className="so-neon" aria-hidden="true">
        <svg viewBox="0 0 60 40" className="so-neon-crown">
          <path
            d="M6 34 L4 10 L18 22 L30 4 L42 22 L56 10 L54 34 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </svg>
        <b>{a}</b>
        {rest.length ? <i>{rest.join(" ")}</i> : null}
      </div>
      <div className="so-wrap so-hero-in">
        <div className="so-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="so-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="so-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="so-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="so-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          <div className="so-hero-btns">
            {vm.show.cta ? <Buy vm={vm} className="so-btn" arrow /> : null}
            {shown(vm, "variants") && vm.variants.length ? (
              <Go to="variants" className="so-btn-line">
                {tr(vm, "Voir les coloris", "شوف الألوان")} <Icon name={vm.rtl ? "back" : "arrow"} />
              </Go>
            ) : null}
          </div>
        </div>
        <div className="so-hero-foot">
          <ul className="so-hero-trust">
            {vm.trust.slice(0, 3).map((t, i) => {
              const [h, ...s] = t.split(/\s+[:–—-]\s+/);
              return (
                <li key={i}>
                  <Icon name={iconAt(["award", "swap", "lock"], i)} />
                  <span>
                    <b>{h}</b>
                    {s.length ? <small>{s.join(" ")}</small> : null}
                  </span>
                </li>
              );
            })}
          </ul>
          <span className="so-counter" dir="ltr">
            <b>01</b>
            <i />
            <b>{pad(Math.min(3, Math.max(1, vm.images.length)))}</b>
          </span>
        </div>
      </div>
    </section>
  );
}

function Categories({ vm }: SectionProps) {
  return (
    <section className="so-light" id={sid("benefits")}>
      <div className="so-wrap">
        <div className="so-head">
          <Title>{vm.titles.benefits}</Title>
          <Go to={shown(vm, "variants") ? "variants" : "order"} className="so-more">
            {tr(vm, "Voir tous les coloris", "شوف كل الألوان")} <Icon name={vm.rtl ? "back" : "arrow"} />
          </Go>
        </div>
        <div className="so-cats">
          {vm.benefits.slice(0, 4).map((b, i) => (
            <article key={i} className="so-cat">
              <Img vm={vm} i={1 + i} className="so-cat-img" alt="" />
              <div className="so-cat-copy">
                <h3>{b.title}</h3>
                {b.text ? <p>{b.text}</p> : null}
                <Buy vm={vm} className="so-link" arrow>
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

function Arrivals({ vm, setVariant }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const move = (d: number) =>
    ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.5 * (vm.rtl ? -1 : 1), behavior: "smooth" });
  const pick = (i: number) => {
    setVariant(i);
    scrollToOrder();
  };
  return (
    <section className="so-dark" id={sid("variants")}>
      <div className="so-wrap">
        <div className="so-head">
          <Title light>{vm.titles.variants}</Title>
          <Go to="order" className="so-more so-more-light">
            {tr(vm, "Commander", "اطلب")} <Icon name={vm.rtl ? "back" : "arrow"} />
          </Go>
        </div>
        <div className="so-car">
          <button type="button" className="so-arrow" aria-label="‹" onClick={() => move(-1)}>
            <Icon name={vm.rtl ? "arrow" : "back"} />
          </button>
          <div className="so-track" ref={ref}>
            {vm.variants.map((v, i) => (
              <article key={v.name + i} className="so-card" onClick={() => pick(i)}>
                <span className="so-new">{tr(vm, "NEW", "جديد")}</span>
                <span className="so-heart" aria-hidden="true">
                  <Icon name="heart" />
                </span>
                <Img vm={vm} i={5 + i} className="so-card-img" alt={v.name} />
                <h3>{vm.name}</h3>
                <small>« {v.name} »</small>
                <div className="so-card-price">
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  <b>{money(vm, vm.price)}</b>
                  {v.color ? <span className="so-dot" style={{ background: v.color }} /> : null}
                </div>
                <button
                  type="button"
                  className="so-card-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    pick(i);
                  }}
                >
                  {tr(vm, "Choisir", "اختار")} <Icon name="cart" />
                </button>
              </article>
            ))}
          </div>
          <button type="button" className="so-arrow" aria-label="›" onClick={() => move(1)}>
            <Icon name={vm.rtl ? "back" : "arrow"} />
          </button>
        </div>
      </div>
    </section>
  );
}

/** Éclaboussures de peinture (bandeau promo). */
function Splatter() {
  const dots = React.useMemo(() => {
    let seed = 7;
    const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: 140 }, () => {
      const x = 52 + r() * 30 + (r() - 0.5) * 18;
      return { x, y: r() * 100, s: 0.15 + r() * (x > 62 ? 1.6 : 0.9) };
    });
  }, []);
  return (
    <svg className="so-splat" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {dots.map((d, i) => (
        <ellipse key={i} cx={d.x} cy={d.y} rx={d.s * 0.35} ry={d.s} fill="#0d0d0e" />
      ))}
    </svg>
  );
}

function Promo({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="so-promo" id={sid("countdown")}>
      <Splatter />
      <div className="so-wrap so-promo-in">
        <p className="so-promo-script">{tr(vm, "Offre limitée", "عرض محدود")}</p>
        <div className="so-promo-big">
          {d ? (
            <>
              <span className="so-promo-upto">{tr(vm, "Jusqu'à", "حتى")}</span>
              <b dir="ltr">-{d}%</b>
            </>
          ) : (
            <b className="so-promo-cod">{tr(vm, "PAIEMENT À LA LIVRAISON", "الدفع عند الاستلام")}</b>
          )}
        </div>
        <div className="so-promo-side">
          <h2>{vm.titles.countdown}</h2>
          <Countdown vm={vm} small />
          <Buy vm={vm} className="so-btn-line" arrow>
            {tr(vm, "Profiter de l'offre", "استافد من العرض")}
          </Buy>
        </div>
        <svg className="so-smiley" viewBox="0 0 120 130" aria-hidden="true">
          <circle cx="60" cy="58" r="48" fill="none" stroke="currentColor" strokeWidth="7" />
          <path
            d="M38 36l16 16M54 36L38 52M68 36l16 16M84 36L68 52"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M34 70c10 16 42 16 52 0" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path
            d="M44 104v14M60 106v22M80 102v10M30 94v12"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}

function Culture({ vm }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const parts = vm.story.title.split(/(?<=[.!?])\s+/);
  const last = parts.length > 1 ? parts.pop() : "";
  return (
    <section className="so-culture" id={sid("story")}>
      <div className="so-wrap so-culture-in">
        <div className="so-culture-copy">
          <h2>
            {parts.join(" ")}
            {last ? <em>{last}</em> : null}
          </h2>
          <p>{vm.story.text}</p>
          <Buy vm={vm} className="so-btn-line" arrow>
            {tr(vm, "Rejoins le mouvement", "انضم للحركة")}
          </Buy>
        </div>
        <div className="so-strip-wrap">
          <div className="so-strip" ref={ref}>
            {[11, 12, 13, 14, 15].map((n) => (
              <Img key={n} vm={vm} i={n} className="so-strip-img" alt="" />
            ))}
          </div>
          <button
            type="button"
            className="so-arrow so-strip-next"
            aria-label="›"
            onClick={() => ref.current?.scrollBy({ left: (vm.rtl ? -1 : 1) * 220, behavior: "smooth" })}
          >
            <Icon name={vm.rtl ? "back" : "arrow"} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="so-light so-reviews" id={sid("reviews")}>
      <div className="so-wrap so-reviews-in">
        <Title>{vm.titles.reviews}</Title>
        <div className="so-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article className="so-rev" key={i}>
              <span className="so-quote">“</span>
              <p>{r.text}</p>
              <Stars n={r.rating} className="so-stars" />
              <div className="so-who">
                <span className="so-avatar">{r.name.charAt(0)}</span>
                <b>{r.name}</b>
                {r.city ? <small>{r.city}</small> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ vm }: SectionProps) {
  return (
    <section className="so-light so-logos" id={sid("stats")}>
      <div className="so-wrap">
        <ul>
          {vm.stats.slice(0, 8).map((s, i) => (
            <li key={i} className={"so-logo-" + (i % 4)}>
              <b>{s.value}</b>
              <small>{s.label}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="so-order"
      title={
        <>
          {vm.orderTitle}
          <Brush />
        </>
      }
      aside={
        <>
          <div className="so-order-img">
            <Img vm={vm} i={16} />
            {discount(vm) ? <span className="so-order-tag">-{discount(vm)}%</span> : null}
          </div>
          <ul>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap", "headset"], i)} /> {t}
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
    <section className="so-light" id={sid("faq")}>
      <div className="so-wrap so-faq">
        <Title>{vm.titles.faq}</Title>
        <div>
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

function Footer({ vm, qty }: SectionProps) {
  const cols: [string, [string, string][]][] = [
    [
      tr(vm, "Boutique", "المتجر"),
      (
        [
          ["variants", tr(vm, "Nouveautés", "الجديد")],
          ["benefits", vm.titles.benefits],
          ["story", vm.titles.story],
          ["countdown", tr(vm, "Promo", "تخفيضات")],
          ["order", tr(vm, "Commander", "اطلب")],
        ] as [string, string][]
      ).filter(([k]) => k === "order" || shown(vm, k)),
    ],
    [
      tr(vm, "Aide", "مساعدة"),
      (
        [
          ["faq", "FAQ"],
          ["order", tr(vm, "Livraison", "التوصيل")],
          ["faq", tr(vm, "Retours", "الإرجاع")],
          ["reviews", vm.titles.reviews],
        ] as [string, string][]
      ).filter(([k]) => k === "order" || shown(vm, k)),
    ],
  ];
  const [a, ...rest] = vm.name.split(/\s+/);
  return (
    <footer className="so-footer">
      <div className="so-wrap so-foot-grid">
        <div className="so-foot-brand">
          <Logo vm={vm} />
          <p>{vm.description ? vm.description.split(/(?<=[.!?:])\s/)[0] : vm.delivery}</p>
          <div className="so-socials">
            {vm.whatsapp ? (
              <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <Icon name="whatsapp" />
              </a>
            ) : null}
            <Go to="reviews">
              <Icon name="instagram" />
            </Go>
            <Go to="story">
              <Icon name="facebook" />
            </Go>
          </div>
        </div>
        <div className="so-foot-quick">
          <b className="so-foot-h">{tr(vm, "Commande express", "طلب سريع")}</b>
          <p>
            {tr(
              vm,
              "Remplis le formulaire en 30 secondes, on te rappelle pour confirmer.",
              "عمر الاستمارة ف 30 ثانية وغادي نتاصلو بيك.",
            )}
          </p>
          <div className="so-fake">
            <span>
              {vm.name}
              {vm.price ? " · " + money(vm, totalFor(vm, qty)) : ""}
            </span>
            <Buy vm={vm} className="so-btn so-btn-sm" />
          </div>
        </div>
        <div className="so-foot-app">
          <div>
            <b className="so-foot-h">{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</b>
            <p>{vm.delivery}</p>
            <div className="so-badges">
              <span>
                <Icon name="cash" />
                <small>
                  {tr(vm, "Payez", "خلص")}
                  <b>{tr(vm, "À la réception", "عند الاستلام")}</b>
                </small>
              </span>
              {vm.whatsapp ? (
                <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" />
                  <small>
                    {tr(vm, "Commandez sur", "اطلب ف")}
                    <b>WhatsApp</b>
                  </small>
                </a>
              ) : null}
            </div>
          </div>
          <div className="so-phone" aria-hidden="true">
            <span className="so-phone-logo">
              <b>{a}</b>
              {rest.length ? <i>{rest.join(" ")}</i> : null}
            </span>
            <em>{tr(vm, "Nouveau drop", "جديد")}</em>
            <Img vm={vm} i={16} alt="" />
          </div>
        </div>
        {cols.map(([h, links]) => (
          <nav key={h} className="so-foot-col">
            <b className="so-foot-h">{h}</b>
            {links.map(([k, l], i) => (
              <Go key={k + i} to={k}>
                {l}
              </Go>
            ))}
          </nav>
        ))}
      </div>
      <div className="so-foot-bottom">
        <div className="so-wrap so-foot-bottom-row">
          <small>
            © {new Date().getFullYear()} {vm.name}. {tr(vm, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
          </small>
          <nav>
            {shown(vm, "faq") ? <Go to="faq">{tr(vm, "Conditions", "الشروط")}</Go> : null}
            <Go to="order">{tr(vm, "Livraison", "التوصيل")}</Go>
            {shown(vm, "faq") ? <Go to="faq">{tr(vm, "Retours", "الإرجاع")}</Go> : null}
          </nav>
          <small className="so-ship">
            <Icon name="globe" />
            {tr(vm, "Livraison partout au Maroc", "التوصيل لجميع المدن")}
          </small>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts:
    "family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Permanent+Marker&family=Poppins:wght@400;500;600;700",
  font: '"Poppins", system-ui, sans-serif',
  heading: '"Barlow Condensed", "Oswald", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: (p) => <Announce {...p} />,
    benefits: (p) => <Categories {...p} />,
    variants: (p) => <Arrivals {...p} />,
    countdown: (p) => <Promo {...p} />,
    story: (p) => <Culture {...p} />,
    reviews: (p) => <Reviews {...p} />,
    stats: (p) => <Stats {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
