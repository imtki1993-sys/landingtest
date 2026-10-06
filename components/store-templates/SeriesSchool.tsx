// Blocs « sur mesure » : hero école, cartes à encoche avec icônes dessinées,
// photo + chiffres en tuiles, appel à l'action avec photo en biais.
// Les doodles (flèches, étincelles, astérisques) prennent les couleurs du thème.
import React from "react";
import type { SxBlock, SxItem } from "../../lib/store-templates";
import { Icon } from "./SeriesParts";
import type { HeroKit } from "./SeriesHeroes2";
import "./series-school.css";

/** Texte avec les mots entre *étoiles* soulignés au feutre. */
export function hl(text: string | undefined): React.ReactNode {
  const s = String(text || "");
  if (!s.includes("*")) return s;
  return s.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 ? (
      <em key={i} className="sx-hl">
        {part}
      </em>
    ) : (
      part
    ),
  );
}
/** Même texte sans les étoiles (titres de page, attributs). */
export const plain = (text: string | undefined) => String(text || "").replace(/\*([^*]+)\*/g, "$1");

type DoodleName =
  "squiggle" | "spark" | "asterisk" | "burst" | "spiral" | "globe" | "target" | "book" | "bulb" | "lines";

/** Dessins au trait (stroke = couleur courante). */
export function Doodle({ name, className = "" }: { name: DoodleName; className?: string }) {
  const p = {
    className: "sx-doodle sx-doodle-" + name + (className ? " " + className : ""),
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "squiggle":
      return (
        <svg viewBox="0 0 220 180" {...p}>
          <path d="M205 8c-6 60-60 110-104 96-30-9-25-46 2-44 26 2 25 40-6 60-26 17-62 22-84 14" />
          <path d="M28 108l-14 26 30-4" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 100 100" {...p} fill="currentColor" stroke="none">
          <path d="M50 0c4 30 16 42 50 50-34 8-46 20-50 50-4-30-16-42-50-50 34-8 46-20 50-50z" />
        </svg>
      );
    case "asterisk":
      return (
        <svg viewBox="0 0 100 100" {...p} strokeWidth={7}>
          <path d="M52 6c-4 30-6 58-10 88M14 30c26 10 48 24 74 42M10 64c30-12 56-26 82-46M20 52h70" />
        </svg>
      );
    case "burst":
      return (
        <svg viewBox="0 0 200 160" {...p} strokeWidth={12}>
          <path d="M30 14l20 54M104 20l-26 68M186 92l-62 42" />
        </svg>
      );
    case "lines":
      return (
        <svg viewBox="0 0 140 90" {...p} strokeWidth={9}>
          <path d="M134 8C96 32 52 46 14 58M134 30C104 52 64 70 24 84" />
        </svg>
      );
    case "spiral":
      return (
        <svg viewBox="0 0 140 110" {...p} strokeWidth={6}>
          <path d="M14 104C-2 70 30 22 78 10c40-10 62 22 42 50-18 26-62 30-72 8-8-18 12-38 32-34 18 4 18 26 2 30" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 100 100" {...p} strokeWidth={5}>
          <circle cx="50" cy="50" r="44" />
          <ellipse cx="50" cy="50" rx="20" ry="44" />
          <path d="M8 36h84M8 64h84M50 6v88" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 100 100" {...p} strokeWidth={5}>
          <path d="M80 30A42 42 0 1 0 90 52" />
          <path d="M66 40a24 24 0 1 0 6 14" />
          <circle cx="48" cy="54" r="8" />
          <path d="M48 54L86 16M74 14l12 2 2 12" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 100 100" {...p} strokeWidth={5}>
          <path d="M50 24C38 14 20 12 8 16v64c12-4 30-2 42 8 12-10 30-12 42-8V16c-12-4-30-2-42 8zM50 24v64" />
        </svg>
      );
    case "bulb":
      return (
        <svg viewBox="0 0 100 100" {...p} strokeWidth={5}>
          <path d="M36 70c0-14-16-20-16-38a30 30 0 0 1 60 0c0 18-16 24-16 38zM38 82h24M42 94h16" />
        </svg>
      );
  }
}

const FEATURE_ICONS: DoodleName[] = ["spiral", "globe", "target", "book", "bulb"];

/** Bouton flèche posé dans l'encoche d'une carte. */
const notchArrow = (href: string, label: string, className = "") => (
  <a className={"sx-notch-arrow " + className} href={href} aria-label={label}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 18L18 6M8 6h10v10" />
    </svg>
  </a>
);

