"use client";
// Design « Gander Orange » : agence noire + halo orange. En-tête en pilules (menu, heure
// du Maroc, logo centré, chat, CTA), hero avec grand mot-marque derrière le portrait
// détouré, carte « commande » vitrée, panneau de chiffres en police pixel, nid de cercles
// (avantages), vues produit, caractéristiques, packs, avis, formulaire COD, FAQ, CTA final.
// Images : 0 = portrait détouré (hero), 1 = face (commande, CTA), 2 = profil, 3 = vue 3/4
// (vues produit : 1, 2, 3 ; mini-avatars du hero : 1, 2, 3).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import {
  Buy,
  Go,
  goTo,
  Headline,
  Icon,
  iconAt,
  Img,
  money,
  navOf,
  OrderBox,
  scrollToOrder,
  sid,
  Stars,
  tr,
} from "../kit";
import "./style.css";

const BENEFIT_ICONS = ["headset", "eye", "spa", "battery", "bolt", "box"];
const FEATURE_ICONS = ["eye", "headset", "target", "spa"];
const PANEL_ICONS = ["headset", "eye", "bolt"];

/** Mot-marque géant : premier mot du nom, en capitales. */
const wordOf = (vm: VM) => (vm.name.split(/\s+/)[0] || vm.name).toUpperCase();

/** Chiffres mis en valeur (orange) dans un titre. */
function Digits({ text }: { text: string }) {
  const parts = text.split(/(\d[\d.,]*\s?[%+h°]?)/);
  return (
    <>
      {parts.map((t, i) =>
        i % 2 ? (
          <em key={i} className="go-or">
            {t}
          </em>
        ) : (
          <React.Fragment key={i}>{t}</React.Fragment>
        ),
      )}
    </>
  );
}

/** Logo : petite marque orange (losanges décalés). */
const Mark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 32" aria-hidden="true">
    <path d="M20 2 34 16l-6 6-8-8-8 8-6-6z" fill="currentColor" />
    <path d="M20 18l6 6-6 6-6-6z" fill="currentColor" opacity=".75" />
  </svg>
);

