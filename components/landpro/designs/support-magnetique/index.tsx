"use client";
// Design « Support magnétique » : fiche produit type A+ (fond nuit, lueurs bleu électrique).
// Hero scène tableau de bord + slogan manuscrit, 4 cartes « gros plan » (features),
// « Utilisable partout » en tuiles inclinées (showcase + imageLabels), bande compatibilité
// (specs + pinceau bleu), bandeau d'engagements (trust), avis, formulaire COD, FAQ.
//
// Images : 0 = hero (scène) · 1-4 = gros plans des cartes features · 5-9 = scènes d'usage
// (légendes imageLabels[0..4]) · 10 = rangée de téléphones · 11 = anneau métallique
// (légende imageLabels[5]).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import { Buy, Go, Headline, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, Stars, tr } from "../kit";
import "./style.css";

/** Pictogrammes au trait propres au design (repli sur les icônes du kit). */
const GLYPHS: Record<string, React.ReactNode> = {
  magnet: (
    <>
      <path d="M5 4h4v8a3 3 0 0 0 6 0V4h4v8a7 7 0 0 1-14 0z" />
      <path d="M5 8h4M15 8h4" />
      <path d="M19.5 2.5l1.5-1M21 5h1.5" />
    </>
  ),
  suction: (
    <>
      <path d="M9 3h6v6H9z" />
      <path d="M12 9v3" />
      <path d="M6 12h12l2.5 6h-17z" />
      <path d="M4 21h16" />
    </>
  ),
  rot360: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M17.7 3v3.6h-3.6M6.3 21v-3.6h3.6" />
      <text x="12" y="14" textAnchor="middle" fontSize="6.2" fontWeight="800" stroke="none" fill="currentColor">
        360
      </text>
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M10.5 5h3M11 18.5h2" />
    </>
  ),
  car: (
    <>
      <path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11" />
      <rect x="3" y="11" width="18" height="6" rx="2" />
      <path d="M5 17v2M19 17v2" />
      <circle cx="7.5" cy="14" r="1" />
      <circle cx="16.5" cy="14" r="1" />
    </>
  ),
  windshield: (
    <>
      <path d="M3 8c6-3 12-3 18 0l-2.5 9c-4.3-1.5-8.7-1.5-13 0z" />
      <path d="M9 14l4-4" />
    </>
  ),
  mirror: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6M8.5 21h7M9.5 7.5l2-2" />
    </>
  ),
  shower: (
    <>
      <path d="M12 4s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z" />
      <path d="M5 4l2 2M3 9h2.5M19 4l-2 2" />
    </>
  ),
  hand: (
    <>
      <path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10" />
      <path d="M12 9.5a1.5 1.5 0 0 1 3 0V11M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.8-2.4L4.5 15.5a1.6 1.6 0 0 1 2.4-2L9 15" />
    </>
  ),
};

