"use client";
// Design « Voiture électrique » (classes vd-*) : en-tête blanc (logo V + marque, nav centrée, langue,
// bouton vert), hero SUV en scène architecturale + pastille d'icônes, carte fiche technique,
// recharge (3 cartes photo), gamme en carrousel, bande impact vert clair, avis, commande,
// FAQ, bandeau recharge (CTA vers le formulaire) et grand pied de page blanc.
//
// Images : 0 hero · 1-3 cartes recharge (features) · 4-6 gamme (variants, légendes vm.imageLabels)
//          5 commande · 7 bandeau final (arrière + câble).
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
  totalFor,
  tr,
} from "../kit";
import "./style.css";

/** Icônes propres au design (voiture, sapin, recyclage, prise) ; sinon icônes du kit. */
const OWN: Record<string, React.ReactNode> = {
  car: (
    <>
      <path d="M4 15v-3l2-5h12l2 5v3" />
      <path d="M3 15h18v3H3z" />
      <circle cx="7" cy="15.5" r="1" />
      <circle cx="17" cy="15.5" r="1" />
      <path d="M5 18v2M19 18v2M7 11h10" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3 7 9h3l-4 5h4l-4 5h12l-4-5h4l-4-5h3z" />
      <path d="M12 19v3" />
    </>
  ),
  recycle: (
    <>
      <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12A8 8 0 0 1 18.3 7.1" />
      <path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2" />
    </>
  ),
  plug: (
    <>
      <path d="M13 2 6 13h5l-1 9 8-12h-5z" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
};
const Ico = ({ name }: { name: string }) =>
  OWN[name] ? (
    <svg
      className="lpx-ico"
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
      {OWN[name]}
    </svg>
  ) : (
    <Icon name={name} />
  );

const SPEC_ICONS = ["battery", "bolt", "plug", "car", "shield"];
const STAT_ICONS = ["leaf", "tree", "recycle", "globe"];
const RAIL = [
  { key: "specs", icon: "bolt" },
  { key: "variants", icon: "car" },
  { key: "stats", icon: "leaf" },
  { key: "order", icon: "user" },
];

/** « valeur · note » → [valeur, note] */
const split = (s: string) => {
  const [a, ...b] = s.split(/\s*[·|]\s*/);
  return [a || "", b.join(" · ")] as const;
};
const Arrow = ({ rtl }: { rtl: boolean }) => <Icon name={rtl ? "back" : "arrow"} />;

/** Logo : V vert + nom, le dernier mot court (« EV ») en vert. */
function Logo({ vm }: { vm: SectionProps["vm"] }) {
  const words = vm.name.trim().split(/\s+/);
  const last = words.length > 1 && words[words.length - 1].length <= 3 ? words.pop() : "";
  return (
    <span className="vd-logo">
      <svg viewBox="0 0 32 28" aria-hidden="true">
        <path d="M1 2h8l7 15 7-15h8L19 27h-6z" fill="currentColor" />
        <path d="M9 2h5l2 5-2.5 5z" fill="#ffffff" opacity=".45" />
      </svg>
      <b dir="auto">
        {words.join(" ")}
        {last ? <i>{last}</i> : null}
      </b>
    </span>
  );
}

function Header({ vm }: SectionProps) {
  return (
    <header className="vd-header">
      <div className="vd-wrap vd-header-row">
        <a
          className="vd-logo-link"
          href="#"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <Logo vm={vm} />
        </a>
        <nav className="vd-nav">
          {navOf(vm, 6).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <div className="vd-header-end">
          <span className="vd-lang">
            <Icon name="globe" />
            {vm.lang.toUpperCase()}
            <Icon name="down" />
          </span>
          <Buy vm={vm} className="vd-btn vd-btn-sm" arrow />
        </div>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const second = vm.order.includes("variants") && !vm.hidden.has("variants") && vm.variants.length ? "variants" : "";
  const more = vm.order.find((k) => ["features", "specs", "reviews"].includes(k) && !vm.hidden.has(k)) || "order";
  return (
    <section className="vd-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="vd-hero-img" />
      <div className="vd-wrap vd-hero-in">
        <div className="vd-hero-copy">
          {vm.eyebrow && vm.show.badge ? <small className="vd-eyebrow">{vm.eyebrow}</small> : null}
          <Headline vm={vm} className="vd-h1" />
          {vm.show.subtitle && vm.subheadline ? <p className="vd-lead">{vm.subheadline}</p> : null}
          {vm.show.price && vm.price ? (
            <p className="vd-hero-price">
              <span>{tr(vm, "À partir de", "ابتداءً من")}</span>
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              {discount(vm) ? <em>-{discount(vm)}%</em> : null}
            </p>
          ) : null}
          <div className="vd-hero-btns">
            {vm.show.cta ? <Buy vm={vm} className="vd-btn" arrow /> : null}
            <Go to={second || "order"} className="vd-btn-ghost">
              {second ? tr(vm, "Voir les modèles", "شوف الموديلات") : tr(vm, "Réserver", "احجز")}
            </Go>
          </div>
          <Go to={more} className="vd-watch">
            <span>
              <Icon name="play" />
            </span>
            {tr(vm, "Découvrir en détail", "اكتشف التفاصيل")}
          </Go>
        </div>
      </div>
      <nav className="vd-rail" aria-label={vm.name}>
        {RAIL.map((r) => (
          <button key={r.key} type="button" aria-label={vm.titles[r.key] || r.key} onClick={() => goTo(r.key)}>
            <Ico name={r.icon} />
          </button>
        ))}
      </nav>
    </section>
  );
}

function Specs({ vm }: SectionProps) {
  return (
    <section className="vd-specs" id={sid("specs")}>
      <div className="vd-wrap">
        <h2 className="vd-sr">{vm.titles.specs}</h2>
        <ul className="vd-specs-card">
          {vm.specs.slice(0, 5).map((s, i) => {
            const [v, note] = split(s.value);
            return (
              <li key={i}>
                <span className="vd-spec-ico">
                  <Ico name={iconAt(SPEC_ICONS, i)} />
                </span>
                <span className="vd-spec-txt">
                  <b>{v}</b>
                  <b>{s.label}</b>
                  {note ? <small>{note}</small> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Features({ vm }: SectionProps) {
  return (
    <section className="vd-sec vd-charge" id={sid("features")}>
      <div className="vd-wrap vd-charge-in">
        <div className="vd-charge-copy">
          <small className="vd-eyebrow">{tr(vm, "Recharge partout", "شحن فكل بلاصة")}</small>
          <h2 className="vd-h2">{vm.titles.features}</h2>
          {vm.description ? <p>{vm.description}</p> : null}
          <Buy vm={vm} className="vd-btn" arrow />
        </div>
        <div className="vd-charge-cards">
          {vm.features.slice(0, 6).map((f, i) => (
            <article key={i} className="vd-ccard">
              <Img vm={vm} i={1 + (i % 3)} className="vd-ccard-img" alt={f.title} />
              <div>
                <h3>{f.title}</h3>
                {f.text ? <p>{f.text}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lineup({ vm, variant, setVariant }: SectionProps) {
  const track = React.useRef<HTMLDivElement>(null);
  const n = vm.variants.length;
  const show = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    const t = track.current;
    if (!el || !t) return;
    const left = el.offsetLeft - t.offsetLeft - (t.clientWidth - el.clientWidth) / 2;
    t.scrollTo({ left: vm.rtl ? left - (t.scrollWidth - t.clientWidth) * 0 : left, behavior: "smooth" });
  };
  const move = (d: number) => {
    const i = (variant + d + n) % n;
    setVariant(i);
    show(i);
  };
  const specs = vm.specs.slice(0, 3);
  return (
    <section className="vd-sec vd-lineup" id={sid("variants")}>
      <div className="vd-wrap">
        <div className="vd-head">
          <small className="vd-eyebrow">{tr(vm, "Notre gamme", "التشكيلة ديالنا")}</small>
          <h2 className="vd-h2">{vm.titles.variants}</h2>
        </div>
        <div className="vd-carousel">
          <button type="button" className="vd-round" aria-label="‹" onClick={() => move(-1)}>
            <Icon name={vm.rtl ? "arrow" : "back"} />
          </button>
          <div className="vd-track" ref={track}>
            {vm.variants.map((v, i) => {
              const tag = vm.imageLabels[4 + i] || "";
              return (
                <article
                  key={v.name + i}
                  className={"vd-model" + (i === variant ? " is-on" : "")}
                  onClick={() => setVariant(i)}
                >
                  <div className="vd-model-top">
                    <div>
                      <h3>{v.name}</h3>
                      {tag ? <p>{tag}</p> : null}
                    </div>
                    {i === variant ? (
                      <span className="vd-pill">{tr(vm, "Votre choix", "اختيارك")}</span>
                    ) : v.color ? (
                      <span className="vd-swatch" style={{ background: v.color }} />
                    ) : null}
                  </div>
                  <Img vm={vm} i={4 + i} className="vd-model-img" alt={v.name} />
                  {specs.length ? (
                    <ul className="vd-model-specs">
                      {specs.map((s, k) => (
                        <li key={k}>
                          <b>{split(s.value)[0]}</b>
                          <small>{s.label}</small>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <button
                    type="button"
                    className="vd-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariant(i);
                      scrollToOrder();
                    }}
                  >
                    {tr(vm, "Réserver ce modèle", "احجز هاد الموديل")} <Arrow rtl={vm.rtl} />
                  </button>
                </article>
              );
            })}
          </div>
          <button type="button" className="vd-round" aria-label="›" onClick={() => move(1)}>
            <Icon name={vm.rtl ? "back" : "arrow"} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Impact({ vm }: SectionProps) {
  return (
    <section className="vd-impact" id={sid("stats")}>
      <div className="vd-wrap vd-impact-in">
        <div className="vd-impact-copy">
          <small className="vd-eyebrow">{tr(vm, "Notre impact", "الأثر ديالنا")}</small>
          <h2 className="vd-h2">{vm.titles.stats}</h2>
          <Buy vm={vm} className="vd-btn" arrow />
        </div>
        <ul className="vd-stats">
          {vm.stats.slice(0, 4).map((s, i) => {
            const [label, note] = split(s.label);
            return (
              <li key={i}>
                <span className="vd-stat-ico">
                  <Ico name={iconAt(STAT_ICONS, i)} />
                </span>
                <b>{s.value}</b>
                <strong>{label}</strong>
                {note ? <small>{note}</small> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ vm }: SectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [on, setOn] = React.useState(0);
  const onScroll = () => {
    const t = ref.current;
    const c = t?.children[0] as HTMLElement | undefined;
    if (!t || !c) return;
    setOn(Math.min(vm.reviews.length - 1, Math.round(Math.abs(t.scrollLeft) / (c.offsetWidth + 24))));
  };
  const go = (i: number) => {
    const t = ref.current;
    const c = t?.children[i] as HTMLElement | undefined;
    if (!t || !c) return;
    t.scrollTo({ left: (vm.rtl ? -1 : 1) * i * (c.offsetWidth + 24), behavior: "smooth" });
    setOn(i);
  };
  return (
    <section className="vd-sec vd-reviews" id={sid("reviews")}>
      <div className="vd-wrap">
        <div className="vd-head">
          <small className="vd-eyebrow">{tr(vm, "Ce que disent nos conducteurs", "شنو كيقولو السائقين")}</small>
          <h2 className="vd-h2">{vm.titles.reviews}</h2>
        </div>
        <div className="vd-revs" ref={ref} onScroll={onScroll}>
          {vm.reviews.map((r, i) => (
            <article className="vd-rev" key={i}>
              <span className="vd-quote" aria-hidden="true">
                “
              </span>
              <div className="vd-rev-body">
                <p>{r.text}</p>
                <div className="vd-rev-foot">
                  <div>
                    <b>
                      — {r.name}
                      {r.city ? <small> · {r.city}</small> : null}
                    </b>
                    <Stars n={r.rating} className="vd-stars" />
                  </div>
                  <span className="vd-avatar" aria-hidden="true">
                    {r.name
                      .split(/\s+/)
                      .map((w) => w.charAt(0))
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {vm.reviews.length > 1 ? (
          <div className="vd-dots">
            {vm.reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={String(i + 1)}
                className={i === on ? "is-on" : ""}
                onClick={() => go(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Order(p: SectionProps) {
  const { vm } = p;
  const v = vm.variants[p.variant];
  return (
    <OrderBox
      p={p}
      className="vd-order"
      title={vm.titles.order}
      aside={
        <>
          <small className="vd-eyebrow">{tr(vm, "Demande de réservation", "طلب الحجز")}</small>
          <div className="vd-order-card">
            <Img vm={vm} i={vm.variants.length ? 4 + Math.min(p.variant, 2) : 0} className="vd-order-img" />
            <div className="vd-order-name">
              <b>{v ? v.name : vm.name}</b>
              {vm.price ? <span>{money(vm, totalFor(vm, p.qty))}</span> : null}
            </div>
          </div>
          <ul>
            {vm.trust.slice(0, 4).map((t, i) => (
              <li key={i}>
                <span>
                  <Icon name={iconAt(["truck", "cash", "shield", "headset"], i)} />
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
    <section className="vd-sec vd-faq-sec" id={sid("faq")}>
      <div className="vd-wrap vd-faq">
        <div className="vd-head">
          <small className="vd-eyebrow">{tr(vm, "Besoin d'aide ?", "محتاج مساعدة؟")}</small>
          <h2 className="vd-h2">{vm.titles.faq}</h2>
        </div>
        <div className="vd-faq-list">
          {vm.faq.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>
                {f.question}
                <span>
                  <Icon name="plus" />
                </span>
              </summary>
              {f.answer ? <p>{f.answer}</p> : null}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Final({ vm, qty, variant }: SectionProps) {
  const v = vm.variants[variant];
  return (
    <section className="vd-final" id={sid("final_cta")}>
      <Img vm={vm} i={7} className="vd-final-img" alt="" />
      <div className="vd-final-in">
        <div className="vd-final-copy">
          <h2 className="vd-h2">{vm.titles.final_cta}</h2>
          {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
        </div>
        <div className="vd-final-form">
          <span className="vd-fake">{v ? v.name : vm.name}</span>
          <span className="vd-fake">{vm.price ? money(vm, totalFor(vm, qty)) : vm.delivery}</span>
          <Buy vm={vm} className="vd-btn-dark" arrow />
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  const on = (k: string) => vm.order.includes(k) && !vm.hidden.has(k);
  const cols: [string, [string, string][]][] = [
    [tr(vm, "Modèles", "الموديلات"), on("variants") ? vm.variants.slice(0, 4).map((v) => ["variants", v.name]) : []],
    [
      tr(vm, "Recharge", "الشحن"),
      on("features") ? vm.features.slice(0, 4).map((f) => ["features", f.title] as [string, string]) : [],
    ],
    [
      tr(vm, "Technologie", "التكنولوجيا"),
      on("specs") ? vm.specs.slice(0, 4).map((s) => ["specs", s.label] as [string, string]) : [],
    ],
    [
      tr(vm, "Entreprise", "الشركة"),
      (
        [
          ["stats", tr(vm, "Notre impact", "الأثر ديالنا")],
          ["reviews", tr(vm, "Avis clients", "آراء الزبناء")],
          ["faq", "FAQ"],
        ] as [string, string][]
      ).filter(([k]) => on(k)),
    ],
    [
      tr(vm, "Assistance", "المساعدة"),
      [
        ["order", tr(vm, "Réserver un essai", "احجز تجربة")],
        ["order", tr(vm, "Livraison", "التوصيل")],
        ["faq", tr(vm, "Paiement", "الخلاص")],
      ],
    ],
  ];
  return (
    <footer className="vd-footer">
      <div className="vd-wrap">
        <div className="vd-foot-grid">
          <div className="vd-foot-brand">
            <Logo vm={vm} />
            {vm.description ? <p>{vm.description.split(/(?<=[.!?])\s/)[0]}</p> : null}
            {vm.whatsapp ? (
              <a
                className="vd-social"
                href={`https://wa.me/${vm.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" />
              </a>
            ) : null}
          </div>
          {cols
            .filter(([, l]) => l.length)
            .map(([h, links]) => (
              <nav key={h} className="vd-foot-col">
                <b>{h}</b>
                {links.map(([k, l], i) => (
                  <Go key={k + i} to={k}>
                    {l}
                  </Go>
                ))}
              </nav>
            ))}
        </div>
        <div className="vd-foot-bottom">
          <small>
            © {new Date().getFullYear()} {vm.name}. {tr(vm, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
          </small>
          <span>
            {vm.delivery.split(/\s*·\s*/).map((t, i) => (
              <small key={i}>{t}</small>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Outfit:wght@400;500;600&family=Inter:wght@400;500;600;700",
  font: '"Inter", system-ui, sans-serif',
  heading: '"Outfit", "Inter", system-ui, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    specs: (p) => <Specs {...p} />,
    features: (p) => <Features {...p} />,
    variants: (p) => <Lineup {...p} />,
    stats: (p) => <Impact {...p} />,
    reviews: (p) => <Reviews {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