/** Heure locale (Maroc), mise à jour chaque minute — rendue après le montage. */
function Clock({ vm }: { vm: VM }) {
  const [t, setT] = React.useState("");
  React.useEffect(() => {
    const f = () => {
      try {
        setT(
          new Date().toLocaleTimeString("fr-FR", { timeZone: "Africa/Casablanca", hour: "2-digit", minute: "2-digit" }),
        );
      } catch {
        setT(new Date().toTimeString().slice(0, 5));
      }
    };
    f();
    const id = window.setInterval(f, 30000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="go-clock">
      / {tr(vm, "Maroc", "المغرب")}
      {t ? " – " : ""}
      <b dir="ltr">{t}</b>
    </span>
  );
}

/** Bouton « Discuter » : WhatsApp si le numéro existe, sinon la FAQ. */
function Chat({ vm, className, label = true }: { vm: VM; className: string; label?: boolean }) {
  const inner = (
    <>
      {label ? <span>{tr(vm, "Discuter avec nous", "تواصل معنا")}</span> : null}
      <i className="go-chev">
        <Icon name={vm.rtl ? "back" : "arrow"} />
      </i>
    </>
  );
  return vm.whatsapp ? (
    <a className={className} href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <button type="button" className={className} onClick={() => goTo("faq")}>
      {inner}
    </button>
  );
}

function Header({ vm }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  const links = navOf(vm, 6);
  return (
    <header className="go-header">
      <div className="go-header-row">
        <div className="go-header-start">
          <button type="button" className="go-pill go-menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name={open ? "close" : "menu"} />
            <span>{tr(vm, "Menu", "القائمة")}</span>
          </button>
          <Clock vm={vm} />
          {open ? (
            <nav className="go-dropdown" onClick={() => setOpen(false)}>
              {links.map((l) => (
                <Go key={l.key} to={l.key}>
                  {l.label}
                </Go>
              ))}
            </nav>
          ) : null}
        </div>
        <a
          className="go-logo"
          href="#"
          aria-label={vm.name}
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <Mark />
        </a>
        <div className="go-header-end">
          <span className="go-chat-ico" aria-hidden="true">
            <Icon name="chat" />
          </span>
          <Chat vm={vm} className="go-pill go-chat" />
          <Buy vm={vm} className="go-pill go-start" />
        </div>
      </div>
    </header>
  );
}

function Hero({ vm, variant, setVariant }: SectionProps) {
  const word = wordOf(vm);
  const top = vm.stats[0];
  return (
    <section className="go-hero" id={sid("hero")}>
      <div className="go-stage">
        <div className="go-glow" aria-hidden="true" />
        <div className="go-grid" aria-hidden="true" />
        <div className="go-word" dir="ltr" style={{ ["--n" as string]: Math.max(word.length, 4) }} aria-hidden="true">
          {word}
          <small className="go-year">{new Date().getFullYear()}</small>
          {top ? (
            <small className="go-happy">
              {top.value} {top.label}
            </small>
          ) : null}
        </div>
        <Img vm={vm} i={0} className="go-figure" />
      </div>

      <div className="go-hero-start">
        <div className="go-avatars">
          <span className="go-faces">
            {[1, 2, 3].map((i) => (
              <Img key={i} vm={vm} i={i} alt="" />
            ))}
          </span>
          <span>
            <b>{top ? `${top.value} ${top.label}` : vm.name}</b>
            <small>{vm.eyebrow && vm.show.badge ? vm.eyebrow : vm.trust[0]}</small>
          </span>
        </div>
        <div className="go-h1-row">
          <Headline vm={vm} className="go-h1" />
          <small className="go-scroll">({tr(vm, "Défiler", "انزل")})</small>
        </div>
        {vm.show.cta ? (
          <div className="go-ctas">
            <Buy vm={vm} className="go-btn" />
            <Chat vm={vm} className="go-btn-dark" />
          </div>
        ) : null}
      </div>

      <div className="go-hero-end">
        {vm.show.subtitle && vm.subheadline ? <p className="go-lead">{vm.subheadline}</p> : null}
        <Go to="features" className="go-ulink">
          {tr(vm, "Comment ça marche ?", "كيفاش خدام؟")}
        </Go>
        <div className="go-card">
          <h3>{vm.orderTitle}</h3>
          <p>{vm.delivery}</p>
          <div className="go-dots">
            {vm.variants.length
              ? vm.variants.slice(0, 4).map((v, i) => (
                  <button
                    key={v.name + i}
                    type="button"
                    className={"go-dot" + (i === variant ? " go-on" : "")}
                    title={v.name}
                    aria-label={v.name}
                    onClick={() => setVariant(i)}
                  >
                    <i style={{ background: v.color || "#333" }} />
                  </button>
                ))
              : ["truck", "cash", "shield"].map((n, i) => (
                  <span key={n} className={"go-dot" + (i === 0 ? " go-on" : "")}>
                    <Icon name={n} />
                  </span>
                ))}
          </div>
          <button type="button" className="go-field" onClick={scrollToOrder}>
            <span>
              {vm.name}
              {vm.show.price && vm.price ? (
                <>
                  {" · "}
                  <b>{money(vm, vm.price)}</b>
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                </>
              ) : null}
            </span>
            <i className="go-arrow">
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </i>
          </button>
        </div>
      </div>
    </section>
  );
}

function Stats({ vm }: SectionProps) {
  const words = vm.description.split(/\s+/).filter(Boolean);
  const cut = Math.ceil(words.length * 0.5);
  const nums = vm.stats.length >= 4 ? vm.stats.slice(1, 4) : vm.stats.slice(0, 3);
  return (
    <section className="go-sec" id={sid("stats")}>
      <div className="go-wrap">
        <div className="go-panel">
          <div className="go-panel-top">
            <div className="go-panel-side">
              <p className="go-globe">
                <Icon name="globe" />
                <span>{vm.titles.stats}</span>
              </p>
              <div className="go-socials" aria-hidden="true">
                {PANEL_ICONS.map((n, i) => (
                  <span key={n} className={i === 0 ? "go-on" : ""}>
                    <Icon name={n} />
                  </span>
                ))}
              </div>
            </div>
            {words.length ? (
              <p className="go-statement">
                {words.slice(0, cut).join(" ")} <span>{words.slice(cut).join(" ")}</span>
              </p>
            ) : null}
          </div>
          <div className="go-nums">
            {nums.map((s, i) => (
              <div key={i} className="go-num">
                <b dir="ltr">{s.value}</b>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Position des cercles en escalier (1, 2, 3 par ligne). */
const HONEY = [
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 1],
  [3, 2],
  [3, 3],
];

function Benefits({ vm }: SectionProps) {
  return (
    <section className="go-sec go-partners" id={sid("benefits")}>
      <div className="go-wrap go-partners-in">
        <div className="go-years">
          <h2>
            <Digits text={vm.titles.benefits} />
          </h2>
          <small>{tr(vm, "ce qui fait la différence", "اللي كيدير الفرق")}</small>
        </div>
        <span className="go-vline" aria-hidden="true" />
        <div className="go-honey">
          {vm.benefits.slice(0, 6).map((b, i) => (
            <div key={i} className="go-cell" style={{ gridRow: HONEY[i][0], gridColumn: HONEY[i][1] }}>
              <Icon name={iconAt(BENEFIT_ICONS, i)} />
              <b>{b.title}</b>
              {b.text ? <small>{b.text}</small> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase({ vm }: SectionProps) {
  const n = Math.min(3, Math.max(1, vm.images.length - 1));
  return (
    <section className="go-sec" id={sid("showcase")}>
      <div className="go-wrap">
        <div className="go-head">
          <h2 className="go-h2">{vm.titles.showcase}</h2>
          <Buy vm={vm} className="go-btn-dark" arrow />
        </div>
        <div className="go-views" style={{ ["--n" as string]: n }}>
          {Array.from({ length: n }, (_, k) => k + 1).map((i) => (
            <figure key={i} className="go-view">
              <Img vm={vm} i={i} className="go-view-img" alt={vm.imageLabels[i] || vm.name} />
              <span className="go-pix go-view-n" dir="ltr">
                0{i}
              </span>
              {vm.imageLabels[i] ? (
                <figcaption>
                  <i />
                  {vm.imageLabels[i]}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="go-sec" id={sid("features")}>
      <div className="go-wrap go-feat">
        <div className="go-feat-head">
          <h2 className="go-h2">{vm.titles.features}</h2>
          {vm.story.title ? <p>{vm.story.title}</p> : null}
          <Buy vm={vm} className="go-btn" />
        </div>
        <ol className="go-feat-list">
          {vm.features.map((f, i) => (
            <li key={i}>
              <span className="go-pix" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="go-feat-ico">
                <Icon name={iconAt(FEATURE_ICONS, i)} />
              </span>
              <div>
                <h3>{f.title}</h3>
                {f.text ? <p>{f.text}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Offers({ vm, qty, setQty }: SectionProps) {
  return (
    <section className="go-sec" id={sid("offers")}>
      <div className="go-wrap">
        <div className="go-head">
          <h2 className="go-h2">{vm.titles.offers}</h2>
          <p className="go-head-note">{vm.delivery}</p>
        </div>
        <div className="go-offers" style={{ ["--n" as string]: Math.min(vm.offers.length, 4) }}>
          {vm.offers.slice(0, 4).map((o) => (
            <article key={o.qty + o.label} className={"go-offer" + (o.qty === qty ? " go-on" : "")}>
              <div className="go-offer-top">
                <span>
                  <i />
                  {o.label}
                </span>
                {o.badge ? <em>{o.badge}</em> : null}
              </div>
              <b className="go-offer-price">{money(vm, o.price)}</b>
              {o.qty > 1 ? (
                <small>
                  {money(vm, Math.round(o.price / o.qty))} / {tr(vm, "unité", "الوحدة")}
                </small>
              ) : vm.oldPrice ? (
                <small>
                  <s>{money(vm, vm.oldPrice)}</s>
                </small>
              ) : (
                <small>{vm.trust[0]}</small>
              )}
              <button
                type="button"
                className={o.qty === qty ? "go-btn" : "go-btn-dark"}
                onClick={() => {
                  setQty(o.qty);
                  scrollToOrder();
                }}
              >
                <span>{tr(vm, "Choisir", "اختار")}</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="go-sec" id={sid("reviews")}>
      <div className="go-wrap">
        <div className="go-head">
          <h2 className="go-h2">{vm.titles.reviews}</h2>
        </div>
        <div className="go-revs">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <article key={i} className="go-rev">
              <Stars n={r.rating} className="go-stars" />
              <p>{r.text}</p>
              <div className="go-who">
                <span>{r.name.charAt(0)}</span>
                <span>
                  <b>{r.name}</b>
                  <small>{r.city || tr(vm, "Client vérifié", "زبون")}</small>
                </span>
              </div>
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
      className="go-order"
      aside={
        <div className="go-order-card">
          <div className="go-order-media">
            <Img vm={vm} i={1} className="go-order-img" />
          </div>
          {vm.specs.length ? (
            <dl className="go-specs">
              {vm.specs.slice(0, 5).map((s, i) => (
                <div key={i}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <ul className="go-order-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="go-sec" id={sid("faq")}>
      <div className="go-wrap go-faq">
        <div className="go-faq-head">
          <h2 className="go-h2">{vm.titles.faq}</h2>
          <Chat vm={vm} className="go-btn-dark" />
        </div>
        <div className="go-faq-list">
          {vm.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                <span>{f.question}</span>
                <i>
                  <Icon name="plus" />
                </i>
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
    <section className="go-sec" id={sid("final_cta")}>
      <div className="go-wrap">
        <div className="go-final">
          <div className="go-final-copy">
            <h2>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
          </div>
          <div className="go-card go-final-card">
            <h3>{vm.name}</h3>
            <p>{vm.delivery}</p>
            <button type="button" className="go-field" onClick={scrollToOrder}>
              <span>
                {vm.cta}
                {vm.price ? (
                  <>
                    {" · "}
                    <b>{money(vm, total)}</b>
                  </>
                ) : null}
              </span>
              <i className="go-arrow">
                <Icon name={vm.rtl ? "back" : "arrow"} />
              </i>
            </button>
          </div>
          <Img vm={vm} i={3} className="go-final-img" alt="" />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="go-footer">
      <div className="go-wrap">
        <div className="go-foot-top">
          <span className="go-foot-brand">
            <Mark className="go-foot-mark" />
            <b>{vm.name}</b>
          </span>
          <nav className="go-foot-nav">
            {navOf(vm, 6).map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          <Buy vm={vm} className="go-pill go-start" />
        </div>
        <div
          className="go-foot-word"
          dir="ltr"
          style={{ ["--n" as string]: Math.max(wordOf(vm).length, 4) }}
          aria-hidden="true"
        >
          {wordOf(vm)}
        </div>
        <div className="go-foot-bottom">
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
  fonts: "family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600&family=VT323",
  font: '"Inter", system-ui, sans-serif',
  heading: '"Inter", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    stats: (p) => <Stats {...p} />,
    benefits: (p) => <Benefits {...p} />,
    showcase: (p) => <Showcase {...p} />,
    features: (p) => <Features {...p} />,
    offers: (p) => <Offers {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
