"use client";
// Design « Vortex Rouge » : studio motion noir / blanc / rouge.
// En-tête noir (logo X), hero noir portrait + éclats rouges, « à propos » blanc
// (story + stats), cartes services sombres (features), vignettes vidéo (showcase),
// process en cercles numérotés (how), coloris + avis (reviews), commande, FAQ,
// bandeau rouge (final_cta) et pied de page noir fin.
// Images : 0 hero · 1 à propos · 2-5 vignettes vidéo · 6 produit (commande).
import React from "react";
import type { Design } from "../types";
import type { SectionProps } from "../../Sections";
import type { VM } from "../../model";
import { VideoFrame } from "../../parts";
import { Buy, discount, Go, goTo, Icon, iconAt, Img, money, navOf, OrderBox, scrollToOrder, sid, tr } from "../kit";
import "./style.css";

const FEAT_ICONS = ["eye", "sun", "target", "spring", "shield", "box"];
const STAT_ICONS = ["award", "sun", "target", "eye"];

/** Ponctuation finale (. ? !) en rouge, comme les titres de la maquette. */
function Paint({ text, hl }: { text: string; hl?: string }) {
  const m = text.match(/^([\s\S]*?)([.?!؟]+)\s*$/);
  const body = m ? m[1] : text;
  const end = m ? m[2] : "";
  const i = hl ? body.toLowerCase().indexOf(hl.toLowerCase()) : -1;
  return (
    <>
      {i >= 0 && hl ? (
        <>
          {body.slice(0, i)}
          <em>{body.slice(i, i + hl.length)}</em>
          {body.slice(i + hl.length)}
        </>
      ) : (
        body
      )}
      {end ? <i className="vr-dot">{end}</i> : null}
    </>
  );
}

