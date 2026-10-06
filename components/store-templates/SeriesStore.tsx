"use client";
// Rendu d'une boutique avec un template de série (Série 1, 2…).
// Storefront garde la logique (panier, variantes, commande, pages) ; ce composant
// ne fait que la mise en page : header, accueil par sections, pied de page.
import React, { useEffect, useMemo, useState } from "react";
import {
  copyLang,
  fillTokens,
  resolveSections,
  sectionContent,
  templateCopy,
  type StoreTemplate,
  type SxBlock,
  type SxSectionType,
} from "../../lib/store-templates";
import "./series-store.css";

type Txt = Record<string, string>;
export interface SeriesStoreProps {
  t: StoreTemplate;
  store: any;
  cfg: any;
  products: any[];
  page: string;
  rtl: boolean;
  base: string;
  txt: Txt;
  /** contenu des pages autres que l'accueil (produit, boutique, livraison…) */
  body?: React.ReactNode;
  /** tiroir du panier (rendu par Storefront) */
  drawer?: React.ReactNode;
  cartCount: number;
  openCart: () => void;
  add: (p: any) => void;
}

/* ───────── utilitaires ───────── */
const img = (p: any): string => (Array.isArray(p?.image_urls) ? p.image_urls.find(Boolean) || "" : "");
const productUrl = (base: string, p: any) => base + "/product/" + encodeURIComponent(p.slug || p.id);
const hasOptions = (p: any) =>
  Array.isArray(p?.specifications?.options) &&
  p.specifications.options.length > 0 &&
  Array.isArray(p?.specifications?.variants) &&
  p.specifications.variants.length > 0;
const price = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("fr-MA", { maximumFractionDigits: 2 }) + " DH" : "";
};
function readableOn(hex: string): string | undefined {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return undefined;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111111" : "#ffffff";
}
const FONT_WEIGHTS = "wght@400;500;600;700;800";
function fontsHref(families: string[]) {
  const list = Array.from(new Set(families.filter(Boolean)));
  return (
    "https://fonts.googleapis.com/css2?" +
    list.map((f) => "family=" + f.trim().replace(/ /g, "+") + ":" + FONT_WEIGHTS).join("&") +
    "&display=swap"
  );
}

function Icon({ name }: { name: string }) {
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
    check: <path d="m5 12 4 4 10-10" />,
    star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  };
  return (
    <svg className="sx-icon" viewBox="0 0 24 24" aria-hidden="true">
      {p[name] || p.check}
    </svg>
  );
}
const TRUST_ICONS = ["truck", "cash", "swap", "chat"];

