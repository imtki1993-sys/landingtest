"use client";
// Design « Orbite Rétro » : univers rétro-futuriste crème / orange brûlé / brun.
// En-tête (logo à cercles, menu centré, pastille orange), hero au grand titre condensé
// et disque orange avec orbites, bande sombre « à propos » + chiffres, fonctions en
// 4 colonnes, bande « performances » (barres %) + étapes, vignettes vidéo, avis,
// formulaire, FAQ, bandeau orange et pied de page sombre.
//
// Images : 0 = hero (dans le disque orange) · 1–5 = vignettes « séances » ·
// 6 = illustration « à propos » · 7 = arche (bande performances) · 8 = produit (commande).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import { Buy, Go, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, tr } from "../kit";
import "./style.css";

const FEAT_ICONS = ["sun", "eye", "target", "cube", "film", "sparkle", "globe", "bolt"];
const STEP_ICONS = ["cart", "phone", "truck", "cash", "check"];
const TRUST_ICONS = ["truck", "cash", "swap", "headset"];

/** Logo : cercles concentriques. */
const Mark = () => (
  <svg className="or-mark" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="24" cy="24" r="7" fill="currentColor" />
  </svg>
);

/** Ornement étoile (séparateurs). */
const Spark = ({ className = "or-spark" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 0c.7 7.6 4.4 11.3 12 12-7.6.7-11.3 4.4-12 12-.7-7.6-4.4-11.3-12-12C7.6 11.3 11.3 7.6 12 0z"
      fill="currentColor"
    />
  </svg>
);

/** Titre de section « — TITRE — ». */
const Kicker = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={"or-kicker " + className}>
    <i aria-hidden="true" />
    <span>{children}</span>
    <i aria-hidden="true" />
  </h2>
);

/** Grand titre : la ponctuation finale passe en orange, la partie mise en valeur aussi. */
function BigTitle({ vm }: { vm: VM }) {
  const t = vm.headline.trim();
  const m = t.match(/^([\s\S]*?)([.!?…؟]+)$/);
  const body = m ? m[1] : t;
  const end = m ? m[2] : "";
  const h = vm.highlight || "";
  const i = h ? body.toLowerCase().indexOf(h.toLowerCase()) : -1;
  return (
    <h1 className="or-h1">
      {i >= 0 ? (
        <>
          {body.slice(0, i)}
          <em>{body.slice(i, i + h.length)}</em>
          {body.slice(i + h.length)}
        </>
      ) : (
        body
      )}
      {end ? <span className="or-dot">{end}</span> : null}
    </h1>
  );
}

/** Une section suit-elle directement une autre (pour les fusionner en une bande) ? */
const follows = (vm: VM, a: string, b: string) => {
  const ia = vm.order.indexOf(a);
  return ia >= 0 && vm.order[ia + 1] === b && !vm.hidden.has(a) && !vm.hidden.has(b);
};
const statsInStory = (vm: VM) => follows(vm, "story", "stats") && !!vm.story.text && vm.stats.length > 0;
const howInSpecs = (vm: VM) => follows(vm, "specs", "how") && vm.specs.length > 0;

/** Valeur en % d'une caractéristique (barre de progression). */
const pct = (v: string) => {
  const m = v.match(/(\d+(?:[.,]\d+)?)\s*%/);
  return m ? Math.max(0, Math.min(100, parseFloat(m[1].replace(",", ".")))) : 100;
};

const SKY: [number, number, number][] = [
  [0, 18, 70],
  [16, 22, 120],
  [36, 14, 92],
  [48, 26, 180],
  [72, 16, 130],
  [86, 22, 210],
  [106, 30, 150],
  [134, 16, 96],
  [148, 24, 128],
  [170, 18, 74],
];
const Skyline = () => (
  <svg className="or-sky" viewBox="0 0 190 230" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    {SKY.map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x} y={230 - h} width={w} height={h} fill={i % 3 === 1 ? "#4a3a2b" : i % 2 ? "#6d5b47" : "#8c7a62"} />
        {i === 5 ? <path d={`M${x + 6} ${230 - h}l5 -26 5 26z`} fill="#4a3a2b" /> : null}
        {Array.from({ length: Math.floor(h / 16) }).map((_, k) => (
          <rect key={k} x={x + 4} y={236 - h + k * 16} width={w - 8} height="2" fill="#efe2c8" opacity=".35" />
        ))}
      </g>
    ))}
  </svg>
);

