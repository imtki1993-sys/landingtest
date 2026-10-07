"use client";
// Design « Arctic Puffer » : bande de montagnes, en-tête mono entre crochets, hero bleu acier
// (photo plein cadre, titre condensé, tailles / coloris, bouton octogone, slider à coins coupés),
// « nouvelle collection » (carte vedette + cartes coloris), atouts, avis, commande, FAQ, bandeau tag.
//
// Images : 0 = hero (fond plein cadre) · 1… = slider du hero (toutes les photos sauf 0)
// · 3 = carte vedette · 4+i = carte du coloris i · 1 = visuel du formulaire · 2 = bandeau final.
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { asset } from "../demo-kit";
import { Buy, Go, goTo, Headline, Icon, Img, money, navOf, OrderBox, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

const ID = "arctic-puffer";
const pad = (n: number) => String(n).padStart(2, "0");
const up = (t: string) => t.toUpperCase();

/** Bouton décagone au trait avec flèche ↗ (couleur = currentColor). */
function Octa({ small }: { small?: boolean }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + Math.PI / 10;
    return `${(50 + 48 * Math.cos(a)).toFixed(1)},${(50 + 48 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg className={small ? "ap-octa ap-octa-sm" : "ap-octa"} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={small ? 1.6 : 1.1} />
      <path
        className="ap-octa-arrow"
        d="M42 58 58 42M47 42h11v11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/** Tailles lues dans la fiche technique (« Tailles : S · M · L · XL »). */
function sizesOf(vm: SectionProps["vm"]) {
  const s = vm.specs.find((x) => /taille|size|مقاس|قياس/i.test(x.label));
  return s
    ? s.value
        .split(/\s*[·,/|]\s*|\s+/)
        .filter(Boolean)
        .slice(0, 6)
    : [];
}

const shortName = (n: string) => {
  const w = n.trim().split(/\s+/);
  return w[w.length - 1] || n;
};

function Header({ vm }: SectionProps) {
  const links = [{ key: "variants", label: tr(vm, "Catalogue", "الكتالوج") }, ...navOf(vm, 4)].filter(
    (l) =>
      l.key !== "variants" || (vm.order.includes("variants") && !vm.hidden.has("variants") && vm.variants.length > 0),
  );
  return (
    <header className="ap-header">
      <img className="ap-mountains" src={asset(ID, "mountains")} alt="" aria-hidden="true" />
      <div className="ap-wrap ap-header-row">
        <a
          className="ap-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {vm.name}
        </a>
        <nav className="ap-nav">
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              [ {up(l.label)} ]
            </Go>
          ))}
        </nav>
        <span className="ap-icons">
          <button type="button" aria-label={tr(vm, "Collection", "المجموعة")} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          <button type="button" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm, variant, setVariant }: SectionProps) {
  const sizes = sizesOf(vm);
  const [size, setSize] = React.useState(sizes.length > 1 ? 1 : 0);
  const n = vm.images.length;
  const slides = n > 1 ? vm.images.length - 1 : 1;
  const [start, setStart] = React.useState(0);
  const labels = (vm.eyebrow || "")
    .split(/\s*[·|•]\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <section className="ap-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="ap-hero-bg" />
      <div className="ap-wrap ap-hero-in">
        <div className="ap-hero-copy">
          {vm.show.badge && labels.length ? (
            <p className="ap-labels">
              {labels.map((l, i) => (
                <span key={i}>[ {up(l)} ]</span>
              ))}
            </p>
          ) : null}
          <Headline vm={vm} className="ap-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="ap-lead">{vm.subheadline}</p> : null}
          <dl className="ap-opts">
            {sizes.length ? (
              <div>
                <dt>{tr(vm, "TAILLE", "المقاس")}</dt>
                <dd>
                  {sizes.map((s, i) => (
                    <button key={s + i} type="button" className={i === size ? "on" : ""} onClick={() => setSize(i)}>
                      {s}
                    </button>
                  ))}
                </dd>
              </div>
            ) : null}
            {vm.variants.length ? (
              <div>
                <dt>{tr(vm, "COLORIS", "اللون")}</dt>
                <dd>
                  {vm.variants.slice(0, 4).map((v, i) => (
                    <button
                      key={v.name + i}
                      type="button"
                      className={i === variant ? "on" : ""}
                      onClick={() => setVariant(i)}
                    >
                      {up(shortName(v.name))}
                    </button>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
          {vm.show.cta ? (
            <button type="button" className="ap-cart" onClick={scrollToOrder}>
              <Octa />
              <span>
                <small>{up(vm.cta)}</small>
                {vm.show.price && vm.price ? <b>{money(vm, vm.price)}</b> : null}
                {vm.show.price && vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            </button>
          ) : null}
        </div>
        <div className="ap-hero-side">
          <div className="ap-slides">
            {[0, 1].map((k) => (
              <button
                key={k}
                type="button"
                className="ap-slide"
                aria-label={tr(vm, "Photo suivante", "الصورة الموالية")}
                onClick={() => setStart((start + 1) % slides)}
              >
                <Img
                  vm={vm}
                  i={n > 1 ? 1 + ((start + k) % slides) : 0}
                  alt={vm.imageLabels?.[1 + ((start + k) % slides)] || vm.name}
                />
              </button>
            ))}
          </div>
          <div className="ap-count">
            <button type="button" aria-label="‹" onClick={() => setStart((start - 1 + slides) % slides)}>
              {pad(start + 1)}
            </button>
            <i>
              <em style={{ width: `${((start + 1) / slides) * 100}%` }} />
            </i>
            <button type="button" aria-label="›" onClick={() => setStart((start + 1) % slides)}>
              {pad(slides)}
            </button>
          </div>
          <div className="ap-socials">
            {vm.whatsapp ? (
              <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <Icon name="whatsapp" />
              </a>
            ) : null}
            <button type="button" aria-label={vm.titles.reviews} onClick={() => goTo("reviews")}>
              <Icon name="star" />
            </button>
            <button type="button" aria-label={vm.titles.faq} onClick={() => goTo("faq")}>
              <Icon name="chat" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Collection({ vm, setVariant }: SectionProps) {
  const sub = vm.specs.find((s) => /type|mod[eè]le|نوع/i.test(s.label))?.value || vm.name;
  const tags = vm.specs.filter((s) => !/taille|size|مقاس|قياس/i.test(s.label)).slice(0, 3);
  return (
    <section className="ap-sec ap-coll" id={sid("variants")}>
      <div className="ap-wrap">
        <div className="ap-coll-head">
          <h2 className="ap-h2">{vm.titles.variants}</h2>
          <ul className="ap-mono-list">
            <li>[ {up(vm.titles.variants)} ]</li>
            {vm.eyebrow ? <li>[ {up(vm.eyebrow.split(/\s*[·|•]\s*/)[0])} ]</li> : null}
            <li>[ {up(vm.name)} ]</li>
          </ul>
          <ul className="ap-mono-list">
            {tags.map((t, i) => (
              <li key={i}>{up(t.value)}</li>
            ))}
          </ul>
          <span className="ap-pill">
            {pad(vm.variants.length)} {tr(vm, "MODÈLES", "موديلات")}
          </span>
        </div>
        <div className="ap-grid">
          <article className="ap-feat">
            <Img vm={vm} i={3} className="ap-feat-img" alt="" />
            <div className="ap-feat-copy">
              <h3>{vm.name}</h3>
              <button type="button" className="ap-cart ap-cart-sm" onClick={scrollToOrder}>
                <Octa small />
                <span>
                  <small>{up(vm.cta)}</small>
                  {vm.price ? <b>{money(vm, vm.price)}</b> : null}
                </span>
              </button>
            </div>
          </article>
          {vm.variants.slice(0, 8).map((v, i) => (
            <button
              key={v.name + i}
              type="button"
              className="ap-card"
              onClick={() => {
                setVariant(i);
                scrollToOrder();
              }}
            >
              <span className="ap-card-ph">
                <Img vm={vm} i={4 + i} alt={v.name} />
              </span>
              <span className="ap-card-name">{up(v.name)}</span>
              <span className="ap-card-sub">{up(sub)}</span>
              <span className="ap-card-col">
                <i style={{ background: v.color || "#fff" }} />
                {up(shortName(v.name))}
              </span>
              {vm.price ? <span className="ap-card-price">{money(vm, vm.price)}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="ap-sec ap-feats" id={sid("features")}>
      <img className="ap-deco ap-deco-a" src={asset(ID, "tag-a")} alt="" aria-hidden="true" />
      <div className="ap-wrap">
        <div className="ap-sec-head">
          <span className="ap-mono">[ {pad(vm.features.length)} / SPECS ]</span>
          <h2 className="ap-h2">{vm.titles.features}</h2>
        </div>
        <div className="ap-feat-grid">
          {vm.features.slice(0, 4).map((f, i) => (
            <article key={i} className="ap-fcard">
              <span className="ap-mono">[ {pad(i + 1)} ]</span>
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="ap-sec" id={sid("reviews")}>
      <div className="ap-wrap">
        <div className="ap-sec-head">
          <span className="ap-mono">[ {tr(vm, "AVIS CLIENTS", "آراء الزبناء")} ]</span>
          <h2 className="ap-h2">{vm.titles.reviews}</h2>
        </div>
        <div className="ap-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="ap-rev">
              <div className="ap-rev-top">
                <span className="ap-mono">[ {pad(i + 1)} ]</span>
                <Stars n={r.rating} className="ap-stars" />
              </div>
              <p>{r.text}</p>
              <b>{up(r.name)}</b>
              {r.city ? <small>{up(r.city)}</small> : null}
            </article>
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
      className="ap-order"
      title={
        <>
          <span className="ap-mono">[ {tr(vm, "PAIEMENT À LA LIVRAISON", "الدفع عند الاستلام")} ]</span>
          {vm.orderTitle}
        </>
      }
      aside={
        <>
          <span className="ap-order-ph">
            <Img vm={vm} i={1} alt={vm.name} />
          </span>
          {vm.specs.length ? (
            <dl className="ap-specs">
              {vm.specs.slice(0, 5).map((s, i) => (
                <div key={i}>
                  <dt>{up(s.label)}</dt>
                  <dd>{up(s.value)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="ap-sec" id={sid("faq")}>
      <div className="ap-wrap ap-faq">
        <div className="ap-sec-head">
          <span className="ap-mono">[ FAQ ]</span>
          <h2 className="ap-h2">{vm.titles.faq}</h2>
        </div>
        <div>
          {vm.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                <span className="ap-mono">{pad(i + 1)}</span>
                <span>{f.question}</span>
                <i aria-hidden="true">[ + ]</i>
              </summary>
              {f.answer ? <p>{f.answer}</p> : null}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final({ vm, qty }: SectionProps) {
  const total = (vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping;
  return (
    <section className="ap-final" id={sid("final_cta")}>
      <img className="ap-deco ap-deco-b" src={asset(ID, "tag-b")} alt="" aria-hidden="true" />
      <div className="ap-wrap ap-final-in">
        <div>
          <span className="ap-mono">[ {up(vm.name)} ]</span>
          <h2 className="ap-h2">{vm.finalCta.title}</h2>
          {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
        </div>
        <div className="ap-final-box">
          <span>
            {up(vm.name)}
            {vm.price ? <b>{money(vm, total)}</b> : null}
          </span>
          <Buy vm={vm} className="ap-btn" arrow />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const links = [{ key: "variants", label: vm.titles.variants }, ...navOf(vm, 5)];
  return (
    <footer className="ap-footer">
      <div className="ap-wrap">
        <div className="ap-foot-grid">
          <div>
            <b className="ap-logo ap-logo-foot">{vm.name}</b>
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
          </div>
          <nav className="ap-foot-nav">
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                [ {up(l.label)} ]
              </Go>
            ))}
          </nav>
          <ul className="ap-foot-trust">
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <span className="ap-mono">{pad(i + 1)}</span> {up(t)}
              </li>
            ))}
          </ul>
        </div>
        <div className="ap-foot-bottom">
          <small>
            © {new Date().getFullYear()} {up(vm.name)}
          </small>
          <small>{up(vm.delivery)}</small>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Barlow+Condensed:wght@500;600;700;800&family=Space+Mono:wght@400;700&family=Permanent+Marker",
  font: '"Space Mono", ui-monospace, "SFMono-Regular", "DejaVu Sans Mono", Menlo, monospace',
  heading: '"Barlow Condensed", "Oswald", "Bebas Neue", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    variants: (p) => <Collection {...p} />,
    features: (p) => <Features {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
