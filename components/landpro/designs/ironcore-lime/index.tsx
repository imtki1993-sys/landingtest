"use client";
// Design « Ironcore Lime » : salle de sport noire et vert citron, titres condensés.
// En-tête (logo citron, nav avec soulignement, bouton citron), hero dans un panneau
// arrondi (photo de salle à droite, 4 icônes, carte citron « membres »), cartes
// programmes photo, rangée de 4 téléphones (accueil, programmes, galerie, progression),
// packs, avis, formulaire COD, FAQ, bandeau final citron et pied de page.
// Images : 0 = hero (aussi écran d'accueil du téléphone), 1-4 = cartes programmes
// (avantages), 5-6 = galerie du 3e téléphone (légendes imageLabels[5..6]),
// 7 = produit (packs + commande), 8 = gros plan (bandeau final).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import {
  Buy,
  discount,
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

type VMp = SectionProps["vm"];

const HERO_ICONS = ["dumbbell", "calendar", "heart", "award"];
const PROG_ICONS = ["dumbbell", "flame", "spa", "target"];
const SPEC_ICONS = ["calendar", "flame", "clock", "dumbbell", "bolt", "award"];

/** Emblème du logo (monogramme anguleux citron). */
const Mark = () => (
  <svg className="ic-mark" viewBox="0 0 40 40" aria-hidden="true">
    <path d="M4 8h9l-4 24H0z" fill="currentColor" />
    <path d="M15 20 34 6h6L24 19l10 15h-9l-7-10z" fill="currentColor" />
    <path d="M13 17h14l-2 5H12z" fill="currentColor" opacity=".7" />
  </svg>
);

