"use client";
// Heros de la Série 3 (un par template). Chaque hero a son décor dessiné en CSS
// (montagnes, halo, fumée, disque…) visible même sans photo ; les photos viennent
// des images du hero choisies dans l'éditeur, sinon des produits de la boutique.
import React from "react";
import { Icon, TRUST_ICONS, img, price, productUrl } from "./SeriesParts";
import type { SxHeroVariant, SxItem } from "../../lib/store-templates";
import type { HeroKit } from "./SeriesHeroes2";
import "./series-store-3.css";

export const SERIE3_HEROES = new Set<SxHeroVariant>([
  "frost",
  "luxe-dark",
  "slider-beige",
  "neon",
  "portrait-dark",
  "diagonal",
  "ghost-word",
  "smoke",
  "circle-product",
  "center-product",
  "bold-photo",
  "brutal",
  "spec-tech",
  "badge-split",
  "minimal-gray",
  "giant-behind",
  "night-photo",
  "red-panel",
  "brand-giant",
  "orange-orb",
]);

export type Hero3Kit = HeroKit & { items: SxItem[]; fill: (v?: string) => string; add: (p: any) => void };

const tr = (h: HeroKit, fr: string, ar: string) => (h.lang === "ar" ? ar : fr);

export function heroSerie3(variant: SxHeroVariant, h: Hero3Kit): React.ReactNode {
  const first = h.products[0];
  const trustRow = (n = 4, className = "") => (
    <div className={"sx-h3-trust " + className}>
      {h.trust.slice(0, n).map((x, i) => (
        <span key={i}>
          <Icon name={TRUST_ICONS[i % 4]} />
          <span>
            <b>{x.title}</b>
            {x.text && <small>{x.text}</small>}
          </span>
        </span>
      ))}
    </div>
  );
  const statCards = (n = 3, className = "") => (
    <div className={"sx-h3-stats " + className}>
      {h.items.slice(0, n).map((x, i) => (
        <span key={i}>
          <small>{x.title}</small>
          <b>{h.fill(x.value)}</b>
        </span>
      ))}
    </div>
  );
  const arrows = (
    <div className="sx-h3-arrows" aria-hidden="true">
      <a href={h.shopUrl} tabIndex={-1}>
        <Icon name="back" />
      </a>
      <a href={h.shopUrl} tabIndex={-1}>
        <Icon name="arrow" />
      </a>
    </div>
  );
  const dots = (
    <div className="sx-h3-dots" aria-hidden="true">
      <i className="on" />
      <i />
      <i />
    </div>
  );
  const productMini = (p: any, className = "") =>
    p ? (
      <a className={"sx-h3-mini " + className} href={productUrl(h.base, p)}>
        <span>{img(p) ? <img src={img(p)} alt="" /> : <span className="sx-art" />}</span>
        <b>{p.name}</b>
        <small>{price(p.price)}</small>
      </a>
    ) : null;

  switch (variant) {
    /* 01 · bleu glacier */
    case "frost": {
      const [line, note] = h.items;
      return (
        <section className="sx-hero sx-h3-frost">
          <div className="sx-h3-mountains" aria-hidden="true" />
          <div className="sx-wrap sx-h3-frost-grid">
            <div className="sx-h3-frost-top">
              {h.title("h1")}
              <p className="sx-h3-mono">{h.hero.text}</p>
            </div>
            <div className="sx-h3-frost-product">{h.art(0, h.hero.title)}</div>
            {first && (
              <div className="sx-h3-frost-buy">
                <button type="button" onClick={() => h.add(first)} aria-label={h.hero.button + " : " + first.name}>
                  <Icon name="arrow" />
                </button>
                <span>
                  <small>{h.hero.button}</small>
                  <b>{price(first.price)}</b>
                </span>
              </div>
            )}
            {note && <p className="sx-h3-mono sx-h3-frost-note">{note.title}</p>}
            {line && <b className="sx-h3-frost-line">{line.title}</b>}
          </div>
        </section>
      );
    }
    /* 02 · luxe sombre */
    case "luxe-dark":
      return (
        <section className="sx-hero sx-h3-luxe">
          <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-luxe-inner">
            {h.eyebrow()}
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            <div className="sx-actions">
              <a className="sx-btn" href={h.shopUrl}>
                {h.hero.button}
              </a>
              {h.hero.secondary && (
                <a className="sx-btn sx-btn-ghost" href={h.shopUrl}>
                  {h.hero.secondary}
                </a>
              )}
            </div>
            {dots}
          </div>
          {trustRow(4, "sx-h3-luxe-trust")}
        </section>
      );
    /* 03 · bannière beige */
    case "slider-beige":
      return (
        <section className="sx-hero sx-h3-beige">
          <div className="sx-wrap sx-h3-beige-grid">
            <div>
              {h.hero.eyebrow && <small className="sx-h3-tag">{h.hero.eyebrow}</small>}
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              <a className="sx-btn" href={h.shopUrl}>
                {h.hero.button} <Icon name="arrow" />
              </a>
            </div>
            <div className="sx-h3-beige-media">
              <span>{h.art(0, h.hero.title)}</span>
              <span>{h.art(1)}</span>
              <span>{h.art(2)}</span>
            </div>
          </div>
          {arrows}
          {dots}
        </section>
      );
    /* 04 · néon */
    case "neon":
      return (
        <section className="sx-hero sx-h3-neon">
          <div className="sx-h3-glow" aria-hidden="true" />
          <div className="sx-wrap sx-h3-neon-grid">
            <div className="sx-h3-neon-copy">
              {h.hero.eyebrow && <small className="sx-h3-chip">{h.hero.eyebrow}</small>}
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
              {statCards(3, "sx-h3-glass-row")}
            </div>
            <div className="sx-h3-neon-media">{h.art(0, h.hero.title)}</div>
            {first && (
              <a className="sx-h3-neon-card" href={productUrl(h.base, first)}>
                <span>{img(first) ? <img src={img(first)} alt="" /> : <span className="sx-art" />}</span>
                <b>{first.name}</b>
                <small>{price(first.price)}</small>
                <i className="sx-btn">{tr(h, "Commander", "اطلب")}</i>
              </a>
            )}
          </div>
        </section>
      );
    /* 05 · portrait sombre */
    case "portrait-dark":
      return (
        <section className="sx-hero sx-h3-portrait">
          <div className="sx-h3-portrait-media">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-portrait-inner">
            {h.eyebrow()}
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            {h.actions()}
            {trustRow(3, "sx-h3-portrait-trust")}
          </div>
          {h.items[0] && <span className="sx-h3-script">{h.items[0].title}</span>}
        </section>
      );
    /* 06 · découpe en biais */
    case "diagonal":
      return (
        <section className="sx-hero sx-h3-diag">
          <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-diag-inner">
            {h.eyebrow()}
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            {h.actions()}
          </div>
          <span className="sx-h3-diag-num" aria-hidden="true">
            01
          </span>
          <div className="sx-h3-diag-cut" aria-hidden="true">
            <span>{h.art(1)}</span>
          </div>
        </section>
      );
    /* 07 · mot géant */
    case "ghost-word": {
      const word = h.items[0]?.title || h.categories[0]?.name || h.store.name;
      return (
        <section className="sx-hero sx-h3-ghost">
          <div className="sx-wrap">
            <div className="sx-h3-ghost-panel">
              <div className="sx-h3-ghost-copy">
                {h.eyebrow()}
                {h.title("h1")}
              </div>
              <span className="sx-h3-ghost-word" aria-hidden="true">
                {word}
              </span>
              <div className="sx-h3-ghost-product">{h.art(0, h.hero.title)}</div>
              <a className="sx-btn" href={h.shopUrl}>
                {h.hero.button}
              </a>
              <p className="sx-h3-ghost-text">{h.hero.text}</p>
            </div>
          </div>
        </section>
      );
    }
    /* 08 · plein cadre fumée */
    case "smoke":
      return (
        <section className="sx-hero sx-h3-smoke">
          <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
          <div className="sx-h3-smoke-fx" aria-hidden="true" />
          <div className="sx-wrap sx-h3-smoke-inner">
            {h.eyebrow()}
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            {h.actions()}
          </div>
        </section>
      );
    /* 09 · produit dans un disque */
    case "circle-product":
      return (
        <section className="sx-hero sx-h3-circle">
          <div className="sx-wrap sx-h3-circle-grid">
            <div>
              {h.eyebrow()}
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              <div className="sx-actions">
                <a className="sx-btn" href={h.shopUrl}>
                  {h.hero.button} <Icon name="arrow" />
                </a>
                {h.hero.secondary && (
                  <a className="sx-h3-play" href={h.base + "/delivery"}>
                    {h.hero.secondary}
                    <i aria-hidden="true">
                      <Icon name="arrow" />
                    </i>
                  </a>
                )}
              </div>
            </div>
            <div className="sx-h3-circle-media">
              <span className="sx-h3-disc" aria-hidden="true" />
              <span className="sx-h3-circle-img">{h.art(0, h.hero.title)}</span>
            </div>
          </div>
        </section>
      );
    /* 10 · épuré centré */
    case "center-product":
      return (
        <section className="sx-hero sx-h3-center">
          <div className="sx-wrap">
            {h.title("h1")}
            <p className="sx-hero-text">{h.hero.text}</p>
            <div className="sx-h3-center-links">
              <a href={h.shopUrl}>
                {h.hero.button} <Icon name="arrow" />
              </a>
              {h.hero.secondary && (
                <a href={h.base + "/delivery"}>
                  {h.hero.secondary} <Icon name="arrow" />
                </a>
              )}
            </div>
            <div className="sx-h3-center-media">{h.art(0, h.hero.title)}</div>
            {dots}
          </div>
        </section>
      );
    /* 11 · photo sport très grasse */
    case "bold-photo":
      return (
        <section className="sx-hero sx-h3-bold">
          <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-bold-inner">
            {h.title("h1")}
            <i className="sx-h3-bar" aria-hidden="true" />
            <p className="sx-hero-text">{h.hero.text}</p>
            <div className="sx-actions">
              <a className="sx-btn" href={h.shopUrl}>
                {h.hero.button} <Icon name="arrow" />
              </a>
              {h.hero.secondary && (
                <a className="sx-h3-textlink" href={h.shopUrl}>
                  {h.hero.secondary} <Icon name="arrow" />
                </a>
              )}
            </div>
          </div>
        </section>
      );
    /* 12 · typographie brute */
    case "brutal": {
      const letter = String(h.store.name || "B")
        .trim()
        .charAt(0)
        .toUpperCase();
      return (
        <section className="sx-hero sx-h3-brutal">
          <span className="sx-h3-brutal-letter" aria-hidden="true">
            {letter}
          </span>
          <div className="sx-wrap sx-h3-brutal-grid">
            <div className="sx-h3-brutal-copy">
              {h.title("h1")}
              <a className="sx-h3-textlink" href={h.shopUrl}>
                {h.hero.button} <Icon name="arrow" />
              </a>
            </div>
            <p className="sx-h3-mono sx-h3-brutal-text">{h.hero.text}</p>
            <div className="sx-h3-brutal-media">{h.art(0, h.hero.title)}</div>
            <span className="sx-h3-seal" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <defs>
                  <path id="sx-seal-path" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
                </defs>
                <text>
                  <textPath href="#sx-seal-path">
                    {(h.store.name + " · " + h.hero.eyebrow + " · ").toUpperCase()}
                  </textPath>
                </text>
              </svg>
              <b>{letter}.</b>
            </span>
          </div>
        </section>
      );
    }
    /* 13 · high-tech */
    case "spec-tech":
      return (
        <section className="sx-hero sx-h3-spec">
          <div className="sx-h3-nebula" aria-hidden="true" />
          <div className="sx-wrap sx-h3-spec-grid">
            <div>
              {h.eyebrow()}
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              <a className="sx-btn sx-h3-cut-btn" href={h.shopUrl}>
                {h.hero.button} <Icon name="arrow" />
              </a>
              <div className="sx-h3-spec-icons">
                {h.items.slice(0, 4).map((x, i) => (
                  <span key={i}>
                    <Icon name={["chat", "swap", "cash", "phone"][i % 4]} />
                    <b>{x.title}</b>
                    {x.text && <small>{x.text}</small>}
                  </span>
                ))}
              </div>
            </div>
            <div className="sx-h3-spec-media">{h.art(0, h.hero.title)}</div>
          </div>
        </section>
      );
    /* 14 · clair + pastille */
    case "badge-split": {
      const [script, badge] = h.items;
      return (
        <section className="sx-hero sx-h3-badge">
          <div className="sx-wrap sx-h3-badge-grid">
            <div>
              {h.eyebrow()}
              {h.title("h1")}
              {script && <span className="sx-h3-script">{script.title}</span>}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
              {trustRow(3, "sx-h3-badge-trust")}
            </div>
            <div className="sx-h3-badge-media">
              {h.art(0, h.hero.title)}
              {badge && (
                <span className="sx-h3-roundel">
                  <small>{badge.value}</small>
                  <b>{badge.title}</b>
                </span>
              )}
            </div>
          </div>
          {arrows}
        </section>
      );
    }
    /* 15 · gris minimal */
    case "minimal-gray":
      return (
        <section className="sx-hero sx-h3-gray">
          <div className="sx-wrap sx-h3-gray-grid">
            <div>
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              <div className="sx-actions">
                <a className="sx-btn" href={h.shopUrl}>
                  {h.hero.button}
                </a>
                {h.hero.secondary && (
                  <a className="sx-btn sx-btn-ghost" href={h.base + "/contact"}>
                    {h.hero.secondary}
                  </a>
                )}
              </div>
            </div>
            <div className="sx-h3-gray-media">
              {h.art(0, h.hero.title)}
              <span className="sx-h3-glass-bars" aria-hidden="true" />
            </div>
          </div>
        </section>
      );
    /* 16 · mot géant derrière la photo */
    case "giant-behind":
      return (
        <section className="sx-hero sx-h3-giant">
          <div className="sx-h3-orange-glow" aria-hidden="true" />
          <span className="sx-h3-giant-word" aria-hidden="true">
            {h.store.name}
          </span>
          <div className="sx-h3-giant-media">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-giant-bottom">
            <div>
              {h.eyebrow()}
              {h.title("h1")}
              {h.actions()}
            </div>
            <div className="sx-h3-giant-card">
              <b>{tr(h, "Une question ?", "عندك سؤال؟")}</b>
              <small>{h.hero.text}</small>
              <a className="sx-btn" href={h.base + "/contact"}>
                {tr(h, "Nous contacter", "تواصل معانا")} <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>
      );
    /* 17 · photo de nuit */
    case "night-photo":
      return (
        <section className="sx-hero sx-h3-night">
          <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
          <div className="sx-wrap sx-h3-night-inner">
            {h.eyebrow()}
            {h.title("h1")}
            {h.hero.text && <p className="sx-hero-text">{h.hero.text}</p>}
            <a className="sx-btn sx-btn-light" href={h.shopUrl}>
              {h.hero.button}
            </a>
          </div>
        </section>
      );
    /* 18 · panneau rouge */
    case "red-panel":
      return (
        <section className="sx-hero sx-h3-red">
          <div className="sx-wrap">
            <div className="sx-h3-red-card">
              <div className="sx-h3-red-copy">
                {h.eyebrow()}
                {h.title("h1")}
                <p className="sx-hero-text">{h.hero.text}</p>
                {h.actions()}
                {trustRow(3, "sx-h3-red-trust")}
              </div>
              <div className="sx-h3-red-media">
                <span className="sx-h3-red-panel" aria-hidden="true" />
                <span className="sx-h3-red-img">{h.art(0, h.hero.title)}</span>
                {h.items[0] && <b className="sx-h3-roundel sx-h3-red-badge">{h.items[0].title}</b>}
              </div>
            </div>
          </div>
        </section>
      );
    /* 19 · nom géant */
    case "brand-giant":
      return (
        <section className="sx-hero sx-h3-brand">
          <div className="sx-wrap sx-h3-brand-grid">
            <div className="sx-h3-brand-main">
              <div className="sx-hero-bg">{h.art(0, h.hero.title)}</div>
              <div className="sx-h3-brand-copy">
                <span className="sx-h3-brand-name">
                  {h.store.name}
                  <sup>®</sup>
                </span>
                <small>{h.hero.eyebrow}</small>
              </div>
            </div>
            <div className="sx-h3-brand-side">
              {h.items[0] && (
                <span className="sx-h3-brand-stat">
                  <b>{h.fill(h.items[0].value)}</b>
                  <small>{h.items[0].title}</small>
                </span>
              )}
              {first && (
                <a className="sx-h3-brand-card" href={productUrl(h.base, first)}>
                  <span>{img(first) ? <img src={img(first)} alt="" /> : <span className="sx-art" />}</span>
                  <small>{first.name}</small>
                  <b>
                    + {h.hero.button} {price(first.price)}
                  </b>
                </a>
              )}
            </div>
          </div>
          <h1 className="sx-visually-hidden">{h.hero.title}</h1>
        </section>
      );
    /* 20 · disque orange */
    case "orange-orb":
      return (
        <section className="sx-hero sx-h3-orb">
          <div className="sx-wrap sx-h3-orb-grid">
            <div className="sx-h3-orb-copy">
              {h.title("h1")}
              <p className="sx-hero-text">{h.hero.text}</p>
              <div className="sx-actions">
                <a className="sx-btn" href={h.shopUrl}>
                  {h.hero.button} <Icon name="arrow" />
                </a>
                {h.hero.secondary && (
                  <a className="sx-h3-play" href={h.shopUrl}>
                    {h.hero.secondary}
                    <i aria-hidden="true">
                      <Icon name="arrow" />
                    </i>
                  </a>
                )}
              </div>
            </div>
            <div className="sx-h3-orb-media">
              <span className="sx-h3-orb-disc" aria-hidden="true" />
              <span className="sx-h3-orb-img">{h.art(0, h.hero.title)}</span>
              {h.items[0] && (
                <span className="sx-h3-orb-badge">
                  <b>{h.fill(h.items[0].value)}</b>
                  <small>{h.items[0].title}</small>
                </span>
              )}
            </div>
            {productMini(first, "sx-h3-orb-feature")}
            <div className="sx-h3-orb-stats">
              {h.items.slice(1, 5).map((x, i) => (
                <span key={i}>
                  <b>{h.fill(x.value)}</b>
                  <small>{x.title}</small>
                </span>
              ))}
            </div>
          </div>
        </section>
      );
  }
  return null;
}