export default function SeriesStore(props: SeriesStoreProps) {
  const { t, store, cfg, products, page, rtl, base, txt, body, drawer, cartCount, openCart, add } = props;
  const [menu, setMenu] = useState(false);
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState("featured");
  const lang = copyLang(store.locale);
  const c = templateCopy(t, store.locale);
  // Réglages propres à ce template (sinon : textes et couleurs du template)
  const own = cfg.storeTemplateId === t.id;
  const pick = (v: unknown, fallback: string) => (own && typeof v === "string" && v.trim() ? v : fallback);
  const sx = own ? cfg.sx : undefined;
  const { order, hidden } = resolveSections(t, sx);
  const block = (k: SxSectionType): SxBlock => sectionContent(t, store.locale, k, sx);

  const hero = {
    eyebrow: pick(cfg.heroEyebrow, c.eyebrow),
    title: pick(cfg.heroTitle, c.title),
    text: pick(cfg.heroText, c.text),
    button: pick(cfg.heroButton, c.button),
    secondary: own ? cfg.heroSecondaryButton || "" : c.secondary || "",
    highlight: c.highlight || "",
  };
  const primary = pick(cfg.primary, t.theme.primary);
  const accent = pick(cfg.accent, t.theme.accent);
  const headingFont = rtl ? "Cairo" : pick(cfg.headingFont, t.theme.headingFont);
  const bodyFont = rtl ? "Cairo" : pick(cfg.bodyFont, t.theme.bodyFont);

  // Polices du template, chargées une fois par combinaison
  const href = fontsHref([headingFont, bodyFont, t.theme.scriptFont || ""]);
  useEffect(() => {
    const id = "sx-fonts-" + href.length + "-" + headingFont.replace(/\W/g, "") + bodyFont.replace(/\W/g, "");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }, [href, headingFont, bodyFont]);

  const heroImages: string[] = (
    Array.isArray(cfg.heroImages) && cfg.heroImages.length ? cfg.heroImages : cfg.heroImage ? [cfg.heroImage] : []
  ).filter((x: any) => typeof x === "string" && x);
  const productImages = useMemo(() => Array.from(new Set(products.map(img).filter(Boolean))) as string[], [products]);
  const pics = Array.from(new Set([...heroImages, ...productImages]));
  const pic = (i: number) => (pics.length ? pics[i % pics.length] : "");

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; image: string; count: number }>();
    for (const p of products) {
      const name = String(p?.specifications?.category || "").trim();
      if (!name) continue;
      const cur = map.get(name) || { name, image: "", count: 0 };
      cur.count++;
      cur.image = cur.image || img(p);
      map.set(name, cur);
    }
    if (!map.size && Array.isArray(cfg.categories))
      for (const x of cfg.categories)
        if (typeof x === "string" && x.trim()) map.set(x, { name: x, image: "", count: 0 });
    return Array.from(map.values());
  }, [products, cfg.categories]);
  const ctx = { products: products.length, categories: categories.length };
  const shopUrl = base + "/shop";
  const catUrl = (name: string) => shopUrl + "?category=" + encodeURIComponent(name);

  /* ───────── éléments communs ───────── */
  const art = (i = 0, label?: string) =>
    pic(i) ? (
      <img className="sx-img" src={pic(i)} alt={label || store.name} loading={i ? "lazy" : "eager"} />
    ) : (
      <div className="sx-art" aria-hidden="true">
        <span>
          {String(store.name || "S")
            .trim()
            .charAt(0)}
        </span>
      </div>
    );
  const title = (Tag: any = "h1", className = "") => {
    const h = hero.highlight;
    const i = h ? hero.title.toLowerCase().indexOf(h.toLowerCase()) : -1;
    return (
      <Tag className={"sx-hero-title " + className}>
        {i >= 0 ? (
          <>
            {hero.title.slice(0, i)}
            <em className="sx-hl">{hero.title.slice(i, i + h.length)}</em>
            {hero.title.slice(i + h.length)}
          </>
        ) : (
          hero.title
        )}
      </Tag>
    );
  };
  const script =
    hero.highlight && hero.title.toLowerCase().indexOf(hero.highlight.toLowerCase()) < 0 && t.theme.scriptFont;
  const actions = (light = false) => (
    <div className="sx-actions">
      <a className={"sx-btn" + (light ? " sx-btn-light" : "")} href={shopUrl}>
        {hero.button} <Icon name="arrow" />
      </a>
      {hero.secondary && (
        <a className="sx-btn sx-btn-ghost" href={base + "/delivery"}>
          {hero.secondary}
        </a>
      )}
    </div>
  );
  const eyebrow = () => (hero.eyebrow ? <small className="sx-eyebrow">{hero.eyebrow}</small> : null);
  const searchBar = (withSelect = false) => (
    <form className="sx-search" action={shopUrl} method="get" role="search">
      <Icon name="search" />
      {withSelect && categories.length > 0 && (
        <select name="category" aria-label={lang === "ar" ? "التصنيف" : "Catégorie"} defaultValue="">
          <option value="">{lang === "ar" ? "كل التصنيفات" : "Toutes catégories"}</option>
          {categories.map((x) => (
            <option key={x.name} value={x.name}>
              {x.name}
            </option>
          ))}
        </select>
      )}
      <input name="q" placeholder={txt.search} aria-label={txt.search} />
      <button type="submit">{hero.button}</button>
    </form>
  );
  const first = products[0];
  const statItems = block("stats").items || [];

  /* ───────── hero : une mise en page par template ───────── */
  function heroNode() {
    switch (t.hero) {
      case "editorial":
        return (
          <section className="sx-hero sx-hero-editorial">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
                <div className="sx-hero-stats">
                  {statItems.slice(0, 2).map((s, i) => (
                    <span key={i}>
                      <b>{fillTokens(s.value, ctx)}</b>
                      <small>{s.title}</small>
                    </span>
                  ))}
                </div>
              </div>
              <div className="sx-hero-media">
                {art()}
                <div className="sx-tags">
                  {categories.slice(0, 3).map((x) => (
                    <a key={x.name} href={catUrl(x.name)}>
                      {x.name}
                    </a>
                  ))}
                </div>
                <span className="sx-vertical">{store.name}</span>
              </div>
            </div>
          </section>
        );
      case "pop":
        return (
          <section className="sx-hero sx-hero-pop">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
              <div className="sx-hero-media">
                <div className="sx-disc">{art()}</div>
                <div className="sx-float-card">
                  <b>{lang === "ar" ? "مزايانا" : "Nos avantages"}</b>
                  {(block("trust").items || []).slice(0, 3).map((x, i) => (
                    <span key={i}>
                      <Icon name="check" /> {x.title}
                    </span>
                  ))}
                </div>
                <i className="sx-dot sx-dot-a" />
                <i className="sx-dot sx-dot-b" />
                <i className="sx-dot sx-dot-c" />
              </div>
            </div>
          </section>
        );
      case "giant":
        return (
          <section className="sx-hero sx-hero-giant">
            <div className="sx-giant-panel">
              <span className="sx-giant-word" aria-hidden="true">
                {hero.title}
              </span>
              <div className="sx-giant-media">{art()}</div>
              <div className="sx-giant-bottom">
                <div>
                  {eyebrow()}
                  <h1 className="sx-hero-title sx-visually-small">{hero.title}</h1>
                  <p className="sx-hero-text">{hero.text}</p>
                </div>
                <div className="sx-giant-side">
                  <span className="sx-chip">
                    <b>{products.length}</b> {lang === "ar" ? "منتج" : "produits"}
                  </span>
                  {actions(true)}
                </div>
              </div>
            </div>
          </section>
        );
      case "split-card":
        return (
          <section className="sx-hero sx-hero-split-card">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                <div className="sx-tags sx-tags-inline">
                  {(categories.length ? categories.map((x) => x.name) : [hero.eyebrow]).slice(0, 3).map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
              <div className="sx-hero-media">
                {art()}
                {first && (
                  <a className="sx-float-card" href={productUrl(base, first)}>
                    <small>{hero.eyebrow}</small>
                    <b>{first.name}</b>
                    <span>{price(first.price)}</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      case "mockup":
        return (
          <section className="sx-hero sx-hero-mockup">
            <div className="sx-wrap">
              <div className="sx-mockup-stage">
                <div className="sx-chips-left">
                  {(block("trust").items || []).slice(0, 2).map((x, i) => (
                    <span key={i} className="sx-float-chip">
                      <Icon name={TRUST_ICONS[i]} /> {x.title}
                    </span>
                  ))}
                </div>
                <div className="sx-phone">
                  <div className="sx-phone-screen">
                    {art()}
                    {first && (
                      <div className="sx-phone-price">
                        <small>{first.name}</small>
                        <b>{price(first.price)}</b>
                      </div>
                    )}
                  </div>
                </div>
                <div className="sx-chips-right">
                  {(block("trust").items || []).slice(2, 4).map((x, i) => (
                    <span key={i} className="sx-float-chip">
                      <Icon name={TRUST_ICONS[i + 2]} /> {x.title}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sx-hero-copy sx-center">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
            </div>
          </section>
        );
      case "photo-dark":
        return (
          <section className="sx-hero sx-hero-photo-dark">
            <div className="sx-hero-bg">{art()}</div>
            <div className="sx-wrap sx-hero-inner">
              {title()}
              <div className="sx-glass">
                {eyebrow()}
                <p className="sx-hero-text">{hero.text}</p>
                <a className="sx-link" href={shopUrl}>
                  {hero.button} <Icon name="arrow" />
                </a>
              </div>
              <div className="sx-hero-stats">
                {statItems.slice(0, 3).map((s, i) => (
                  <span key={i}>
                    <b>{fillTokens(s.value, ctx)}</b>
                    <small>{s.title}</small>
                  </span>
                ))}
              </div>
            </div>
          </section>
        );
      case "color-block":
        return (
          <section className="sx-hero sx-hero-color-block">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
              <div className="sx-hero-media">{art()}</div>
            </div>
          </section>
        );
      case "market":
        return (
          <section className="sx-hero sx-hero-market">
            <div className="sx-wrap">
              {categories.length > 0 && (
                <nav className="sx-catbar" aria-label={lang === "ar" ? "التصنيفات" : "Catégories"}>
                  {categories.slice(0, 8).map((x) => (
                    <a key={x.name} href={catUrl(x.name)}>
                      {x.name} <span aria-hidden="true">›</span>
                    </a>
                  ))}
                </nav>
              )}
              <div className="sx-hero-grid">
                <p className="sx-hero-text">{hero.text}</p>
                <div>
                  {title()}
                  {actions()}
                </div>
              </div>
            </div>
          </section>
        );
      case "search":
        return (
          <section className="sx-hero sx-hero-search">
            <div className="sx-search-frame">
              <div className="sx-hero-bg">{art()}</div>
              <div className="sx-hero-copy sx-center">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {searchBar()}
              </div>
            </div>
          </section>
        );
      case "rounded-dark":
        return (
          <section className="sx-hero sx-hero-rounded-dark">
            <div className="sx-rd-card">
              <div className="sx-rd-media">{art()}</div>
              <div className="sx-hero-copy">
                <span className="sx-badge">
                  <Icon name="star" />
                </span>
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {searchBar(true)}
              </div>
              <div className="sx-rd-cards">
                <span className="sx-rd-label">{hero.eyebrow}</span>
                {(block("trust").items || []).slice(0, 2).map((x, i) => (
                  <div key={i} className="sx-rd-service">
                    <i>
                      <Icon name={TRUST_ICONS[i]} />
                    </i>
                    <b>{x.title}</b>
                    <small>{x.text}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      case "serif-photo":
        return (
          <section className="sx-hero sx-hero-serif-photo">
            <div className="sx-serif-frame">
              <div className="sx-hero-bg">{art()}</div>
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <div className="sx-pager" aria-hidden="true">
                  <b>01</b>
                  <i />
                  <span>02</span>
                  <span>03</span>
                </div>
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
            </div>
          </section>
        );
      case "gradient-promo":
        return (
          <section className="sx-hero sx-hero-gradient-promo">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions(true)}
              </div>
              <div className="sx-hero-media">
                {art()}
                {script && <span className="sx-script">{hero.highlight}</span>}
              </div>
            </div>
          </section>
        );
      case "wordmark":
        return (
          <section className="sx-hero sx-hero-wordmark">
            <div className="sx-hero-bg">{art()}</div>
            <div className="sx-wrap sx-hero-inner">
              <div className="sx-hero-copy">
                {script && <span className="sx-script">{hero.highlight}</span>}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
            </div>
          </section>
        );
      case "architect":
        return (
          <section className="sx-hero sx-hero-architect">
            <div className="sx-wrap sx-hero-grid">
              <div className="sx-hero-copy">
                {eyebrow()}
                {title()}
                <p className="sx-hero-text">{hero.text}</p>
                {actions()}
              </div>
              <div className="sx-hero-media">
                {art()}
                {first && (
                  <a className="sx-float-card" href={productUrl(base, first)}>
                    <b>{first.name}</b>
                    <small>{first.short_description || hero.eyebrow}</small>
                    <span>{price(first.price)}</span>
                  </a>
                )}
                <i className="sx-orb" aria-hidden="true" />
              </div>
            </div>
          </section>
        );
      case "food":
        return (
          <section className="sx-hero sx-hero-food">
            <div className="sx-wrap">
              <div className="sx-hero-grid">
                <div className="sx-hero-copy">
                  {eyebrow()}
                  {title()}
                  <p className="sx-hero-text">{hero.text}</p>
                  {actions()}
                </div>
                <div className="sx-hero-media">{art()}</div>
              </div>
              {products.length > 0 && (
                <div className="sx-food-cards">
                  {products.slice(0, 3).map((p, i) => (
                    <a key={p.id} href={productUrl(base, p)} className={"sx-food-card sx-food-card-" + i}>
                      {img(p) ? <img src={img(p)} alt={p.name} loading="lazy" /> : <span className="sx-art" />}
                      <span>
                        <b>{p.name}</b>
                        <small>{price(p.price)}</small>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
    }
    return null;
  }

  /* ───────── cartes produit ───────── */
  const card = (p: any) => {
    const pr = Number(p.price),
      cmp = Number(p.compare_at_price);
    const off = cmp > pr && pr > 0 ? Math.round((1 - pr / cmp) * 100) : 0;
    return (
      <article className="sx-card" key={p.id}>
        <a className="sx-card-media" href={productUrl(base, p)}>
          {img(p) ? <img src={img(p)} alt={p.name} loading="lazy" /> : <span className="sx-art" aria-hidden="true" />}
          {off > 0 && <em className="sx-off">-{off}%</em>}
        </a>
        <div className="sx-card-body">
          {p.specifications?.category && <small className="sx-card-cat">{p.specifications.category}</small>}
          <a className="sx-card-name" href={productUrl(base, p)}>
            {p.name}
          </a>
          <div className="sx-price">
            <b>{price(p.price)}</b>
            {off > 0 && <s>{price(p.compare_at_price)}</s>}
          </div>
          {hasOptions(p) ? (
            <a className="sx-add" href={productUrl(base, p)}>
              {lang === "ar" ? "اختار" : "Choisir"}
            </a>
          ) : (
            <button type="button" className="sx-add" onClick={() => add(p)}>
              <Icon name="cart" /> {txt.add}
            </button>
          )}
        </div>
      </article>
    );
  };
  const head = (b: SxBlock, link = true, fallback = "") => (
    <div className="sx-head">
      <div>
        {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
        <h2>{b.title || fallback}</h2>
        {b.text && <p>{b.text}</p>}
      </div>
      {link && (
        <a className="sx-link" href={shopUrl}>
          {lang === "ar" ? "شوف الكل" : "Voir tout"} <Icon name="arrow" />
        </a>
      )}
    </div>
  );

  /* ───────── sections ───────── */
  function section(k: SxSectionType) {
    const b = block(k);
    switch (k) {
      case "hero":
        return heroNode();
      case "trust": {
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className={"sx-section sx-trust sx-trust-" + t.trust}>
            <div className="sx-wrap">
              {b.title && head(b, false)}
              <div className="sx-trust-list">
                {items.map((x, i) => (
                  <div key={i} className="sx-trust-item">
                    {t.trust === "numbered" ? (
                      <b className="sx-num">{String(i + 1).padStart(2, "0")}</b>
                    ) : (
                      <Icon name={TRUST_ICONS[i % 4]} />
                    )}
                    <span>
                      <b>{x.title}</b>
                      {x.text && <small>{x.text}</small>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "categories": {
        if (!categories.length) return null;
        return (
          <section className={"sx-section sx-cats sx-cats-" + t.categories}>
            <div className="sx-wrap">
              {head(b)}
              <div className="sx-cats-list">
                {categories.slice(0, t.categories === "tiles" ? 4 : 8).map((x, i) => (
                  <a key={x.name} href={catUrl(x.name)} className="sx-cat">
                    {t.categories !== "pills" && (
                      <span className="sx-cat-media">
                        {x.image ? <img src={x.image} alt={x.name} loading="lazy" /> : art(i + 1, x.name)}
                      </span>
                    )}
                    <b>{x.name}</b>
                    {x.count > 0 && t.categories !== "pills" && (
                      <small>
                        {x.count} {lang === "ar" ? "منتج" : x.count > 1 ? "produits" : "produit"}
                      </small>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "products": {
        if (cfg.showProducts === false || !products.length) return null;
        return (
          <section className="sx-section sx-products">
            <div className="sx-wrap">
              {head({
                ...b,
                title: pick(cfg.collectionTitle, c.collectionTitle),
                text: own ? cfg.collectionSubtitle || "" : c.collectionSubtitle || "",
              })}
              <div className={"sx-grid sx-card-" + t.card}>{products.slice(0, 8).map((p) => card(p))}</div>
            </div>
          </section>
        );
      }
      case "catalog":
        return catalog(b);
      case "promos": {
        if (t.promos === "banner")
          return (
            <section className="sx-section sx-promos sx-promos-banner">
              <div className="sx-wrap">
                <div className="sx-banner">
                  <div className="sx-banner-copy">
                    {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
                    <h2>{b.title || hero.title}</h2>
                    {b.text && <p>{b.text}</p>}
                    <a className="sx-btn" href={shopUrl}>
                      {b.button || hero.button} <Icon name="arrow" />
                    </a>
                  </div>
                  <div className="sx-banner-media">
                    {[1, 2, 3].map((i) => (
                      <span key={i}>{art(i)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className={"sx-section sx-promos sx-promos-" + t.promos}>
            <div className="sx-wrap sx-promo-list">
              {items.slice(0, 2).map((x, i) => {
                const color = /^#[0-9a-f]{6}$/i.test(x.value || "") ? x.value! : "";
                return (
                  <a
                    key={i}
                    href={shopUrl}
                    className={"sx-promo sx-promo-" + i}
                    style={color ? ({ background: color, color: readableOn(color) } as React.CSSProperties) : undefined}
                  >
                    <span className="sx-promo-copy">
                      {x.value && !color && <small className="sx-chip">{x.value}</small>}
                      <b>{x.title}</b>
                      {x.text && <small>{x.text}</small>}
                      <span className="sx-promo-cta">
                        {lang === "ar" ? "اكتشف" : "Découvrir"} <Icon name="arrow" />
                      </span>
                    </span>
                    <span className="sx-promo-media">{art(i + 2)}</span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      }
      case "showcase": {
        if (!b.title && !b.text) return null;
        return (
          <section className="sx-section sx-showcase">
            <div className="sx-wrap sx-showcase-grid">
              <div className="sx-showcase-media">
                {art(1)}
                {pics.length > 2 && <span className="sx-showcase-small">{art(2)}</span>}
              </div>
              <div className="sx-showcase-copy">
                {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
                <h2>{b.title}</h2>
                {b.text && <p>{b.text}</p>}
                {b.items && b.items.length > 0 && (
                  <ol className="sx-steps">
                    {b.items.map((x, i) => (
                      <li key={i}>
                        <b>{String(i + 1).padStart(2, "0")}</b>
                        <span>
                          <strong>{x.title}</strong>
                          {x.text && <small>{x.text}</small>}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {b.button && (
                  <a className="sx-btn" href={shopUrl}>
                    {b.button} <Icon name="arrow" />
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      }
      case "stats": {
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className="sx-section sx-stats">
            <div className="sx-wrap">
              {b.title && <h2 className="sx-stats-title">{b.title}</h2>}
              <div className="sx-stats-list">
                {items.map((x, i) => (
                  <div key={i}>
                    <b>{fillTokens(x.value, ctx)}</b>
                    <span>{x.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "wordmark":
        return (
          <section className="sx-section sx-wordmark">
            <div className="sx-wrap">
              {b.eyebrow && <span className="sx-script">{b.eyebrow}</span>}
              <span
                className="sx-wordmark-text"
                style={{ ["--sx-wm" as string]: Math.min(19, 150 / Math.max(1, String(store.name).length)) + "vw" }}
              >
                {store.name}
              </span>
            </div>
          </section>
        );
      case "testimonials": {
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className="sx-section sx-testimonials">
            <div className="sx-wrap">
              {head(b, false)}
              <div className="sx-quotes">
                {items.map((x, i) => (
                  <figure key={i}>
                    <span className="sx-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    <blockquote>{x.text}</blockquote>
                    <figcaption>{x.title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "newsletter":
        return (
          <section className="sx-section sx-cta">
            <div className="sx-wrap sx-cta-box">
              <div>
                <h2>{b.title}</h2>
                {b.text && <p>{b.text}</p>}
              </div>
              <a className="sx-btn sx-btn-light" href={base + "/contact"}>
                {b.button || txt.contact} <Icon name="arrow" />
              </a>
            </div>
          </section>
        );
      case "faq": {
        if (cfg.showFaq === false || !Array.isArray(cfg.faq) || !cfg.faq.length) return null;
        return (
          <section className="sx-section sx-faq">
            <div className="sx-wrap sx-faq-grid">
              {head(b, false)}
              <div>
                {cfg.faq.slice(0, 6).map((x: any, i: number) => (
                  <details key={i}>
                    <summary>{x.q}</summary>
                    <p>{x.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        );
      }
    }
    return null;
  }

  function catalog(b: SxBlock) {
    const list = products
      .filter((p) => !cat || p?.specifications?.category === cat)
      .slice()
      .sort((a, z) =>
        sort === "price-asc"
          ? Number(a.price) - Number(z.price)
          : sort === "price-desc"
            ? Number(z.price) - Number(a.price)
            : 0,
      );
    if (!products.length) return null;
    return (
      <section className="sx-section sx-catalog">
        <div className="sx-wrap sx-catalog-grid">
          <aside>
            <b>{lang === "ar" ? "التصنيف" : "Catégorie"}</b>
            <button type="button" className={!cat ? "active" : ""} onClick={() => setCat("")}>
              {lang === "ar" ? "كل المنتجات" : "Tous les produits"} <small>{products.length}</small>
            </button>
            {categories.map((x) => (
              <button
                key={x.name}
                type="button"
                className={cat === x.name ? "active" : ""}
                onClick={() => setCat(x.name)}
              >
                {x.name} <small>{x.count}</small>
              </button>
            ))}
          </aside>
          <div>
            <div className="sx-catalog-bar">
              <h2>{b.title || pick(cfg.collectionTitle, c.collectionTitle)}</h2>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label={lang === "ar" ? "الترتيب" : "Trier"}
              >
                <option value="featured">{lang === "ar" ? "المميزة" : "Sélection"}</option>
                <option value="price-asc">{lang === "ar" ? "الثمن: من الأقل" : "Prix croissant"}</option>
                <option value="price-desc">{lang === "ar" ? "الثمن: من الأعلى" : "Prix décroissant"}</option>
              </select>
            </div>
            <div className={"sx-grid sx-grid-3 sx-card-" + t.card}>{list.slice(0, 12).map((p) => card(p))}</div>
          </div>
        </div>
      </section>
    );
  }

  /* ───────── page ───────── */
  const th = t.theme;
  const style: Record<string, string> = {
    "--sx-bg": th.bg,
    "--sx-surface": th.surface,
    "--sx-text": th.text,
    "--sx-muted": th.muted,
    "--sx-border": th.border,
    "--sx-primary": primary,
    "--sx-on-primary": readableOn(primary) || th.onPrimary,
    "--sx-accent": accent,
    "--sx-on-accent": readableOn(accent) || th.onAccent,
    "--sx-dark": th.dark,
    "--sx-on-dark": th.onDark,
    "--sx-hero-bg": th.heroBg,
    "--sx-hero-text": th.heroText,
    "--sx-radius": th.radius + "px",
    "--sx-hfont": `"${headingFont}", "Cairo", system-ui, sans-serif`,
    "--sx-bfont": `"${bodyFont}", "Cairo", system-ui, sans-serif`,
    "--sx-script": `"${th.scriptFont || headingFont}", cursive`,
    "--sx-hw": String(rtl ? Math.max(700, th.headingWeight) : th.headingWeight),
    "--sx-hcase": rtl ? "none" : th.headingCase || "none",
    "--sx-htrack": rtl ? "0" : th.headingTracking || "-0.01em",
    // pages internes (produit, boutique, livraison…) rendues par Storefront
    "--ps-primary": primary,
    "--ps-accent": accent,
    "--ps-on-accent": readableOn(accent) || "#fff",
    "--ps-text": th.text,
    "--ps-muted": th.muted,
    "--ps-border": th.border,
    "--ps-surface": th.surface,
    "--ps-store-bg": th.bg,
    "--ps-radius": th.radius + "px",
    "--ps-heading-font": `"${headingFont}", "Cairo", sans-serif`,
    "--ps-body-font": `"${bodyFont}", "Cairo", sans-serif`,
  };
  const isHome = page === "home";
  const nav = [
    [base, txt.home],
    [shopUrl, txt.shop],
    [base + "/delivery", txt.delivery],
    [base + "/contact", txt.contact],
  ];

  return (
    <main
      className={
        "public-store sx-store sx-tpl-" + t.id + " sx-header-" + t.header + (isHome ? " sx-home" : " sx-inner")
      }
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "fr"}
      style={style as React.CSSProperties}
      data-store-template={t.id}
    >
      {cfg.showAnnouncement !== false && (
        <div className="sx-announcement">{pick(cfg.announcement, c.announcement)}</div>
      )}
      <header className="sx-header">
        <div className="sx-wrap sx-header-row">
          <a className="sx-brand" href={base}>
            {cfg.logo ? <img src={cfg.logo} alt={store.name} /> : store.name}
          </a>
          <nav id="sx-nav" className={"sx-nav" + (menu ? " open" : "")}>
            {nav.map(([h, l]) => (
              <a key={h} href={h} onClick={() => setMenu(false)}>
                {l}
              </a>
            ))}
          </nav>
          <div className="sx-header-actions">
            <a className="sx-icon-btn" href={shopUrl} aria-label={txt.search}>
              <Icon name="search" />
            </a>
            <button type="button" className="sx-cart" onClick={openCart} aria-label={txt.cart}>
              <Icon name="cart" />
              <i>{cartCount}</i>
            </button>
            <button
              type="button"
              className="sx-burger"
              aria-label={rtl ? "القائمة" : "Menu"}
              aria-expanded={menu}
              aria-controls="sx-nav"
              onClick={() => setMenu((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {isHome ? (
        order.filter((k) => !hidden.has(k)).map((k) => <React.Fragment key={k}>{section(k)}</React.Fragment>)
      ) : (
        <div className="sx-page">{body}</div>
      )}

      {cfg.showFooter !== false && (
        <footer className="sx-footer">
          <div className="sx-wrap sx-footer-grid">
            <div>
              <b className="sx-footer-brand">{store.name}</b>
              <p>{cfg.footerContent?.about || hero.text}</p>
              <small>
                © {new Date().getFullYear()} {store.name} · {txt.cod}
              </small>
            </div>
            <nav>
              <b>{txt.shop}</b>
              <a href={shopUrl}>{lang === "ar" ? "جميع المنتجات" : "Tous les produits"}</a>
              {categories.slice(0, 4).map((x) => (
                <a key={x.name} href={catUrl(x.name)}>
                  {x.name}
                </a>
              ))}
            </nav>
            <nav>
              <b>{lang === "ar" ? "مساعدة" : "Aide"}</b>
              <a href={base + "/delivery"}>{txt.delivery}</a>
              <a href={base + "/faq"}>{txt.faq}</a>
              <a href={base + "/contact"}>{txt.contact}</a>
            </nav>
            <nav>
              <b>{lang === "ar" ? "قانوني" : "Informations"}</b>
              <a href={base + "/privacy"}>{rtl ? "الخصوصية" : "Confidentialité"}</a>
              <a href={base + "/terms"}>{rtl ? "الشروط" : "Conditions"}</a>
              <a href={base + "/returns"}>{rtl ? "الإرجاع" : "Retours"}</a>
            </nav>
          </div>
        </footer>
      )}
      {drawer}
    </main>
  );
}