function Logo({ vm }: { vm: VMp }) {
  const words = vm.name.trim().split(/\s+/);
  const a = words[0] || vm.name;
  const b = words.slice(1).join(" ");
  return (
    <span className="ic-logo">
      <Mark />
      <span>
        <b>{a}</b>
        {b ? <small>{b}</small> : null}
      </span>
    </span>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <small className="ic-eyebrow">{children}</small>;

function toTop(e: React.MouseEvent) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Header({ vm }: SectionProps) {
  return (
    <header className="ic-header">
      <div className="ic-wrap ic-header-row">
        <a href="#" className="ic-home" onClick={toTop} aria-label={vm.name}>
          <Logo vm={vm} />
        </a>
        <nav className="ic-nav">
          <a href="#" className="ic-on" onClick={toTop}>
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {navOf(vm, 6).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <Buy vm={vm} className="ic-btn ic-btn-sm" />
      </div>
    </header>
  );
}

/** Pastilles « membres » : initiales des vrais avis. */
function Avatars({ vm }: { vm: VMp }) {
  if (!vm.reviews.length) return null;
  return (
    <span className="ic-avatars">
      {vm.reviews.slice(0, 5).map((r, i) => (
        <i key={i}>{r.name.charAt(0)}</i>
      ))}
    </span>
  );
}

function Hero({ vm }: SectionProps) {
  const stat = vm.stats[0];
  return (
    <section className="ic-hero-sec" id={sid("hero")}>
      <div className="ic-hero">
        <Img vm={vm} i={0} className="ic-hero-bg" />
        <div className="ic-wrap ic-hero-in">
          <div className="ic-hero-copy">
            {vm.eyebrow && vm.show.badge ? <Eyebrow>{vm.eyebrow}</Eyebrow> : null}
            <Headline vm={vm} className="ic-h1" />
            {vm.show.subtitle && vm.subheadline ? <p className="ic-lead">{vm.subheadline}</p> : null}
            {vm.show.price && vm.price ? (
              <p className="ic-hero-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                {discount(vm) ? <span>-{discount(vm)}%</span> : null}
              </p>
            ) : null}
            <div className="ic-hero-btns">
              {vm.show.cta ? <Buy vm={vm} className="ic-btn" arrow /> : null}
              <Go to="showcase" className="ic-btn-line">
                <Icon name="play" />
                <span>{tr(vm, "Voir l'appli", "شوف التطبيق")}</span>
              </Go>
            </div>
          </div>
          {vm.features.length ? (
            <ul className="ic-hero-feats">
              {vm.features.slice(0, 4).map((f, i) => (
                <li key={i}>
                  <Icon name={iconAt(HERO_ICONS, i)} />
                  <b>{f.title}</b>
                  {f.text ? <span>{f.text}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {stat ? (
            <div className="ic-members">
              <div className="ic-members-top">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M6 20c.8-3.6 3-5.4 6-5.4s5.2 1.8 6 5.4" />
                  <circle cx="5" cy="10" r="2.3" />
                  <path d="M1.5 18c.5-2.4 1.8-3.6 3.6-3.8" />
                  <circle cx="19" cy="10" r="2.3" />
                  <path d="M22.5 18c-.5-2.4-1.8-3.6-3.6-3.8" />
                </svg>
                <span>
                  <b>{stat.value}</b>
                  <small>{stat.label}</small>
                </span>
              </div>
              <Avatars vm={vm} />
              <button type="button" onClick={scrollToOrder}>
                {tr(vm, "Rejoignez la communauté !", "انضم للمجموعة دابا !")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Programs({ vm }: SectionProps) {
  const intro = vm.description ? vm.description.split(/(?<=[.!?])\s/)[0] : "";
  return (
    <section className="ic-sec" id={sid("benefits")}>
      <div className="ic-wrap">
        <div className="ic-progs-panel">
          <div className="ic-sec-head">
            <div>
              <Eyebrow>{tr(vm, "Nos programmes", "البرامج ديالنا")}</Eyebrow>
              <h2 className="ic-h2">{vm.titles.benefits}</h2>
            </div>
            {intro ? <p>{intro}</p> : null}
            <Go to="showcase" className="ic-btn-line ic-btn-line-w">
              <span>{tr(vm, "Tout découvrir", "اكتشف كلشي")}</span>
              <Icon name={vm.rtl ? "back" : "arrow"} />
            </Go>
          </div>
          <div className="ic-progs">
            {vm.benefits.slice(0, 4).map((b, i) => (
              <article key={i} className="ic-prog">
                <Img vm={vm} i={1 + i} className="ic-prog-img" alt="" />
                <div className="ic-prog-copy">
                  <span className="ic-ring-ico">
                    <Icon name={iconAt(PROG_ICONS, i)} />
                  </span>
                  <h3>{b.title}</h3>
                  {b.text ? <p>{b.text}</p> : null}
                  <button type="button" className="ic-more" onClick={scrollToOrder}>
                    <span>{tr(vm, "En savoir plus", "عرف كثر")}</span>
                    <Icon name={vm.rtl ? "back" : "arrow"} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Cadre de téléphone (barre d'état + contenu). */
function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"ic-phone " + (className || "")}>
      <div className="ic-phone-screen">
        <div className="ic-status" dir="ltr">
          <b>9:41</b>
          <i className="ic-island" />
          <span>
            <svg viewBox="0 0 18 12" aria-hidden="true">
              <rect x="0" y="8" width="3" height="4" rx=".6" />
              <rect x="5" y="5" width="3" height="7" rx=".6" />
              <rect x="10" y="2" width="3" height="10" rx=".6" />
            </svg>
            <svg viewBox="0 0 26 12" aria-hidden="true">
              <rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" />
              <rect x="2.5" y="2.5" width="15" height="7" rx="1.5" />
              <rect x="23" y="4" width="2" height="4" rx="1" />
            </svg>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Ring({ value, label }: { value: string; label: string }) {
  const m = value.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const pct = m ? Math.max(0, Math.min(100, parseFloat(m[1].replace(",", ".")))) : 100;
  const C = 2 * Math.PI * 52;
  return (
    <div className="ic-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="52" className="ic-ring-bg" />
        <circle
          cx="60"
          cy="60"
          r="52"
          className="ic-ring-fg"
          strokeDasharray={`${(C * pct) / 100} ${C}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span>
        <b>{value}</b>
        <small>{label}</small>
      </span>
    </div>
  );
}

function Phones({ vm }: SectionProps) {
  const ring = vm.stats[1] || vm.stats[0];
  const d = discount(vm);
  const gallery = [5, 6].map((i) => {
    const lbl = vm.imageLabels[i] || "";
    const [a, ...rest] = lbl.split(/\s*[·|•]\s*/);
    return { i, name: a || vm.name, role: rest.join(" · ") };
  });
  const list = vm.specs.length
    ? vm.specs.slice(0, 4).map((s) => ({ t: s.label, v: s.value }))
    : vm.features.slice(0, 4).map((f) => ({ t: f.title, v: f.text }));
  return (
    <section className="ic-sec ic-phones-sec" id={sid("showcase")}>
      <div className="ic-wrap">
        <div className="ic-phones">
          <Phone className="ic-ph-home">
            <div className="ic-ph-bar">
              <Logo vm={vm} />
              <Icon name="menu" />
            </div>
            <div className="ic-ph-home-copy">
              {vm.eyebrow ? <Eyebrow>{vm.eyebrow}</Eyebrow> : null}
              <h3>{vm.headline}</h3>
              {vm.subheadline ? <p>{vm.subheadline}</p> : null}
              <Buy vm={vm} className="ic-btn ic-btn-xs" arrow />
              <Go to="benefits" className="ic-btn-line ic-btn-xs">
                <Icon name="play" />
                <span>{tr(vm, "Programmes", "البرامج")}</span>
              </Go>
            </div>
            <Img vm={vm} i={0} className="ic-ph-home-img" alt="" />
          </Phone>

          <Phone>
            <div className="ic-ph-head">
              <Eyebrow>{tr(vm, "Nos programmes", "البرامج ديالنا")}</Eyebrow>
              <h3>{vm.titles.benefits}</h3>
            </div>
            <div className="ic-ph-list">
              {vm.benefits.slice(0, 3).map((b, i) => (
                <div key={i} className="ic-ph-item">
                  <Img vm={vm} i={1 + i} alt="" />
                  <div>
                    <b>{b.title}</b>
                    {b.text ? <span>{b.text}</span> : null}
                    <em>
                      {tr(vm, "En savoir plus", "عرف كثر")} <Icon name={vm.rtl ? "back" : "arrow"} />
                    </em>
                  </div>
                </div>
              ))}
            </div>
            <Buy vm={vm} className="ic-btn ic-btn-xs ic-ph-cta" />
          </Phone>

          <Phone>
            <div className="ic-ph-head">
              <Eyebrow>{tr(vm, "En images", "بالصور")}</Eyebrow>
              <h3>{vm.titles.showcase}</h3>
            </div>
            <div className="ic-ph-gal">
              {gallery.map((g) => (
                <figure key={g.i}>
                  <Img vm={vm} i={g.i} alt={g.name} />
                  <figcaption>
                    <b>{g.name}</b>
                    {g.role ? <span>{g.role}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Phone>

          <Phone>
            <div className="ic-ph-head">
              <Eyebrow>{vm.name}</Eyebrow>
              <h3>{vm.titles.specs}</h3>
            </div>
            {ring ? (
              <Ring value={ring.value} label={ring.label} />
            ) : d ? (
              <Ring value={`-${d}%`} label={tr(vm, "de remise", "تخفيض")} />
            ) : null}
            <ul className="ic-ph-specs">
              {list.map((s, i) => (
                <li key={i}>
                  <Icon name={iconAt(SPEC_ICONS, i)} />
                  <span>
                    <b>{s.t}</b>
                    {s.v ? <small>{s.v}</small> : null}
                  </span>
                </li>
              ))}
            </ul>
            <Buy vm={vm} className="ic-btn ic-btn-xs ic-ph-cta" />
          </Phone>
        </div>
      </div>
    </section>
  );
}

function Offers({ vm, qty, setQty }: SectionProps) {
  const base = vm.offers[0] ? vm.offers[0].price / Math.max(1, vm.offers[0].qty) : vm.price;
  return (
    <section className="ic-sec" id={sid("offers")}>
      <div className="ic-wrap">
        <div className="ic-sec-head ic-sec-head-c">
          <div>
            <Eyebrow>{tr(vm, "Packs", "العروض")}</Eyebrow>
            <h2 className="ic-h2">{vm.titles.offers}</h2>
          </div>
        </div>
        <div className="ic-offers" style={{ ["--n" as string]: Math.min(vm.offers.length, 4) }}>
          {vm.offers.slice(0, 4).map((o, i) => {
            const full = base * o.qty;
            return (
              <article key={o.qty + o.label} className={"ic-offer" + (o.qty === qty ? " ic-offer-on" : "")}>
                {o.badge ? <span className="ic-offer-badge">{o.badge}</span> : null}
                <Img vm={vm} i={7} className="ic-offer-img" alt="" />
                <h3>{o.label}</h3>
                <p className="ic-offer-price">
                  <b>{money(vm, o.price)}</b>
                  {full > o.price + 1 ? <s>{money(vm, full)}</s> : null}
                </p>
                <button
                  type="button"
                  className={o.qty === qty ? "ic-btn" : "ic-btn-line"}
                  onClick={() => {
                    setQty(o.qty);
                    scrollToOrder();
                  }}
                >
                  <span>{i === 0 && vm.offers.length === 1 ? vm.cta : tr(vm, "Choisir", "اختار")}</span>
                  <Icon name={vm.rtl ? "back" : "arrow"} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  return (
    <section className="ic-sec" id={sid("reviews")}>
      <div className="ic-wrap">
        <div className="ic-sec-head ic-sec-head-c">
          <div>
            <Eyebrow>{tr(vm, "Avis clients", "آراء الزبناء")}</Eyebrow>
            <h2 className="ic-h2">{vm.titles.reviews}</h2>
          </div>
        </div>
        <div className="ic-revs">
          {vm.reviews.slice(0, 4).map((r, i) => (
            <article key={i} className="ic-rev">
              <Stars n={r.rating} className="ic-stars" />
              <p>{r.text}</p>
              <div className="ic-who">
                <i>{r.name.charAt(0)}</i>
                <span>
                  <b>{r.name}</b>
                  {r.city ? <small>{r.city}</small> : null}
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
    <div className="ic-order-sec">
      <OrderBox
        p={p}
        className="ic-order"
        aside={
          <>
            <Eyebrow>{vm.name}</Eyebrow>
            <Img vm={vm} i={7} className="ic-order-img" />
            <ul>
              {(vm.specs.length ? vm.specs.slice(0, 3).map((s) => `${s.label} : ${s.value}`) : [])
                .concat(vm.trust.slice(0, 3))
                .map((t, i) => (
                  <li key={i}>
                    <Icon name="check" /> {t}
                  </li>
                ))}
            </ul>
          </>
        }
      />
    </div>
  );
}

function Faq({ vm }: SectionProps) {
  return (
    <section className="ic-sec" id={sid("faq")}>
      <div className="ic-wrap ic-faq">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="ic-h2">{vm.titles.faq}</h2>
          <p className="ic-faq-sub">{vm.delivery}</p>
        </div>
        <div className="ic-faq-list">
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
      </div>
    </section>
  );
}

function Final({ vm, qty }: SectionProps) {
  const price = vm.offers.find((o) => o.qty === qty)?.price ?? vm.price;
  return (
    <section className="ic-sec ic-final-sec" id={sid("final_cta")}>
      <div className="ic-wrap">
        <div className="ic-final">
          <div className="ic-final-copy">
            <h2>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
            <div className="ic-final-form">
              <span>
                {vm.name}
                {price ? " · " + money(vm, price + vm.shipping) : ""}
              </span>
              <Buy vm={vm} className="ic-final-btn" arrow />
            </div>
          </div>
          <Img vm={vm} i={8} className="ic-final-img" alt="" />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const cols: [string, [string, string][]][] = [
    [
      tr(vm, "Découvrir", "اكتشف"),
      [
        ["benefits", vm.titles.benefits],
        ["showcase", vm.titles.showcase],
        ["offers", vm.titles.offers],
      ],
    ],
    [
      tr(vm, "Aide", "المساعدة"),
      [
        ["faq", vm.titles.faq],
        ["reviews", vm.titles.reviews],
        ["order", tr(vm, "Commander", "اطلب")],
      ],
    ],
  ];
  return (
    <footer className="ic-footer">
      <div className="ic-wrap">
        <div className="ic-foot-grid">
          <div className="ic-foot-brand">
            <Logo vm={vm} />
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
            {vm.whatsapp ? (
              <a
                className="ic-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          {cols.map(([h, links]) => (
            <nav key={h} className="ic-foot-col">
              <b>{h}</b>
              {links.map(([k, l]) => (
                <Go key={k + l} to={k}>
                  {l}
                </Go>
              ))}
            </nav>
          ))}
          <ul className="ic-foot-trust">
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "shield"], i)} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ic-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}
          </small>
          <button type="button" onClick={() => goTo("order")}>
            {vm.delivery}
          </button>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700",
  font: '"Barlow", "Inter", system-ui, sans-serif',
  heading: '"Barlow Condensed", "Oswald", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    benefits: (p) => <Programs {...p} />,
    showcase: (p) => <Phones {...p} />,
    offers: (p) => <Offers {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
