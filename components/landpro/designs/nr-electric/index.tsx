"use client";
// Design « NR Electric » : affiche studio gris clair. Monogramme + marque espacée,
// grand titre fin, accroche avec mot en gras, grand cercle fin à deux points
// (« mobilité nouvelle génération »), 6 caractéristiques à icônes rondes à gauche,
// énorme moto au centre, 4 vues (face / profil / arrière / dessus), puis fiche
// technique, packs, formulaire, FAQ et ligne finale centrée très espacée.
// Images : 0 = hero (3/4), 1 = face, 2 = profil, 3 = arrière, 4 = dessus
// (vues de la galerie = images 1 à 4, légendes = imageLabels[0..3]).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import { Buy, discount, Go, Headline, Icon, iconAt, Img, money, OrderBox, scrollToOrder, sid, tr } from "../kit";
import "./style.css";

const FEAT_ICONS = ["bolt", "battery", "chip", "spring", "shield", "grid"];
const VIEW_LABELS: [string, string][] = [
  ["Face", "الأمام"],
  ["Profil", "الجانب"],
  ["Arrière", "الخلف"],
  ["Dessus", "الفوق"],
];

/** Monogramme : initiales des deux premiers mots, sinon deux premières lettres. */
const mono = (name: string) => {
  const w = name.trim().split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : name.trim().slice(0, 2)).toUpperCase();
};

/** Accroche : la partie mise en valeur (vm.highlight) en gras, si elle s'y trouve. */
function Tagline({ vm }: { vm: VM }) {
  const t = vm.subheadline;
  const h = vm.highlight || "";
  const i = h ? t.toLowerCase().indexOf(h.toLowerCase()) : -1;
  return (
    <p className="nr-tagline">
      {i >= 0 ? (
        <>
          {t.slice(0, i)}
          <b>{t.slice(i, i + h.length)}</b>
          {t.slice(i + h.length)}
        </>
      ) : (
        t
      )}
    </p>
  );
}

const showFeats = (vm: VM) => vm.order.includes("features") && !vm.hidden.has("features") && vm.features.length > 0;

