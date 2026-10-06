// Blocs « sur mesure » des templates Clé Lime (immobilier) et Sourire Clair (soins) :
// heros « estate » et « clinic », présentation + chiffres, services, expert,
// cartes points forts et catégories en trio.
import React from "react";
import type { SxBlock, SxItem } from "../../lib/store-templates";
import { Icon } from "./SeriesParts";
import type { HeroKit } from "./SeriesHeroes2";
import { hl, plain } from "./SeriesSchool";
import "./series-custom.css";

type Art = (i?: number, label?: string, src?: string) => React.ReactNode;
type Fill = (v?: string) => string;

/** « 12K+ » → « 12K » + « + » en couleur d'accent. */
export function statValue(v: string) {
  const m = v.match(/^(.*?)([+%*]+)$/);
  return m ? (
    <>
      {m[1]}
      <i className="sx-stat-sym">{m[2]}</i>
    </>
  ) : (
    v
  );
}

/** Petit carré flèche (bouton pilule). */
const arrowBox = (
  <span className="sx-arrow-box" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  </span>
);

/** Étiquette de section : pastille (« À propos ») avec petite icône. */
export const chip = (text?: string) =>
  text ? (
    <small className="sx-chip-label">
      <i aria-hidden="true" />
      {text}
    </small>
  ) : null;

/* ───────── heros ───────── */
export function heroEstate(h: HeroKit & { items: SxItem[]; fill: Fill }) {
  return (
    <section className="sx-hero sx-hero-estate">
      <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
      <div className="sx-wrap sx-estate-inner">
        {h.eyebrow()}
        {h.title("h1")}
        {h.hero.text && <p className="sx-hero-text">{h.hero.text}</p>}
        <div className="sx-estate-bottom">
          {h.items.length > 0 && (
            <div className="sx-estate-stats">
              {h.items.slice(0, 3).map((x, i) => (
                <span key={i}>
                  <b>{statValue(h.fill(x.value))}</b>
                  <small>{x.title}</small>
                  <i aria-hidden="true" />
                </span>
              ))}
            </div>
          )}
          <a className="sx-pill-btn" href={h.shopUrl}>
            {h.hero.button}
            {arrowBox}
          </a>
        </div>
      </div>
    </section>
  );
}

