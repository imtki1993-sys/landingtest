"use client";
// Pages internes des templates de boutique : Boutique, Produit, Livraison & paiement,
// Contact, FAQ et pages légales. Chaque template choisit sa mise en page (t.layout).
import React, { useEffect, useMemo, useState } from "react";
import {
  FaqBlock,
  Icon,
  ProductCard,
  TRUST_ICONS,
  discount,
  img,
  price,
  productUrl,
  tr,
  type SxCtx,
} from "./SeriesParts";

export interface VariantApi {
  productSelections: Record<string, Record<string, string>>;
  selectOption: (productId: string, name: string, value: string) => void;
  selectedVariant: (p: any) => any;
}

/* ───────── en-tête de page ───────── */
function PageHead({
  ctx,
  eyebrow,
  title,
  intro,
  children,
}: {
  ctx: SxCtx;
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const layout = ctx.t.layout.page;
  return (
    <header className={"sx-page-head sx-page-head-" + layout}>
      <div className="sx-wrap">
        <nav className="sx-crumbs" aria-label={tr(ctx, "Fil d'Ariane", "المسار")}>
          <a href={ctx.base}>{ctx.txt.home}</a>
          <span aria-hidden="true">/</span>
          <span>{title}</span>
        </nav>
        <div className="sx-page-head-body">
          <div>
            {eyebrow && <small className="sx-eyebrow">{eyebrow}</small>}
            <h1>{title}</h1>
          </div>
          {(intro || children) && (
            <div className="sx-page-head-side">
              {intro && <p>{intro}</p>}
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ───────── Boutique ───────── */
export function ShopPage({ ctx }: { ctx: SxCtx }) {
  const { products, categories } = ctx;
  const layout = ctx.t.layout.shop;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("featured");
  // ?q=… et ?category=… : barre de recherche et liens de catégories
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    setQ(u.get("q") || "");
    setCat(u.get("category") || "");
  }, []);
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p?.specifications?.sizes || []))).filter(Boolean) as string[],
    [products],
  );
  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p?.specifications?.colors || []))).filter(Boolean) as string[],
    [products],
  );
  const list = products
    .filter(
      (p) =>
        !q ||
        String(p.name || "")
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .filter((p) => !cat || p?.specifications?.category === cat)
    .filter((p) => !size || (p?.specifications?.sizes || []).includes(size))
    .filter((p) => !color || (p?.specifications?.colors || []).includes(color))
    .slice()
    .sort((a, z) =>
      sort === "price-asc"
        ? Number(a.price) - Number(z.price)
        : sort === "price-desc"
          ? Number(z.price) - Number(a.price)
          : sort === "name"
            ? String(a.name).localeCompare(String(z.name))
            : 0,
    );
  const reset = () => {
    setQ("");
    setCat("");
    setSize("");
    setColor("");
  };
  const search = (
    <label className="sx-field sx-field-search">
      <Icon name="search" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ctx.txt.search}
        aria-label={ctx.txt.search}
      />
    </label>
  );
  const sortSelect = (
    <select
      className="sx-select"
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      aria-label={tr(ctx, "Trier", "الترتيب")}
    >
      <option value="featured">{tr(ctx, "Sélection", "المختارة")}</option>
      <option value="price-asc">{tr(ctx, "Prix croissant", "الثمن: من الأقل")}</option>
      <option value="price-desc">{tr(ctx, "Prix décroissant", "الثمن: من الأعلى")}</option>
      <option value="name">{tr(ctx, "Nom A–Z", "الاسم")}</option>
    </select>
  );
  const chips = (
    <div className="sx-chips" role="list">
      <button type="button" className={!cat ? "active" : ""} onClick={() => setCat("")}>
        {tr(ctx, "Tout", "الكل")}
      </button>
      {categories.map((x) => (
        <button key={x.name} type="button" className={cat === x.name ? "active" : ""} onClick={() => setCat(x.name)}>
          {x.name}
        </button>
      ))}
    </div>
  );
  const count = (
    <span className="sx-count">
      {list.length} {tr(ctx, list.length > 1 ? "produits" : "produit", "منتج")}
    </span>
  );
  const grid = list.length ? (
    <div className={"sx-grid " + (layout === "topbar" ? "" : "sx-grid-3 ") + "sx-card-" + ctx.t.card}>
      {list.map((p, i) => (
        <ProductCard key={p.id} ctx={ctx} p={p} index={i} />
      ))}
    </div>
  ) : (
    <div className="sx-empty">
      <b>{tr(ctx, "Aucun produit trouvé", "ما لقينا حتى منتج")}</b>
      <button type="button" className="sx-btn" onClick={reset}>
        {tr(ctx, "Voir tous les produits", "شوف جميع المنتجات")}
      </button>
    </div>
  );
  const filterGroup = (label: string, values: string[], value: string, set: (v: string) => void) =>
    values.length > 0 && (
      <div className="sx-filter">
        <b>{label}</b>
        <div className="sx-filter-values">
          {values.map((v) => (
            <button
              key={v}
              type="button"
              className={value === v ? "active" : ""}
              onClick={() => set(value === v ? "" : v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  const title = ctx.txt.shop;
  const intro = ctx.cfg.collectionSubtitle || ctx.about;

  if (layout === "sidebar")
    return (
      <>
        <PageHead ctx={ctx} title={title} intro={intro} />
        <section className="sx-section sx-shop sx-shop-sidebar">
          <div className="sx-wrap sx-catalog-grid">
            <aside>
              {search}
              <div className="sx-filter">
                <b>{tr(ctx, "Catégorie", "التصنيف")}</b>
                <button type="button" className={"sx-filter-row" + (!cat ? " active" : "")} onClick={() => setCat("")}>
                  {tr(ctx, "Tous les produits", "جميع المنتجات")} <small>{products.length}</small>
                </button>
                {categories.map((x) => (
                  <button
                    key={x.name}
                    type="button"
                    className={"sx-filter-row" + (cat === x.name ? " active" : "")}
                    onClick={() => setCat(x.name)}
                  >
                    {x.name} <small>{x.count}</small>
                  </button>
                ))}
              </div>
              {filterGroup(tr(ctx, "Taille", "المقاس"), sizes, size, setSize)}
              {filterGroup(tr(ctx, "Couleur", "اللون"), colors, color, setColor)}
            </aside>
            <div>
              <div className="sx-shop-bar">
                {count}
                {sortSelect}
              </div>
              {grid}
            </div>
          </div>
        </section>
      </>
    );
  if (layout === "banner")
    return (
      <>
        <PageHead ctx={ctx} eyebrow={ctx.store.name} title={title} intro={intro}>
          {search}
        </PageHead>
        <section className="sx-section sx-shop sx-shop-banner">
          <div className="sx-wrap">
            <div className="sx-shop-bar">
              {chips}
              {sortSelect}
            </div>
            {(sizes.length > 0 || colors.length > 0) && (
              <div className="sx-shop-filters">
                {filterGroup(tr(ctx, "Taille", "المقاس"), sizes, size, setSize)}
                {filterGroup(tr(ctx, "Couleur", "اللون"), colors, color, setColor)}
              </div>
            )}
            {count}
            {grid}
          </div>
        </section>
      </>
    );
  return (
    <>
      <PageHead ctx={ctx} title={title} intro={intro} />
      <section className="sx-section sx-shop sx-shop-topbar">
        <div className="sx-wrap">
          <div className="sx-shop-bar">
            {search}
            {chips}
            {sortSelect}
          </div>
          {(sizes.length > 0 || colors.length > 0) && (
            <div className="sx-shop-filters">
              {filterGroup(tr(ctx, "Taille", "المقاس"), sizes, size, setSize)}
              {filterGroup(tr(ctx, "Couleur", "اللون"), colors, color, setColor)}
            </div>
          )}
          {count}
          {grid}
        </div>
      </section>
    </>
  );
}

/* ───────── Produit ───────── */
export function ProductPage({ ctx, product, api }: { ctx: SxCtx; product: any; api: VariantApi }) {
  const layout = ctx.t.layout.product;
  const variant = api.selectedVariant(product);
  const imgs: string[] = Array.isArray(product.image_urls) ? product.image_urls.filter(Boolean) : [];
  const gallery = variant?.image ? [variant.image, ...imgs.filter((x) => x !== variant.image)] : imgs;
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [variant?.image]);
  const current = gallery[active] || gallery[0] || "";
  const shownPrice = variant?.price != null ? variant.price : product.price;
  const shownCompare = variant?.compare_at_price != null ? variant.compare_at_price : product.compare_at_price;
  const off = discount({ price: shownPrice, compare_at_price: shownCompare });
  const opts: any[] = product.specifications?.options || [];
  const outOfStock = variant?.stock != null && Number(variant.stock) <= 0;
  const related = ctx.products
    .filter((p) => p.id !== product.id)
    .sort(
      (a, z) =>
        Number(z?.specifications?.category === product.specifications?.category) -
        Number(a?.specifications?.category === product.specifications?.category),
    )
    .slice(0, 4);

  const mainImage = current ? <img src={current} alt={product.name} /> : <span className="sx-art" aria-hidden="true" />;
  const thumbs =
    gallery.length > 1 ? (
      <div className="sx-thumbs">
        {gallery.map((src, i) => (
          <button
            key={src + i}
            type="button"
            className={i === active ? "active" : ""}
            onClick={() => setActive(i)}
            aria-label={tr(ctx, "Image ", "صورة ") + (i + 1)}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
    ) : null;
  const media =
    layout === "stack" ? (
      <div className="sx-pd-media sx-pd-stack">
        {gallery.length
          ? gallery.map((src, i) => <img key={src + i} src={src} alt={i ? "" : product.name} />)
          : mainImage}
      </div>
    ) : (
      <div className="sx-pd-media">
        <div className="sx-pd-main">
          {mainImage}
          {off > 0 && <em className="sx-off">-{off}%</em>}
        </div>
        {thumbs}
      </div>
    );
  const info = (
    <div className="sx-pd-info">
      {product.specifications?.category && (
        <a className="sx-eyebrow" href={ctx.catUrl(product.specifications.category)}>
          {product.specifications.category}
        </a>
      )}
      <h1>{product.name}</h1>
      <div className="sx-pd-price">
        <b>{price(shownPrice)}</b>
        {off > 0 && (
          <>
            <s>{price(shownCompare)}</s>
            <em className="sx-chip">-{off}%</em>
          </>
        )}
      </div>
      {(product.description || product.short_description) && (
        <p className="sx-pd-desc">{product.description || product.short_description}</p>
      )}
      {opts.map((o) => (
        <div className="sx-pd-option" key={o.name}>
          <b>
            {o.name}
            {api.productSelections[product.id]?.[o.name] ? " : " + api.productSelections[product.id][o.name] : ""}
          </b>
          <div>
            {(o.values || []).map((v: string) => {
              const selected = api.productSelections[product.id]?.[o.name] === v;
              return (
                <button
                  type="button"
                  key={v}
                  className={selected ? "active" : ""}
                  aria-pressed={selected}
                  onClick={() => api.selectOption(product.id, o.name, v)}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {variant && variant.stock != null && (
        <small className={"sx-pd-stock" + (outOfStock ? " out" : "")}>
          {outOfStock ? tr(ctx, "Rupture de stock", "غير متوفر") : tr(ctx, "En stock", "متوفر")}
        </small>
      )}
      <button type="button" className="sx-btn sx-pd-add" disabled={outOfStock} onClick={() => ctx.add(product)}>
        <Icon name="cart" /> {ctx.txt.add}
      </button>
      <ul className="sx-pd-trust">
        {ctx.trust.slice(0, 3).map((x, i) => (
          <li key={i}>
            <Icon name={TRUST_ICONS[i % 4]} />
            <span>
              <b>{x.title}</b>
              {x.text && <small>{x.text}</small>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <>
      <section className={"sx-section sx-pd sx-pd-" + layout}>
        <div className="sx-wrap">
          <nav className="sx-crumbs" aria-label={tr(ctx, "Fil d'Ariane", "المسار")}>
            <a href={ctx.base}>{ctx.txt.home}</a>
            <span aria-hidden="true">/</span>
            <a href={ctx.shopUrl}>{ctx.txt.shop}</a>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </nav>
          <div className="sx-pd-grid">
            {media}
            {info}
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="sx-section sx-products sx-related">
          <div className="sx-wrap">
            <div className="sx-head">
              <div>
                <h2>{tr(ctx, "Vous aimerez aussi", "غادي يعجبوك حتى هادو")}</h2>
              </div>
              <a className="sx-link" href={ctx.shopUrl}>
                {tr(ctx, "Voir tout", "شوف الكل")} <Icon name="arrow" />
              </a>
            </div>
            <div className={"sx-grid sx-card-" + ctx.t.card}>
              {related.map((p, i) => (
                <ProductCard key={p.id} ctx={ctx} p={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function NotFoundPage({ ctx }: { ctx: SxCtx }) {
  return (
    <section className="sx-section">
      <div className="sx-wrap sx-empty">
        <b>{tr(ctx, "Ce produit n'est plus disponible", "هاد المنتج ما بقاش متوفر")}</b>
        <a className="sx-btn" href={ctx.shopUrl}>
          {tr(ctx, "Voir la boutique", "شوف المتجر")} <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}

/* ───────── Livraison & paiement ───────── */
export function DeliveryPage({ ctx }: { ctx: SxCtx }) {
  const dc = ctx.cfg.deliveryContent || {};
  const points: { title: string; text?: string }[] =
    Array.isArray(dc.points) && dc.points.length
      ? dc.points.map((x: any) =>
          typeof x === "string" ? { title: x } : { title: String(x?.title || ""), text: x?.text },
        )
      : ctx.trust;
  const defaultSteps = [
    {
      title: tr(ctx, "Vous commandez", "كتطلب"),
      text: tr(
        ctx,
        "Ajoutez vos produits au panier et laissez votre nom, téléphone et ville.",
        "زيد المنتجات للسلة وخلي سميتك، التيليفون والمدينة.",
      ),
    },
    {
      title: tr(ctx, "Nous confirmons", "كنأكدو"),
      text: tr(
        ctx,
        "Notre équipe vous appelle pour confirmer la commande et l'adresse.",
        "الفريق ديالنا كيعيط ليك باش يأكد الطلب والعنوان.",
      ),
    },
    {
      title: tr(ctx, "Vous recevez et payez", "كتوصل وكتخلص"),
      text: tr(
        ctx,
        "Le livreur vous remet le colis : vous payez en espèces à la réception.",
        "الموزع كيعطيك الكولية وكتخلص كاش عند الاستلام.",
      ),
    },
  ];
  // étapes modifiables dans l'éditeur (Pages > Livraison & paiement)
  const steps: { title: string; text?: string }[] =
    Array.isArray(dc.steps) && dc.steps.some((x: any) => x?.title)
      ? dc.steps.filter((x: any) => x?.title)
      : defaultSteps;
  const trustLayout = ctx.t.trust;
  return (
    <>
      <PageHead
        ctx={ctx}
        eyebrow={ctx.store.name}
        title={dc.title || ctx.txt.delivery}
        intro={dc.intro || tr(ctx, "Tout ce qu'il faut savoir avant de commander.", "كلشي اللي خاصك تعرف قبل ما تطلب.")}
      />
      <section className={"sx-section sx-trust sx-trust-" + trustLayout}>
        <div className="sx-wrap">
          <div className="sx-trust-list">
            {points.map((x, i) => (
              <div key={i} className="sx-trust-item">
                {trustLayout === "numbered" ? (
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
      <section className="sx-section sx-steps-section">
        <div className="sx-wrap sx-showcase-grid">
          <div className="sx-showcase-copy">
            <small className="sx-eyebrow">{tr(ctx, "Comment ça marche", "كيفاش خدامة")}</small>
            <h2>{dc.stepsTitle || tr(ctx, "Paiement à la livraison, en 3 étapes", "الدفع عند الاستلام، ف3 خطوات")}</h2>
            <p>{dc.stepsText || tr(ctx, "Aucune carte bancaire n'est demandée.", "ما كنطلبو حتى بطاقة بنكية.")}</p>
          </div>
          <ol className="sx-steps">
            {steps.map((x, i) => (
              <li key={i}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>
                  <strong>{x.title}</strong>
                  <small>{x.text}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <ContactBand ctx={ctx} />
    </>
  );
}

function ContactBand({ ctx }: { ctx: SxCtx }) {
  return (
    <section className="sx-section sx-cta">
      <div className="sx-wrap sx-cta-box">
        <div>
          <h2>{tr(ctx, "Une question avant de commander ?", "عندك سؤال قبل الطلب؟")}</h2>
          <p>{tr(ctx, "Notre équipe vous répond rapidement.", "الفريق ديالنا كيجاوبك بسرعة.")}</p>
        </div>
        <a className="sx-btn sx-btn-light" href={ctx.base + "/contact"}>
          {ctx.txt.contact} <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}

/* ───────── Contact ───────── */
export function ContactPage({ ctx }: { ctx: SxCtx }) {
  const { cfg, store, txt } = ctx;
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");
  const whatsapp = String(cfg.whatsapp || "").replace(/\D/g, "");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      fd = new FormData(form);
    setState("busy");
    setError("");
    try {
      const r = await fetch("/api/store-contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          name: fd.get("name") || "Client",
          email: fd.get("email"),
          phone: fd.get("phone"),
          subject: fd.get("subject") || txt.contact,
          message: fd.get("message") || "-",
        }),
      });
      const x = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(x.error || tr(ctx, "Envoi impossible", "ما تصيفطاتش الرسالة"));
      form.reset();
      setState("sent");
    } catch (err: any) {
      setError(err?.message || "Erreur");
      setState("idle");
    }
  }
  return (
    <>
      <PageHead
        ctx={ctx}
        eyebrow={store.name}
        title={cfg.contactContent?.title || txt.contact}
        intro={
          cfg.contactContent?.intro ||
          tr(
            ctx,
            "Une question sur un produit ou votre commande ? Écrivez-nous.",
            "عندك سؤال على منتج ولا على الطلب؟ كتب لينا.",
          )
        }
      />
      <section className="sx-section sx-contact">
        <div className="sx-wrap sx-contact-grid">
          <form className="sx-contact-form" onSubmit={submit}>
            <h2>{tr(ctx, "Envoyez-nous un message", "صيفط لينا رسالة")}</h2>
            <div className="sx-form-row">
              <input name="name" required placeholder={txt.name || tr(ctx, "Nom complet", "الاسم الكامل")} />
              <input name="phone" inputMode="tel" placeholder={txt.phone || tr(ctx, "Téléphone", "الهاتف")} />
            </div>
            <input name="email" type="email" placeholder="Email" />
            <input name="subject" placeholder={tr(ctx, "Sujet", "الموضوع")} />
            <textarea name="message" required placeholder={tr(ctx, "Votre message", "الرسالة")} />
            <button type="submit" className="sx-btn" disabled={state === "busy"}>
              {state === "busy" ? "…" : tr(ctx, "Envoyer le message", "صيفط الرسالة")} <Icon name="arrow" />
            </button>
            {state === "sent" && (
              <p className="sx-form-ok" role="status">
                <Icon name="check" />{" "}
                {tr(ctx, "Message envoyé, nous vous répondons rapidement.", "تصيفطات الرسالة، غادي نجاوبوك قريب.")}
              </p>
            )}
            {error && (
              <p className="sx-form-error" role="alert">
                {error}
              </p>
            )}
          </form>
          <aside className="sx-contact-info">
            {whatsapp && (
              <a className="sx-contact-card" href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer">
                <Icon name="chat" />
                <span>
                  <b>WhatsApp</b>
                  <small>+{whatsapp}</small>
                </span>
              </a>
            )}
            {cfg.contactEmail && (
              <a className="sx-contact-card" href={"mailto:" + cfg.contactEmail}>
                <Icon name="mail" />
                <span>
                  <b>Email</b>
                  <small>{cfg.contactEmail}</small>
                </span>
              </a>
            )}
            <div className="sx-contact-card">
              <Icon name="truck" />
              <span>
                <b>{txt.delivery}</b>
                <small>
                  {tr(
                    ctx,
                    "Livraison partout au Maroc, paiement à la réception.",
                    "التوصيل لجميع المدن، والدفع عند الاستلام.",
                  )}
                </small>
              </span>
            </div>
            <a className="sx-contact-card" href={ctx.base + "/faq"}>
              <Icon name="chat" />
              <span>
                <b>{txt.faq}</b>
                <small>{tr(ctx, "Les réponses aux questions fréquentes.", "الأجوبة على الأسئلة الشائعة.")}</small>
              </span>
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ───────── FAQ ───────── */
export function FaqPage({ ctx, eyebrow, title }: { ctx: SxCtx; eyebrow?: string; title: string }) {
  const items = Array.isArray(ctx.cfg.faq) ? ctx.cfg.faq.filter((x: any) => x && x.q) : [];
  return (
    <>
      <div className="sx-faq-page">
        <FaqBlock ctx={ctx} eyebrow={eyebrow || ctx.store.name} title={title} items={items} as="h1" />
      </div>
      <ContactBand ctx={ctx} />
    </>
  );
}

/* ───────── pages légales ───────── */
export function LegalPage({ ctx, page }: { ctx: SxCtx; page: "privacy" | "terms" | "returns" }) {
  const titles = {
    privacy: tr(ctx, "Confidentialité", "الخصوصية"),
    terms: tr(ctx, "Conditions générales", "الشروط العامة"),
    returns: tr(ctx, "Retours & échanges", "الاستبدال والإرجاع"),
  };
  const custom = ctx.cfg.legalContent?.[page];
  return (
    <>
      <PageHead ctx={ctx} eyebrow={ctx.store.name} title={titles[page]} />
      <section className="sx-section sx-legal">
        <div className="sx-wrap sx-legal-body">
          {typeof custom === "string" && custom.trim() ? (
            custom.split(/\n{2,}/).map((para: string, i: number) => <p key={i}>{para}</p>)
          ) : (
            <p>
              {tr(
                ctx,
                "Cette page présente les informations de base de la boutique. Le marchand doit compléter et adapter ce contenu à son activité avant utilisation commerciale.",
                "هاد الصفحة كتوضح المعلومات الأساسية ديال المتجر. خاص صاحب المتجر يكمل ويعدل هاد المحتوى حسب النشاط ديالو قبل الاستعمال التجاري.",
              )}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export { productUrl, img };
