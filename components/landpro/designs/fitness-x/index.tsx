"use client";
// Design « Fitness X » : salle de sport sombre et orange, titres larges (Unbounded).
// En-tête fin (contacts + nav + bouton orange), hero « OBJECTIF / FITNESS / ATTEINT » avec le
// mot géant traversé par la photo détourée, cartes programmes numérotées, à propos + chiffres,
// bandeaux défilants inclinés, pourquoi nous choisir (photo + tuiles alternées), coachs (galerie),
// témoignage, fiche technique en grille, bandeau engagements orange, packs (tarifs),
// étapes numérotées, actus, formulaire COD, FAQ et pied de page.
//
// Photos (vm.images, elles tournent s'il y en a moins) :
//  0 hero (détourée) · 1-3 cartes programmes · 4 à propos · 5 pourquoi nous choisir
//  6-11 galerie coachs (légendes vm.imageLabels) · 12-13 actus · 1 vignette de la 1re étape · 0 commande
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Buy, Go, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

const FEAT_ICONS = ["dumbbell", "bolt", "target", "shield"];
const TRUST_ICONS = ["truck", "cash", "swap", "headset", "award"];

/** « /// » orange devant les petits sur-titres. */
const Slash = () => <i className="fx-slash" aria-hidden="true" />;

/** Titre de section : sur-titre barré + grand titre, mot fantôme en contour derrière. */
function Title({ children, ghost, center = false }: { children: React.ReactNode; ghost?: string; center?: boolean }) {
  return (
    <div className={"fx-title" + (center ? " fx-title-c" : "")}>
      {ghost ? (
        <span className="fx-ghost" aria-hidden="true">
          {ghost}
        </span>
      ) : null}
      <h2>{children}</h2>
    </div>
  );
}

/** Coupe le titre du hero : avant / mot géant (vm.highlight ou mot le plus long) / après. */
function splitHeadline(t: string, h?: string): [string, string, string] {
  const i = h ? t.toLowerCase().indexOf(h.toLowerCase()) : -1;
  if (h && i >= 0) return [t.slice(0, i).trim(), t.slice(i, i + h.length), t.slice(i + h.length).trim()];
  const words = t.split(/\s+/).filter(Boolean);
  if (!words.length) return ["", "", ""];
  let k = 0;
  words.forEach((w, j) => {
    if (w.length > words[k].length) k = j;
  });
  return [words.slice(0, k).join(" "), words[k], words.slice(k + 1).join(" ")];
}

