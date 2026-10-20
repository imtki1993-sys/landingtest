"use client";
// Les 16 variantes de hero. Le texte vient du contenu de la page
// (headline, subheadline, hero_badge_text, cta…), la mise en page du template.
import React from "react";
import type { VM } from "./model";
import { formatPrice } from "./i18n";
import {
  Countdown,
  cx,
  PriceRow,
  scrollToOrder,
  scrollToSection,
  Stage,
  starText,
  ThumbGallery,
  VideoFrame,
  waHref,
} from "./parts";

function Title({ vm }: { vm: VM }) {
  const { headline, highlight } = vm;
  if (!highlight || !headline.includes(highlight)) return <h1>{headline}</h1>;
  const [a, b] = headline.split(highlight);
  return (
    <h1>
      {a}
      <span className={cx("hl")}>{highlight}</span>
      {b}
    </h1>
  );
}

function Rating({ vm }: { vm: VM }) {
  if (!vm.show.rating || !vm.reviews.length) return null;
  const avg = vm.reviews.reduce((n, r) => n + r.rating, 0) / vm.reviews.length;
  return (
    <div className={cx("rating")}>
      <span className={cx("stars")}>{starText(avg)}</span>
      <span>
        {avg.toFixed(1)}/5 · {vm.reviews.length} {vm.u.reviews}
      </span>
    </div>
  );
}

function CtaButton({ vm, label, extra = "lg pulse" }: { vm: VM; label?: string; extra?: string }) {
  if (!vm.show.cta) return null;
  return (
    <button type="button" className={cx("btn", extra)} onClick={scrollToOrder}>
      {label || vm.cta}
    </button>
  );
}

function Actions({ vm, wa }: { vm: VM; wa?: boolean }) {
  return (
    <div className={cx("hero-actions")}>
      {vm.orderMode !== "whatsapp" && <CtaButton vm={vm} label={`${vm.cta} →`} />}
      {(wa || vm.orderMode !== "form") && vm.whatsapp && (
        <a className={cx("btn wa lg")} href={waHref(vm)} target="_blank" rel="noopener noreferrer">
          💬 {vm.u.orderWhatsapp}
        </a>
      )}
      <Cta2 vm={vm} />
    </div>
  );
}

/** Bouton secondaire : affiché seulement si le vendeur lui a donné un texte. */
function Cta2({ vm }: { vm: VM }) {
  if (!vm.show.cta2 || !vm.hero.cta2) return null;
  return (
    <button
      type="button"
      className={cx("btn ghost lg")}
      onClick={() => scrollToSection(vm.hero.cta2Target || "benefits")}
    >
      {vm.hero.cta2}
    </button>
  );
}

