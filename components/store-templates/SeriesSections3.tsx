"use client";
// Sections de la Série 3 : offres du jour, mosaïque de bannières, caractéristiques,
// bande de photos et 12 mises en page de catégories.
import React, { useEffect, useState } from "react";
import type { SxBlock, SxCategories } from "../../lib/store-templates";
import { Icon, discount, img, price, productUrl, type SxCtx } from "./SeriesParts";
import { hl } from "./SeriesSchool";

type Art = (i?: number, label?: string, src?: string) => React.ReactNode;
type Cat = { name: string; image: string; count: number };

/* ───────── offres du jour (compte à rebours jusqu'à minuit) ───────── */
function useUntilMidnight() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export function DealsSection({ b, ctx, head }: { b: SxBlock; ctx: SxCtx; head: React.ReactNode }) {
  const left = useUntilMidnight();
  const onSale = ctx.products.filter((p) => discount(p) > 0);
  const list = (onSale.length ? onSale : ctx.products).slice(0, 2);
  if (!list.length) return null;
  const parts =
    left === null
      ? ["--", "--", "--"]
      : [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60].map((n) => String(n).padStart(2, "0"));
  const labels = ctx.lang === "ar" ? ["ساعة", "دقيقة", "ثانية"] : ["Heures", "Min", "Sec"];
  return (
    <section className="sx-section sx-deals">
      <div className="sx-wrap">
        {head}
        <div className="sx-deals-list">
          {list.map((p) => {
            const off = discount(p);
            return (
              <article key={p.id} className="sx-deal">
                <a className="sx-deal-media" href={productUrl(ctx.base, p)}>
                  {img(p) ? <img src={img(p)} alt={p.name} loading="lazy" /> : <span className="sx-art" />}
                  {off > 0 && <em>-{off}%</em>}
                </a>
                <div className="sx-deal-body">
                  <a className="sx-deal-name" href={productUrl(ctx.base, p)}>
                    {p.name}
                  </a>
                  <div className="sx-price">
                    {off > 0 && <s>{price(p.compare_at_price)}</s>}
                    <b>{price(p.price)}</b>
                  </div>
                  <small className="sx-deal-ends">
                    {ctx.lang === "ar" ? "العرض كيسالي فـ" : "L'offre se termine dans"}
                  </small>
                  <div className="sx-deal-timer" aria-live="off">
                    {parts.map((v, i) => (
                      <span key={i}>
                        <b>{v}</b>
                        <small>{labels[i]}</small>
                      </span>
                    ))}
                  </div>
                  <button type="button" className="sx-btn" onClick={() => ctx.add(p)}>
                    <Icon name="cart" /> {b.button || ctx.txt.add}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── mosaïque de bannières ───────── */
export function MosaicSection({
  b,
  art,
  href,
  head,
  more,
}: {
  b: SxBlock;
  art: Art;
  href: string;
  head: React.ReactNode;
  more: string;
}) {
  const items = (b.items || []).slice(0, 6);
  if (!items.length) return null;
  return (
    <section className="sx-section sx-mosaic">
      <div className="sx-wrap">
        {(b.title || b.text) && head}
        <div className={"sx-mosaic-grid sx-mosaic-" + items.length}>
          {items.map((x, i) => (
            <a key={i} href={href} className={"sx-tile sx-tile-" + i}>
              <span className="sx-tile-media">{art(i + 2, x.title, x.image)}</span>
              <span className="sx-tile-copy">
                {x.value && <small>{x.value}</small>}
                <b>{hl(x.title)}</b>
                {x.text && <span>{x.text}</span>}
                <i className="sx-tile-cta">
                  {more} <Icon name="arrow" />
                </i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── caractéristiques ───────── */
export function SpecsSection({ b }: { b: SxBlock }) {
  const items = b.items || [];
  if (!items.length) return null;
  return (
    <section className="sx-section sx-specs">
      <div className="sx-wrap">
        <div className="sx-specs-box">
          {b.title && (
            <div className="sx-specs-label">
              <b>{b.title}</b>
            </div>
          )}
          <dl className="sx-specs-list">
            {items.slice(0, 6).map((x, i) => (
              <div key={i}>
                <dt>{x.title}</dt>
                <dd>{x.value}</dd>
                {x.text && <small>{x.text}</small>}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ───────── bande de photos ───────── */
export function GallerySection({ b, ctx, art }: { b: SxBlock; ctx: SxCtx; art: Art }) {
  const own = (b.items || []).filter((x) => x.image);
  const tiles = own.length
    ? own.map((x) => ({ key: x.image!, label: x.title, href: ctx.shopUrl, node: art(0, x.title, x.image) }))
    : ctx.products.slice(0, 6).map((p, i) => ({
        key: p.id,
        label: p.name,
        href: productUrl(ctx.base, p),
        node: img(p) ? <img src={img(p)} alt={p.name} loading="lazy" /> : art(i),
      }));
  if (!tiles.length) return null;
  return (
    <section className="sx-section sx-gallery">
      <div className="sx-wrap">
        <div className="sx-gallery-box">
          <div className="sx-gallery-head">
            <h2>{hl(b.title)}</h2>
            {b.text && <p>{b.text}</p>}
          </div>
          <div className="sx-gallery-strip">
            {tiles.map((x) => (
              <a key={x.key} href={x.href} className="sx-gallery-tile">
                {x.node}
                <span>{x.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── catégories ───────── */
const CAT_ICONS = [
  // icônes au trait génériques (une par catégorie, dans l'ordre)
  <path key="a" d="M4 8h16v12H4zM8 8V6a4 4 0 0 1 8 0v2" />,
  <path key="b" d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />,
  <path key="c" d="M6 3h12l2 6H4zM5 9v12h14V9M10 14h4" />,
  <path key="d" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 3" />,
  <path key="e" d="M7 4h10v16H7zM11 17h2" />,
  <path key="f" d="M3 12a9 9 0 0 1 18 0v6H3zM8 12v6M16 12v6" />,
];
const catIcon = (i: number) => (
  <svg
    className="sx-cat-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {CAT_ICONS[i % CAT_ICONS.length]}
  </svg>
);

export const CATEGORIES_V3 = new Set<SxCategories>([
  "dark-tiles",
  "icon-grid",
  "color-blocks",
  "gray-grid",
  "circle-icons",
  "big-cards",
  "side-cards",
  "chip-cards",
  "lavender",
  "collection",
  "square-tiles",
  "split-tiles",
]);

export function CategoriesV3({
  variant,
  b,
  categories,
  catUrl,
  shopUrl,
  art,
  head,
  lang,
}: {
  variant: SxCategories;
  b: SxBlock;
  categories: Cat[];
  catUrl: (n: string) => string;
  shopUrl: string;
  art: Art;
  head: React.ReactNode;
  lang: string;
}) {
  if (!categories.length) return null;
  const shop = lang === "ar" ? "تسوق" : "Acheter";
  const count = (n: number) => (lang === "ar" ? n + " منتج" : n + (n > 1 ? " produits" : " produit"));
  const media = (x: Cat, i: number) =>
    x.image ? <img src={x.image} alt={x.name} loading="lazy" /> : art(i + 1, x.name);
  const limit: Partial<Record<SxCategories, number>> = {
    "split-tiles": 4,
    "big-cards": 4,
    "color-blocks": 5,
    "gray-grid": 6,
    "side-cards": 4,
    lavender: 4,
    collection: 3,
    "dark-tiles": 6,
    "chip-cards": 5,
  };
  const list = categories.slice(0, limit[variant] || 8);
  const card = (x: Cat, i: number) => {
    switch (variant) {
      case "icon-grid":
      case "circle-icons":
        return (
          <>
            <span className="sx-cv-icon">{catIcon(i)}</span>
            <b>{x.name}</b>
          </>
        );
      case "color-blocks":
        return (
          <>
            <span className="sx-cv-copy">
              <small>{x.count > 0 ? count(x.count) : shop}</small>
              <b>{x.name}</b>
              <i className="sx-cv-ghost" aria-hidden="true">
                {x.name}
              </i>
              <em className="sx-cv-btn">{shop}</em>
            </span>
            <span className="sx-cv-media">{media(x, i)}</span>
          </>
        );
      case "gray-grid":
        return (
          <>
            <b>{x.name}</b>
            <span className="sx-cv-media">{media(x, i)}</span>
          </>
        );
      case "big-cards":
      case "split-tiles":
        return (
          <>
            <span className="sx-cv-copy">
              <b>{x.name}</b>
              {x.count > 0 && <small>{count(x.count)}</small>}
              <em className="sx-cv-link">
                {lang === "ar" ? "اكتشف" : "Explorer"} <Icon name="arrow" />
              </em>
            </span>
            <span className="sx-cv-media">{media(x, i)}</span>
          </>
        );
      case "chip-cards":
        return (
          <>
            <span className="sx-cv-media">{media(x, i)}</span>
            <span className="sx-cv-copy">
              <b>{x.name}</b>
              {x.count > 0 && <small>{count(x.count)}</small>}
            </span>
            <i className="sx-cv-arrow" aria-hidden="true">
              <Icon name="arrow" />
            </i>
          </>
        );
      case "lavender":
        return (
          <>
            <i className="sx-cv-arrow" aria-hidden="true">
              <Icon name="arrow" />
            </i>
            <span className="sx-cv-media">{media(x, i)}</span>
            <b>{x.name}</b>
          </>
        );
      case "collection":
        return (
          <>
            <span className="sx-cv-media">{media(x, i)}</span>
            <b>{x.name}</b>
            <i className="sx-cv-count">{x.count}</i>
          </>
        );
      default:
        // dark-tiles, side-cards, square-tiles
        return (
          <>
            <span className="sx-cv-media">{media(x, i)}</span>
            <b>{x.name}</b>
            <small className="sx-cv-shop">
              {shop} <Icon name="arrow" />
            </small>
          </>
        );
    }
  };
  const side = variant === "side-cards" || variant === "icon-grid";
  return (
    <section className={"sx-section sx-cv sx-cv-" + variant}>
      <div className={"sx-wrap" + (side ? " sx-cv-side" : "")}>
        {side ? (
          <div className="sx-cv-intro">
            {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
            <h2>{hl(b.title)}</h2>
            {b.text && <p>{b.text}</p>}
            <a className="sx-link" href={shopUrl}>
              {lang === "ar" ? "كل التصنيفات" : "Toutes les catégories"} <Icon name="arrow" />
            </a>
          </div>
        ) : (
          (b.title || b.text) && head
        )}
        <div className="sx-cv-list">
          {list.map((x, i) => (
            <a key={x.name} href={catUrl(x.name)} className={"sx-cv-card sx-cv-" + i}>
              {card(x, i)}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
