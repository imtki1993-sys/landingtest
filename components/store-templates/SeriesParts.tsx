"use client";
// Blocs communs des templates de boutique : carte produit, FAQ, pied de page.
// Chaque bloc a plusieurs mises en page ; le template choisit la sienne (t.layout).
import React from "react";
import type { StoreTemplate } from "../../lib/store-templates";

/* ───────── contexte partagé ───────── */
export interface SxCategory {
  name: string;
  image: string;
  count: number;
}
export interface SxCtx {
  t: StoreTemplate;
  store: any;
  cfg: any;
  lang: "fr" | "ar";
  rtl: boolean;
  base: string;
  txt: Record<string, string>;
  shopUrl: string;
  catUrl: (name: string) => string;
  categories: SxCategory[];
  products: any[];
  add: (p: any) => void;
  /** texte de présentation de la boutique (hero) */
  about: string;
  /** garanties de la boutique (livraison, paiement…) */
  trust: { title: string; text?: string }[];
}
/** Texte selon la langue de la boutique. */
export const tr = (ctx: SxCtx, fr: string, ar: string) => (ctx.lang === "ar" ? ar : fr);

/* ───────── utilitaires ───────── */
export const img = (p: any): string => (Array.isArray(p?.image_urls) ? p.image_urls.find(Boolean) || "" : "");
export const productUrl = (base: string, p: any) => base + "/product/" + encodeURIComponent(p.slug || p.id);
export const hasOptions = (p: any) =>
  Array.isArray(p?.specifications?.options) &&
  p.specifications.options.length > 0 &&
  Array.isArray(p?.specifications?.variants) &&
  p.specifications.variants.length > 0;
export const price = (v: any) => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n)
    ? ""
    : n.toLocaleString("fr-MA", { maximumFractionDigits: 2 }) + " DH";
};
export const discount = (p: any) => {
  const pr = Number(p?.price),
    cmp = Number(p?.compare_at_price);
  return cmp > pr && pr > 0 ? Math.round((1 - pr / cmp) * 100) : 0;
};
export function readableOn(hex: string): string | undefined {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return undefined;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111111" : "#ffffff";
}