/** Liste à coches du hero (points écrits pour le hero, sinon titres des bénéfices). */
function Points({ vm }: { vm: VM }) {
  if (!vm.show.points || !vm.hero.points.length) return null;
  return (
    <ul className={cx("check-list")}>
      {vm.hero.points.slice(0, 6).map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}

/** Accroche promo au-dessus du titre (vide = rien). */
const Kicker = ({ vm }: { vm: VM }) =>
  vm.show.kicker && vm.hero.kicker ? <span className={cx("kicker")}>{vm.hero.kicker}</span> : null;

function Chips({ vm }: { vm: VM }) {
  if (!vm.show.trust || !vm.hero.trust.length) return null;
  return (
    <div className={cx("chips")}>
      {vm.hero.trust.slice(0, 3).map((t, i) => (
        <span className={cx("chip")} key={i}>
          {["🚚", "💵", "↩️"][i] || "✓"} {t}
        </span>
      ))}
    </div>
  );
}

const Eyebrow = ({ vm }: { vm: VM }) =>
  vm.show.badge && vm.eyebrow ? <span className={cx("badge eyebrow")}>{vm.eyebrow}</span> : null;
const Sub = ({ vm, style }: { vm: VM; style?: React.CSSProperties }) =>
  vm.show.subtitle && vm.subheadline ? (
    <p className={cx("sub")} style={style}>
      {vm.subheadline}
    </p>
  ) : null;

function Copy({ vm, chips = true }: { vm: VM; chips?: boolean }) {
  return (
    <div>
      <Kicker vm={vm} />
      <Eyebrow vm={vm} />
      <Title vm={vm} />
      <Sub vm={vm} />
      <Rating vm={vm} />
      <PriceRow vm={vm} />
      <Actions vm={vm} />
      {chips && <Chips vm={vm} />}
    </div>
  );
}

export function Hero({ vm }: { vm: VM }) {
  const v = vm.t.hero.variant;
  const img = vm.images[0];
  const img2 = vm.images[1] || img;
  const img3 = vm.images[2] || img;

  switch (v) {
    case "centered":
      return (
        <section className={cx("hero hero-centered")}>
          <div className={cx("container")}>
            <Copy vm={vm} />
            <Stage src={img} alt={vm.name} />
          </div>
        </section>
      );
    case "fullbleed":
      return (
        <section className={cx("hero hero-fullbleed")}>
          <div className={cx("bg")}>
            <img src={img} alt={vm.name} />
          </div>
          <div className={cx("overlay")}>
            <div className={cx("container")}>
              <Copy vm={vm} chips={false} />
            </div>
          </div>
        </section>
      );
    case "luxury":
      return (
        <section className={cx("hero hero-luxury")}>
          <div className={cx("container narrow")}>
            {vm.show.badge && vm.eyebrow ? (
              <div
                className={cx("accent")}
                style={{ letterSpacing: ".35em", fontSize: 12, textTransform: "uppercase" }}
              >
                {vm.eyebrow}
              </div>
            ) : null}
            <div className={cx("line")} />
            <Kicker vm={vm} />
            <Title vm={vm} />
            <Sub vm={vm} style={{ margin: "0 auto" }} />
            <div className={cx("line")} />
            <Stage src={img} alt={vm.name} extra="bare" />
            <PriceRow vm={vm} center />
            <CtaButton vm={vm} extra="lg" />
            <Cta2 vm={vm} />
          </div>
        </section>
      );
    case "ugc":
      return (
        <section className={cx("hero hero-ugc")}>
          <div className={cx("container hero-grid reverse")}>
            <Copy vm={vm} />
            <div className={cx("creator-card")}>
              <span className={cx("live")}>● LIVE</span>
              <div className={cx("face")}>😍</div>
              <img className={cx("held")} src={img} alt={vm.name} data-hero-main="" />
              {vm.ugc[0]?.handle ? <span className={cx("handle")}>{vm.ugc[0].handle}</span> : null}
            </div>
          </div>
        </section>
      );
    case "problem":
      return (
        <section className={cx("hero hero-problem")}>
          <div className={cx("container hero-grid")}>
            <Copy vm={vm} />
            <div className={cx("pain-grid")}>
              {[img, img2, img3, vm.images[3] || img].map((src, i) => (
                <Stage key={i} src={src} alt="" main={i === 0} />
              ))}
            </div>
          </div>
        </section>
      );
    case "flash":
      return (
        <section className={cx("hero hero-flash")}>
          <div className={cx("container hero-grid")}>
            <div>
              {vm.show.badge && vm.eyebrow ? <span className={cx("flash-top")}>⚡ {vm.eyebrow}</span> : null}
              <Kicker vm={vm} />
              <Title vm={vm} />
              <Sub vm={vm} />
              <div style={{ margin: "18px 0", display: "flex" }}>
                <Countdown vm={vm} />
              </div>
              <PriceRow vm={vm} />
              <Actions vm={vm} />
            </div>
            <Stage src={img} alt={vm.name} extra="bare" />
          </div>
        </section>
      );
    case "video":
      return (
        <section className={cx("hero hero-video")}>
          <div className={cx("container hero-grid reverse")}>
            <Copy vm={vm} />
            <VideoFrame vm={vm} />
          </div>
        </section>
      );
    case "beforeAfter":
      return (
        <section className={cx("hero hero-beforeafter")}>
          <div className={cx("container hero-grid")}>
            <Copy vm={vm} />
            <div className={cx("ba")}>
              <Stage src={vm.beforeImage} alt="" extra="before">
                <span className={cx("label")}>{vm.u.before}</span>
              </Stage>
              <Stage src={vm.afterImage} alt={vm.name}>
                <span className={cx("label")} style={{ background: "var(--primary)" }}>
                  {vm.u.after}
                </span>
              </Stage>
            </div>
          </div>
        </section>
      );
    case "whatsapp":
      return (
        <section className={cx("hero hero-whatsapp")}>
          <div className={cx("container hero-grid")}>
            <div>
              <Kicker vm={vm} />
              <Eyebrow vm={vm} />
              <Title vm={vm} />
              <Sub vm={vm} />
              <Rating vm={vm} />
              <PriceRow vm={vm} />
              <div className={cx("hero-actions")}>
                {vm.whatsapp ? (
                  <a className={cx("btn wa lg block")} href={waHref(vm)} target="_blank" rel="noopener noreferrer">
                    💬 {vm.u.orderWhatsapp}
                  </a>
                ) : (
                  <CtaButton vm={vm} extra="wa lg block" label={`💬 ${vm.u.orderWhatsapp}`} />
                )}
              </div>
              <Chips vm={vm} />
            </div>
            <div className={cx("phone")}>
              <div className={cx("screen")}>
                <div className={cx("wa-head")}>
                  <span className={cx("avatar")} style={{ width: 32, height: 32, background: "#25d366" }}>
                    🛍️
                  </span>{" "}
                  {vm.name}
                </div>
                <div className={cx("msgs")}>
                  <div className={cx("bubble me")}>
                    {vm.lang === "ar" ? "السلام، بغيت نطلب" : "Bonjour, je veux commander 🙂"}
                  </div>
                  <div className={cx("bubble")}>
                    <img src={img} alt="" />
                    <b>{vm.name}</b>
                    <br />
                    {vm.price ? `${formatPrice(vm.price, vm.currency)} ✅` : "✅"}
                  </div>
                  <div className={cx("bubble")}>
                    {vm.lang === "ar" ? "مرحبا! عطينا الاسم والمدينة 📦" : "Avec plaisir ! Votre nom et ville ? 📦"}
                  </div>
                  <div className={cx("bubble me")}>✅ 👍</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    case "editorial":
      return (
        <section className={cx("hero hero-editorial")}>
          <div className={cx("container hero-grid")}>
            <div>
              {vm.show.badge && vm.eyebrow ? (
                <div
                  className={cx("muted")}
                  style={{ letterSpacing: ".3em", fontSize: 12, textTransform: "uppercase", marginBottom: 16 }}
                >
                  {vm.eyebrow}
                </div>
              ) : null}
              <Kicker vm={vm} />
              <Title vm={vm} />
              <Sub vm={vm} />
              <PriceRow vm={vm} />
              <CtaButton vm={vm} label={`${vm.cta} →`} extra="lg" />
              <Cta2 vm={vm} />
            </div>
            <div className={cx("ed-grid")}>
              <Stage src={img} alt={vm.name} />
              <Stage src={img2} alt="" />
              <Stage src={img3} alt="" />
            </div>
          </div>
        </section>
      );
    case "neon":
      return (
        <section className={cx("hero hero-neon")}>
          <div className={cx("container hero-grid")}>
            <Copy vm={vm} />
            <Stage src={img} alt={vm.name} extra="bare" />
          </div>
        </section>
      );
    case "sport":
      return (
        <section className={cx("hero hero-sport")}>
          <div className={cx("container hero-grid")}>
            <div>
              <Kicker vm={vm} />
              <Eyebrow vm={vm} />
              <Title vm={vm} />
              <Sub vm={vm} />
              <PriceRow vm={vm} />
              <CtaButton vm={vm} label={`${vm.cta} →`} extra="lg" />
              <Cta2 vm={vm} />
            </div>
            <Stage src={img} alt={vm.name} />
          </div>
        </section>
      );
    case "marketplace":
      return (
        <section className={cx("hero hero-marketplace")}>
          <div className={cx("container mk-grid")}>
            <ThumbGallery vm={vm} />
            <div className={cx("buy-box")}>
              <Kicker vm={vm} />
              <Eyebrow vm={vm} />
              <h1 style={{ fontSize: "clamp(26px,3.4cqi,36px)", marginTop: 12 }}>{vm.headline}</h1>
              <Rating vm={vm} />
              <PriceRow vm={vm} />
              <Points vm={vm} />
              <CtaButton vm={vm} label={vm.cta} extra="block lg pulse" />
              <Chips vm={vm} />
            </div>
          </div>
        </section>
      );
    case "minimal":
      return (
        <section className={cx("hero hero-minimal hero-centered")}>
          <div className={cx("container narrow")}>
            <Kicker vm={vm} />
            <Title vm={vm} />
            <Sub vm={vm} />
            <Stage src={img} alt={vm.name} />
            <PriceRow vm={vm} center />
            <CtaButton vm={vm} extra="lg" />
            <Cta2 vm={vm} />
          </div>
        </section>
      );
    case "oneScreen":
      return (
        <section className={cx("hero hero-onescreen")}>
          <div className={cx("container")}>
            <div className={cx("os-card")}>
              <Stage src={img} alt={vm.name} />
              <div>
                <Kicker vm={vm} />
                <Title vm={vm} />
                <Points vm={vm} />
                <Rating vm={vm} />
                <PriceRow vm={vm} />
                <Actions vm={vm} wa />
              </div>
            </div>
          </div>
        </section>
      );
    case "split":
    default:
      return (
        <section className={cx("hero")}>
          <div className={cx("container hero-grid")}>
            <Copy vm={vm} />
            <Stage src={img} alt={vm.name}>
              {vm.demo && vm.t.hero.badge ? <span className={cx("badge solid tag")}>{vm.t.hero.badge}</span> : null}
            </Stage>
          </div>
        </section>
      );
  }
}