/** Logo : X rouge + nom (dernière lettre en rouge). */
function Logo({ vm }: { vm: VM }) {
  const n = vm.name.trim();
  return (
    <span className="vr-logo">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M3 3h7l6 9 6-9h7L19.5 16 29 29h-7l-6-9-6 9H3l9.5-13z" fill="currentColor" />
        <path d="M3 3h7l6 9-3.5 4z" fill="#fff" opacity=".22" />
      </svg>
      <b>
        {n.slice(0, -1)}
        <i>{n.slice(-1)}</i>
      </b>
    </span>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <small className="vr-eyebrow">{children}</small>;

/** Fenêtre vidéo (si la page a une vidéo) ; sinon on va aux visuels. */
function useReel(vm: VM) {
  const [open, setOpen] = React.useState(false);
  const play = () => (vm.videoUrl ? setOpen(true) : goTo("showcase"));
  const modal = open ? (
    <div className="vr-modal" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
      <div className="vr-modal-in" onClick={(e) => e.stopPropagation()}>
        <VideoFrame vm={vm} />
        <button type="button" className="vr-modal-x" aria-label={tr(vm, "Fermer", "سد")} onClick={() => setOpen(false)}>
          <Icon name="close" />
        </button>
      </div>
    </div>
  ) : null;
  return { play, modal };
}

function Header({ vm }: SectionProps) {
  return (
    <header className="vr-header">
      <div className="vr-wrap vr-header-row">
        <a
          href="#"
          className="vr-logo-link"
          onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          <Logo vm={vm} />
        </a>
        <nav className="vr-nav">
          <a
            href="#"
            className="vr-on"
            onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}
          >
            {tr(vm, "Accueil", "الرئيسية")}
          </a>
          {navOf(vm, 6).map((l) => (
            <Go key={l.key} to={l.key}>
              {l.label}
            </Go>
          ))}
        </nav>
        <Buy vm={vm} className="vr-btn vr-btn-sm" arrow>
          {tr(vm, "Commander", "اطلب")}
        </Buy>
      </div>
    </header>
  );
}

function Hero({ vm }: SectionProps) {
  const { play, modal } = useReel(vm);
  return (
    <section className="vr-hero" id={sid("hero")}>
      <Img vm={vm} i={0} className="vr-hero-img" />
      <div className="vr-wrap vr-hero-in">
        <div className="vr-hero-copy">
          {vm.eyebrow && vm.show.badge ? <Eyebrow>{vm.eyebrow}</Eyebrow> : null}
          <h1 className="vr-h1">
            <Paint text={vm.headline} hl={vm.highlight} />
          </h1>
          {vm.show.subtitle && vm.subheadline ? <p className="vr-lead">{vm.subheadline}</p> : null}
          <div className="vr-hero-actions">
            {vm.show.cta ? <Buy vm={vm} className="vr-btn" arrow /> : null}
            <button type="button" className="vr-reel" onClick={play}>
              <span className="vr-reel-ring">
                <Icon name="play" />
              </span>
              <span>
                {tr(vm, "Voir", "شوف")}
                <br />
                {tr(vm, "le film", "الفيديو")}
              </span>
            </button>
          </div>
        </div>
        <div className="vr-sign">
          <span className="vr-sign-name">{vm.name}</span>
          {vm.show.price && vm.price ? (
            <small>
              {tr(vm, "Prix de lancement", "ثمن الإطلاق")}
              <br />
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
            </small>
          ) : null}
        </div>
      </div>
      {modal}
    </section>
  );
}

function About({ vm }: SectionProps) {
  const st = vm.stats;
  const badge = st.length >= 4 ? st[0] : null;
  const list = badge ? st.slice(1, 4) : st.slice(0, 3);
  const ghost = vm.name.split(/\s+/)[0] || vm.name;
  return (
    <section className="vr-about" id={sid("story")}>
      <div className="vr-wrap vr-about-in">
        <div className="vr-about-art">
          <span className="vr-ghost" aria-hidden="true">
            {ghost}
          </span>
          <Img vm={vm} i={1} className="vr-about-img" alt="" />
          {badge ? (
            <span className="vr-badge">
              <b>{badge.value}</b>
              <small>{badge.label}</small>
            </span>
          ) : discount(vm) ? (
            <span className="vr-badge">
              <b>-{discount(vm)}%</b>
              <small>{tr(vm, "Offre de lancement", "عرض الإطلاق")}</small>
            </span>
          ) : null}
        </div>
        <div className="vr-about-copy">
          <Eyebrow>{vm.titles.story}</Eyebrow>
          <h2 className="vr-h2">
            <Paint text={vm.story.title} />
          </h2>
          {vm.story.text ? <p className="vr-text">{vm.story.text}</p> : null}
          {list.length ? (
            <ul className="vr-stats">
              {list.map((s, i) => (
                <li key={i}>
                  <Icon name={iconAt(STAT_ICONS, i)} />
                  <span>
                    <b>{s.value}</b>
                    <small>{s.label}</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <Buy vm={vm} className="vr-btn vr-btn-dark vr-btn-dl">
            <span>{vm.cta}</span>
            <Icon name="down" />
          </Buy>
        </div>
      </div>
    </section>
  );
}

function Services({ vm }: SectionProps) {
  return (
    <section className="vr-services" id={sid("features")}>
      <div className="vr-wrap">
        <div className="vr-head-c">
          <Eyebrow>{tr(vm, "Ce qui la rend unique", "اللي كيميزها")}</Eyebrow>
          <h2 className="vr-h2">
            <Paint text={vm.titles.features} />
          </h2>
        </div>
        <div className="vr-cards">
          {vm.features.slice(0, 6).map((f, i) => (
            <article key={i} className="vr-card">
              <span className="vr-card-ico">
                <Icon name={iconAt(FEAT_ICONS, i)} />
              </span>
              <h3>{f.title}</h3>
              {f.text ? <p>{f.text}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Works({ vm }: SectionProps) {
  const { play, modal } = useReel(vm);
  return (
    <section className="vr-works" id={sid("showcase")}>
      <div className="vr-wrap">
        <div className="vr-head-row">
          <div>
            <Eyebrow>{tr(vm, "En action", "ف الواقع")}</Eyebrow>
            <h2 className="vr-h2">
              <Paint text={vm.titles.showcase} />
            </h2>
          </div>
          <Go to="order" className="vr-link">
            {tr(vm, "Commander la vôtre", "اطلب ديالك")} <Icon name="up" />
          </Go>
        </div>
        <div className="vr-tiles">
          {[0, 1, 2, 3].map((_, k) => {
            const [t, sub] = (vm.imageLabels[k] || "").split(/\s+[—–-]\s+/);
            return (
              <button
                type="button"
                key={k}
                className="vr-tile"
                onClick={vm.videoUrl ? play : scrollToOrder}
                aria-label={t || vm.name}
              >
                <Img vm={vm} i={2 + k} className="vr-tile-img" alt="" />
                <span className="vr-play">
                  <Icon name="play" />
                </span>
                <span className="vr-tile-cap">
                  <b>{t || vm.name}</b>
                  <small>{sub || (vm.variants[k]?.name ?? vm.cta)}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {modal}
    </section>
  );
}

function Process({ vm }: SectionProps) {
  return (
    <section className="vr-process" id={sid("how")}>
      <div className="vr-wrap">
        <div className="vr-head-c">
          <Eyebrow>{tr(vm, "Comment ça marche", "كيفاش كتخدم")}</Eyebrow>
          <h2 className="vr-h2">
            <Paint text={vm.titles.how} />
          </h2>
        </div>
        <ol className="vr-steps" style={{ ["--n" as string]: Math.min(vm.steps.length, 6) }}>
          {vm.steps.slice(0, 6).map((s, i) => (
            <li key={i}>
              <span className="vr-num">{i + 1}</span>
              <h3>{s.title}</h3>
              {s.text ? <p>{s.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const MARK_STYLES = ["vr-mk-a", "vr-mk-b", "vr-mk-c", "vr-mk-d", "vr-mk-e", "vr-mk-f", "vr-mk-g", "vr-mk-h"];

function Clients({ vm, setVariant }: SectionProps) {
  const [k, setK] = React.useState(0);
  const r = vm.reviews[k % vm.reviews.length];
  const marks = vm.variants.length ? vm.variants.map((v) => v.name) : vm.trust;
  return (
    <section className="vr-clients" id={sid("reviews")}>
      <div className="vr-wrap vr-clients-in">
        <div>
          <Eyebrow>{tr(vm, "Coloris & avis", "الألوان والآراء")}</Eyebrow>
          <h2 className="vr-h2">
            <Paint text={vm.titles.reviews} />
          </h2>
          <div className="vr-marks">
            {marks.slice(0, 8).map((m, i) =>
              vm.variants.length ? (
                <button
                  type="button"
                  key={i}
                  className={"vr-mark " + MARK_STYLES[i % 8]}
                  onClick={() => {
                    setVariant(i);
                    scrollToOrder();
                  }}
                >
                  {m}
                </button>
              ) : (
                <span key={i} className={"vr-mark " + MARK_STYLES[i % 8]}>
                  {m}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="vr-quote-wrap">
          <figure className="vr-quote">
            <span className="vr-q" aria-hidden="true">
              “
            </span>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <span className="vr-avatar">{r.name.charAt(0)}</span>
              <span>
                <b>{r.name}</b>
                <small>{r.city || tr(vm, "Client vérifié", "زبون")}</small>
              </span>
            </figcaption>
          </figure>
          {vm.reviews.length > 1 ? (
            <div className="vr-dots">
              {vm.reviews.slice(0, 8).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={i === k % vm.reviews.length ? "vr-on" : ""}
                  aria-label={String(i + 1)}
                  onClick={() => setK(i)}
                />
              ))}
            </div>
          ) : null}
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
      className="vr-order"
      title={<Paint text={vm.titles.order} />}
      aside={
        <>
          <Eyebrow>{tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}</Eyebrow>
          <div className="vr-order-art">
            <Img vm={vm} i={6} className="vr-order-img" alt="" />
          </div>
          <ul>
            {vm.trust.slice(0, 3).map((t, i) => (
              <li key={i}>
                <Icon name={iconAt(["truck", "cash", "swap"], i)} /> {t}
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
    <section className="vr-faq" id={sid("faq")}>
      <div className="vr-wrap vr-faq-in">
        <div>
          <Eyebrow>{tr(vm, "Besoin d'aide", "محتاج مساعدة")}</Eyebrow>
          <h2 className="vr-h2">
            <Paint text={vm.titles.faq} />
          </h2>
          <Buy vm={vm} className="vr-btn vr-btn-dark" arrow />
        </div>
        <div className="vr-faq-list">
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

function Final({ vm }: SectionProps) {
  const contacts: [string, React.ReactNode][] = [];
  if (vm.whatsapp)
    contacts.push([
      "phone",
      <a key="w" href={`https://wa.me/${vm.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
        +{vm.whatsapp}
      </a>,
    ]);
  contacts.push(["truck", vm.trust[0] || vm.delivery]);
  contacts.push(["pin", tr(vm, "Partout au Maroc", "ف كاع المدن ديال المغرب")]);
  return (
    <section className="vr-final" id={sid("final_cta")}>
      <div className="vr-wrap vr-final-in">
        <div>
          <Eyebrow>{vm.titles.final_cta}</Eyebrow>
          <h2 className="vr-final-title">
            <Paint text={vm.finalCta.title} />
          </h2>
        </div>
        <div className="vr-final-mid">
          {vm.finalCta.text ? <p>{vm.finalCta.text}</p> : null}
          <Buy vm={vm} className="vr-btn vr-btn-black" arrow />
        </div>
        <div className="vr-final-end">
          <ul>
            {contacts.map(([ic, c], i) => (
              <li key={i}>
                <span>
                  <Icon name={ic} />
                </span>
                {c}
              </li>
            ))}
          </ul>
          {vm.whatsapp ? (
            <a
              className="vr-social"
              href={`https://wa.me/${vm.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Footer({ vm }: SectionProps) {
  return (
    <footer className="vr-footer">
      <div className="vr-wrap vr-footer-row">
        <Logo vm={vm} />
        <small>
          © {new Date().getFullYear()} {vm.name}. {tr(vm, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
        </small>
        <nav>
          <Go to="faq">{vm.titles.faq.replace(/[.?!]+$/, "")}</Go>
          <Go to="order">{tr(vm, "Commander", "اطلب")}</Go>
        </nav>
      </div>
    </footer>
  );
}

const design: Design = {
  fonts: "family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@500;600",
  font: '"Manrope", "Inter", system-ui, sans-serif',
  heading: '"Oswald", "Bebas Neue", Impact, sans-serif',
  header: (p) => <Header {...p} />,
  hero: (p) => <Hero {...p} />,
  footer: (p) => <Footer {...p} />,
  sections: {
    story: (p) => <About {...p} />,
    features: (p) => <Services {...p} />,
    showcase: (p) => <Works {...p} />,
    how: (p) => <Process {...p} />,
    reviews: (p) => <Clients {...p} />,
    order: (p) => <Order {...p} />,
    faq: (p) => <Faq {...p} />,
    final_cta: (p) => <Final {...p} />,
  },
};
export default design;