export function Icon({ name }: { name: string }) {
  const p: Record<string, React.ReactNode> = {
    truck: (
      <>
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    cash: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    swap: (
      <>
        <path d="M4 8h13l-3-3" />
        <path d="M20 16H7l3 3" />
      </>
    ),
    chat: <path d="M4 5h16v11H8l-4 4z" />,
    cart: (
      <>
        <path d="M3 4h2l2.4 11h10.2L20 8H6.2" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4.5-4.5" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    back: <path d="M19 12H5m5-5-5 5 5 5" />,
    check: <path d="m5 12 4 4 10-10" />,
    plus: <path d="M12 5v14M5 12h14" />,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  };
  return (
    <svg className="sx-icon" viewBox="0 0 24 24" aria-hidden="true">
      {p[name] || p.check}
    </svg>
  );
}
export const TRUST_ICONS = ["truck", "cash", "swap", "chat"];

/* ───────── carte produit ───────── */
export function ProductCard({ ctx, p, index = 0 }: { ctx: SxCtx; p: any; index?: number }) {
  const layout = ctx.t.layout.card;
  const url = productUrl(ctx.base, p);
  const off = discount(p);
  const options = hasOptions(p);
  const media = img(p) ? (
    <img src={img(p)} alt={p.name} loading="lazy" />
  ) : (
    <span className="sx-art" aria-hidden="true" />
  );
  const choose = tr(ctx, "Choisir", "اختار");
  // bouton d'ajout : libellé complet, ou icône seule pour les cartes compactes
  const addBtn = (variant: "full" | "icon" | "text") =>
    options ? (
      <a
        className={"sx-add sx-add-" + variant}
        href={url}
        aria-label={variant === "icon" ? choose + " " + p.name : undefined}
      >
        {variant === "icon" ? <Icon name="arrow" /> : choose}
      </a>
    ) : (
      <button
        type="button"
        className={"sx-add sx-add-" + variant}
        onClick={() => ctx.add(p)}
        aria-label={variant === "icon" ? ctx.txt.add + " " + p.name : undefined}
      >
        {variant === "icon" ? (
          <Icon name="plus" />
        ) : (
          <>
            <Icon name="cart" /> {ctx.txt.add}
          </>
        )}
      </button>
    );
  const priceRow = (
    <div className="sx-price">
      <b>{price(p.price)}</b>
      {off > 0 && <s>{price(p.compare_at_price)}</s>}
    </div>
  );
  const cat = p.specifications?.category ? <small className="sx-card-cat">{p.specifications.category}</small> : null;
  const name = (
    <a className="sx-card-name" href={url}>
      {p.name}
    </a>
  );

  switch (layout) {
    case "overlay":
      return (
        <article className="sx-card sx-cl-overlay">
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {cat}
            {name}
            {priceRow}
          </div>
          {addBtn("icon")}
        </article>
      );
    case "minimal":
      return (
        <article className="sx-card sx-cl-minimal">
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          {addBtn("icon")}
          <div className="sx-card-body">
            <div className="sx-card-line">
              {name}
              {priceRow}
            </div>
            {cat}
          </div>
        </article>
      );
    case "editorial":
      return (
        <article className="sx-card sx-cl-editorial">
          <span className="sx-card-index">{String(index + 1).padStart(2, "0")}</span>
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {cat}
            {name}
            {priceRow}
            {addBtn("text")}
          </div>
        </article>
      );
    case "centered":
      return (
        <article className="sx-card sx-cl-centered">
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {name}
            {priceRow}
            {addBtn("full")}
          </div>
        </article>
      );
    case "tag":
      return (
        <article className="sx-card sx-cl-tag">
          <a className="sx-card-media" href={url}>
            {media}
            <em className="sx-price-tag">{price(p.price)}</em>
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {cat}
            {name}
            {off > 0 && (
              <div className="sx-price">
                <s>{price(p.compare_at_price)}</s>
              </div>
            )}
            {addBtn("text")}
          </div>
        </article>
      );
    case "framed":
      return (
        <article className="sx-card sx-cl-framed">
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {cat}
            {name}
            <div className="sx-card-line">
              {priceRow}
              {addBtn("icon")}
            </div>
          </div>
        </article>
      );
    default:
      return (
        <article className="sx-card sx-cl-classic">
          <a className="sx-card-media" href={url}>
            {media}
            {off > 0 && <em className="sx-off">-{off}%</em>}
          </a>
          <div className="sx-card-body">
            {cat}
            {name}
            {priceRow}
            {addBtn("full")}
          </div>
        </article>
      );
  }
}

/* ───────── FAQ ───────── */
export function FaqBlock({
  ctx,
  eyebrow,
  title,
  text,
  items,
  as = "h2",
}: {
  ctx: SxCtx;
  eyebrow?: string;
  title: string;
  text?: string;
  items: { q: string; a: string }[];
  as?: "h1" | "h2";
}) {
  const layout = ctx.t.layout.faq;
  const H = as;
  const head = (
    <div className="sx-faq-head">
      {eyebrow && <small className="sx-eyebrow">{eyebrow}</small>}
      <H>{title}</H>
      {text && <p>{text}</p>}
      {layout !== "cards" && layout !== "band" && (
        <a className="sx-link" href={ctx.base + "/contact"}>
          {tr(ctx, "Une autre question ? Contactez-nous", "عندك سؤال آخر؟ تواصل معنا")} <Icon name="arrow" />
        </a>
      )}
    </div>
  );
  if (layout === "cards")
    return (
      <section className="sx-section sx-faq sx-faq-cards">
        <div className="sx-wrap">
          {head}
          <div className="sx-faq-list">
            {items.map((x, i) => (
              <article key={i}>
                <b>{x.q}</b>
                <p>{x.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  if (layout === "numbered")
    return (
      <section className="sx-section sx-faq sx-faq-numbered">
        <div className="sx-wrap sx-faq-grid">
          {head}
          <ol className="sx-faq-list">
            {items.map((x, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{x.q}</b>
                  <p>{x.a}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  const list = (
    <div className="sx-faq-list">
      {items.map((x, i) => (
        <details key={i} open={i === 0 && layout === "center"}>
          <summary>{x.q}</summary>
          <p>{x.a}</p>
        </details>
      ))}
    </div>
  );
  return (
    <section className={"sx-section sx-faq sx-faq-" + layout}>
      <div className={"sx-wrap" + (layout === "split" ? " sx-faq-grid" : "")}>
        {head}
        {list}
      </div>
    </section>
  );
}

/* ───────── pied de page ───────── */
export function SeriesFooter({ ctx }: { ctx: SxCtx }) {
  const { store, cfg, base, txt, shopUrl, categories, rtl } = ctx;
  const layout = ctx.t.layout.footer;
  const about = cfg.footerContent?.about || ctx.about;
  const year = new Date().getFullYear();
  const brand = <b className="sx-footer-brand">{cfg.logo ? <img src={cfg.logo} alt={store.name} /> : store.name}</b>;
  const shopLinks = (
    <nav>
      <b>{txt.shop}</b>
      <a href={shopUrl}>{tr(ctx, "Tous les produits", "جميع المنتجات")}</a>
      {categories.slice(0, 4).map((x) => (
        <a key={x.name} href={ctx.catUrl(x.name)}>
          {x.name}
        </a>
      ))}
    </nav>
  );
  const helpLinks = (
    <nav>
      <b>{tr(ctx, "Aide", "مساعدة")}</b>
      <a href={base + "/delivery"}>{txt.delivery}</a>
      <a href={base + "/faq"}>{txt.faq}</a>
      <a href={base + "/contact"}>{txt.contact}</a>
    </nav>
  );
  const legalLinks = (
    <nav>
      <b>{tr(ctx, "Informations", "معلومات")}</b>
      <a href={base + "/privacy"}>{rtl ? "الخصوصية" : "Confidentialité"}</a>
      <a href={base + "/terms"}>{rtl ? "الشروط" : "Conditions"}</a>
      <a href={base + "/returns"}>{rtl ? "الإرجاع" : "Retours"}</a>
    </nav>
  );
  const inline = [
    [shopUrl, txt.shop],
    [base + "/delivery", txt.delivery],
    [base + "/faq", txt.faq],
    [base + "/contact", txt.contact],
    [base + "/privacy", rtl ? "الخصوصية" : "Confidentialité"],
    [base + "/terms", rtl ? "الشروط" : "Conditions"],
    [base + "/returns", rtl ? "الإرجاع" : "Retours"],
  ];
  const copyright = (
    <small className="sx-copy">
      © {year} {store.name} · {txt.cod}
    </small>
  );
  const payBadges = (
    <div className="sx-pay">
      <span>
        <Icon name="cash" /> {txt.cod}
      </span>
      <span>
        <Icon name="truck" /> {tr(ctx, "Livraison au Maroc", "التوصيل فالمغرب")}
      </span>
    </div>
  );

  if (layout === "wordmark")
    return (
      <footer className="sx-footer sx-footer-wordmark">
        <div className="sx-wrap">
          <div className="sx-footer-row">
            <p>{about}</p>
            <nav className="sx-footer-inline">
              {inline.map(([h, l]) => (
                <a key={h} href={h}>
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <span
            className="sx-footer-giant"
            style={{ ["--sx-wm" as string]: Math.min(18, 140 / Math.max(1, String(store.name).length)) + "vw" }}
          >
            {store.name}
          </span>
          <div className="sx-footer-row sx-footer-bottom">
            {copyright}
            {payBadges}
          </div>
        </div>
      </footer>
    );
  if (layout === "centered")
    return (
      <footer className="sx-footer sx-footer-centered">
        <div className="sx-wrap">
          {brand}
          <p>{about}</p>
          <nav className="sx-footer-inline">
            {inline.map(([h, l]) => (
              <a key={h} href={h}>
                {l}
              </a>
            ))}
          </nav>
          {payBadges}
          {copyright}
        </div>
      </footer>
    );
  if (layout === "minimal")
    return (
      <footer className="sx-footer sx-footer-minimal">
        <div className="sx-wrap sx-footer-row">
          {brand}
          <nav className="sx-footer-inline">
            {inline.map(([h, l]) => (
              <a key={h} href={h}>
                {l}
              </a>
            ))}
          </nav>
          {copyright}
        </div>
      </footer>
    );
  if (layout === "cta")
    return (
      <footer className="sx-footer sx-footer-cta">
        <div className="sx-wrap">
          <div className="sx-footer-top">
            <h2>{tr(ctx, "Commandez aujourd'hui, payez à la livraison.", "طلب اليوم، وخلص ملي توصلك.")}</h2>
            <div className="sx-actions">
              <a className="sx-btn" href={shopUrl}>
                {txt.shop} <Icon name="arrow" />
              </a>
              <a className="sx-btn sx-btn-ghost" href={base + "/contact"}>
                {txt.contact}
              </a>
            </div>
          </div>
          <div className="sx-footer-grid">
            <div>
              {brand}
              <p>{about}</p>
            </div>
            {shopLinks}
            {helpLinks}
            {legalLinks}
          </div>
          <div className="sx-footer-row sx-footer-bottom">
            {copyright}
            {payBadges}
          </div>
        </div>
      </footer>
    );
  if (layout === "split")
    return (
      <footer className="sx-footer sx-footer-split">
        <div className="sx-footer-panel">
          {brand}
          <p>{about}</p>
          {payBadges}
        </div>
        <div className="sx-footer-links">
          {shopLinks}
          {helpLinks}
          {legalLinks}
          {copyright}
        </div>
      </footer>
    );
  return (
    <footer className="sx-footer sx-footer-columns">
      <div className="sx-wrap sx-footer-grid">
        <div>
          {brand}
          <p>{about}</p>
          {copyright}
        </div>
        {shopLinks}
        {helpLinks}
        {legalLinks}
      </div>
    </footer>
  );
}