export function heroClinic(h: HeroKit & { items: SxItem[]; fill: Fill }) {
  const card = h.items[0];
  const chips = h.categories.slice(0, 5);
  return (
    <section className="sx-hero sx-hero-clinic">
      <div className="sx-clinic-frame">
        <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
        <div className="sx-wrap sx-clinic-inner">
          <div className="sx-clinic-copy">
            {h.eyebrow()}
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            <a className="sx-pill-btn sx-pill-light" href={h.shopUrl}>
              {h.hero.button}
              <span className="sx-arrow-circle" aria-hidden="true">
                <Icon name="arrow" />
              </span>
            </a>
          </div>
          <div className="sx-clinic-bottom">
            {card && (
              <a className="sx-clinic-card" href={h.shopUrl}>
                <span className="sx-clinic-card-img">
                  {h.art(1, plain(card.title), card.image)}
                  <i className="sx-play" aria-hidden="true" />
                </span>
                <small>{card.title}</small>
                {card.value && <b>{h.fill(card.value)}</b>}
              </a>
            )}
            {chips.length > 0 && (
              <nav className="sx-clinic-chips" aria-label={h.lang === "ar" ? "الخدمات" : "Services"}>
                {chips.map((x) => (
                  <a key={x.name} href={h.catUrl(x.name)}>
                    {x.name}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
      {h.trust.length > 0 && (
        <div className="sx-wrap sx-clinic-strip">
          {h.trust.slice(0, 4).map((x, i) => (
            <span key={i}>{x.title}</span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────── présentation + chiffres ───────── */
export function StatementSection({
  b,
  layout,
  art,
  fill,
  href,
}: {
  b: SxBlock;
  layout: "rows" | "inline";
  art: Art;
  fill: Fill;
  href: string;
}) {
  const items = b.items || [];
  if (!b.title && !items.length) return null;
  const statement = (
    <p className="sx-statement-text">
      {b.title && <b>{hl(b.title)} </b>}
      {b.text}
    </p>
  );
  if (layout === "inline")
    return (
      <section className="sx-section sx-statement sx-statement-inline">
        <div className="sx-wrap">
          <div className="sx-st-top">
            <div className="sx-st-side">
              {chip(b.eyebrow)}
              <div className="sx-st-avatars">
                <span>{art(5, "", b.image2)}</span>
                <span>{art(6)}</span>
              </div>
            </div>
            <div>
              {statement}
              {b.button && (
                <a className="sx-link" href={href}>
                  {b.button} <Icon name="arrow" />
                </a>
              )}
            </div>
          </div>
          <div className="sx-st-bottom">
            <div className="sx-st-stats">
              {items.slice(0, 4).map((x, i) => (
                <div key={i}>
                  <strong>{statValue(fill(x.value))}</strong>
                  <span>{x.title}</span>
                </div>
              ))}
            </div>
            <span className="sx-st-photo">{art(2, plain(b.title), b.image)}</span>
          </div>
        </div>
      </section>
    );
  return (
    <section className="sx-section sx-statement sx-statement-rows">
      <div className="sx-wrap">
        <div className="sx-st-top">
          {chip(b.eyebrow)}
          <div>
            {statement}
            {b.button && (
              <a className="sx-pill-btn sx-pill-dark" href={href}>
                {b.button}
                {arrowBox}
              </a>
            )}
          </div>
        </div>
        <div className="sx-st-bottom">
          <span className="sx-st-photo">{art(2, plain(b.title), b.image)}</span>
          <div className="sx-st-rows">
            {items.slice(0, 5).map((x, i) => (
              <div key={i}>
                <span>{x.title}</span>
                <strong>{statValue(fill(x.value))}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── services ───────── */
const SERVICE_ICONS = ["chart", "user", "bars", "card", "doc", "building"];
function ServiceIcon({ i }: { i: number }) {
  const name = SERVICE_ICONS[i % SERVICE_ICONS.length];
  const p = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "sx-service-icon",
  };
  switch (name) {
    case "chart":
      return (
        <svg {...p}>
          <path d="M5 27h22M8 22v-5M14 22v-9M20 22v-6M26 22V8M7 13l7-6 6 4 7-6" />
        </svg>
      );
    case "user":
      return (
        <svg {...p}>
          <circle cx="15" cy="10" r="5" />
          <path d="M5 27c1-6 5-9 10-9 3 0 5 1 7 3M21 26l2 2 5-5" />
        </svg>
      );
    case "bars":
      return (
        <svg {...p}>
          <path d="M6 27V13M13 27V7M20 27V15M27 27V10M4 27h25" />
          <circle cx="6" cy="9" r="2" />
          <circle cx="20" cy="11" r="2" />
        </svg>
      );
    case "card":
      return (
        <svg {...p}>
          <rect x="4" y="7" width="24" height="18" rx="3" />
          <path d="M4 13h24M9 20h5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...p}>
          <path d="M8 4h11l6 6v18H8zM19 4v6h6M12 17l3 3 6-6" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M8 28V6h12v22M20 12h5v16M5 28h22M12 10h4M12 15h4M12 20h4" />
        </svg>
      );
  }
}

export function ServicesSection({ b, fill }: { b: SxBlock; fill: Fill }) {
  const items = b.items || [];
  if (!items.length) return null;
  const plainItems = items.filter((x) => !x.value);
  const stat = items.find((x) => x.value);
  return (
    <section className="sx-section sx-services">
      <div className="sx-wrap">
        <div className="sx-center-head">
          {chip(b.eyebrow)}
          <h2>{hl(b.title)}</h2>
          {b.text && <p>{b.text}</p>}
        </div>
        <div className="sx-services-grid">
          {plainItems.slice(0, 7).map((x, i) => (
            <div key={i} className="sx-service">
              <ServiceIcon i={i} />
              <b>{x.title}</b>
              {x.text && <small>{x.text}</small>}
            </div>
          ))}
          {stat && (
            <div className="sx-service sx-service-stat">
              <strong>{fill(stat.value)}</strong>
              <b>{stat.title}</b>
              {stat.text && <small>{stat.text}</small>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── expert ───────── */
export function ExpertSection({ b, art, fill, href }: { b: SxBlock; art: Art; fill: Fill; href: string }) {
  const [person, ...stats] = b.items || [];
  if (!b.title && !person) return null;
  return (
    <section className="sx-section sx-expert">
      <div className="sx-wrap sx-expert-grid">
        <div className="sx-expert-copy">
          {chip(b.eyebrow)}
          <h2>{hl(b.title)}</h2>
          {b.text && <p>{b.text}</p>}
          {person && (
            <div className="sx-expert-card">
              <span className="sx-expert-photo">{art(3, person.title, b.image)}</span>
              <div>
                <b>{person.title}</b>
                {person.value && <small>{person.value}</small>}
                {person.text && <p>{person.text}</p>}
                <a className="sx-pill-btn sx-pill-accent" href={href}>
                  {b.button || "Rendez-vous"}
                  <span className="sx-arrow-circle" aria-hidden="true">
                    <Icon name="arrow" />
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="sx-expert-media">
          {art(4, plain(b.title), b.image2)}
          {stats.length > 0 && (
            <div className="sx-expert-stats">
              {stats.slice(0, 3).map((x, i) => (
                <div key={i}>
                  <small>{x.title}</small>
                  <strong>{fill(x.value)}</strong>
                  {x.text && <span>{x.text}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── cartes points forts ───────── */
export function HighlightsSection({ b, art, fill, href }: { b: SxBlock; art: Art; fill: Fill; href: string }) {
  const items = b.items || [];
  if (!items.length) return null;
  const [a, c, d, e] = items;
  return (
    <section className="sx-section sx-highlights">
      <div className="sx-wrap">
        <div className="sx-head">
          <div>
            {chip(b.eyebrow)}
            <h2>{hl(b.title)}</h2>
            {b.text && <p>{b.text}</p>}
          </div>
          <div className="sx-hl-nav">
            <a href={href} aria-label="Voir la boutique">
              <Icon name="back" />
            </a>
            <a href={href} aria-label="Voir la boutique" className="is-on">
              <Icon name="arrow" />
            </a>
          </div>
        </div>
        <div className="sx-hl-row">
          {a && (
            <a className="sx-hl-card sx-hl-image" href={href}>
              <b>{a.title}</b>
              <span>{art(5, a.title, a.image)}</span>
            </a>
          )}
          {c && (
            <a className="sx-hl-card sx-hl-accent" href={href}>
              {c.value && <small className="sx-hl-pill">{c.value}</small>}
              <b>{hl(c.title)}</b>
              {c.text && <span>{c.text}</span>}
            </a>
          )}
          {d && (
            <a className="sx-hl-card sx-hl-photo" href={href} aria-label={d.title}>
              {art(6, d.title, d.image)}
            </a>
          )}
          {e && (
            <div className="sx-hl-card sx-hl-chart">
              <strong>{fill(e.value)}</strong>
              <span>{e.title}</span>
              <div className="sx-hl-bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────── catégories en trio ───────── */
export function TrioCategories({
  b,
  categories,
  catUrl,
  art,
  head,
  lang,
}: {
  b: SxBlock;
  categories: { name: string; image: string; count: number }[];
  catUrl: (n: string) => string;
  art: Art;
  head: React.ReactNode;
  lang: string;
}) {
  if (!categories.length) return null;
  const unit = (n: number) => (lang === "ar" ? n + " منتج" : n + (n > 1 ? " produits" : " produit"));
  return (
    <section className="sx-section sx-trio">
      <div className="sx-wrap">
        {b.title ? (
          <div className="sx-center-head">
            {chip(b.eyebrow)}
            <h2>{hl(b.title)}</h2>
            {b.text && <p>{b.text}</p>}
          </div>
        ) : (
          head
        )}
        <div className="sx-trio-list">
          {categories.slice(0, 3).map((x, i) => (
            <a key={x.name} href={catUrl(x.name)} className={"sx-trio-card sx-trio-" + i}>
              {i === 1 && <span className="sx-trio-bg">{x.image ? <img src={x.image} alt="" /> : art(i + 1)}</span>}
              <b>{x.name}</b>
              <span className="sx-trio-foot">
                {i !== 1 && (
                  <span className="sx-trio-thumb">{x.image ? <img src={x.image} alt="" /> : art(i + 1)}</span>
                )}
                {x.count > 0 && <small>{unit(x.count)}</small>}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