function Header({ vm }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  const phone = vm.whatsapp ? "+" + vm.whatsapp.replace(/^\+/, "") : "";
  return (
    <header className="fx-header">
      <div className="fx-topbar">
        <div className="fx-wrap fx-topbar-in">
          <span className="fx-contacts">
            {phone ? (
              <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <Icon name="phone" /> <bdi>{phone}</bdi>
              </a>
            ) : null}
            <span>
              <Icon name="truck" /> {vm.delivery}
            </span>
          </span>
          <span className="fx-socials" aria-hidden="true">
            <Icon name="facebook" />
            <Icon name="instagram" />
            <Icon name="whatsapp" />
          </span>
        </div>
      </div>
      <div className="fx-wrap fx-nav-row">
        <a
          className="fx-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <b>{vm.name}</b>
        </a>
        <nav className={"fx-nav" + (open ? " is-open" : "")} onClick={() => setOpen(false)}>
          {navOf(vm, 6).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <Buy vm={vm} className="fx-btn fx-btn-sm" />
        <button type="button" className="fx-burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const [pre, big, post] = splitHeadline(vm.headline, vm.highlight);
  const n = Math.max(5, big.length);
  const line = (
    <>
      {pre ? <span className="fx-h-pre">{pre}</span> : null}
      <span className="fx-h-big">{big}</span>
      {post ? <span className="fx-h-post">{post}</span> : null}
    </>
  );
  return (
    <section className="fx-hero" id={sid("hero")}>
      <svg className="fx-hero-x" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 0h170l130 250-130 250H40l130-250z" />
        <path d="M260 0h170L300 250l130 250H260l-90-172 40-78-40-78z" opacity=".55" />
      </svg>
      <span className="fx-marks fx-marks-a" aria-hidden="true">
        ✕✕
      </span>
      <span className="fx-marks fx-marks-b" aria-hidden="true">
        ✕
      </span>
      <span className="fx-dots" aria-hidden="true" />
      <div className="fx-wrap fx-hero-in">
        {vm.eyebrow && vm.show.badge ? (
          <small className="fx-eyebrow">
            <Slash />
            {vm.eyebrow}
          </small>
        ) : null}
        <div className="fx-stage" style={{ ["--fx-n" as any]: n }}>
          <h1 className="fx-h1">{line}</h1>
          <Img vm={vm} i={0} className="fx-hero-img" />
          <div className="fx-h1 fx-h1-ghost" aria-hidden="true">
            {line}
          </div>
        </div>
        <div className="fx-hero-foot">
          {vm.show.subtitle && vm.subheadline ? <p className="fx-lead">{vm.subheadline}</p> : <span />}
          <div className="fx-hero-buy">
            {vm.show.price && vm.price ? (
              <p className="fx-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </p>
            ) : null}
            {vm.show.cta ? <Buy vm={vm} className="fx-btn" arrow /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Programs({ vm }: SectionProps) {
  return (
    <section className="fx-progs" id={sid("benefits")}>
      <h2 className="fx-sr">{vm.titles.benefits}</h2>
      <div className="fx-progs-row">
        {vm.benefits.slice(0, 3).map((b, i) => (
          <article key={i} className="fx-prog">
            <Img vm={vm} i={1 + i} className="fx-prog-img" alt="" />
            <div className="fx-prog-copy">
              <h3>{b.title}</h3>
              {b.text ? <p>{b.text}</p> : null}
            </div>
            <span className="fx-prog-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function About({ vm }: SectionProps) {
  return (
    <section className="fx-about" id={sid("stats")}>
      <div className="fx-wrap fx-about-in">
        <div className="fx-about-copy">
          <span className="fx-ghost" aria-hidden="true">
            {tr(vm, "À propos", "من نحن")}
          </span>
          <h2>{vm.titles.stats}</h2>
          {vm.description ? <p>{vm.description}</p> : null}
          <Buy vm={vm} className="fx-btn-line" arrow />
        </div>
        <Img vm={vm} i={4} className="fx-about-img" alt="" />
        <ul className="fx-stats">
          {vm.stats.slice(0, 3).map((s, i) => (
            <li key={i}>
              <small>
                <Slash />
                {s.label}
              </small>
              <b>{s.value}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Marquee({ vm }: { vm: SectionProps["vm"] }) {
  const words = [...vm.benefits, ...vm.features].map((x) => x.title).filter(Boolean);
  if (!words.length) return null;
  const list = [...words, ...words];
  const row = (k: string) => (
    <div className="fx-mq-track" key={k}>
      {list.map((w, i) => (
        <span key={i}>
          {w}
          <i aria-hidden="true">✦</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className="fx-mq" aria-hidden="true">
      <div className="fx-mq-band fx-mq-dark">{row("a")}</div>
      <div className="fx-mq-band fx-mq-orange">{row("b")}</div>
    </div>
  );
}

function Why({ vm }: SectionProps) {
  return (
    <section className="fx-why" id={sid("features")}>
      <Marquee vm={vm} />
      <div className="fx-wrap">
        <Title center ghost={tr(vm, "Atouts", "المميزات")}>
          {vm.titles.features}
        </Title>
      </div>
      <div className="fx-why-grid">
        <div className="fx-why-media">
          <Img vm={vm} i={5} className="fx-why-img" alt="" />
          <button type="button" className="fx-play" onClick={scrollToOrder}>
            <Icon name="play" />
            <span>{tr(vm, "Go", "يلا")}</span>
          </button>
        </div>
        <div className="fx-tiles">
          {vm.features.slice(0, 4).map((f, i) => (
            <article key={i} className={"fx-tile" + (i === 0 || i === 3 ? " is-hot" : "")}>
              <span className="fx-tile-ico">
                <Icon name={iconAt(FEAT_ICONS, i)} />
              </span>
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coaches({ vm }: SectionProps) {
  const count = vm.images.length >= 6 ? 6 : 3;
  return (
    <section className="fx-sec fx-coaches" id={sid("showcase")}>
      <div className="fx-wrap fx-coach-grid">
        <div className="fx-coach-title">
          <Slash />
          <h2>{vm.titles.showcase}</h2>
        </div>
        {Array.from({ length: count }, (_, k) => {
          const i = 6 + k;
          const label = vm.imageLabels[i % Math.max(1, vm.images.length)] || "";
          return (
            <figure key={k} className="fx-coach">
              <Img vm={vm} i={i} alt={label || vm.name} />
              {label ? <figcaption>{label}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function Testimonial({ vm }: SectionProps) {
  const [k, setK] = React.useState(0);
  const n = vm.reviews.length;
  const r = vm.reviews[k % n];
  return (
    <section className="fx-sec" id={sid("reviews")}>
      <div className="fx-wrap">
        <Title center>{vm.titles.reviews}</Title>
        <div className="fx-rev">
          <span className="fx-rev-av" aria-hidden="true">
            {r.name.charAt(0)}
            <i>”</i>
          </span>
          <div className="fx-rev-body">
            <Stars n={r.rating} className="fx-stars" />
            <p>“{r.text}”</p>
            <b>{r.name}</b>
            <small>{r.city || tr(vm, "Client vérifié", "زبون")}</small>
          </div>
          {n > 1 ? (
            <div className="fx-rev-nav">
              <button type="button" aria-label="‹" onClick={() => setK((k - 1 + n) % n)}>
                <Icon name={vm.rtl ? "arrow" : "back"} />
              </button>
              <button type="button" aria-label="›" onClick={() => setK((k + 1) % n)}>
                <Icon name={vm.rtl ? "back" : "arrow"} />
              </button>
            </div>
          ) : null}
        </div>
        {n > 1 ? (
          <div className="fx-dots-row">
            {vm.reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={String(i + 1)}
                className={i === k % n ? "is-on" : ""}
                onClick={() => setK(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="fx-sec" id={sid("specs")}>
      <div className="fx-wrap">
        <div className="fx-specs-head">
          <h2>
            <Slash />
            {vm.titles.specs}
          </h2>
          {vm.subheadline ? <p>{vm.subheadline}</p> : null}
        </div>
        <div className="fx-table">
          {vm.specs.map((s, i) => (
            <div key={i} className="fx-cell">
              <small>{s.label}</small>
              <b>{s.value}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners({ vm }: SectionProps) {
  return (
    <section className="fx-partners" id={sid("trust")}>
      <span className="fx-ghost fx-ghost-band" aria-hidden="true">
        {vm.titles.trust}
      </span>
      <h2 className="fx-sr">{vm.titles.trust}</h2>
      <ul className="fx-band">
        {vm.trust.slice(0, 5).map((t, i) => (
          <li key={i}>
            <Icon name={iconAt(TRUST_ICONS, i)} />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Pricing({ vm, qty, setQty }: SectionProps) {
  const offers = vm.offers.slice(0, 3);
  const hot =
    offers.length > 1
      ? Math.max(
          1,
          offers.findIndex((o) => o.badge),
        )
      : 0;
  const perks = [...vm.trust, ...vm.features.map((f) => f.title)].filter(Boolean);
  return (
    <section className="fx-sec fx-pricing" id={sid("offers")}>
      <div className="fx-wrap">
        <Title center>{vm.titles.offers}</Title>
        <div className="fx-plans" data-n={offers.length}>
          {offers.map((o, i) => {
            const full = vm.price * o.qty;
            return (
              <article
                key={o.qty}
                className={"fx-plan" + (i === hot ? " is-hot" : "") + (qty === o.qty ? " is-sel" : "")}
              >
                <header>
                  <small>{o.label}</small>
                  {o.badge ? <em>{o.badge}</em> : null}
                </header>
                <p className="fx-plan-price">
                  <b>{money(vm, o.price)}</b>
                  {full > o.price ? <s>{money(vm, full)}</s> : null}
                </p>
                <ul>
                  {perks.slice(0, 3 + i).map((t, j) => (
                    <li key={j}>
                      <Icon name="check" />
                      {t}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="fx-btn-line"
                  onClick={() => {
                    setQty(o.qty);
                    scrollToOrder();
                  }}
                >
                  <span>
                    {qty === o.qty ? tr(vm, "Sélectionné", "مختار") : tr(vm, "Choisir ce pack", "اختار هاد العرض")}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Steps({ vm }: SectionProps) {
  return (
    <section className="fx-sec" id={sid("how")}>
      <div className="fx-wrap fx-steps-in">
        <div className="fx-steps-title">
          <Slash />
          <h2>{vm.titles.how}</h2>
          <span className="fx-ghost fx-ghost-v" aria-hidden="true">
            {tr(vm, "Étapes", "المراحل")}
          </span>
        </div>
        <ol className="fx-steps">
          {vm.steps.slice(0, 5).map((s, i) => (
            <li key={i} className={i === 0 ? "is-first" : ""}>
              <span className="fx-step-n">
                <small>{tr(vm, "Étape", "مرحلة")}</small>
                <b>{String(i + 1).padStart(2, "0")}</b>
              </span>
              <span className="fx-step-copy">
                {s.text ? (
                  <small>
                    <Slash />
                    {s.text}
                  </small>
                ) : null}
                <b>{s.title}</b>
                {i === 0 ? <Buy vm={vm} className="fx-btn-line fx-btn-xs" /> : null}
              </span>
              {i === 0 ? <Img vm={vm} i={1} className="fx-step-img" alt="" /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function News({ vm }: SectionProps) {
  const cards = [
    { tag: tr(vm, "Actu", "جديد"), title: vm.story.title, text: vm.story.text },
    { tag: tr(vm, "Garantie", "ضمان"), title: vm.guarantee.title, text: vm.guarantee.text },
  ];
  return (
    <section className="fx-sec" id={sid("story")}>
      <div className="fx-wrap">
        <Title center>{vm.titles.story}</Title>
        <div className="fx-news">
          {cards.map((c, i) => (
            <article key={i} className="fx-post">
              <div className="fx-post-media">
                <Img vm={vm} i={12 + i} alt="" />
                <span className="fx-post-tag">{c.tag}</span>
              </div>
              <h3>{c.title}</h3>
              {c.text ? <p>{c.text}</p> : null}
              <Go to="order" className="fx-post-more">
                {tr(vm, "En savoir plus", "اعرف أكثر")} <Icon name={vm.rtl ? "back" : "arrow"} />
              </Go>
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
      className="fx-order"
      aside={
        <>
          <span className="fx-ghost" aria-hidden="true">
            {tr(vm, "Commande", "الطلب")}
          </span>
          <Img vm={vm} i={0} className="fx-order-img" />
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} /> {t}
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
    <section className="fx-sec" id={sid("faq")}>
      <div className="fx-wrap fx-faq">
        <Title center>{vm.titles.faq}</Title>
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <span>{String(i + 1).padStart(2, "0")}</span>
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
  const links = navOf(vm, 8);
  return (
    <footer className="fx-footer">
      <div className="fx-wrap">
        <div className="fx-foot-grid">
          <div className="fx-foot-brand">
            <b className="fx-logo-foot">{vm.name}</b>
            {vm.description ? <p>{vm.description.split(/[.!]/)[0] + "."}</p> : null}
            <Buy vm={vm} className="fx-btn fx-btn-sm" />
          </div>
          <nav className="fx-foot-col">
            <b>
              <Slash />
              {tr(vm, "Navigation", "روابط")}
            </b>
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <ul className="fx-foot-col fx-foot-trust">
            <b>
              <Slash />
              {tr(vm, "Service", "الخدمة")}
            </b>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} />
                {t}
              </li>
            ))}
            {vm.whatsapp ? (
              <li>
                <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" /> WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="fx-foot-bottom">
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
  fonts: "family=Unbounded:wght@500;700;800;900&family=Poppins:wght@300;400;500;600;700",
  font: '"Poppins", system-ui, sans-serif',
  heading: '"Unbounded", "Orbitron", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Programs {...p} />,
    stats: (p) => <About {...p} />,
    features: (p) => <Why {...p} />,
    showcase: (p) => <Coaches {...p} />,
    reviews: (p) => <Testimonial {...p} />,
    specs: (p) => <Specs {...p} />,
    trust: (p) => <Partners {...p} />,
    offers: (p) => <Pricing {...p} />,
    how: (p) => <Steps {...p} />,
    story: (p) => <News {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
