"use client";
// Templates sur mesure « Détail Rouge » (s90-04, maquette Kicks) et « Bande Rouge »
// (s90-05, maquette Studds) : heros, sections propres et pieds de page.
// Les noms et photos sont ceux de la boutique ; la mise en page suit la maquette.
import React, { useEffect, useState } from "react";
import type { SxBlock } from "../../lib/store-templates";
import { Icon, img, price, productUrl, tr, type SxCtx } from "./SeriesParts";
import type { Hero3Kit } from "./SeriesHeroes3";
import { whatsappDigits } from "./WhatsAppButton";
import "./series-kicks.css";

type Art = (i?: number, label?: string, src?: string) => React.ReactNode;
const htr = (h: Hero3Kit, fr: string, ar: string) => (h.lang === "ar" ? ar : fr);
const catOf = (p: any) => String(p?.specifications?.category || "").trim();
const plainText = (v: unknown, max = 110) => {
  const s = String(v || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
};
const photo = (p: any, fallback: React.ReactNode) =>
  img(p) ? <img src={img(p)} alt={p.name} loading="lazy" /> : fallback;

/** URL de la page en cours (après montage, pour les liens de partage). */
function usePageUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  return url;
}

/** Fines lignes rouges reliées par des points (décor de la maquette Kicks). */
function NetLines({ className = "" }: { className?: string }) {
  const pts: [number, number][] = [
    [0, 210],
    [140, 150],
    [300, 250],
    [470, 120],
    [640, 230],
    [820, 90],
    [980, 200],
    [1200, 140],
  ];
  const low: [number, number][] = [
    [0, 420],
    [220, 360],
    [430, 440],
    [700, 330],
    [930, 420],
    [1200, 350],
  ];
  const line = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");
  return (
    <svg
      className={"sx-net " + className}
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <polyline points={line(pts)} />
      <polyline points={line(low)} />
      <polyline points={`140,150 220,360 470,120 700,330 820,90`} />
      {[...pts, ...low].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" />
      ))}
    </svg>
  );
}

/** Bouton pilule blanc : rond avec flèche + texte, nom du produit en rouge. */
function KPill({ href, label, name }: { href: string; label: string; name?: string }) {
  return (
    <a className="sx-kpill" href={href}>
      <i aria-hidden="true">
        <Icon name="arrow" />
      </i>
      <span>
        {label} {name && <b>{name}</b>}
      </span>
    </a>
  );
}

/* ═════════ Détail Rouge (Kicks) ═════════ */
export function KicksHero({ h }: { h: Hero3Kit }) {
  const p = h.products[0];
  const href = p ? productUrl(h.base, p) : h.shopUrl;
  const page = usePageUrl();
  const share = encodeURIComponent(page);
  return (
    <section className="sx-hero sx-hk">
      <NetLines />
      <div className="sx-wrap sx-hk-grid">
        <div className="sx-hk-copy">
          <small className="sx-hk-brand">{h.store.name}</small>
          {h.hero.eyebrow && <b className="sx-hk-eyebrow">{h.hero.eyebrow}</b>}
          {h.title("h1", "sx-hk-title")}
          {h.trust[0] && (
            <div className="sx-hk-rate">
              <span aria-hidden="true">
                <Icon name="truck" />
                <Icon name="cash" />
                <Icon name="swap" />
                <Icon name="chat" />
              </span>
              <small>{h.trust[0].title}</small>
            </div>
          )}
          {h.hero.text && <p className="sx-hk-text">{h.hero.text}</p>}
          <KPill href={href} label={h.hero.button} name={p?.name} />
        </div>
        <a className="sx-hk-media" href={href} aria-label={p?.name || h.store.name}>
          {h.art(0, p?.name || h.hero.title)}
        </a>
      </div>
      <div className="sx-wrap sx-hk-share">
        <a href={"https://www.facebook.com/sharer/sharer.php?u=" + share} target="_blank" rel="noreferrer">
          facebook
        </a>
        <a href={"https://wa.me/?text=" + share} target="_blank" rel="noreferrer">
          whatsapp
        </a>
      </div>
    </section>
  );
}

