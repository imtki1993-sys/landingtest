"use client";
// Heros de la Série 2 (un par template). Les éléments communs (titre, boutons,
// images, recherche) sont fournis par SeriesStore via `h`.
import React from "react";
import { Icon, TRUST_ICONS, img, price, productUrl } from "./SeriesParts";
import type { SxHeroVariant, SxItem } from "../../lib/store-templates";
import "./series-store-2.css";

export interface HeroKit {
  hero: { eyebrow: string; title: string; text: string; button: string; secondary: string; highlight: string };
  store: any;
  products: any[];
  categories: { name: string; image: string; count: number }[];
  lang: "fr" | "ar";
  base: string;
  shopUrl: string;
  catUrl: (name: string) => string;
  stats: { value: string; title: string }[];
  trust: SxItem[];
  art: (i?: number, label?: string, src?: string) => React.ReactNode;
  title: (Tag?: any, className?: string) => React.ReactNode;
  actions: (light?: boolean) => React.ReactNode;
  eyebrow: () => React.ReactNode;
  searchBar: (withSelect?: boolean) => React.ReactNode;
}

const tr = (h: HeroKit, fr: string, ar: string) => (h.lang === "ar" ? ar : fr);

export function heroSerie2(variant: SxHeroVariant, h: HeroKit): React.ReactNode {
  const first = h.products[0];
  const productChip = (p: any, className = "") =>
    p ? (
      <a className={"sx-float-card " + className} href={productUrl(h.base, p)}>
        <span className="sx-fc-img">{img(p) ? <img src={img(p)} alt="" /> : <span className="sx-art" />}</span>
        <span>
          <b>{p.name}</b>
          <small>{price(p.price)}</small>
        </span>
        <i className="sx-fc-plus">
          <Icon name="plus" />
        </i>
      </a>
    ) : null;
  const statRow = (n = 4) => (
    <div className="sx-hero-statrow">
      {h.stats.slice(0, n).map((s, i) => (
        <span key={i}>
          <b>{s.value}</b>
          <small>{s.title}</small>
        </span>
      ))}
    </div>
  );
  const trustRow = (
    <div className="sx-hero-trustrow">
      {h.trust.slice(0, 4).map((x, i) => (
        <span key={i}>
          <Icon name={TRUST_ICONS[i % 4]} />
          <b>{x.title}</b>
        </span>
      ))}
    </div>
  );

  switch (variant) {
    case "gallery":
      return (
        <section className="sx-hero sx-hero-gallery">
          <div className="sx-wrap">
            <div className="sx-hero-grid">
              <div className="sx-hero-copy">
                {h.eyebrow()}
                {h.title()}
                <p className="sx-hero-text">{h.hero.text}</p>
                <div className="sx-gal-row">
                  <span className="sx-gal-small">{h.art(1)}</span>
                  {productChip(first, "sx-gal-card")}
                </div>
              </div>
              <div className="sx-hero-media">
                <div className="sx-gal-main">{h.art(0)}</div>
                <div className="sx-gal-thumbs">
                  {[2, 3, 4].map((i) => (
                    <span key={i}>{h.art(i)}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="sx-gal-search">{h.searchBar(true)}</div>
          </div>
        </section>
      );
    case "warm-photo":
      return (
        <section className="sx-hero sx-hero-warm-photo">
          <div className="sx-warm-frame">
            <div className="sx-hero-bg">{h.art(0)}</div>
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions(true)}
            </div>
            {productChip(first, "sx-warm-card")}
          </div>
          <div className="sx-wrap">{trustRow}</div>
        </section>
      );
    case "sky-left":
      return (
        <section className="sx-hero sx-hero-sky-left">
          <div className="sx-sky-frame">
            <div className="sx-hero-copy">
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions(true)}
            </div>
            <div className="sx-hero-media">{h.art(0)}</div>
            <div className="sx-gauge">
              <small>{tr(h, "Paiement à la livraison", "الدفع عند الاستلام")}</small>
              <svg viewBox="0 0 120 70" aria-hidden="true">
                <path d="M10 62a50 50 0 0 1 100 0" className="sx-gauge-bg" />
                <path d="M10 62a50 50 0 0 1 100 0" className="sx-gauge-fg" />
              </svg>
              <b>100%</b>
              <div>
                {h.stats.slice(0, 2).map((s, i) => (
                  <span key={i}>
                    <b>{s.value}</b>
                    <small>{s.title}</small>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    case "freeflow":
      return (
        <section className="sx-hero sx-hero-freeflow">
          <div className="sx-flow-bg" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="sx-wrap sx-flow-inner">
            <div className="sx-flow-side">
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
            </div>
            {h.title("h1", "sx-flow-title")}
            <div className="sx-flow-proof">
              <span className="sx-avatars" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <span key={i}>{h.art(i)}</span>
                ))}
              </span>
              <span>
                <b>{h.stats[0]?.value}</b> {h.stats[0]?.title}
              </span>
            </div>
          </div>
        </section>
      );
    case "soft-card":
      return (
        <section className="sx-hero sx-hero-soft-card">
          <div className="sx-wrap">
            <div className="sx-soft-frame">
              <div className="sx-hero-copy">
                {h.eyebrow()}
                {h.title()}
                <p className="sx-hero-text">{h.hero.text}</p>
                {h.searchBar()}
              </div>
              <div className="sx-hero-media">{h.art(0)}</div>
            </div>
          </div>
        </section>
      );
    case "photo-cards":
      return (
        <section className="sx-hero sx-hero-photo-cards">
          <div className="sx-pc-frame">
            <div className="sx-hero-bg">{h.art(0)}</div>
            <div className="sx-hero-copy">
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions(true)}
            </div>
            <div className="sx-pc-cards">
              <div className="sx-pc-card">
                <small>{h.hero.eyebrow}</small>
                <b>{h.stats[0]?.value}</b>
                <span>{h.stats[0]?.title}</span>
              </div>
              <div className="sx-pc-card sx-pc-dark">
                <small>{tr(h, "Paiement", "الخلاص")}</small>
                <b>100%</b>
                <span>{tr(h, "à la livraison", "عند الاستلام")}</span>
                <span className="sx-pc-bars" aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <i key={i} style={{ height: 20 + ((i * 37) % 60) + "%" }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    case "giant-under":
      return (
        <section className="sx-hero sx-hero-giant-under">
          <div className="sx-hero-bg">{h.art(0)}</div>
          <div className="sx-wrap sx-gu-top">
            <span className="sx-avatars" aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <span key={i}>{h.art(i)}</span>
              ))}
            </span>
            <p className="sx-gu-claim">{h.hero.text}</p>
          </div>
          <div className="sx-gu-word" aria-hidden="true">
            {h.hero.eyebrow || h.store.name}
          </div>
          <div className="sx-wrap sx-gu-bottom">
            {h.title("h1", "sx-gu-title")}
            {h.actions()}
          </div>
        </section>
      );
    case "editorial-serif":
      return (
        <section className="sx-hero sx-hero-editorial-serif">
          <div className="sx-wrap sx-hero-grid">
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              {h.actions()}
              <div className="sx-es-mini">
                <span>{h.art(2)}</span>
                <p className="sx-hero-text">{h.hero.text}</p>
              </div>
            </div>
            <div className="sx-hero-media">
              {h.art(0)}
              {h.products.slice(0, 2).map((p, i) => (
                <a key={p.id} className={"sx-es-dot sx-es-dot-" + i} href={productUrl(h.base, p)}>
                  <span>{img(p) ? <img src={img(p)} alt="" /> : null}</span>
                  <small>{p.name}</small>
                </a>
              ))}
              <a className="sx-es-all" href={h.shopUrl}>
                {tr(h, "Voir tous les produits", "شوف جميع المنتجات")} <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>
      );
    case "dark-forest":
      return (
        <section className="sx-hero sx-hero-dark-forest">
          <div className="sx-hero-bg">{h.art(0)}</div>
          <div className="sx-wrap sx-df-inner">
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions(true)}
            </div>
            {productChip(first, "sx-df-card")}
          </div>
          <div className="sx-wrap">{trustRow}</div>
        </section>
      );
    case "plates":
      return (
        <section className="sx-hero sx-hero-plates">
          <div className="sx-wrap sx-hero-grid">
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
            </div>
            <div className="sx-hero-media sx-plates">
              <span className="sx-plates-ring" aria-hidden="true" />
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={"sx-plate sx-plate-" + i}>
                  {h.art(i)}
                </span>
              ))}
            </div>
          </div>
          <div className="sx-wrap sx-plates-trust">
            {h.trust.slice(0, 3).map((x, i) => (
              <div key={i}>
                <i>
                  <Icon name={TRUST_ICONS[i % 4]} />
                </i>
                <b>{x.title}</b>
                {x.text && <small>{x.text}</small>}
              </div>
            ))}
          </div>
        </section>
      );
    case "sky-wellness":
      return (
        <section className="sx-hero sx-hero-sky-wellness">
          <div className="sx-sw-frame">
            <div className="sx-hero-bg">{h.art(0)}</div>
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
            </div>
          </div>
          <div className="sx-wrap">{statRow(4)}</div>
        </section>
      );
    case "framed-photo":
      return (
        <section className="sx-hero sx-hero-framed-photo">
          <div className="sx-wrap">
            <div className="sx-fp-frame">
              <div className="sx-hero-bg">{h.art(0)}</div>
              <div className="sx-fp-info">
                <small>
                  <Icon name="pin" /> {tr(h, "Livraison partout au Maroc", "التوصيل لجميع المدن")}
                </small>
                <b>{tr(h, "Paiement à la livraison", "الدفع عند الاستلام")}</b>
              </div>
              <div className="sx-hero-copy">
                {h.hero.eyebrow && <span className="sx-chip">{h.hero.eyebrow}</span>}
                {h.title()}
                <p className="sx-hero-text">{h.hero.text}</p>
              </div>
              <div className="sx-fp-proof">
                <span className="sx-avatars" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span key={i}>{h.art(i)}</span>
                  ))}
                </span>
                <span>
                  <b>{h.stats[0]?.value}</b>
                  <small>{h.stats[0]?.title}</small>
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    case "dark-collage":
      return (
        <section className="sx-hero sx-hero-dark-collage">
          <div className="sx-wrap sx-dc-grid">
            <div className="sx-dc-side">
              <span className="sx-dc-img">{h.art(1)}</span>
              {productChip(first, "sx-dc-card")}
            </div>
            <div className="sx-hero-copy sx-center">
              {h.hero.eyebrow && <span className="sx-chip sx-chip-ghost">{h.hero.eyebrow}</span>}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
            </div>
            <div className="sx-dc-side">
              <div className="sx-dc-tags">
                {h.categories.slice(0, 3).map((c) => (
                  <a key={c.name} href={h.catUrl(c.name)}>
                    #{c.name}
                  </a>
                ))}
              </div>
              <span className="sx-dc-img sx-dc-tall">{h.art(0)}</span>
            </div>
          </div>
        </section>
      );
    case "center-photo":
      return (
        <section className="sx-hero sx-hero-center-photo">
          <div className="sx-hero-bg">{h.art(0)}</div>
          <div className="sx-wrap sx-hero-copy sx-center">
            {h.eyebrow()}
            {h.title()}
            <p className="sx-hero-text">{h.hero.text}</p>
            {h.actions(true)}
          </div>
        </section>
      );
    case "dark-split":
      return (
        <section className="sx-hero sx-hero-dark-split">
          <div className="sx-wrap sx-hero-grid">
            <div className="sx-hero-copy">
              {h.eyebrow()}
              {h.title()}
              <p className="sx-hero-text">{h.hero.text}</p>
              {h.actions()}
              {statRow(2)}
            </div>
            <div className="sx-hero-media">
              {h.art(0)}
              <div className="sx-ds-badge">
                <b>{h.stats[0]?.value}</b>
                <small>{h.stats[0]?.title}</small>
              </div>
            </div>
          </div>
        </section>
      );
  }
  return null;
}