function Header({ vm }: SectionProps) {
  return (
    <header className="nr-header">
      <div className="nr-wrap nr-header-row">
        <a
          className="nr-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <b aria-hidden="true">{mono(vm.name)}</b>
          <span>{vm.name}</span>
        </a>
        <button type="button" className="nr-head-cta" onClick={scrollToOrder}>
          {tr(vm, "Commander", "اطلب")}
          <Icon name={vm.rtl ? "back" : "arrow"} />
        </button>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const feats = showFeats(vm) ? vm.features.slice(0, 6) : [];
  return (
    <section className="nr-hero" id={sid("hero")}>
      <div className="nr-wrap nr-hero-in">
        <i className="nr-dash" aria-hidden="true" />
        <div className="nr-hero-copy">
          <Headline vm={vm} className="nr-h1" />
          {vm.show.subtitle && vm.subheadline ? <Tagline vm={vm} /> : null}
        </div>

        <div className="nr-ring" aria-hidden="true">
          <i className="nr-ring-dot nr-ring-dot-a" />
          <i className="nr-ring-dot nr-ring-dot-b" />
        </div>
        <div className="nr-ring-copy">
          {vm.eyebrow && vm.show.badge ? <h2 className="nr-ring-title">{vm.eyebrow}</h2> : null}
          <i className="nr-dash nr-dash-sm" aria-hidden="true" />
          {vm.description ? <p>{vm.description}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="nr-ring-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="nr-btn" arrow /> : null}
        </div>

        {feats.length ? (
          <ul className="nr-feats" id={sid("features")}>
            {feats.map((f, i) => (
              <li key={i}>
                <span className="nr-feat-ico">
                  <Icon name={iconAt(FEAT_ICONS, i)} />
                </span>
                <span>
                  <b>{f.title}</b>
                  {f.text ? <small>{f.text}</small> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="nr-stage">
          <Img vm={vm} i={0} className="nr-bike" />
        </div>
      </div>
    </section>
  );
}

/** Les caractéristiques sont dans le hero (comme sur l'affiche) : la section ne garde que l'ancre. */
function Features({ vm }: SectionProps) {
  return showFeats(vm) ? <span className="nr-anchor" aria-hidden="true" /> : null;
}

function Views({ vm }: SectionProps) {
  return (
    <section className="nr-views-sec" id={sid("showcase")}>
      <div className="nr-wrap">
        <div className="nr-views">
          {[0, 1, 2, 3].map((k) => (
            <figure key={k} className={"nr-view nr-view-" + k}>
              <Img
                vm={vm}
                i={vm.images.length > 1 ? 1 + k : 0}
                className="nr-view-img"
                alt={vm.imageLabels[k] || vm.name}
              />
              <figcaption>{vm.imageLabels[k] || tr(vm, VIEW_LABELS[k][0], VIEW_LABELS[k][1])}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Title({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="nr-title">
      <i className="nr-dash" aria-hidden="true" />
      <h2>{children}</h2>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="nr-sec" id={sid("specs")}>
      <div className="nr-wrap nr-specs">
        <div className="nr-specs-media">
          <Img vm={vm} i={2} className="nr-specs-img" alt="" />
        </div>
        <div>
          <Title>{vm.titles.specs}</Title>
          <dl className="nr-spec-list">
            {vm.specs.map((s, i) => (
              <div key={i}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Offers({ vm, qty, setQty }: SectionProps) {
  const d = discount(vm);
  return (
    <section className="nr-sec nr-sec-alt" id={sid("offers")}>
      <div className="nr-wrap">
        <Title
          sub={
            d ? tr(vm, `Jusqu'à -${d}% · paiement à la livraison`, `تخفيض حتى ${d}% · الدفع عند الاستلام`) : vm.delivery
          }
        >
          {vm.titles.offers}
        </Title>
        <div className="nr-offers">
          {vm.offers.map((o, i) => (
            <button
              type="button"
              key={o.qty + o.label}
              className={"nr-offer" + (o.qty === qty ? " is-on" : "")}
              onClick={() => {
                setQty(o.qty);
                scrollToOrder();
              }}
            >
              <span className="nr-offer-n">{String(i + 1).padStart(2, "0")}</span>
              {o.badge ? <span className="nr-offer-badge">{o.badge}</span> : null}
              <b className="nr-offer-label">{o.label}</b>
              <span className="nr-offer-price">{money(vm, o.price)}</span>
              {o.qty > 1 ? (
                <small>
                  {money(vm, Math.round(o.price / o.qty))} {tr(vm, "/ unité", "/ الوحدة")}
                </small>
              ) : (
                <small>{vm.delivery}</small>
              )}
              <span className="nr-offer-go">
                {tr(vm, "Choisir", "اختار")} <Icon name={vm.rtl ? "back" : "arrow"} />
              </span>
            </button>
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
      className="nr-order"
      title={vm.titles.order}
      aside={
        <>
          <Img vm={vm} i={0} className="nr-order-img" />
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <span className="nr-feat-ico">
                  <Icon name={iconAt(["truck", "cash", "shield"], i)} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="nr-sec" id={sid("faq")}>
      <div className="nr-wrap nr-faq">
        <Title>{vm.titles.faq}</Title>
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <span className="nr-faq-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="nr-faq-q">{f.question}</span>
              <Icon name="plus" />
            </summary>
            {f.answer ? <p>{f.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function Final({ vm }: SectionProps) {
  return (
    <section className="nr-final" id={sid("final_cta")}>
      <div className="nr-wrap">
        <h2>{vm.titles.final_cta}</h2>
        <p>
          <b>{vm.finalCta.title}</b>
          {vm.finalCta.text ? " " + vm.finalCta.text : ""}
        </p>
        <Buy vm={vm} className="nr-btn" arrow />
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="nr-footer">
      <div className="nr-wrap">
        <b className="nr-foot-brand">{vm.name}</b>
        <nav className="nr-foot-nav">
          <Go to="showcase">{vm.titles.showcase}</Go>
          <Go to="specs">{vm.titles.specs}</Go>
          <Go to="faq">{vm.titles.faq}</Go>
          <Go to="order">{tr(vm, "Commander", "اطلب")}</Go>
        </nav>
        <small>
          © {new Date().getFullYear()} {vm.name} · {vm.delivery}
        </small>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Jost:wght@300;400;500;600",
  font: '"Jost", system-ui, sans-serif',
  heading: '"Jost", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    showcase: (p) => <Views {...p} />,
    specs: (p) => <Specs {...p} />,
    offers: (p) => <Offers {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
