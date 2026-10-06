"use client";
// Header des templates de boutique : 9 mises en page (t.layout.header).
// Sur mobile, toutes se replient en logo + panier + bouton menu ; le menu
// « menu » s'ouvre aussi en plein écran sur ordinateur.
import React, { useEffect, useState } from "react";
import { Icon, tr, type SxCtx } from "./SeriesParts";

export default function SeriesHeader({
  ctx,
  page,
  cartCount,
  openCart,
}: {
  ctx: SxCtx;
  page: string;
  cartCount: number;
  openCart: () => void;
}) {
  const { store, cfg, base, txt, shopUrl, categories } = ctx;
  const layout = ctx.t.layout.header;
  const [open, setOpen] = useState(false);
  // Header collé en haut : il prend un fond et une ombre dès que la page défile
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Échap ferme le menu ; le défilement de la page est bloqué pendant qu'il est ouvert
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const section = page === "home" ? "home" : page === "shop" || page.startsWith("product/") ? "shop" : page;
  const links: { key: string; href: string; label: string }[] = [
    { key: "home", href: base, label: txt.home },
    { key: "shop", href: shopUrl, label: txt.shop },
    { key: "delivery", href: base + "/delivery", label: txt.delivery },
    { key: "contact", href: base + "/contact", label: txt.contact },
  ];
  const link = (l: (typeof links)[number], i?: number) => (
    <a
      key={l.key}
      href={l.href}
      className={section === l.key ? "active" : undefined}
      aria-current={section === l.key ? "page" : undefined}
    >
      {i !== undefined && <span className="sx-nav-num">{String(i + 1).padStart(2, "0")}</span>}
      {l.label}
    </a>
  );
  const brand = (
    <a className="sx-brand" href={base}>
      {cfg.logo ? <img src={cfg.logo} alt={store.name} /> : store.name}
    </a>
  );
  const nav = (items = links, numbered = false) => (
    <nav className="sx-nav" aria-label={tr(ctx, "Navigation", "التنقل")}>
      {items.map((l, i) => link(l, numbered ? i : undefined))}
    </nav>
  );
  const searchIcon = (
    <a className="sx-icon-btn" href={shopUrl} aria-label={txt.search}>
      <Icon name="search" />
    </a>
  );
  const cart = (withLabel = false) => (
    <button
      type="button"
      className={"sx-cart" + (withLabel ? " sx-cart-label" : "")}
      onClick={openCart}
      aria-label={txt.cart + " (" + cartCount + ")"}
    >
      <Icon name="cart" />
      {withLabel && <span>{txt.cart}</span>}
      <i>{cartCount}</i>
    </button>
  );
  const ctaBtn = (
    <a className="sx-btn sx-header-cta" href={shopUrl}>
      {tr(ctx, "Commander", "اطلب دابا")}
    </a>
  );
  const burger = (always = false) => (
    <button
      type="button"
      className={"sx-burger" + (always ? " sx-burger-always" : "")}
      aria-label={tr(ctx, "Menu", "القائمة")}
      aria-expanded={open}
      aria-controls="sx-menu-panel"
      onClick={() => setOpen(true)}
    >
      <span className="sx-burger-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {always && <b>{tr(ctx, "Menu", "القائمة")}</b>}
    </button>
  );
  const searchForm = (
    <form className="sx-header-search" action={shopUrl} method="get" role="search">
      <Icon name="search" />
      <input name="q" placeholder={txt.search} aria-label={txt.search} />
    </form>
  );

  let row: React.ReactNode;
  let before: React.ReactNode = null;
  let after: React.ReactNode = null;
  switch (layout) {
    case "centered":
      row = (
        <>
          {nav()}
          {brand}
          <div className="sx-header-actions">
            {searchIcon}
            {cart()}
            {burger()}
          </div>
        </>
      );
      break;
    case "editorial":
      row = (
        <>
          {brand}
          {nav(links, true)}
          <div className="sx-header-actions">
            <a className="sx-text-link" href={shopUrl}>
              {tr(ctx, "Rechercher", "قلب")}
            </a>
            <button type="button" className="sx-text-link sx-cart-text" onClick={openCart}>
              {txt.cart} ({cartCount})
            </button>
            {burger()}
          </div>
        </>
      );
      break;
    case "pill":
      row = (
        <div className="sx-pill">
          {brand}
          {nav()}
          <div className="sx-header-actions">
            {cart(true)}
            {burger()}
          </div>
        </div>
      );
      break;
    case "stacked":
      row = (
        <>
          {brand}
          {searchForm}
          <div className="sx-header-actions">
            {cart(true)}
            {burger()}
          </div>
        </>
      );
      after = (
        <div className="sx-header-sub">
          <div className="sx-wrap">
            {nav()}
            {categories.length > 0 && (
              <nav className="sx-header-cats" aria-label={tr(ctx, "Catégories", "التصنيفات")}>
                {categories.slice(0, 6).map((c) => (
                  <a key={c.name} href={ctx.catUrl(c.name)}>
                    {c.name}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      );
      break;
    case "menu":
      row = (
        <>
          {brand}
          <div className="sx-header-actions">
            {cart()}
            {burger(true)}
          </div>
        </>
      );
      break;
    case "split":
      row = (
        <>
          {nav(links.slice(0, 2))}
          {brand}
          <div className="sx-header-end">
            {nav(links.slice(2))}
            <div className="sx-header-actions">
              {cart()}
              {burger()}
            </div>
          </div>
        </>
      );
      break;
    case "search":
      row = (
        <>
          {brand}
          {nav()}
          {searchForm}
          <div className="sx-header-actions">
            {cart()}
            {burger()}
          </div>
        </>
      );
      break;
    case "utility":
      before = (
        <div className="sx-utility">
          <div className="sx-wrap">
            {ctx.trust.slice(0, 3).map((x, i) => (
              <span key={i}>
                <Icon name={["truck", "swap", "cash"][i]} /> {x.title}
              </span>
            ))}
          </div>
        </div>
      );
      row = (
        <>
          {brand}
          {nav()}
          <div className="sx-header-actions">
            {searchIcon}
            {cart()}
            {burger()}
          </div>
        </>
      );
      break;
    default:
      row = (
        <>
          {brand}
          {nav()}
          <div className="sx-header-actions">
            {searchIcon}
            {cart()}
            {ctaBtn}
            {burger()}
          </div>
        </>
      );
  }

  return (
    <>
      {before}
      <header className={"sx-header sx-h-" + layout + (scrolled ? " is-scrolled" : "")}>
        <div className="sx-wrap sx-header-row">{row}</div>
        {after}
      </header>
      {open && (
        <div className="sx-menu-wrap" onClick={() => setOpen(false)}>
          <div
            id="sx-menu-panel"
            className="sx-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label={tr(ctx, "Menu", "القائمة")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sx-menu-top">
              {brand}
              <button type="button" className="sx-menu-close" onClick={() => setOpen(false)} aria-label="Fermer">
                ×
              </button>
            </div>
            <nav className="sx-menu-links">
              {links.map((l, i) => (
                <a
                  key={l.key}
                  href={l.href}
                  className={section === l.key ? "active" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {l.label}
                </a>
              ))}
            </nav>
            {categories.length > 0 && (
              <div className="sx-menu-cats">
                <b>{tr(ctx, "Catégories", "التصنيفات")}</b>
                {categories.slice(0, 8).map((c) => (
                  <a key={c.name} href={ctx.catUrl(c.name)} onClick={() => setOpen(false)}>
                    {c.name}
                  </a>
                ))}
              </div>
            )}
            <div className="sx-menu-foot">
              <a href={base + "/faq"}>{txt.faq}</a>
              <span>{txt.cod}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