function G({ name, className }: { name: string; className?: string }) {
  if (!GLYPHS[name]) return <Icon name={name} className={className} />;
  return (
    <svg
      className={className ?? "lpx-ico"}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}

const HERO_ICONS = ["magnet", "suction", "rot360", "mobile"];
const USE_ICONS = ["car", "windshield", "dumbbell", "mirror", "shower"];
const TRUST_ICONS = ["truck", "cash", "shield", "headset"];

/** Trait bleu sous les titres en italique (« Use it anywhere »). */
const Swoosh = () => (
  <svg className="sm-swoosh" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
    <path d="M2 11C80 5 190 2 298 3l-2 5C190 7 90 9 4 13z" fill="currentColor" />
  </svg>
);

/** Titre de section italique gras + trait bleu. */
const Title = ({ children }: { children: React.ReactNode }) => (
  <div className="sm-title">
    <h2>{children}</h2>
    <Swoosh />
  </div>
);

/** Titre du hero : 1er mot court en grand dégradé, partie mise en valeur en bleu, la suite en sous-titre. */
function HeroTitle({ vm }: SectionProps) {
  const t = vm.headline.trim();
  const h = vm.highlight || "";
  const i = h ? t.toLowerCase().indexOf(h.toLowerCase()) : -1;
  if (i < 0) return <Headline vm={vm} className="sm-h1" />;
  const before = t.slice(0, i).trim();
  const after = t.slice(i + h.length).trim();
  const words = before.split(/\s+/).filter(Boolean);
  const first = words.length > 1 && words[0].length <= 5 ? words[0] : "";
  const rest = first ? words.slice(1).join(" ") : before;
  return (
    <h1 className="sm-h1">
      {first ? (
        <span className="sm-h1-big">
          <span className="sm-grad">{first}</span>
          <svg className="sm-h1-arrow" viewBox="0 0 40 20" aria-hidden="true">
            <path d="M2 13h30M26 7l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
      ) : null}
      {rest ? <span className="sm-h1-line">{rest}</span> : null}
      <span className="sm-h1-line sm-grad">{t.slice(i, i + h.length)}</span>
      {after ? <span className="sm-h1-sub">{after}</span> : null}
    </h1>
  );
}

function Header({ vm }: SectionProps) {
  return (
    <header className="sm-header">
      <div className="sm-wrap sm-header-row">
        <a
          className="sm-logo"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <G name="magnet" />
          <b>{vm.name}</b>
        </a>
        <nav className="sm-nav">
          {navOf(vm, 4).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <Buy vm={vm} className="sm-btn sm-btn-sm">
          {tr(vm, "Commander", "اطلب")}
        </Buy>
      </div>
    </header>
  );
}

function Hero(p: SectionProps) {
  const { vm } = p;
  const sub = vm.subheadline.split(/\s*\|\s*/).filter(Boolean);
  const slogan = vm.story.title.trim();
  const showSlogan = slogan && slogan.length <= 36 && slogan !== vm.subheadline;
  const lines = showSlogan ? slogan.split(/(?<=[.!?])\s+/).filter(Boolean) : [];
  return (
    <section className="sm-hero" id={sid("hero")}>
      <div className="sm-hero-media">
        <Img vm={vm} i={0} className="sm-hero-bg" />
        {lines.length ? (
          <p className="sm-script" aria-hidden="true">
            {lines.map((l, k) => (
              <span key={k} className={k === lines.length - 1 && lines.length > 1 ? "sm-script-last" : undefined}>
                {l}
              </span>
            ))}
          </p>
        ) : null}
      </div>
      <div className="sm-wrap sm-hero-in">
        <div className="sm-hero-copy">
          {vm.eyebrow && vm.show.badge ? <span className="sm-pill">{vm.eyebrow}</span> : null}
          <HeroTitle {...p} />
          {vm.show.subtitle && sub.length ? (
            <p className="sm-lead">
              {sub.map((s, k) => (
                <span key={k}>{s}</span>
              ))}
            </p>
          ) : null}
          {vm.benefits.length ? (
            <ul className="sm-hero-icons">
              {vm.benefits.slice(0, 4).map((b, k) => (
                <li key={k}>
                  <span className="sm-roundico">
                    <G name={iconAt(HERO_ICONS, k)} />
                  </span>
                  <small>{b.title}</small>
                </li>
              ))}
            </ul>
          ) : null}
          {(vm.show.price && vm.price) || vm.show.cta ? (
            <div className="sm-hero-buy">
              {vm.show.cta ? <Buy vm={vm} className="sm-btn" arrow /> : null}
              {vm.show.price && vm.price ? (
                <p className="sm-price">
                  <b>{money(vm, vm.price)}</b>
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="sm-sec sm-feats-sec" id={sid("features")}>
      <div className="sm-wrap">
        <h2 className="sm-vh">{vm.titles.features}</h2>
        <div className="sm-feats">
          {vm.features.slice(0, 4).map((f, k) => (
            <article key={k} className="sm-feat">
              <Img vm={vm} i={1 + k} className="sm-feat-img" alt={f.title} />
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Uses({ vm }: SectionProps) {
  // autant de tuiles que de légendes (3 à 5), sinon selon le nombre de photos
  const base = vm.imageLabels.length || vm.images.length;
  const n = Math.min(5, Math.max(3, base));
  const tiles = Array.from({ length: n }, (_, k) => k);
  return (
    <section className="sm-sec sm-uses-sec" id={sid("showcase")}>
      <div className="sm-wrap">
        <Title>{vm.titles.showcase}</Title>
      </div>
      <div className="sm-uses">
        {tiles.map((k) => (
          <figure key={k} className="sm-use">
            <div className="sm-use-in">
              <Img vm={vm} i={5 + k} className="sm-use-img" alt={vm.imageLabels[k] || vm.name} />
              {vm.imageLabels[k] ? (
                <figcaption>
                  <span className="sm-roundico sm-roundico-sm">
                    <G name={iconAt(USE_ICONS, k)} />
                  </span>
                  <b>{vm.imageLabels[k]}</b>
                </figcaption>
              ) : null}
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Pinceau bleu (fond du slogan de la bande compatibilité). */
const Brush = () => (
  <svg className="sm-brush-bg" viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true">
    <path
      d="M18 44c40-12 92-26 160-30 46-3 90-8 128-12l-6 14 14 4-12 10 10 8-16 8 12 10-18 6 8 12-26 6c-44 8-96 18-150 28-30 6-58 14-90 24l8-14-16-2 12-12-14-6 16-8-12-10 18-6-10-10 18-6z"
      fill="currentColor"
    />
    <path d="M30 70c70-20 150-34 260-46" stroke="#7fd0ff" strokeWidth="3" fill="none" opacity=".5" />
    <path d="M40 104c80-20 160-34 250-48" stroke="#0a63c9" strokeWidth="4" fill="none" opacity=".35" />
  </svg>
);

function Compat({ vm }: SectionProps) {
  const [head, ...rest] = vm.specs;
  const ring = vm.imageLabels[5];
  return (
    <section className="sm-compat" id={sid("specs")}>
      <div className="sm-wrap sm-compat-row">
        <div className="sm-compat-copy">
          <h3>{head.label}</h3>
          {head.value ? <p>{head.value}</p> : null}
        </div>
        <div className="sm-compat-mid">
          <figure className="sm-phones">
            <Img vm={vm} i={10} className="sm-phones-img" alt="" />
            {rest.length ? (
              <figcaption>
                {rest.slice(0, 4).map((s, k) => (
                  <span key={k}>
                    <small>{s.label}</small>
                    <b>{s.value}</b>
                  </span>
                ))}
              </figcaption>
            ) : null}
          </figure>
          <span className="sm-plus" aria-hidden="true">
            +
          </span>
          <figure className="sm-ring">
            <Img vm={vm} i={11} className="sm-ring-img" alt={ring || ""} />
            {ring ? <figcaption>{ring}</figcaption> : null}
          </figure>
        </div>
        <button type="button" className="sm-brush" onClick={scrollToOrder}>
          <Brush />
          <h2>{vm.titles.specs}</h2>
        </button>
      </div>
    </section>
  );
}

function Trust({ vm }: SectionProps) {
  return (
    <section className="sm-trust" id={sid("trust")}>
      <ul className="sm-wrap sm-trust-row">
        {vm.trust.slice(0, 4).map((t, k) => (
          <li key={k}>
            <G name={iconAt(TRUST_ICONS, k)} className={"lpx-ico" + (k === 1 ? " sm-ico-blue" : "")} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="sm-sec" id={sid("reviews")}>
      <div className="sm-wrap">
        <Title>{vm.titles.reviews}</Title>
        <div className="sm-revs">
          {vm.reviews.slice(0, 6).map((r, k) => (
            <article key={k} className="sm-rev">
              <Stars n={r.rating} className="sm-stars" />
              <p>{r.text}</p>
              <div className="sm-who">
                <span className="sm-avatar">{r.name.charAt(0)}</span>
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
      className="sm-order"
      aside={
        <>
          <div className="sm-order-media">
            <Img vm={vm} i={0} className="sm-order-img" />
          </div>
          <ul className="sm-order-trust">
            {vm.trust.slice(0, 3).map((t, k) => (
              <li key={k}>
                <span className="sm-roundico sm-roundico-sm">
                  <Icon name={iconAt(TRUST_ICONS, k)} />
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
    <section className="sm-sec" id={sid("faq")}>
      <div className="sm-wrap sm-faq">
        <Title>{vm.titles.faq}</Title>
        {vm.faq.map((f, k) => (
          <details key={k} open={k === 0}>
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
  return (
    <footer className="sm-footer">
      <div className="sm-wrap sm-foot-row">
        <span className="sm-logo">
          <G name="magnet" />
          <b>{vm.name}</b>
        </span>
        <nav className="sm-nav">
          {navOf(vm, 5).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        {vm.whatsapp ? (
          <a
            className="sm-wa"
            href={`https://wa.me/${vm.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <Icon name="whatsapp" />
          </a>
        ) : null}
      </div>
      <div className="sm-wrap sm-foot-bottom">
        <small>
          © {new Date().getFullYear()} {vm.name}
        </small>
        <small>{vm.delivery}</small>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Permanent+Marker",
  font: '"Montserrat", system-ui, sans-serif',
  heading: '"Montserrat", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    features: (p) => <Features {...p} />,
    showcase: (p) => <Uses {...p} />,
    specs: (p) => <Compat {...p} />,
    trust: (p) => <Trust {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
  },
};
export default design;