/* ───────── hero ───────── */
export function heroSchool(h: HeroKit & { items: SxItem[]; fill: (v?: string) => string }) {
  const [card1, card2] = h.items;
  const more = h.lang === "ar" ? "اكتشف" : "Découvrir";
  return (
    <section className="sx-hero sx-hero-school">
      <div className="sx-wrap sx-school-grid">
        <div className="sx-school-copy">
          {h.eyebrow()}
          {h.title("h1")}
          <p className="sx-hero-text">{h.hero.text}</p>
          {h.actions()}
          <Doodle name="squiggle" className="sx-school-squiggle" />
        </div>
        <div className="sx-school-visual" aria-hidden="true">
          <span className="sx-chalk sx-school-block sx-school-block-a" />
          <span className="sx-chalk sx-school-block sx-school-block-b" />
          <span className="sx-chalk sx-school-block sx-school-block-c" />
          <span className="sx-school-photo">{h.art(0, h.hero.title)}</span>
          <Doodle name="burst" className="sx-school-burst" />
        </div>
        {(card1 || card2) && (
          <div className="sx-school-cards">
            {card1 && (
              <div className="sx-school-card sx-school-card-person">
                <span className="sx-school-card-photo">{h.art(1, plain(card1.title), card1.image)}</span>
                <div>
                  <b>{hl(card1.title)}</b>
                  {card1.value && <strong>{h.fill(card1.value)}</strong>}
                  {card1.text && <small>{card1.text}</small>}
                </div>
              </div>
            )}
            {card2 && (
              <div className="sx-school-card sx-school-card-notch">
                <span className="sx-school-card-img">{h.art(2, plain(card2.title), card2.image)}</span>
                {notchArrow(h.shopUrl, more)}
                <b>{hl(card2.title)}</b>
                {card2.text && <small>{card2.text}</small>}
                <Doodle name="asterisk" className="sx-school-ast" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** En-tête de section : titre à gauche (mots soulignés), texte à droite, doodle. */
export function SplitHead({ b, deco = "squiggle" }: { b: SxBlock; deco?: DoodleName }) {
  if (!b.title && !b.text) return null;
  return (
    <div className="sx-split-head">
      <div>
        {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
        <h2>
          {hl(b.title)}
          <Doodle name="spark" className="sx-head-spark" />
        </h2>
      </div>
      {b.text && <p>{b.text}</p>}
      <Doodle name={deco} className="sx-head-deco" />
    </div>
  );
}

/* ───────── cartes à encoche ───────── */
export function FeaturesSection({ b, shopUrl, lang }: { b: SxBlock; shopUrl: string; lang: string }) {
  const items = b.items || [];
  if (!items.length) return null;
  const more = lang === "ar" ? "اكتشف" : "Découvrir";
  return (
    <section className="sx-section sx-features">
      <div className="sx-wrap">
        <SplitHead b={b} />
        <div className="sx-features-list">
          {items.slice(0, 6).map((x, i) => (
            <article key={i} className={"sx-feature" + (i % 3 === 1 ? " sx-feature-alt" : "")}>
              <Doodle name={FEATURE_ICONS[i % FEATURE_ICONS.length]} className="sx-feature-icon" />
              <h3>{hl(x.title)}</h3>
              {x.text && <p>{x.text}</p>}
              {notchArrow(shopUrl, more + " : " + plain(x.title))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── photo + chiffres ───────── */
export function PhotoStatsSection({
  b,
  photo,
  fill,
}: {
  b: SxBlock;
  photo: React.ReactNode;
  fill: (v?: string) => string;
}) {
  const items = b.items || [];
  if (!items.length && !b.title) return null;
  return (
    <section className="sx-section sx-photostats">
      <div className="sx-wrap">
        <SplitHead b={b} deco="squiggle" />
        <div className="sx-ps-grid">
          <div className="sx-ps-photo">
            <span className="sx-chalk sx-ps-band sx-ps-band-a" />
            <span className="sx-chalk sx-ps-band sx-ps-band-b" />
            <span className="sx-ps-img">{photo}</span>
          </div>
          {items.slice(0, 3).map((x, i) => (
            <div key={i} className={"sx-ps-stat sx-ps-stat-" + i}>
              <strong>{fill(x.value)}</strong>
              <span>{x.title}</span>
            </div>
          ))}
          <span className="sx-ps-deco sx-ps-burst" aria-hidden="true">
            <Doodle name="burst" />
          </span>
          <span className="sx-chalk sx-ps-tile sx-ps-tile-a" aria-hidden="true" />
          <span className="sx-chalk sx-ps-tile sx-ps-tile-b" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ───────── appel à l'action avec photo ───────── */
export function CtaPhotoSection({
  b,
  photo,
  href,
  fallback,
}: {
  b: SxBlock;
  photo: React.ReactNode;
  href: string;
  fallback: string;
}) {
  return (
    <section className="sx-section sx-cta-photo">
      <div className="sx-wrap">
        <div className="sx-ctap-box">
          <span className="sx-ctap-media">{photo}</span>
          <div className="sx-ctap-copy">
            {b.eyebrow && <small>{b.eyebrow}</small>}
            <h2>{hl(b.title)}</h2>
            {b.text && <p>{b.text}</p>}
            <a className="sx-btn" href={href}>
              {b.button || fallback} <Icon name="arrow" />
            </a>
          </div>
          {notchArrow(href, b.button || fallback, "sx-ctap-arrow")}
          <Doodle name="asterisk" className="sx-ctap-ast" />
        </div>
      </div>
    </section>
  );
}
