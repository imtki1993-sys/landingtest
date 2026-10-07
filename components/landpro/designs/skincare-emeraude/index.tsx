"use client";
// Design « Skincare Émeraude » : barre haute teal foncé, en-tête teal (logo rond + serif),
// hero dégradé teal avec portrait, carte d'engagements flottante, catégories en cercles,
// produits phares, bandeau offre spéciale, bande de réassurance, commande, avis, FAQ, pied teal.
//
// Plan des images (vm.images, rotation si moins de photos) :
//   0      hero (portrait)
//   1..6   cercles « catégories » (benefits)
//   7..10  cartes produits phares (variants : variante i → image 7 + i) ; 7 = visuel du formulaire
//   11     groupe de produits du bandeau offre (final_cta)
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import {
  announceParts,
  Buy,
  discount,
  Go,
  goTo,
  Headline,
  Icon,
  iconAt,
  Img,
  money,
  OrderBox,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const FEAT_ICONS = ["leaf", "drop", "flask", "rabbit"];
const TRUST_ICONS = ["truck", "shield", "swap", "headset"];

/** « Titre : texte » → [titre, texte] */
const split = (s: string): [string, string] => {
  const m = s.split(/\s+[:–—-]\s+|\s*:\s+/);
  return m.length > 1 ? [m[0], m.slice(1).join(" : ")] : [s, ""];
};

const Leaf = ({ className = "se-leaf" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19C5 10 10 5 20 4c0 9-5 15-14 15z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 19 14 10" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Titre en petites capitales espacées entre deux filets (« — SHOP BY CATEGORY — »). */
const Kicker = ({ children }: { children: React.ReactNode }) => (
  <div className="se-kicker">
    <i />
    <Leaf />
    <h2>{children}</h2>
    <Leaf />
    <i />
  </div>
);

/** Titre serif capitales + filet à feuille (« FEATURED PRODUCTS ⟵ »). */
const SerifTitle = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <div className={"se-stitle" + (center ? " se-stitle-c" : "")}>
    <h2>{children}</h2>
    <span className="se-stitle-orn">
      <Leaf />
      <i />
    </span>
  </div>
);

function navLinks(vm: SectionProps["vm"]) {
  const all: [string, string, string][] = [
    ["variants", "Boutique", "المتجر"],
    ["benefits", "Collections", "المجموعات"],
    ["features", "Ingrédients", "المكونات"],
    ["reviews", "Avis", "الآراء"],
    ["faq", "FAQ", "أسئلة"],
  ];
  return all
    .filter(([k]) => vm.order.includes(k) && !vm.hidden.has(k))
    .map(([k, fr, ar]) => ({ key: k, label: tr(vm, fr, ar) }));
}

const toTop = (e: React.MouseEvent) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function Announcement({ vm }: SectionProps) {
  const parts = announceParts(vm);
  return (
    <div className="se-top">
      <div className="se-wrap se-top-row">
        <span className="se-top-msg">
          <Icon name="truck" />
          {parts[0]}
        </span>
        <nav className="se-top-links">
          {parts.slice(1, 2).map((t, i) => (
            <span key={i} className="se-top-extra">
              {t}
            </span>
          ))}
          <Go to="order">{tr(vm, "Commander", "اطلب")}</Go>
          {vm.order.includes("faq") && !vm.hidden.has("faq") ? <Go to="faq">FAQ</Go> : null}
          {vm.whatsapp ? (
            <a href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
              {tr(vm, "Contact", "تواصل")}
            </a>
          ) : null}
        </nav>
      </div>
    </div>
  );
}

function Header({ vm, qty }: SectionProps) {
  const sub = vm.eyebrow && vm.eyebrow.length <= 26 ? vm.eyebrow : "";
  return (
    <header className="se-header">
      <div className="se-wrap se-header-row">
        <a className="se-logo" href="#" onClick={toTop}>
          <span className="se-logo-mark">
            <Icon name="spa" />
          </span>
          <span className="se-logo-txt">
            <b>{vm.name}</b>
            {sub ? <small>{sub}</small> : null}
          </span>
        </a>
        <nav className="se-nav">
          <a href="#" className="on" onClick={toTop}>
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {navLinks(vm).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <span className="se-icons">
          <button type="button" aria-label={tr(vm, "Produits", "المنتجات")} onClick={() => goTo("variants")}>
            <Icon name="search" />
          </button>
          <button type="button" aria-label={tr(vm, "Avis", "الآراء")} onClick={() => goTo("reviews")}>
            <Icon name="user" />
          </button>
          <button type="button" className="se-bag" aria-label={vm.cta} onClick={scrollToOrder}>
            <Icon name="bag" />
            <i>{qty}</i>
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="se-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="se-hero-img" />
      <div className="se-wrap se-hero-in">
        <div className="se-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="se-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="se-h1" />
          <div className="se-divider">
            <i />
            <Leaf />
            <i />
          </div>
          {vm.show.subtitle && vm.subheadline ? <p className="se-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="se-hero-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          <div className="se-hero-ctas">
            {vm.show.cta ? <Buy vm={vm} className="se-btn se-btn-dark" arrow /> : null}
            {vm.videoUrl ? (
              <a className="se-play" href={vm.videoUrl} target="_blank" rel="noopener noreferrer">
                <span>
                  <Icon name="play" />
                </span>
                {tr(vm, "Voir la vidéo", "شوف الفيديو")}
              </a>
            ) : (
              <Go to="benefits" className="se-play">
                <span>
                  <Icon name="down" />
                </span>
                {tr(vm, "Découvrir", "اكتشف")}
              </Go>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  // la carte chevauche le hero seulement quand elle le suit directement
  const shown = vm.order.filter((k) => k !== "announcement" && !vm.hidden.has(k));
  const lift = shown[shown.indexOf("features") - 1] === "hero";
  return (
    <section className={"se-feat-sec" + (lift ? " se-lift" : "")} id={sid("features")}>
      <div className="se-wrap">
        <ul className="se-feat">
          {vm.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <Icon name={iconAt(FEAT_ICONS, i)} />
              <span>
                <h3>{f.title}</h3>
                {f.text ? <p>{f.text}</p> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Categories({ vm }: SectionProps) {
  return (
    <section className="se-sec" id={sid("benefits")}>
      <div className="se-wrap">
        <Kicker>{vm.titles.benefits}</Kicker>
        <div className="se-cats">
          {vm.benefits.slice(0, 6).map((b, i) => (
            <button type="button" key={i} className="se-cat" onClick={scrollToOrder}>
              <span className="se-cat-ring">
                <Img vm={vm} i={1 + i} className="se-cat-img" alt={b.title} />
              </span>
              <b>{b.title}</b>
              <small>{b.text || tr(vm, "Découvrir", "اكتشف")}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Products({ vm, setVariant }: SectionProps) {
  const d = discount(vm);
  const tags = [
    tr(vm, "Coup de cœur", "المفضل"),
    tr(vm, "Nouveau", "جديد"),
    tr(vm, "Édition limitée", "إصدار محدود"),
    "",
  ];
  const n = vm.reviews.length;
  const avg = n ? vm.reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  return (
    <section className="se-sec se-sec-prod" id={sid("variants")}>
      <div className="se-wrap">
        <div className="se-prod-head">
          <SerifTitle>{vm.titles.variants}</SerifTitle>
          <Go to="order" className="se-pill-line">
            {tr(vm, "Commander", "اطلب")}
          </Go>
        </div>
        <div className="se-prods">
          {vm.variants.slice(0, 4).map((v, i) => {
            const tag = i === 3 ? (d ? `${tr(vm, "Promo", "تخفيض")} -${d}%` : "") : tags[i % 4];
            const pick = () => {
              setVariant(i);
              scrollToOrder();
            };
            return (
              <article key={v.name + i} className="se-prod">
                <div className="se-prod-media">
                  {tag ? <span className="se-tag">{tag}</span> : null}
                  <Img vm={vm} i={7 + i} className="se-prod-img" alt={v.name} />
                </div>
                <div className="se-prod-body">
                  <h3>{v.name}</h3>
                  {n ? (
                    <span className="se-rating">
                      <Stars n={avg} className="se-stars" />
                      <small>({n})</small>
                    </span>
                  ) : null}
                  {vm.price ? (
                    <p className="se-price">
                      <b>{money(vm, vm.price)}</b>
                      {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                    </p>
                  ) : null}
                  <div className="se-prod-row">
                    <button type="button" className="se-btn se-btn-sm" onClick={pick}>
                      <span className="se-l-full">{tr(vm, "Ajouter au panier", "زيد للسلة")}</span>
                      <span className="se-l-short">{tr(vm, "Ajouter", "زيد")}</span>
                      <Icon name={vm.rtl ? "back" : "arrow"} />
                    </button>
                    <button type="button" className="se-heart" aria-label={v.name} onClick={pick}>
                      <Icon name="heart" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Offer({ vm }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="se-offer-sec" id={sid("final_cta")}>
      <div className="se-wrap">
        <div className="se-offer">
          <Img vm={vm} i={11} className="se-offer-img" alt="" />
          <div className="se-offer-copy">
            <small>{vm.titles.final_cta}</small>
            <h2>
              {d ? tr(vm, `Profitez de -${d}% sur votre commande`, `استافد من -${d}% على طلبك`) : vm.finalCta.title}
            </h2>
            {d ? <p className="se-offer-sub">{vm.finalCta.title}</p> : null}
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
          </div>
          <button type="button" className="se-offer-cta" onClick={scrollToOrder}>
            <Icon name="gift" />
            <b>{vm.cta}</b>
            <span>
              {vm.name}
              {vm.price ? " · " + money(vm, vm.price) : ""}
            </span>
            <small>{vm.delivery}</small>
          </button>
        </div>
      </div>
    </section>
  );
}

function Trust({ vm }: SectionProps) {
  return (
    <section className="se-trust-sec" id={sid("trust")}>
      <div className="se-wrap">
        <ul className="se-trust">
          {vm.trust.slice(0, 4).map((t, i) => {
            const [a, b] = split(t);
            return (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} />
                <span>
                  <b>{a}</b>
                  {b ? <small>{b}</small> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  return (
    <OrderBox
      p={p}
      className="se-order"
      aside={
        <>
          <small className="se-order-kicker">{vm.name}</small>
          <Img vm={vm} i={7 + Math.max(0, p.variant)} className="se-order-img" />
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(TRUST_ICONS, i)} /> {split(t)[0]}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="se-sec" id={sid("reviews")}>
      <div className="se-wrap">
        <Kicker>{vm.titles.reviews}</Kicker>
        <div className="se-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article className="se-rev" key={i}>
              <Stars n={r.rating} className="se-stars" />
              <p>{r.text}</p>
              <div className="se-who">
                <span className="se-avatar">{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  <small>{r.city || tr(vm, "Cliente vérifiée", "زبونة")}</small>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="se-sec se-sec-faq" id={sid("faq")}>
      <div className="se-wrap se-faq">
        <SerifTitle center>{vm.titles.faq}</SerifTitle>
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              {f.question}
              <Icon name="plus" />
            </summary>
            {f.answer ? <p>{f.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const links = navLinks(vm);
  return (
    <footer className="se-footer">
      <div className="se-wrap">
        <div className="se-foot-grid">
          <div className="se-foot-brand">
            <a className="se-logo" href="#" onClick={toTop}>
              <span className="se-logo-mark">
                <Icon name="spa" />
              </span>
              <span className="se-logo-txt">
                <b>{vm.name}</b>
              </span>
            </a>
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
            {vm.whatsapp ? (
              <a
                className="se-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          <nav className="se-foot-col">
            <b>{tr(vm, "Boutique", "المتجر")}</b>
            {links.slice(0, 3).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
            <Go to="order">{tr(vm, "Commander", "اطلب")}</Go>
          </nav>
          <nav className="se-foot-col">
            <b>{tr(vm, "Aide", "مساعدة")}</b>
            {links.slice(3).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
            <Go to="order">{tr(vm, "Livraison", "التوصيل")}</Go>
          </nav>
          <div className="se-foot-cta">
            <b>{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</b>
            <p>{vm.delivery}</p>
            <Buy vm={vm} className="se-btn se-btn-light" arrow />
          </div>
        </div>
        <div className="se-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <small>{vm.delivery}</small>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=DM+Sans:wght@400;500;600;700",
  font: '"DM Sans", system-ui, sans-serif',
  heading: '"Fraunces", Georgia, serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    announcement: (p) => <Announcement {...p} />,
    features: (p) => <Features {...p} />,
    benefits: (p) => <Categories {...p} />,
    variants: (p) => <Products {...p} />,
    final_cta: (p) => <Offer {...p} />,
    trust: (p) => <Trust {...p} />,
    order: (p) => <Order {...p} />,
    reviews: (p) => <Reviews {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
