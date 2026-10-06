"use client";
// Rendu d'une boutique avec un template de série (Série 1, 2…).
// Storefront garde la logique (panier, variantes, commande) ; ce composant fait la
// mise en page de toutes les pages : accueil par sections, boutique, produit,
// livraison, contact, FAQ, pages légales, header et pied de page — chacune avec
// la mise en page propre au template (t.layout).
import React, { useEffect, useMemo, useState } from "react";
import {
  SECTION_LABELS,
  copyLang,
  effectiveTemplate,
  fillTokens,
  sectionType,
  resolveSections,
  sectionContent,
  templateCopy,
  type StoreTemplate,
  type SxBlock,
  type SxSectionType,
} from "../../lib/store-templates";
import {
  FaqBlock,
  Icon,
  ProductCard,
  SeriesFooter,
  TRUST_ICONS,
  img,
  price,
  productUrl,
  readableOn,
  type SxCtx,
} from "./SeriesParts";
import {
  ContactPage,
  DeliveryPage,
  FaqPage,
  LegalPage,
  NotFoundPage,
  ProductPage,
  ShopPage,
  type VariantApi,
} from "./SeriesPages";
import SeriesHeader from "./SeriesHeader";
import { heroSerie2 } from "./SeriesHeroes2";
import {
  ExpertSection,
  HighlightsSection,
  ServicesSection,
  StatementSection,
  TrioCategories,
  heroClinic,
  heroEstate,
} from "./SeriesCustom";
import { MapSection } from "./SeriesMap";
import { SERIE3_HEROES, heroSerie3 } from "./SeriesHeroes3";
import {
  CoverflowSection,
  FilmstripSection,
  KicksHero,
  ShelfSection,
  StuddsHero,
  WelcomeSection,
  ZigzagSection,
  customFooter,
} from "./SeriesKicks";
import {
  CATEGORIES_V3,
  CategoriesV3,
  DealsSection,
  GallerySection,
  MosaicSection,
  SpecsSection,
} from "./SeriesSections3";
import { CtaPhotoSection, FeaturesSection, PhotoStatsSection, heroSchool, hl, plain } from "./SeriesSchool";
import { storeBuilderDefaults } from "../../lib/store-builder-config";
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
  /** produit de la page produit (null si introuvable) */
  product?: any;
  /** sélection des variantes (gérée par Storefront) */
  variants: VariantApi;
  /** blocs personnalisés ajoutés dans l'éditeur pour la page courante */
  extra?: React.ReactNode;
  /** tiroir du panier (rendu par Storefront) */
  drawer?: React.ReactNode;
  /** éléments flottants (bouton WhatsApp) */
  floating?: React.ReactNode;
  /** blocs personnalisés de l'accueil (éditeur « Ajouter une section ») */
  customHome?: { id: string; node: React.ReactNode }[];
  /** aperçu de l'éditeur : sections cliquables avec barre d'actions */
  editing?: boolean;
  cartCount: number;
  openCart: () => void;
  add: (p: any) => void;
}

// Graisses demandées à Google Fonts : une graisse absente fait échouer toute la feuille
// de style, d'où une liste par police (400 à 700 par défaut, une seule pour certaines).
const FONT_WEIGHTS: Record<string, string> = {
  "DM Serif Display": "",
  Anton: "",
  "Alfa Slab One": "",
  "Bebas Neue": "",
  Caveat: ":wght@400;700",
};
export function fontsHref(families: string[]) {
  const list = Array.from(new Set(families.filter(Boolean).map((f) => f.trim())));
  return (
    "https://fonts.googleapis.com/css2?" +
    list
      .map((f) => "family=" + f.replace(/ /g, "+") + (f in FONT_WEIGHTS ? FONT_WEIGHTS[f] : ":wght@400;500;600;700"))
      .join("&") +
    "&display=swap"
  );
}

/** Textes par défaut de l'ancien éditeur : jamais affichés dans un template de série. */
const GENERIC_DEFAULTS = new Set<string>(
  (["heroTitle", "heroText", "heroButton", "announcement", "collectionTitle"] as const).map(
    (k) => storeBuilderDefaults[k],
  ),
);

