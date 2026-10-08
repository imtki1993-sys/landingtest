"use client";
// Design « Bracelet citron » : en-tête à pilules (menus, logo rond centré, recherche,
// panier, menu), fiche produit (titre minuscule avec capsules citron, prix + « ajouter »,
// grande carte grise avec étiquettes flottantes, tailles et couleurs), onglets
// « collections » + carrousel de cartes (variantes), bloc « pourquoi » (caractéristiques
// + carte citron avec avis), avis, FAQ en pilules, formulaire COD, appel final citron.
//
// Images : 0 = hero (carte grise, vignette « produit de la semaine », formulaire)
//          1..5 = cartes des variantes (variante i → image 1 + i)
//          6 = visuel du formulaire de commande / appel final
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Buy, Go, goTo, Icon, Img, money, navOf, OrderBox, pic, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

/** Logo rond (anneau ouvert + point). */
const Mark = ({ className = "bl-mark" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
    <path
      d="M27.4 11.2A12 12 0 1 0 28 19.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
    <path d="M21 16a5 5 0 1 1-5-5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);

/** Double chevron du bouton « ajouter ». */
const Dbl = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" className="bl-dbl">
    <path
      d="m6 7 5 5-5 5M13 7l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const n2 = (i: number) => String(i + 1).padStart(2, "0");
const avg = (vm: SectionProps["vm"]) =>
  vm.reviews.length ? vm.reviews.reduce((a, r) => a + r.rating, 0) / vm.reviews.length : 0;

/** Menu déroulant en pilule (en-tête). */
function Drop({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={"bl-drop" + (open ? " on" : "")} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="bl-pill bl-drop-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{label}</span>
        <i className="bl-chev">
          <Icon name="down" />
        </i>
      </button>
      {open ? (
        <div className="bl-drop-menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function Logo({ vm }: { vm: SectionProps["vm"] }) {
  const words = vm.name.split(/\s+/);
  const a = words.length > 1 ? words[0] : vm.name;
  const b = words.length > 1 ? words.slice(1).join(" ") : "";
  return (
    <a
      className="bl-logo"
      href="#"
      onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      <Mark />
      <b>
        {a}
        {b ? <span>{b}</span> : null}
      </b>
    </a>
  );
}

function Header({ vm, qty, setVariant }: SectionProps) {
  const [menu, setMenu] = React.useState(false);
  const links = navOf(vm, 6);
  return (
    <header className="bl-header">
      <div className="bl-wrap bl-header-row">
        <div className="bl-header-start">
          {vm.variants.length ? (
            <Drop label={tr(vm, "bracelets", "الأساور")}>
              {vm.variants.map((v, i) => (
                <button
                  key={v.name + i}
                  type="button"
                  onClick={() => {
                    setVariant(i);
                    goTo("variants");
                  }}
                >
                  <i className="bl-dot" style={{ background: v.color || "#111" }} />
                  {v.name}
                </button>
              ))}
            </Drop>
          ) : null}
          {links.length ? (
            <Drop label={tr(vm, "infos", "معلومات")}>
              {links.map((l) => (
                <Go key={l.key} to={l.key}>
                  {l.label}
                </Go>
              ))}
            </Drop>
          ) : null}
        </div>
        <Logo vm={vm} />
        <div className="bl-header-end">
          <button type="button" className="bl-pill bl-search" onClick={() => goTo("variants")}>
            <span>{tr(vm, "rechercher…", "قلب…")}</span>
            <Icon name="search" />
          </button>
          <button type="button" className="bl-pill bl-cart" onClick={scrollToOrder} aria-label={vm.cta}>
            <span>{tr(vm, "panier", "السلة")}</span>
            <i>{qty}</i>
          </button>
          <button type="button" className="bl-menu" onClick={() => setMenu(!menu)} aria-expanded={menu}>
            <span>{tr(vm, "Menu", "القائمة")}</span>
            <svg viewBox="0 0 30 16" aria-hidden="true">
              <path d="M0 2h30M0 8h30M0 14h30" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </div>
      {menu ? (
        <nav className="bl-wrap bl-menu-panel" onClick={() => setMenu(false)}>
          {links.map((l, i) => (
            <Go key={l.key} to={l.key} className="bl-pill">
              <small>{n2(i)}</small> {l.label}
            </Go>
          ))}
          <Go to="order" className="bl-pill bl-pill-lime">
            {vm.cta}
          </Go>
        </nav>
      ) : null}
    </header>
  );
}

/** Titre : mots avant la mise en valeur / logo + capsule + suite / dernier mot en capsule. */
function Title({ vm, children }: { vm: SectionProps["vm"]; children?: React.ReactNode }) {
  const t = vm.headline;
  const h = vm.highlight || "";
  const i = h ? t.toLowerCase().indexOf(h.toLowerCase()) : -1;
  if (i < 0) {
    const words = t.split(/\s+/);
    const last = words.length > 2 ? words.pop() : "";
    return (
      <h1 className="bl-h1">
        <span className="bl-l2">
          <Mark className="bl-mark bl-h1-mark" />
          {words.join(" ")}
        </span>
        <span className="bl-l3">
          {last ? <em className="bl-cap">{last}</em> : null}
          {children}
        </span>
      </h1>
    );
  }
  const pre = t.slice(0, i).trim();
  const hl = t.slice(i, i + h.length);
  const post = t
    .slice(i + h.length)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const last = post.length > 1 ? post.pop() : "";
  return (
    <h1 className="bl-h1">
      {pre ? <span className="bl-l1">{pre}</span> : null}
      <span className="bl-l2">
        <Mark className="bl-mark bl-h1-mark" />
        <em className="bl-cap">{hl}</em> {post.join(" ")}
      </span>
      <span className="bl-l3">
        {last ? <em className="bl-cap bl-cap-2">{last}</em> : null}
        {children}
      </span>
    </h1>
  );
}

function Hero({ vm, qty, setQty, variant, setVariant }: SectionProps) {
  const [shot, setShot] = React.useState(0);
  const [tab, setTab] = React.useState(false);
  const n = Math.max(1, vm.images.length);
  const imgI = shot % n;
  const label2 = vm.specs.find((s) => /mati|metal|acier|مادة/i.test(s.label))?.value || vm.specs[1]?.value || "";
  return (
    <section className="bl-hero" id={sid("hero")}>
      <div className="bl-wrap bl-hero-grid">
        <div className="bl-hero-copy">
          <div className="bl-hero-top">
            <button
              type="button"
              className="bl-pill bl-pill-line"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {tr(vm, "retour à l'accueil", "الرجوع للرئيسية")}
            </button>
            <span className="bl-hero-ico">
              {vm.reviews.length ? (
                <button type="button" aria-label={vm.titles.reviews} onClick={() => goTo("reviews")}>
                  <Icon name="star" />
                </button>
              ) : null}
              <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
                <Icon name="play" />
              </button>
            </span>
          </div>
          <div className="bl-title-row">
            <Title vm={vm}>
              <span className="bl-week">
                <span>
                  <b>{tr(vm, "produit", "منتج")}</b> {tr(vm, "de", "ديال")}
                  <br />
                  {tr(vm, "la semaine", "السيمانة")}
                </span>
                <Img vm={vm} i={0} className="bl-week-img" alt="" />
              </span>
            </Title>
          </div>
          <div className="bl-hero-mid">
            {vm.show.subtitle && vm.subheadline ? <p className="bl-lead">{vm.subheadline}</p> : <span />}
            {vm.reviews.length ? (
              <button type="button" className="bl-avatars" onClick={() => goTo("reviews")}>
                <span className="bl-faces">
                  {vm.reviews.slice(0, 3).map((r, i) => (
                    <i key={i} className={"bl-face bl-face-" + i}>
                      {r.name.charAt(0)}
                    </i>
                  ))}
                </span>
                <small>
                  {tr(vm, "avis", "آراء")}
                  <br />
                  <b>{tr(vm, "produit", "المنتج")}</b>
                </small>
                <Icon name="plus" />
              </button>
            ) : null}
          </div>
          <div className="bl-buy-row">
            <div className="bl-buy">
              {vm.show.price && vm.price ? (
                <span className="bl-price">
                  <b>{money(vm, vm.price)}</b>
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                </span>
              ) : null}
              {vm.show.cta ? (
                <button type="button" className="bl-add" onClick={scrollToOrder}>
                  <span>{vm.cta}</span>
                  <i>
                    <Dbl />
                  </i>
                </button>
              ) : null}
            </div>
            {vm.specs.length ? (
              <ol className="bl-spec-list">
                {vm.specs.slice(0, 3).map((s, i) => (
                  <li key={i} title={s.value}>
                    {s.label}
                    <sup>{n2(i)}.</sup>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
          <div className="bl-tabs">
            <button type="button" className={"bl-tab bl-tab-wide" + (tab ? " on" : "")} onClick={() => setTab(!tab)}>
              <small>01</small> {tr(vm, "détails", "التفاصيل")}
              <i className="bl-dots">•••</i>
              <Icon name="down" />
            </button>
            {vm.reviews.length ? (
              <Go to="reviews" className="bl-tab">
                <small>02</small> {tr(vm, "avis", "الآراء")}
              </Go>
            ) : null}
            <Go to="order" className="bl-tab">
              <small>03</small> {tr(vm, "livraison", "التوصيل")}
            </Go>
          </div>
          {tab ? (
            <div className="bl-tab-panel">
              {vm.description ? <p>{vm.description}</p> : null}
              {vm.specs.length ? (
                <dl>
                  {vm.specs.map((s, i) => (
                    <div key={i}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bl-stage">
          <Img vm={vm} i={imgI} className="bl-stage-img" />
          {vm.eyebrow && vm.show.badge ? <span className="bl-tag bl-stage-tag">{vm.eyebrow}</span> : null}
          {n > 1 ? (
            <span className="bl-stage-nav">
              <button type="button" aria-label="‹" onClick={() => setShot((shot + n - 1) % n)}>
                <Icon name={vm.rtl ? "arrow" : "back"} />
              </button>
              <button type="button" aria-label="›" onClick={() => setShot((shot + 1) % n)}>
                <Icon name={vm.rtl ? "back" : "arrow"} />
              </button>
            </span>
          ) : null}
          {vm.variants[variant] ? (
            <span className="bl-float bl-float-1">
              <i />
              {vm.variants[variant].name}
            </span>
          ) : null}
          {label2 ? (
            <span className="bl-float bl-float-2">
              <i />
              {label2}
            </span>
          ) : null}
          <div className="bl-stage-bar">
            {vm.offers.length > 1 ? (
              <div className="bl-bar-box bl-sizes">
                {vm.offers.slice(0, 2).map((o) => (
                  <button
                    key={o.qty + o.label}
                    type="button"
                    className={"bl-size" + (o.qty === qty ? " on" : "")}
                    onClick={() => setQty(o.qty)}
                  >
                    <span>
                      <i />
                      {o.label}
                    </span>
                    <b>
                      <Icon name="check" />
                    </b>
                  </button>
                ))}
              </div>
            ) : null}
            {vm.variants.length ? (
              <div className="bl-bar-box bl-colors">
                {vm.variants.slice(0, 6).map((v, i) => (
                  <button
                    key={v.name + i}
                    type="button"
                    className={"bl-color" + (i === variant ? " on" : "")}
                    style={{ background: v.color || "#d9d9d9" }}
                    aria-label={v.name}
                    title={v.name}
                    onClick={() => setVariant(i)}
                  >
                    {i === variant ? <Icon name="check" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" className="bl-bar-box bl-bar-ico" aria-label={vm.cta} onClick={scrollToOrder}>
              <Icon name="bag" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Variants({ vm, setVariant }: SectionProps) {
  const [less, setLess] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const rating = avg(vm);
  const move = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const at = Math.abs(el.scrollLeft);
    const d = at >= max - 4 ? -at : el.clientWidth * 0.7;
    el.scrollBy({ left: d * (vm.rtl ? -1 : 1), behavior: "smooth" });
  };
  const side = (key: string) =>
    !vm.hidden.has(key) && vm.order.includes(key) ? (
      <Go to={key} className="bl-shop-tab">
        {vm.titles[key]}
      </Go>
    ) : (
      <span className="bl-shop-tab" />
    );
  return (
    <section className="bl-sec bl-shop" id={sid("variants")}>
      <div className="bl-wrap">
        <div className="bl-shop-tabs">
          {side("features")}
          <h2 className="bl-shop-tab on">{vm.titles.variants}</h2>
          {side(vm.reviews.length ? "reviews" : "faq")}
        </div>
        <div className="bl-shop-bar">
          <span className="bl-pill">
            {vm.variants.length} {tr(vm, "modèles", "موديلات")}
          </span>
          <button type="button" className="bl-pill bl-drop-btn" onClick={() => goTo("hero")}>
            <span>{tr(vm, "photos", "الصور")}</span>
            <i className="bl-chev">
              <Icon name="down" />
            </i>
          </button>
          <button type="button" className="bl-pill bl-pill-lime bl-less" onClick={() => setLess(!less)}>
            {less ? tr(vm, "voir plus", "شوف كثر") : tr(vm, "voir moins", "شوف قل")}
            <Icon name="up" />
          </button>
        </div>
      </div>
      <hr className="bl-rule" />
      {!less ? (
        <div className="bl-wrap bl-carousel">
          <div className="bl-track" ref={ref}>
            {vm.variants.map((v, i) => (
              <article key={v.name + i} className="bl-card">
                <button
                  type="button"
                  className="bl-card-media"
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                  aria-label={v.name}
                >
                  <Img vm={vm} i={1 + i} className="bl-card-img" alt={v.name} />
                  <span className="bl-tag">{i === 0 && vm.eyebrow ? vm.eyebrow : tr(vm, "nouveau", "جديد")}</span>
                  {v.color ? <i className="bl-card-dot" style={{ background: v.color }} /> : null}
                </button>
                <div className="bl-card-row">
                  <h3>{v.name}</h3>
                  {vm.price ? <b>{money(vm, vm.price)}</b> : null}
                </div>
                {rating ? (
                  <div className="bl-rate">
                    <i>{rating.toFixed(1)}</i>
                    <Stars n={rating} className="bl-stars" />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          {vm.variants.length > 2 ? (
            <button type="button" className="bl-next" aria-label="›" onClick={move}>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Features({ vm }: SectionProps) {
  const [open, setOpen] = React.useState(-1);
  const quote = vm.reviews.length && !vm.hidden.has("reviews") && vm.order.includes("reviews") ? vm.reviews[0] : null;
  return (
    <section className="bl-sec bl-why" id={sid("features")}>
      <div className="bl-wrap bl-why-grid">
        <div className="bl-why-main">
          <span className="bl-pill bl-pill-line bl-pill-sm">{tr(vm, "mode & service", "الستيل والخدمة")}</span>
          <h2 className="bl-h2">{vm.titles.features}</h2>
          {vm.description ? <p className="bl-muted-p">{vm.description}</p> : null}
          {vm.faq.length && !vm.hidden.has("faq") ? (
            <Go to="faq" className="bl-more">
              {tr(vm, "en savoir plus.", "عرف كثر.")}
            </Go>
          ) : null}
          {vm.benefits.length ? (
            <div className="bl-acc">
              {vm.benefits.slice(0, 4).map((b, i) => (
                <div key={i} className={"bl-acc-item" + (open === i ? " on" : "")}>
                  <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                    <span>{b.title}</span>
                    {i === 0 ? <i className="bl-dots">•••</i> : null}
                    {i === 1 ? <i className="bl-know">{tr(vm, "à savoir", "عرف")}</i> : null}
                    <Icon name={i === 2 ? "plus" : "down"} />
                  </button>
                  {open === i && b.text ? <p>{b.text}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <ol className="bl-feat-list">
          {vm.features.slice(0, 5).map((f, i) => (
            <li key={i}>
              <small>{n2(i)}</small>
              <span>
                <b>{f.title}</b>
                {f.text ? <em>{f.text}</em> : null}
              </span>
              <button type="button" aria-label={f.title} onClick={scrollToOrder}>
                <Icon name="up" />
              </button>
            </li>
          ))}
        </ol>
        {quote ? (
          <figure className="bl-lime">
            <Mark className="bl-mark bl-lime-mark" />
            <span className="bl-q">❝</span>
            <blockquote>{quote.text}</blockquote>
            <span className="bl-q bl-q-end">❞</span>
            <figcaption>
              <Go to="reviews">
                {vm.reviews.length} {tr(vm, "avis", "رأي")} <Icon name="down" />
              </Go>
            </figcaption>
          </figure>
        ) : (
          <div className="bl-lime">
            <Mark className="bl-mark bl-lime-mark" />
            <blockquote>{vm.finalCta.title}</blockquote>
            <Buy vm={vm} className="bl-add bl-add-dark" />
          </div>
        )}
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  const lead = !vm.hidden.has("features") && vm.order.includes("features") && vm.features.length;
  const list = lead && vm.reviews.length > 1 ? vm.reviews.slice(1) : vm.reviews;
  return (
    <section className="bl-sec bl-revs-sec" id={sid("reviews")}>
      <div className="bl-wrap bl-revs">
        <div className="bl-revs-list">
          {list.map((r, i) => (
            <article key={i} className="bl-rev">
              <div className="bl-rev-who">
                <span>{r.name}</span>
                <i className="bl-verified">
                  <Icon name="check" /> {r.city || tr(vm, "client vérifié", "زبون")}
                </i>
                <Stars n={r.rating} className="bl-rev-stars" />
              </div>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
        <div className="bl-try">
          <h2 className="bl-h3">
            {vm.titles.reviews} <span>.{tr(vm, "essayez le vôtre", "جرب ديالك")}</span>
          </h2>
          <button type="button" className="bl-plus" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="plus" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Faq({ vm }: SectionProps) {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="bl-sec bl-faq-sec" id={sid("faq")}>
      <div className="bl-wrap bl-faq">
        <div>
          <span className="bl-pill bl-pill-line bl-pill-sm">{tr(vm, "aide", "مساعدة")}</span>
          <h2 className="bl-h2">{vm.titles.faq}</h2>
        </div>
        <div className="bl-acc">
          {vm.faq.map((f, i) => (
            <div key={i} className={"bl-acc-item" + (open === i ? " on" : "")}>
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>
                  <small>{n2(i)}</small> {f.question}
                </span>
                <Icon name="down" />
              </button>
              {open === i && f.answer ? <p>{f.answer}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="bl-order"
      aside={
        <div className="bl-order-card">
          <Img vm={vm} i={6} className="bl-order-img" alt="" />
          {vm.eyebrow ? <span className="bl-tag bl-stage-tag">{vm.eyebrow}</span> : null}
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <i />
                {t}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function Final({ vm, qty }: SectionProps) {
  const total = vm.offers.find((o) => o.qty === qty)?.price ?? vm.price * qty;
  return (
    <section className="bl-sec bl-final-sec" id={sid("final_cta")}>
      <div className="bl-wrap">
        <div className="bl-final">
          <div className="bl-final-copy">
            <Mark className="bl-mark bl-lime-mark" />
            <h2 className="bl-h2">{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
            <div className="bl-final-form">
              <span>
                {vm.name}
                {vm.price ? <b>{money(vm, total)}</b> : null}
              </span>
              <button type="button" className="bl-add bl-add-dark" onClick={scrollToOrder}>
                <span>{vm.cta}</span>
                <i>
                  <Dbl />
                </i>
              </button>
            </div>
          </div>
          <img className="bl-final-img" src={pic(vm, 0)} alt="" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="bl-footer">
      <div className="bl-wrap bl-foot">
        <Logo vm={vm} />
        <nav>
          {navOf(vm, 6).map((l) => (
            <Go key={l.key} to={l.key} className="bl-pill">
              {l.label}
            </Go>
          ))}
        </nav>
        {vm.whatsapp ? (
          <a
            className="bl-pill bl-pill-lime"
            href={`https://wa.me/${vm.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
        ) : null}
      </div>
      <div className="bl-wrap bl-foot-bottom">
        <small>
          © {new Date().getFullYear()} {vm.name}
        </small>
        <small>{vm.delivery}</small>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Urbanist:wght@300;400;500;600;700",
  font: '"Urbanist", "Inter", system-ui, sans-serif',
  heading: '"Urbanist", "Inter", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    variants: (p) => <Variants {...p} />,
    features: (p) => <Features {...p} />,
    reviews: (p) => <Reviews {...p} />,
    faq: (p) => <Faq {...p} />,
    order: (p) => <Order {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