export function ZigzagSection({ b, ctx, art }: { b: SxBlock; ctx: SxCtx; art: Art }) {
  const [tab, setTab] = useState(0);
  const first = ctx.products[0];
  const wa = whatsappDigits(ctx.cfg.whatsapp || ctx.store.workspace_whatsapp);
  const tabs = [
    b.title || tr(ctx, "Caractéristiques", "المميزات"),
    tr(ctx, "Livraison & paiement", "التوصيل والدفع"),
    tr(ctx, "Photos", "الصور"),
    tr(ctx, "Contact", "تواصل"),
  ];
  const rows = (list: { title: string; text?: string; node: React.ReactNode }[]) => (
    <div className="sx-zz-rows">
      {list.map((x, i) => (
        <div key={i} className={"sx-zz-row" + (i % 2 ? " is-flip" : "")}>
          <div className="sx-zz-media">{x.node}</div>
          <div className="sx-zz-copy">
            <h3>{x.title}</h3>
            {x.text && <p>{x.text}</p>}
            <i className="sx-zz-bar" aria-hidden="true" />
          </div>
        </div>
      ))}
    </div>
  );
  let body: React.ReactNode;
  if (tab === 1) body = rows(ctx.trust.map((x, i) => ({ title: x.title, text: x.text, node: art(i + 4, x.title) })));
  else if (tab === 2)
    body = (
      <div className="sx-zz-photos">
        {ctx.products.slice(0, 6).map((p, i) => (
          <a key={p.id} href={productUrl(ctx.base, p)}>
            {photo(p, art(i))}
          </a>
        ))}
      </div>
    );
  else if (tab === 3)
    body = (
      <div className="sx-zz-contact">
        <h3>{tr(ctx, "Une question sur un modèle ?", "عندك سؤال على شي موديل؟")}</h3>
        <p>
          {tr(
            ctx,
            "Taille, couleur ou délai de livraison : écrivez-nous, nous vous répondons rapidement.",
            "المقاس، اللون ولا وقت التوصيل: كتب لينا ونجاوبوك بسرعة.",
          )}
        </p>
        <div className="sx-zz-contact-btns">
          {wa && <KPill href={"https://wa.me/" + wa} label="WhatsApp" />}
          <KPill href={ctx.base + "/contact"} label={ctx.txt.contact} />
        </div>
      </div>
    );
  else
    body = rows((b.items || []).map((x, i) => ({ title: x.title, text: x.text, node: art(i + 1, x.title, x.image) })));
  return (
    <section className="sx-section sx-zz">
      <div className="sx-wrap">
        <div className="sx-zz-card">
          <NetLines className="sx-zz-net" />
          <div className="sx-zz-tabs" role="tablist">
            {tabs.map((label, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={tab === i ? "is-on" : undefined}
                onClick={() => setTab(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sx-zz-body" role="tabpanel">
            {body}
          </div>
        </div>
        <div className="sx-zz-cta">
          <KPill
            href={first ? productUrl(ctx.base, first) : ctx.shopUrl}
            label={b.button || tr(ctx, "Acheter ce modèle", "شري هاد الموديل")}
            name={first?.name}
          />
        </div>
      </div>
    </section>
  );
}

export function KicksFooter({ ctx }: { ctx: SxCtx }) {
  const { store, cfg, base, txt, shopUrl, rtl } = ctx;
  const page = usePageUrl();
  const wa = whatsappDigits(cfg.whatsapp || store.workspace_whatsapp);
  const tiles = ctx.products.slice(0, 4);
  return (
    <footer className="sx-footer sx-footer-kicks">
      <div className="sx-wrap">
        {tiles.length > 0 && (
          <div className="sx-fk-tiles">
            {tiles.map((p, i) => (
              <a key={p.id} className={"sx-fk-tile" + (i === 0 ? " is-on" : "")} href={productUrl(base, p)}>
                <span className="sx-fk-media">
                  {photo(p, <span className="sx-art" />)}
                  <b className="sx-fk-mark">{p.name}</b>
                </span>
                <b className="sx-fk-name">
                  {tr(ctx, "Découvrez", "اكتشف")} {p.name}
                </b>
                <small>{plainText(p.description) || [catOf(p), price(p.price)].filter(Boolean).join(" · ")}</small>
                <i className="sx-fk-bar" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
        <div className="sx-fk-bottom">
          <div>
            <nav className="sx-fk-links">
              <a href={shopUrl}>{txt.shop}</a>
              <a href={base + "/delivery"}>{txt.delivery}</a>
              <a href={base + "/contact"}>{txt.contact}</a>
              <a href={base + "/terms"}>{rtl ? "الشروط" : "Conditions"}</a>
              <a href={base + "/privacy"}>{rtl ? "الخصوصية" : "Confidentialité"}</a>
            </nav>
            <small>
              © {new Date().getFullYear()} {store.name} · {txt.cod}
            </small>
          </div>
          <nav className="sx-fk-social" aria-label={tr(ctx, "Réseaux", "الشبكات")}>
            {wa && (
              <a href={"https://wa.me/" + wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            <a
              href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(page)}
              target="_blank"
              rel="noreferrer"
            >
              facebook
            </a>
            <a href={base + "/faq"}>{txt.faq}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ═════════ Bande Rouge (Studds) ═════════ */
function DotRing() {
  const dots: React.ReactNode[] = [];
  for (let r = 1; r <= 4; r++)
    for (let k = 0; k < r * 6; k++) {
      const a = (k / (r * 6)) * Math.PI * 2;
      dots.push(
        <circle
          key={r + "-" + k}
          cx={(20 + Math.cos(a) * r * 4.2).toFixed(2)}
          cy={(20 + Math.sin(a) * r * 4.2).toFixed(2)}
          r="1.4"
        />,
      );
    }
  return (
    <svg className="sx-hs-dotring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="1.6" />
      {dots}
    </svg>
  );
}

export function StuddsHero({ h }: { h: Hero3Kit }) {
  const slides = h.products.slice(0, 5);
  const n = slides.length;
  const [i, setI] = useState(0);
  const go = (d: number) => n > 1 && setI((v) => (v + d + n) % n);
  const cur = slides[i];
  const next = n > 1 ? slides[(i + 1) % n] : null;
  const href = i === 0 || !cur ? h.shopUrl : productUrl(h.base, cur);
  const badge = h.items[0];
  return (
    <section className="sx-hero sx-hs">
      <i className="sx-band" aria-hidden="true" />
      <div className="sx-wrap sx-hs-grid">
        <div className="sx-hs-copy">
          {badge && (
            <div className="sx-hs-badge">
              <DotRing />
              <span>
                <small>{badge.title}</small>
                {badge.value && <small>{h.fill(badge.value)}</small>}
              </span>
            </div>
          )}
          {h.hero.eyebrow && <small className="sx-hs-eyebrow">{h.hero.eyebrow}</small>}
          {i === 0 || !cur ? h.title("h1", "sx-hs-title") : <h1 className="sx-hero-title sx-hs-title">{cur.name}</h1>}
          <a className="sx-rpill" href={href}>
            {h.hero.button}
          </a>
        </div>
        <a className="sx-hs-media" href={href} aria-label={cur?.name || h.hero.title}>
          <i className="sx-hs-ring" aria-hidden="true" />
          {i === 0 || !cur ? h.art(0, h.hero.title) : photo(cur, h.art(i))}
        </a>
        <div className="sx-hs-next">
          {next && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={htr(h, "Précédent", "السابق")}>
                <Icon name="back" />
              </button>
              <button type="button" className="sx-hs-next-item" onClick={() => go(1)}>
                <span>{photo(next, h.art(i + 1))}</span>
                <b>{next.name}</b>
              </button>
              <button type="button" onClick={() => go(1)} aria-label={htr(h, "Suivant", "التالي")}>
                <Icon name="arrow" />
              </button>
            </>
          )}
        </div>
      </div>
      {n > 1 && (
        <div className="sx-hs-pager">
          <span className="sx-hs-track">
            {slides.map((s, k) => (
              <button
                key={s.id}
                type="button"
                className={k === i ? "is-on" : undefined}
                onClick={() => setI(k)}
                aria-label={s.name}
              />
            ))}
          </span>
          <button type="button" className="sx-hs-ctrl" onClick={() => go(1)} aria-label={htr(h, "Suivant", "التالي")}>
            ‹ ›
          </button>
        </div>
      )}
    </section>
  );
}

export function WelcomeSection({ b, ctx, art }: { b: SxBlock; ctx: SxCtx; art: Art }) {
  const wa = whatsappDigits(ctx.cfg.whatsapp || ctx.store.workspace_whatsapp);
  const side = b.items?.[0];
  return (
    <section className="sx-section sx-welcome">
      <i className="sx-band" aria-hidden="true" />
      <div className="sx-wrap sx-welcome-grid">
        <div className="sx-welcome-col">
          <h2>
            {b.eyebrow && <b>{b.eyebrow}</b>}
            <span>{b.title || ctx.store.name}</span>
          </h2>
          <i className="sx-welcome-rule" aria-hidden="true" />
          {b.text && <p>{b.text}</p>}
          {b.button && (
            <a className="sx-rpill sx-rpill-sm" href={ctx.shopUrl}>
              {b.button}
            </a>
          )}
        </div>
        <div className="sx-welcome-media">{art(1, b.title || ctx.store.name, b.image)}</div>
        {side && (
          <div className="sx-welcome-col sx-welcome-end">
            <h2>
              <b>{side.title}</b>
              {side.value && <span>{side.value}</span>}
            </h2>
            <i className="sx-welcome-rule" aria-hidden="true" />
            {side.text && <p>{side.text}</p>}
            <a
              className="sx-rpill sx-rpill-sm"
              href={wa ? "https://wa.me/" + wa : ctx.base + "/contact"}
              {...(wa ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {tr(ctx, "Nous écrire", "كتب لينا")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function ShelfSection({ b, ctx, art }: { b: SxBlock; ctx: SxCtx; art: Art }) {
  const groups = ctx.categories
    .map((c) => ({ name: c.name, href: ctx.catUrl(c.name), items: ctx.products.filter((p) => catOf(p) === c.name) }))
    .filter((g) => g.items.length);
  if (!groups.length && ctx.products.length)
    groups.push({ name: b.eyebrow || tr(ctx, "Nos produits", "منتجاتنا"), href: ctx.shopUrl, items: ctx.products });
  const [i, setI] = useState(0);
  if (!groups.length) return null;
  const g = groups[i % groups.length];
  const go = (d: number) => setI((v) => (v + d + groups.length) % groups.length);
  return (
    <section className="sx-section sx-shelf">
      <div className="sx-wrap">
        {b.title && <h2 className="sx-shelf-title">{b.title}</h2>}
        <div className="sx-shelf-head">
          <button type="button" className="sx-arrow" onClick={() => go(-1)} aria-label={tr(ctx, "Précédent", "السابق")}>
            <Icon name="back" />
          </button>
          <a className="sx-shelf-name" href={g.href}>
            {g.name}
          </a>
          {b.text && <p>{b.text}</p>}
          <button type="button" className="sx-arrow" onClick={() => go(1)} aria-label={tr(ctx, "Suivant", "التالي")}>
            <Icon name="arrow" />
          </button>
        </div>
        <div className="sx-shelf-stage">
          <div className="sx-shelf-items">
            {g.items.slice(0, 3).map((p, k) => (
              <a key={p.id} href={productUrl(ctx.base, p)} aria-label={p.name}>
                {photo(p, art(k))}
              </a>
            ))}
          </div>
          <i className="sx-shelf-plank" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export function FilmstripSection({ b, ctx, art }: { b: SxBlock; ctx: SxCtx; art: Art }) {
  const own = (b.items || []).filter((x) => x.image);
  const video = (b.url || "").trim();
  const isLink = /^https?:\/\//i.test(video);
  return (
    <section className="sx-filmstrip" aria-label={b.title || b.button || undefined}>
      {[0, 1, 2, 3, 4].map((k) => {
        const x = own[k];
        const media = <span className="sx-fs-media">{art(k + 1, x?.title, x?.image)}</span>;
        if (k === 2)
          return (
            <a
              key={k}
              className="sx-fs-tile sx-fs-center"
              href={isLink ? video : ctx.shopUrl}
              {...(isLink ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {media}
              <span className="sx-fs-video">
                <small>{b.button || tr(ctx, "Voir la vidéo", "شوف الفيديو")}</small>
                <i aria-hidden="true">▶</i>
              </span>
            </a>
          );
        return (
          <div key={k} className="sx-fs-tile">
            {media}
            <i className="sx-fs-num" aria-hidden="true">
              <span>{String(k + 1).padStart(2, "0")}</span>
            </i>
          </div>
        );
      })}
    </section>
  );
}

export function CoverflowSection({ b, ctx, art, head }: { b: SxBlock; ctx: SxCtx; art: Art; head: React.ReactNode }) {
  const list = ctx.products.slice(0, 9);
  const [c, setC] = useState(0);
  if (!list.length) return null;
  const len = list.length;
  const offsets = len >= 5 ? [-2, -1, 0, 1, 2] : len >= 3 ? [-1, 0, 1] : len === 2 ? [0, 1] : [0];
  const at = (o: number) => (c + o + len * 4) % len;
  const cur = list[c % len];
  const go = (d: number) => setC((v) => (v + d + len) % len);
  return (
    <section className="sx-section sx-cover">
      <div className="sx-wrap">
        {b.title && head}
        <div className="sx-cover-row">
          {len > 1 && (
            <button
              type="button"
              className="sx-arrow"
              onClick={() => go(-1)}
              aria-label={tr(ctx, "Précédent", "السابق")}
            >
              <Icon name="back" />
            </button>
          )}
          <div className="sx-cover-track">
            {offsets.map((o) => {
              const p = list[at(o)];
              return (
                <a
                  key={o}
                  className={"sx-cover-item sx-cover-o" + Math.abs(o)}
                  href={productUrl(ctx.base, p)}
                  onClick={
                    o
                      ? (e) => {
                          e.preventDefault();
                          setC(at(o));
                        }
                      : undefined
                  }
                >
                  <span className="sx-cover-media">{photo(p, art(at(o)))}</span>
                  <i className="sx-cover-tick" aria-hidden="true" />
                  {o !== 0 && <small>{p.name}</small>}
                </a>
              );
            })}
          </div>
          {len > 1 && (
            <button type="button" className="sx-arrow" onClick={() => go(1)} aria-label={tr(ctx, "Suivant", "التالي")}>
              <Icon name="arrow" />
            </button>
          )}
        </div>
        <div className="sx-cover-info">
          <b>{cur.name}</b>
          <span>{[catOf(cur), price(cur.price)].filter(Boolean).join(" · ")}</span>
          <a className="sx-rpill sx-rpill-sm" href={productUrl(ctx.base, cur)}>
            {b.button || tr(ctx, "Voir le produit", "شوف المنتج")}
          </a>
        </div>
      </div>
    </section>
  );
}

export function StuddsFooter({ ctx }: { ctx: SxCtx }) {
  const { store, cfg, base, txt, shopUrl, categories, rtl } = ctx;
  const wa = whatsappDigits(cfg.whatsapp || store.workspace_whatsapp);
  const visual = ctx.products.map(img).find(Boolean);
  const round = (href: string, label: string, icon: string, external = false) => (
    <a
      className="sx-round"
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <Icon name={icon} />
    </a>
  );
  return (
    <footer className="sx-footer sx-footer-studds">
      <div className="sx-wrap">
        <div className="sx-fst-grid">
          <div className="sx-fst-brand">
            <b className="sx-footer-brand">{cfg.logo ? <img src={cfg.logo} alt={store.name} /> : store.name}</b>
            <small>{cfg.footerContent?.about || ctx.about}</small>
            <div className="sx-fst-social">
              {wa && round("https://wa.me/" + wa, "WhatsApp", "chat", true)}
              {round(base + "/contact", txt.contact, "phone")}
              {round(base + "/delivery", txt.delivery, "truck")}
              {round(shopUrl, txt.shop, "cart")}
            </div>
          </div>
          <nav>
            <b>{tr(ctx, "Général", "عام")}</b>
            <a href={base}>{txt.home}</a>
            <a href={shopUrl}>{txt.shop}</a>
            <a href={base + "/contact"}>{txt.contact}</a>
            <a href={base + "/privacy"}>{rtl ? "الخصوصية" : "Confidentialité"}</a>
          </nav>
          <nav>
            <b>{tr(ctx, "Aide", "مساعدة")}</b>
            <a href={base + "/delivery"}>{txt.delivery}</a>
            <a href={base + "/faq"}>{txt.faq}</a>
            <a href={base + "/terms"}>{rtl ? "الشروط" : "Conditions"}</a>
            <a href={base + "/returns"}>{rtl ? "الإرجاع" : "Retours"}</a>
          </nav>
          <nav>
            <b>{tr(ctx, "Produits", "المنتجات")}</b>
            <a href={shopUrl}>{tr(ctx, "Tous les produits", "جميع المنتجات")}</a>
            {categories.slice(0, 3).map((x) => (
              <a key={x.name} href={ctx.catUrl(x.name)}>
                {x.name}
              </a>
            ))}
          </nav>
          <nav>
            <b>{tr(ctx, "Infos", "معلومات")}</b>
            {ctx.trust.slice(0, 3).map((x, i) => (
              <span key={i}>{x.title}</span>
            ))}
          </nav>
          <div className="sx-fst-visual" aria-hidden="true">
            {visual && <img src={visual} alt="" loading="lazy" />}
          </div>
        </div>
        <div className="sx-fst-bottom">
          <small>
            © {new Date().getFullYear()} {store.name}
          </small>
          <small>{txt.cod}</small>
        </div>
      </div>
    </footer>
  );
}

/** Pieds de page propres à ces templates (sinon : SeriesFooter). */
export function customFooter(ctx: SxCtx): React.ReactNode | null {
  if (ctx.t.layout.footer === "kicks") return <KicksFooter ctx={ctx} />;
  if (ctx.t.layout.footer === "studds") return <StuddsFooter ctx={ctx} />;
  return null;
}