function Header({ vm }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  const links = navOf(vm, 4, ["story", "features", "specs", "showcase", "reviews", "faq"]);
  return (
    <header className="or-header">
      <div className="or-wrap or-header-row">
        <a
          className="or-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Mark />
          <span>
            <b>{vm.name}</b>
            <small>{tr(vm, "Boutique officielle", "المتجر الرسمي")}</small>
          </span>
        </a>
        <nav className={"or-nav" + (open ? " is-open" : "")} onClick={() => setOpen(false)}>
          <a
            href="#"
            className="or-on"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {links.map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="or-header-end">
          <Buy vm={vm} className="or-pill" />
          <button
            type="button"
            className="or-burger"
            aria-label={tr(vm, "Menu", "القائمة")}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  return (
    <section className="or-hero" id={sid("hero")}>
      <svg className="or-orbits" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="640" cy="360" r="330" />
        <circle cx="640" cy="360" r="420" />
        <circle cx="900" cy="250" r="300" />
        <path d="M1000 120 L520 560" />
        <path d="M640 -40 L1000 300" />
        <circle cx="868" cy="196" r="3.5" className="or-fill" />
        <circle cx="796" cy="262" r="2.5" className="or-fill" />
        <circle cx="960" cy="150" r="2" className="or-fill" />
      </svg>
      <svg className="or-saturn" viewBox="0 0 60 30" aria-hidden="true">
        <ellipse cx="30" cy="15" rx="28" ry="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="30" cy="15" r="9" fill="currentColor" />
      </svg>
      <div className="or-wrap or-hero-grid">
        <div className="or-hero-copy">
          {vm.eyebrow && vm.show.badge ? (
            <p className="or-eyebrow">
              <span>{vm.eyebrow}</span>
              <i aria-hidden="true" />
            </p>
          ) : null}
          <BigTitle vm={vm} />
          {vm.show.subtitle && vm.subheadline ? <p className="or-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="or-price">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </p>
          ) : null}
          {vm.show.cta ? (
            <button type="button" className="or-play" onClick={scrollToOrder}>
              <i>
                <Icon name="play" />
              </i>
              <span>{vm.cta}</span>
            </button>
          ) : null}
        </div>
        <div className="or-hero-art">
          <span className="or-disc">
            <Img vm={vm} i={0} className="or-disc-img" />
          </span>
          <span className="or-metal" aria-hidden="true" />
          <span className="or-striped" aria-hidden="true" />
          <span className="or-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Skyline />
        </div>
        <ul className="or-words">
          {vm.trust.slice(0, 3).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatsList({ vm, className }: { vm: VM; className: string }) {
  return (
    <ul className={className}>
      {vm.stats.slice(0, 4).map((s, i) => (
        <li key={i}>
          <b>{s.value}</b>
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

function Story({ vm }: SectionProps) {
  const merged = statsInStory(vm);
  const t = vm.story.title;
  const cut = t.search(/[,،:]\s/);
  const first = cut > 0 ? t.slice(0, cut + 1) : "";
  const rest = cut > 0 ? t.slice(cut + 1).trim() : t;
  return (
    <section className={"or-about" + (merged ? " or-about-merged" : "")} id={sid("story")}>
      <span className="or-about-planet" aria-hidden="true">
        <i />
      </span>
      <div className="or-wrap or-about-grid">
        <div className="or-about-art">
          <span className="or-frame">
            <Img vm={vm} i={6} className="or-frame-img" alt="" />
          </span>
          <svg className="or-tri" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M0 0 10 5 0 10z" fill="currentColor" />
          </svg>
        </div>
        <div className="or-about-copy">
          <small className="or-label">{vm.titles.story}</small>
          <h2 className="or-about-title">
            {first ? <span className="or-about-first">{first} </span> : null}
            <span className="or-about-rest">{rest}</span>
          </h2>
          <p>{vm.story.text}</p>
          <Buy vm={vm} className="or-ghost" arrow />
        </div>
        {merged ? (
          <div className="or-about-stats" id={sid("stats")}>
            <StatsList vm={vm} className="or-stats" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Stats({ vm }: SectionProps) {
  if (statsInStory(vm)) return null;
  return (
    <section className="or-statband" id={sid("stats")}>
      <div className="or-wrap">
        <Kicker className="or-kicker-dark">{vm.titles.stats}</Kicker>
        <StatsList vm={vm} className="or-stats or-stats-row" />
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="or-services" id={sid("features")}>
      <span className="or-svc-planet" aria-hidden="true" />
      <div className="or-wrap">
        <Kicker>{vm.titles.features}</Kicker>
        <div className="or-svc-grid" style={{ ["--n" as string]: Math.min(4, vm.features.length) }}>
          {vm.features.slice(0, 8).map((f, i) => (
            <article key={i} className="or-svc">
              <span className="or-svc-ico">
                <Icon name={iconAt(FEAT_ICONS, i)} />
              </span>
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
        <div className="or-rule" aria-hidden="true">
          <Spark />
        </div>
      </div>
    </section>
  );
}

function Steps({ vm }: { vm: VM }) {
  return (
    <ol className="or-steps">
      {vm.steps.slice(0, 5).map((s, i) => (
        <li key={i}>
          <span className="or-step-ico">
            <Icon name={iconAt(STEP_ICONS, i)} />
          </span>
          <b>{s.title}</b>
          {s.text ? <small>{s.text}</small> : null}
        </li>
      ))}
    </ol>
  );
}

function Specs({ vm }: SectionProps) {
  const merged = howInSpecs(vm);
  return (
    <section className={"or-skills" + (merged ? " or-skills-merged" : "")} id={sid("specs")}>
      <div className="or-wrap or-skills-grid">
        <div className="or-bars">
          <h2 className="or-skills-title">{vm.titles.specs}</h2>
          <ul>
            {vm.specs.slice(0, 7).map((s, i) => (
              <li key={i}>
                <span>{s.label}</span>
                <b>{s.value}</b>
                <i aria-hidden="true">
                  <em style={{ width: pct(s.value) + "%" }} />
                </i>
              </li>
            ))}
          </ul>
        </div>
        {merged ? (
          <div className="or-skills-mid" id={sid("how")}>
            <h3>{vm.titles.how}</h3>
            <p>{vm.delivery}</p>
            <Steps vm={vm} />
          </div>
        ) : null}
        <div className="or-arch">
          <span className="or-arch-rings" aria-hidden="true" />
          <span className="or-arch-frame">
            <Img vm={vm} i={7} className="or-arch-img" alt="" />
          </span>
          <i className="or-arch-dot" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function How({ vm }: SectionProps) {
  if (howInSpecs(vm)) return null;
  return (
    <section className="or-howband" id={sid("how")}>
      <div className="or-wrap">
        <Kicker className="or-kicker-dark">{vm.titles.how}</Kicker>
        <Steps vm={vm} />
        <p className="or-how-note">{vm.delivery}</p>
      </div>
    </section>
  );
}

function Showcase({ vm }: SectionProps) {
  const n = vm.images.length;
  const idx = n > 1 ? Array.from({ length: Math.min(5, n - 1) }, (_, k) => k + 1) : [0];
  return (
    <section className="or-work" id={sid("showcase")}>
      <div className="or-wrap">
        <div className="or-work-head">
          <h2>
            <i aria-hidden="true" />
            {vm.titles.showcase}
          </h2>
          <Go to="order" className="or-more">
            <span>{tr(vm, "Voir l'offre", "شوف العرض")}</span>
            <i>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </i>
          </Go>
        </div>
        <div className="or-tiles" style={{ ["--n" as string]: Math.max(idx.length, 3) }}>
          {idx.map((k) => {
            const label = vm.imageLabels[k] || "";
            const [title, sub] = label.split(/\s+[·|:–-]\s+/);
            return (
              <button type="button" key={k} className="or-tile" onClick={scrollToOrder}>
                <span className="or-tile-img">
                  <Img vm={vm} i={k} alt={title || vm.name} />
                  <i className="or-tile-play" aria-hidden="true">
                    <Icon name="play" />
                  </i>
                </span>
                <b>{title || vm.name}</b>
                <small>{sub || (vm.price ? money(vm, vm.price) : "")}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="or-words-sec" id={sid("reviews")}>
      <div className="or-wrap">
        <Kicker>{vm.titles.reviews}</Kicker>
        <div className="or-quotes">
          {vm.reviews.slice(0, 6).map((r, i) => (
            <figure key={i} className="or-quote">
              <span className="or-q" aria-hidden="true">
                “
              </span>
              <div>
                <blockquote>{r.text}</blockquote>
                <figcaption>
                  <span className="or-avatar">{r.name.charAt(0)}</span>
                  <span>
                    <b>{r.name}</b>
                    <small>
                      {"★".repeat(Math.round(r.rating))}
                      {r.city ? " · " + r.city : ""}
                    </small>
                  </span>
                </figcaption>
              </div>
            </figure>
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
      className="or-order"
      title={
        <>
          <small className="or-label">{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</small>
          {vm.orderTitle}
        </>
      }
      aside={
        <>
          <div className="or-order-art">
            <span className="or-order-ring" aria-hidden="true" />
            <span className="or-order-disc">
              <Img vm={vm} i={8} className="or-order-img" />
            </span>
          </div>
          <ul className="or-order-trust">
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <span>
                  <Icon name={iconAt(TRUST_ICONS, i)} />
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
    <section className="or-faq" id={sid("faq")}>
      <div className="or-wrap or-faq-in">
        <Kicker>{vm.titles.faq}</Kicker>
        {vm.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <span className="or-faq-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="or-faq-q">{f.question}</span>
              <i>
                <Icon name="plus" />
              </i>
            </summary>
            {f.answer ? <p>{f.answer}</p> : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function Final({ vm }: SectionProps) {
  const sub = (vm.finalCta.text || "").split(/(?<=[.!?])\s/)[0];
  return (
    <section className="or-cta" id={sid("final_cta")}>
      <span className="or-cta-planet" aria-hidden="true" />
      <div className="or-wrap or-cta-in">
        <div className="or-cta-copy">
          <h2>{vm.finalCta.title}</h2>
          {sub ? <p>{sub}</p> : null}
        </div>
        <span className="or-cta-dots" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <Buy vm={vm} className="or-dark-pill" arrow />
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const nav = navOf(vm, 6, ["story", "features", "specs", "showcase", "reviews", "faq", "order"]);
  return (
    <footer className="or-footer">
      <div className="or-wrap">
        <div className="or-foot-grid">
          <div className="or-foot-brand">
            <div className="or-logo or-logo-foot">
              <Mark />
              <span>
                <b>{vm.name}</b>
                <small>{tr(vm, "Boutique officielle", "المتجر الرسمي")}</small>
              </span>
            </div>
            <p>{vm.trust.slice(0, 3).join(". ")}.</p>
          </div>
          <nav className="or-foot-col">
            <b>{tr(vm, "Navigation", "التصفح")}</b>
            {nav.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
          {vm.features.length ? (
            <nav className="or-foot-col">
              <b>{vm.titles.features}</b>
              {vm.features.slice(0, 4).map((f, i) => (
                <Go key={i} to="features">
                  {f.title}
                </Go>
              ))}
            </nav>
          ) : null}
          <div className="or-foot-col">
            <b>{tr(vm, "Infos", "معلومات")}</b>
            {vm.whatsapp ? <span dir="ltr">+{vm.whatsapp}</span> : null}
            <span>{vm.delivery}</span>
            <span>{tr(vm, "Livraison partout au Maroc", "التوصيل لجميع المدن")}</span>
          </div>
          <div className="or-foot-connect">
            <b>{tr(vm, "Restons en contact", "تواصل معنا")}</b>
            <div>
              {vm.whatsapp ? (
                <>
                  <a
                    href={`https://wa.me/${vm.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <Icon name="whatsapp" />
                  </a>
                  <a href={`tel:+${vm.whatsapp}`} aria-label={tr(vm, "Appeler", "اتصل")}>
                    <Icon name="phone" />
                  </a>
                </>
              ) : null}
              <button type="button" onClick={scrollToOrder} aria-label={vm.cta}>
                <Icon name="cart" />
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label={tr(vm, "Haut de page", "الفوق")}
              >
                <Icon name="up" />
              </button>
            </div>
          </div>
        </div>
        <div className="or-foot-bottom">
          <Spark className="or-foot-orn" />
          <small>
            © {new Date().getFullYear()} {vm.name}. {tr(vm, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
          </small>
          <Spark className="or-foot-orn" />
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Barlow+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700",
  font: '"Archivo", system-ui, sans-serif',
  heading: '"Barlow Condensed", "Oswald", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    story: (p) => <Story {...p} />,
    stats: (p) => <Stats {...p} />,
    features: (p) => <Features {...p} />,
    specs: (p) => <Specs {...p} />,
    how: (p) => <How {...p} />,
    showcase: (p) => <Showcase {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