/* ───────── aperçu de l'éditeur ───────── */
type EditAction = "select" | "up" | "down" | "hide" | "show" | "duplicate" | "delete";
function postEdit(key: string, action: EditAction) {
  window.parent?.postMessage({ type: "LANDPRO_SX_ACTION", key, action }, "*");
}
function EditBlock({
  k,
  label,
  hidden,
  selected,
  first,
  last,
  fixed,
  children,
}: {
  k: string;
  label: string;
  hidden: boolean;
  selected: boolean;
  first: boolean;
  last: boolean;
  /** section non déplaçable / non supprimable (bannière principale) */
  fixed?: boolean;
  children: React.ReactNode;
}) {
  const btn = (action: EditAction, text: string, title: string, disabled = false) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        postEdit(k, action);
      }}
    >
      {text}
    </button>
  );
  return (
    <div
      className={"sx-eb" + (hidden ? " is-hidden" : "") + (selected ? " is-selected" : "")}
      data-sx-key={k}
      onClickCapture={(e) => {
        // dans l'éditeur, un clic sélectionne la section au lieu de suivre les liens
        if ((e.target as HTMLElement).closest(".sx-eb-bar")) return;
        e.preventDefault();
        e.stopPropagation();
        postEdit(k, "select");
      }}
    >
      <div className="sx-eb-bar">
        <b>
          {label}
          {hidden ? " · masquée" : ""}
        </b>
        {btn("select", "✎", "Modifier")}
        {!fixed && btn("up", "↑", "Monter", first)}
        {!fixed && btn("down", "↓", "Descendre", last)}
        {!k.startsWith("@") && btn(hidden ? "show" : "hide", hidden ? "◉" : "◌", hidden ? "Afficher" : "Masquer")}
        {!fixed && btn("duplicate", "⧉", "Dupliquer")}
        {!fixed && btn("delete", "🗑", "Supprimer")}
      </div>
      {children || (
        <div className="sx-eb-empty">{label} : rien à afficher pour le moment (contenu ou produits manquants).</div>
      )}
    </div>
  );
}

