"use client";
// Galerie des templates de boutique par séries, avec aperçu réel de chaque
// template (rendu par SeriesStore avec les produits du marchand).
// Utilisée à la création d'une boutique et dans l'éditeur (onglet Design).
import React, { useEffect, useRef, useState } from "react";
import SeriesStore from "./SeriesStore";
import { STORE_SERIES, getStoreTemplate, seedStoreSettings, type StoreTemplate } from "../../lib/store-templates";

const DEMO_NAMES = [
  "Produit vedette",
  "Nouveauté",
  "Best-seller",
  "Édition limitée",
  "Classique",
  "Essentiel",
  "Coup de cœur",
  "Signature",
];

function demoProducts(products: any[] | undefined) {
  const real = (products || []).filter((p) => p && p.id).slice(0, 12);
  if (real.length) return real.map((p) => ({ ...p, slug: p.slug || p.id }));
  return DEMO_NAMES.map((name, i) => ({
    id: "demo-" + i,
    slug: "demo-" + i,
    name,
    price: 149 + i * 50,
    compare_at_price: i % 3 === 0 ? 199 + i * 50 : null,
    image_urls: [],
    specifications: { category: ["Collection", "Nouveautés", "Accessoires"][i % 3] },
  }));
}

const NO_VARIANTS = { productSelections: {}, selectOption: () => {}, selectedVariant: () => null };

const TXT = {
  fr: {
    home: "Accueil",
    shop: "Boutique",
    delivery: "Livraison",
    contact: "Contact",
    faq: "FAQ",
    cart: "Panier",
    add: "Ajouter au panier",
    search: "Rechercher un produit...",
    cod: "Paiement à la livraison",
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    delivery: "التوصيل",
    contact: "تواصل معنا",
    faq: "الأسئلة",
    cart: "السلة",
    add: "أضف للسلة",
    search: "قلب على منتوج...",
    cod: "الدفع عند الاستلام",
  },
};

/** Rendu réduit d'un template (largeur de bureau, mis à l'échelle du conteneur). */
export function TemplatePreview({
  t,
  products,
  locale = "fr",
  name,
  width = 1280,
  full = false,
}: {
  t: StoreTemplate;
  products?: any[];
  locale?: string;
  name?: string;
  width?: number;
  /** true : toute la page est visible (hauteur du contenu) ; sinon vignette 16/10 */
  full?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const [contentH, setContentH] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => {
      setScale(el.clientWidth / width);
      if (inner.current) setContentH(inner.current.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [width]);
  const rtl = locale === "ar" || locale === "darija";
  const store = { name: name || t.name, slug: "apercu", locale, template_id: t.id };
  const cfg = seedStoreSettings(t, locale);
  return (
    <div
      ref={box}
      className="sx-preview"
      style={full ? { height: contentH ? contentH * scale : 600 } : { aspectRatio: "16 / 10" }}
    >
      <div
        ref={inner}
        className="sx-preview-inner"
        style={{ width, transform: `scale(${scale})` }}
        aria-hidden="true"
        inert
      >
        <SeriesStore
          t={t}
          store={store}
          cfg={cfg}
          products={demoProducts(products)}
          page="home"
          rtl={rtl}
          base="#"
          txt={rtl ? TXT.ar : TXT.fr}
          variants={NO_VARIANTS}
          cartCount={0}
          openCart={() => {}}
          add={() => {}}
        />
      </div>
    </div>
  );
}

export default function TemplateGallery({
  value,
  onChange,
  products,
  locale = "fr",
  storeName,
}: {
  value?: string;
  onChange: (id: string) => void;
  products?: any[];
  locale?: string;
  storeName?: string;
}) {
  const [series, setSeries] = useState(STORE_SERIES[0]?.id || 1);
  const [preview, setPreview] = useState("");
  const list = STORE_SERIES.find((s) => s.id === series)?.templates || [];
  const pt = getStoreTemplate(preview);
  return (
    <div className="sx-gallery">
      <div className="sx-gallery-tabs" role="tablist">
        {STORE_SERIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={series === s.id}
            className={series === s.id ? "active" : ""}
            onClick={() => setSeries(s.id)}
          >
            {s.label} <small>{s.templates.length}</small>
          </button>
        ))}
      </div>
      <div className="sx-gallery-grid">
        {list.map((t) => (
          <article key={t.id} className={"sx-gallery-card" + (value === t.id ? " selected" : "")}>
            {/* div et non <button> : l'aperçu contient des liens et des boutons (HTML invalide sinon) */}
            <div
              role="button"
              tabIndex={0}
              className="sx-gallery-thumb"
              onClick={() => setPreview(t.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPreview(t.id))}
              title="Aperçu"
              aria-label={"Aperçu du template " + t.name}
            >
              <TemplatePreview t={t} products={products} locale={locale} name={storeName} />
              <span>Aperçu</span>
            </div>
            <button type="button" className="sx-gallery-select" onClick={() => onChange(t.id)}>
              <span className="sx-gallery-swatches" aria-hidden="true">
                {[t.theme.primary, t.theme.accent, t.theme.dark, t.theme.bg].map((c, i) => (
                  <i key={i} style={{ background: c }} />
                ))}
              </span>
              <b>{t.name}</b>
              <small>{t.niche}</small>
              <em>{t.folder}</em>
              {value === t.id && <strong>✓ Sélectionné</strong>}
            </button>
          </article>
        ))}
      </div>
      {pt && (
        <div className="sx-gallery-modal" onClick={() => setPreview("")}>
          <div onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <b>{pt.name}</b>
                <small>
                  {pt.niche} · {pt.folder}
                </small>
              </div>
              <button type="button" onClick={() => setPreview("")} aria-label="Fermer">
                ×
              </button>
            </header>
            <div className="sx-gallery-modal-body">
              <TemplatePreview t={pt} products={products} locale={locale} name={storeName} full />
            </div>
            <footer>
              <span>{pt.description}</span>
              <button
                type="button"
                className="store-wizard-next"
                onClick={() => {
                  onChange(pt.id);
                  setPreview("");
                }}
              >
                Utiliser ce template
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