export default function SeriesStore(props: SeriesStoreProps) {
  const {
    t: templateDef,
    store,
    cfg,
    products,
    page,
    rtl,
    base,
    txt,
    product,
    variants,
    extra,
    drawer,
    floating,
    customHome = [],
    editing = false,
    cartCount,
    openCart,
    add,
  } = props;
  const [cat, setCat] = useState("");
  // éditeur : section sélectionnée dans le panneau, mise en évidence et affichée
  const [selectedKey, setSelectedKey] = useState("");
  useEffect(() => {
    if (!editing) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== "LANDPRO_SX_SELECTED") return;
      const key = String(e.data.key || "");
      setSelectedKey(key);
      if (e.data.scroll)
        requestAnimationFrame(() =>
          document
            .querySelector(`[data-sx-key="${CSS.escape(key)}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [editing]);
  const [sort, setSort] = useState("featured");
  const lang = copyLang(store.locale);
  // Réglages propres à ce template (sinon : textes et couleurs du template)
  const own = cfg.storeTemplateId === templateDef.id;
  const sx = own ? cfg.sx : undefined;
  // mise en page, hero et couleurs choisis dans l'éditeur, par-dessus ceux du template
  const t = effectiveTemplate(templateDef, sx);
  const c = templateCopy(t, store.locale);
  // valeur réglée par le marchand ; les valeurs génériques de l'éditeur (texte arabe par défaut…) sont ignorées
  const pick = (v: unknown, fallback: string) =>
    own && typeof v === "string" && v.trim() && !GENERIC_DEFAULTS.has(v) ? v : fallback;
  const customById = new Map(customHome.map((x) => [x.id, x.node]));
  const { order, hidden } = resolveSections(
    t,
    sx,
    customHome.map((x) => x.id),
  );
  const block = (k: string): SxBlock => sectionContent(t, store.locale, k, sx);

  const hero = {
    eyebrow: pick(cfg.heroEyebrow, c.eyebrow),
    title: pick(cfg.heroTitle, c.title),
    text: pick(cfg.heroText, c.text),
    button: pick(cfg.heroButton, c.button),
    secondary: own ? cfg.heroSecondaryButton || "" : c.secondary || "",
    highlight: "",
  };
  // mot mis en valeur : celui réglé (IA ou éditeur), sinon celui du template tant que son titre est gardé
  hero.highlight =
    own && typeof cfg.heroHighlight === "string"
      ? cfg.heroHighlight
      : hero.title === c.title || hero.title.toLowerCase().includes((c.highlight || "").toLowerCase())
        ? c.highlight || ""
        : "";
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
    const chosen = (sx?.categoryImages || {}) as Record<string, string>;
    return Array.from(map.values()).map((x) => (chosen[x.name] ? { ...x, image: chosen[x.name] } : x));
  }, [products, cfg.categories, sx?.categoryImages]);
  const counts = { products: products.length, categories: categories.length };
  const shopUrl = base + "/shop";
  const catUrl = (name: string) => shopUrl + "?category=" + encodeURIComponent(name);
  const ctx: SxCtx = {
    t,
    store,
    cfg,
    lang,
    rtl,
    base,
    txt,
    shopUrl,
    catUrl,
    categories,
    products,
    add,
    about: hero.text,
    trust: (block("trust").items || []).map((x) => ({ title: x.title, text: x.text })),
  };

  /* ───────── éléments communs ───────── */
  /** image choisie (src) ou, à défaut, photo de produit n° i */
  const art = (i = 0, label?: string, src?: string) =>
    src || pic(i) ? (
      <img className="sx-img" src={src || pic(i)} alt={label || store.name} loading={i ? "lazy" : "eager"} />
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
                      <b>{fillTokens(s.value, counts)}</b>
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
                    <b>{fillTokens(s.value, counts)}</b>
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
              {categories.length > 0 && t.layout.header !== "stacked" && (
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
    const kit = {
      hero,
      store,
      products,
      categories,
      lang,
      base,
      shopUrl,
      catUrl,
      stats: statItems.map((x) => ({ value: fillTokens(x.value, counts), title: x.title })),
      trust: block("trust").items || [],
      art,
      title,
      actions,
      eyebrow,
      searchBar,
    };
    // hero sur mesure (école) : cartes sous le texte, modifiables avec le hero
    const heroExtra = { ...kit, items: block("hero").items || [], fill: (v?: string) => fillTokens(v, counts) };
    if (t.hero === "school") return heroSchool(heroExtra);
    if (t.hero === "kicks") return <KicksHero h={{ ...heroExtra, add }} />;
    if (t.hero === "studds") return <StuddsHero h={{ ...heroExtra, add }} />;
    if (SERIE3_HEROES.has(t.hero)) return heroSerie3(t.hero, { ...heroExtra, add });
    if (t.hero === "estate") return heroEstate(heroExtra);
    if (t.hero === "clinic") return heroClinic(heroExtra);
    // heros de la Série 2
    return heroSerie2(t.hero, kit);
  }

  const head = (b: SxBlock, link = true, fallback = "") => (
    <div className="sx-head">
      <div>
        {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
        <h2>{hl(b.title || fallback)}</h2>
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
  function section(k: string) {
    const type = sectionType(k);
    if (type === "custom") {
      const node = customById.get(k.slice(7));
      return node ? <div className="sx-custom">{node}</div> : null;
    }
    const b = block(k);
    switch (type) {
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
        if (CATEGORIES_V3.has(t.categories))
          return (
            <CategoriesV3
              variant={t.categories}
              b={b}
              categories={categories}
              catUrl={catUrl}
              shopUrl={shopUrl}
              art={art}
              head={head(b)}
              lang={lang}
            />
          );
        if (t.categories === "trio")
          return <TrioCategories b={b} categories={categories} catUrl={catUrl} art={art} head={head(b)} lang={lang} />;
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
        if (cfg.showProducts === false) return null;
        // section principale : titre de la sélection ; copies : titre et catégorie propres
        const main = k === "products";
        const list = b.category ? products.filter((p) => p?.specifications?.category === b.category) : products;
        if (!list.length) return null;
        return (
          <section className="sx-section sx-products">
            <div className="sx-wrap">
              {head(
                main
                  ? {
                      ...b,
                      title: pick(cfg.collectionTitle, c.collectionTitle),
                      text: own ? cfg.collectionSubtitle || "" : c.collectionSubtitle || "",
                    }
                  : { ...b, title: b.title || b.category || c.collectionTitle },
                true,
              )}
              <div className={"sx-grid sx-card-" + t.card}>
                {list.slice(0, 8).map((p, i) => (
                  <ProductCard key={p.id} ctx={ctx} p={p} index={i} />
                ))}
              </div>
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
                      <span key={i}>{art(i, undefined, i === 1 ? b.image : i === 2 ? b.image2 : undefined)}</span>
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
                    <span className="sx-promo-media">{art(i + 2, x.title, x.image)}</span>
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
                {art(1, b.title, b.image)}
                {(b.image2 || pics.length > 2) && <span className="sx-showcase-small">{art(2, "", b.image2)}</span>}
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
                    <b>{fillTokens(x.value, counts)}</b>
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
                  <figure key={i} className={x.image ? "has-avatar" : undefined}>
                    {x.image && <img className="sx-quote-avatar" src={x.image} alt={x.title} loading="lazy" />}
                    <span className="sx-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    <blockquote>{x.text}</blockquote>
                    <figcaption>
                      {x.title}
                      {x.value && <small>{x.value}</small>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "newsletter":
        if (t.ctaPhoto)
          return (
            <CtaPhotoSection
              b={b}
              photo={art(4, plain(b.title), b.image)}
              href={base + "/contact"}
              fallback={txt.contact}
            />
          );
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
      case "marquee": {
        const words = (b.items || []).map((x) => x.title).filter(Boolean);
        const list = words.length ? words : categories.map((x) => x.name);
        if (!list.length) return null;
        const row = (
          <span className="sx-marquee-row" aria-hidden="true">
            {[...list, ...list].map((w, i) => (
              <span key={i}>
                {w}
                <i>✦</i>
              </span>
            ))}
          </span>
        );
        return (
          <section className="sx-section sx-marquee" aria-label={list.join(", ")}>
            <div className="sx-marquee-track">
              {row}
              {row}
            </div>
          </section>
        );
      }
      case "bento": {
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className="sx-section sx-bento">
            <div className="sx-wrap">
              {(b.title || b.text) && head(b, false)}
              <div className="sx-bento-grid">
                {items.slice(0, 4).map((x, i) => (
                  <a key={i} href={shopUrl} className={"sx-bento-card sx-bento-" + i}>
                    {(x.image || i === 1) && <span className="sx-bento-img">{art(i + 3, x.title, x.image)}</span>}
                    <span className="sx-bento-copy">
                      {x.title && <b>{x.title}</b>}
                      {x.value && <strong>{fillTokens(x.value, counts)}</strong>}
                      {x.text && <small>{x.text}</small>}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "rows": {
        const items = b.items || [];
        if (!items.length) return null;
        return (
          <section className="sx-section sx-rows">
            <div className="sx-wrap">
              <div className="sx-rows-box">
                {head(b, false)}
                <div className="sx-rows-list">
                  {items.map((x, i) => (
                    <div key={i} className="sx-row">
                      {x.value && <small className="sx-row-meta">{x.value}</small>}
                      <div className="sx-row-copy">
                        <b>{x.title}</b>
                        {x.text && <p>{x.text}</p>}
                        <a className="sx-btn sx-btn-light" href={shopUrl}>
                          {b.button || (lang === "ar" ? "اكتشف" : "Découvrir")} <Icon name="arrow" />
                        </a>
                      </div>
                      <span className="sx-row-img">{art(i + 2, x.title, x.image)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "spotlight":
        return (
          <section className="sx-section sx-spotlight">
            <div className="sx-wrap">
              <div className="sx-spot-frame">
                <div className="sx-hero-bg">{art(2, b.title, b.image)}</div>
                <div className="sx-spot-copy">
                  {b.eyebrow && <small className="sx-eyebrow">{b.eyebrow}</small>}
                  <h2>{b.title || hero.title}</h2>
                  {b.text && <p>{b.text}</p>}
                  {b.button && (
                    <a className="sx-btn sx-btn-light" href={shopUrl}>
                      {b.button} <Icon name="arrow" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      case "deals":
        return <DealsSection b={b} ctx={ctx} head={head(b)} />;
      case "mosaic":
        return (
          <MosaicSection
            b={b}
            art={art}
            href={shopUrl}
            head={head(b, false)}
            more={lang === "ar" ? "اكتشف" : "Découvrir"}
          />
        );
      case "specs":
        return <SpecsSection b={b} />;
      case "gallery":
        return <GallerySection b={b} ctx={ctx} art={art} />;
      case "zigzag":
        return <ZigzagSection b={b} ctx={ctx} art={art} />;
      case "welcome":
        return <WelcomeSection b={b} ctx={ctx} art={art} />;
      case "shelf":
        return <ShelfSection b={b} ctx={ctx} art={art} />;
      case "filmstrip":
        return <FilmstripSection b={b} ctx={ctx} art={art} />;
      case "coverflow":
        return <CoverflowSection b={b} ctx={ctx} art={art} head={head(b, false)} />;
      case "map":
        return <MapSection b={b} editing={!!editing} lang={lang} />;
      case "statement":
        return (
          <StatementSection
            b={b}
            layout={t.statement || "rows"}
            art={art}
            fill={(v) => fillTokens(v, counts)}
            href={base + "/contact"}
          />
        );
      case "services":
        return <ServicesSection b={b} fill={(v) => fillTokens(v, counts)} />;
      case "expert":
        return <ExpertSection b={b} art={art} fill={(v) => fillTokens(v, counts)} href={base + "/contact"} />;
      case "highlights":
        return <HighlightsSection b={b} art={art} fill={(v) => fillTokens(v, counts)} href={shopUrl} />;
      case "features":
        return <FeaturesSection b={b} shopUrl={shopUrl} lang={lang} />;
      case "photostats":
        return <PhotoStatsSection b={b} photo={art(3, plain(b.title), b.image)} fill={(v) => fillTokens(v, counts)} />;
      case "faq": {
        if (cfg.showFaq === false || !Array.isArray(cfg.faq) || !cfg.faq.length) return null;
        return (
          <FaqBlock
            ctx={ctx}
            eyebrow={b.eyebrow}
            title={hl(b.title || txt.faq)}
            text={b.text}
            items={cfg.faq.slice(0, 6)}
          />
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
            <div className={"sx-grid sx-grid-3 sx-card-" + t.card}>
              {list.slice(0, 12).map((p, i) => (
                <ProductCard key={p.id} ctx={ctx} p={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ───────── pages internes ───────── */
  function innerPage() {
    if (page.startsWith("product/"))
      return product ? <ProductPage ctx={ctx} product={product} api={variants} /> : <NotFoundPage ctx={ctx} />;
    if (page === "shop") return <ShopPage ctx={ctx} />;
    if (page === "delivery") return <DeliveryPage ctx={ctx} />;
    if (page === "contact") return <ContactPage ctx={ctx} />;
    if (page === "faq")
      return <FaqPage ctx={ctx} eyebrow={block("faq").eyebrow} title={plain(block("faq").title) || txt.faq} />;
    if (page === "privacy" || page === "terms" || page === "returns") return <LegalPage ctx={ctx} page={page} />;
    return <NotFoundPage ctx={ctx} />;
  }

  /* ───────── page ───────── */
  const th = t.theme;
  const lightHero = /^#[0-9a-f]{6}$/i.test(th.heroBg) && readableOn(th.heroBg) === "#111111";
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
    // bandeaux des pages internes : fond du hero, ou couleur principale si le hero est clair
    "--sx-banner-bg": lightHero ? primary : th.heroBg,
    "--sx-banner-text": lightHero ? readableOn(primary) || "#fff" : th.heroText,
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

  return (
    <main
      className={
        "public-store sx-store sx-tpl-" +
        t.id +
        " sx-header-" +
        t.header +
        (isHome ? " sx-home" : " sx-inner") +
        (editing ? " sx-editing" : "")
      }
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "fr"}
      style={style as React.CSSProperties}
      data-store-template={t.id}
      onClickCapture={
        editing
          ? (e) => {
              // éditeur : clic sur le header ou le pied de page = réglages de mise en page
              const el = e.target as HTMLElement;
              if (el.closest(".sx-eb, .sx-menu-wrap, .ps-drawer-wrap")) return;
              const zone = el.closest(".sx-header, .sx-utility")
                ? "@header"
                : el.closest(".sx-footer")
                  ? "@footer"
                  : "";
              if (!zone) return;
              e.preventDefault();
              e.stopPropagation();
              postEdit(zone, "select");
            }
          : undefined
      }
    >
      {cfg.showAnnouncement !== false && (
        <div className="sx-announcement">{pick(cfg.announcement, c.announcement)}</div>
      )}
      <SeriesHeader ctx={ctx} page={page} cartCount={cartCount} openCart={openCart} />

      {isHome ? (
        editing ? (
          order.map((k, i) => {
            const type = sectionType(k);
            const label =
              type === "custom"
                ? "Bloc personnalisé"
                : (type && SECTION_LABELS[type]) + (k.includes("~") ? " (copie)" : "");
            return (
              <EditBlock
                key={k}
                k={k}
                label={label}
                hidden={hidden.has(k)}
                selected={selectedKey === k}
                first={i <= 1}
                last={i === order.length - 1}
                fixed={k === "hero"}
              >
                {section(k)}
              </EditBlock>
            );
          })
        ) : (
          order.filter((k) => !hidden.has(k)).map((k) => <React.Fragment key={k}>{section(k)}</React.Fragment>)
        )
      ) : (
        <div className="sx-page">
          {editing ? (
            <EditBlock
              k={"@page:" + (page.startsWith("product/") ? "product" : page)}
              label="Contenu de la page"
              hidden={false}
              selected={false}
              first
              last
              fixed
            >
              {innerPage()}
            </EditBlock>
          ) : (
            innerPage()
          )}
          {extra}
        </div>
      )}

      {cfg.showFooter !== false && (customFooter(ctx) || <SeriesFooter ctx={ctx} />)}
      {drawer}
      {floating}
    </main>
  );
}
