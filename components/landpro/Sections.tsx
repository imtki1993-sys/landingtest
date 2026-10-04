"use client";
// Toutes les sections des templates (natives de l'éditeur + LandPro + blocs personnalisés).
import React from "react";
import type { VM } from "./model";
import { formatPrice } from "./i18n";
import { Countdown, cx, OfferPicker, OrderForm, PriceRow, scrollToOrder, Stage, starText, VariantPicker, VideoFrame, waHref } from "./parts";

export interface SectionProps {
  vm: VM;
  qty: number;
  setQty: (q: number) => void;
  variant: number;
  setVariant: (i: number) => void;
  preview: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, qty: number) => void;
}

const AVATAR = ["#f97316", "#8b5cf6", "#0ea5e9", "#ec4899", "#10b981", "#eab308"];
const H = ({ children }: { children: React.ReactNode }) => <h2 className={cx("section-title")}>{children}</h2>;
const Wrap = ({ alt, narrow, children, id }: { alt?: boolean; narrow?: boolean; id?: string; children: React.ReactNode }) => (
  <section className={cx("section", alt && "alt")} id={id}>
    <div className={cx("container", narrow && "narrow")}>{children}</div>
  </section>
);

/** Une section est « vide » quand elle n'a aucune donnée à afficher : masquée en ligne, signalée dans l'éditeur. */
export function isEmpty(key: string, vm: VM): boolean {
  switch (key) {
    case "benefits": return !vm.benefits.length;
    case "features": return !vm.features.length;
    case "faq": return !vm.faq.length;
    case "problem": return !vm.problem.pains.length && !vm.problem.solution;
    case "reviews": return !vm.reviews.length;
    case "stats": return !vm.stats.length;
    case "ugc": return !vm.ugc.length;
    case "comparison": return !vm.comparison.length;
    case "specs": return !vm.specs.length;
    case "variants": return !vm.variants.length;
    case "video": return !vm.videoUrl && !vm.demo;
    case "whatsapp": return !vm.whatsapp && !vm.demo;
    case "story": return !vm.story.text;
    case "showcase": return !vm.images.length;
    default: return false;
  }
}

export const EMPTY_HINT: Record<string, string> = {
  benefits: "Ajoutez des bénéfices (1 par ligne) dans le panneau.",
  features: "Ajoutez des caractéristiques (1 par ligne, format « Titre : texte »).",
  faq: "Ajoutez des questions dans le panneau.",
  problem: "Renseignez le problème et la solution dans le panneau.",
  reviews: "Ajoutez de vrais avis clients dans le panneau. Section masquée en ligne tant qu'elle est vide.",
  stats: "Ajoutez vos chiffres clés (ex. 12 000 | Clients livrés).",
  ugc: "Ajoutez les comptes des créateurs et leur citation.",
  comparison: "Ajoutez des lignes de comparaison.",
  specs: "Ajoutez la fiche technique (ex. Poids | 280 g).",
  variants: "Ajoutez les variantes (ex. Noir | #111111).",
  video: "Collez l'URL de votre vidéo (YouTube, Vimeo ou MP4).",
  whatsapp: "Renseignez le numéro WhatsApp de la boutique pour activer ce bloc.",
  story: "Ajoutez le texte de présentation.",
  showcase: "Ajoutez des photos produit.",
};

export function renderSection(key: string, p: SectionProps): React.ReactNode {
  const { vm } = p;
  const T = vm.titles;
  switch (key) {
    case "announcement":
      return <div className={cx("announcement")}>{vm.announcement}</div>;

    case "trust":
      return (
        <div className={cx("trust")}>
          <div className={cx("container")}>
            {vm.trust.slice(0, 4).map((t, i) => (
              <div className={cx("trust-item")} key={i}><span className={cx("ic")}>{["🚚", "💵", "↩️", "🎧"][i] || "✓"}</span>{t}</div>
            ))}
          </div>
        </div>
      );

    case "features":
      return (
        <Wrap>
          <H>{T.features}</H>
          <div className={cx("grid g4")}>
            {vm.features.map((f, i) => (
              <div className={cx("feature")} key={i}>
                <div className={cx("ic")}>{f.icon}</div>
                <h3>{f.title}</h3>
                {f.text ? <p>{f.text}</p> : null}
              </div>
            ))}
          </div>
        </Wrap>
      );

    case "benefits":
      return (
        <Wrap alt>
          <H>{T.benefits}</H>
          <div className={cx("grid g2")}>
            {vm.benefits.map((b, i) => (
              <div className={cx("card benefit")} key={i}>
                <span className={cx("num")}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 style={{ fontSize: 19 }}>{b.title}</h3>
                  {b.text ? <p className={cx("muted")} style={{ margin: 0 }}>{b.text}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      );

    case "showcase": {
      const imgs = vm.images.length >= 4 ? vm.images.slice(0, 8) : [...vm.images, ...vm.images, ...vm.images, ...vm.images].slice(0, 4);
      return (
        <Wrap>
          <H>{T.showcase}</H>
          <div className={cx("gallery-grid")}>{imgs.map((src, i) => <Stage key={i} src={src} alt={`${vm.name} ${i + 1}`} />)}</div>
        </Wrap>
      );
    }

    case "story":
      return (
        <section className={cx("section alt")}>
          <div className={cx("container story")}>
            <Stage src={vm.images[1] || vm.images[0]} alt="" />
            <div>
              <span className={cx("badge")}>{vm.u.story}</span>
              <h2 style={{ fontSize: "clamp(28px,4cqi,42px)", marginTop: 14 }}>{vm.story.title}</h2>
              <p className={cx("muted")} style={{ whiteSpace: "pre-line" }}>{vm.story.text}</p>
              {vm.benefits.length ? <ul className={cx("check-list")}>{vm.benefits.slice(0, 4).map((b, i) => <li key={i}>{b.title}</li>)}</ul> : null}
              <button type="button" className={cx("btn")} onClick={scrollToOrder}>{vm.cta}</button>
            </div>
          </div>
        </section>
      );

    case "how":
      return (
        <Wrap>
          <H>{T.how}</H>
          <div className={cx("grid g4 steps")}>
            {vm.steps.map((s, i) => (
              <div className={cx("step")} key={i}>
                <div className={cx("n")}>{i + 1}</div>
                <h3 style={{ fontSize: 17 }}>{s.title}</h3>
                {s.text ? <p className={cx("muted")} style={{ fontSize: 14 }}>{s.text}</p> : null}
              </div>
            ))}
          </div>
        </Wrap>
      );

    case "problem":
      return (
        <Wrap>
          {T.problem && T.problem !== vm.u.problem ? <H>{T.problem}</H> : null}
          <div className={cx("problem-box")}>
            {vm.problem.pains.length ? (
              <div className={cx("card bad")}>
                <h3>😩 {vm.u.problem}</h3>
                <ul className={cx("x-list")}>{vm.problem.pains.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            ) : null}
            <div className={cx("card good")}>
              <h3>✅ {vm.u.solution}</h3>
              <p style={{ whiteSpace: "pre-line" }}>{vm.problem.solution}</p>
              {vm.benefits.length ? <ul className={cx("check-list")} style={{ margin: 0 }}>{vm.benefits.slice(0, 3).map((b, i) => <li key={i}>{b.title}</li>)}</ul> : null}
            </div>
          </div>
        </Wrap>
      );

    case "before_after":
      return (
        <Wrap alt narrow>
          <H>{T.before_after}</H>
          <div className={cx("ba")}>
            <Stage src={vm.beforeImage} alt="" extra="before"><span className={cx("label")}>{vm.u.before}</span></Stage>
            <Stage src={vm.afterImage} alt=""><span className={cx("label")} style={{ background: "var(--primary)" }}>{vm.u.after}</span></Stage>
          </div>
        </Wrap>
      );

    case "stats":
      return (
        <Wrap alt>
          <div className={cx("stats")}>
            {vm.stats.map((s, i) => <div className={cx("stat")} key={i}><div className={cx("v")}>{s.value}</div><div className={cx("l")}>{s.label}</div></div>)}
          </div>
        </Wrap>
      );

    case "ugc":
      return (
        <Wrap>
          <H>{T.ugc}</H>
          <div className={cx("ugc-grid")}>
            {vm.ugc.slice(0, 8).map((x, i) => (
              <div className={cx("ugc-card")} key={i} style={{ background: `linear-gradient(170deg, ${AVATAR[i % AVATAR.length]}, #1a1a1a)` }}>
                <span className={cx("play-s")}>▶</span>
                <img src={vm.images[i % vm.images.length]} alt="" loading="lazy" />
                <div className={cx("meta")}><b>{x.handle}</b><br />{x.text}</div>
              </div>
            ))}
          </div>
        </Wrap>
      );

    case "reviews": {
      const avg = vm.reviews.reduce((n, r) => n + r.rating, 0) / vm.reviews.length;
      return (
        <Wrap alt>
          <H>{T.reviews}</H>
          <p className={cx("section-sub")}><span className={cx("stars")}>{starText(avg)}</span> {avg.toFixed(1)}/5 · {vm.reviews.length} {vm.u.reviews}</p>
          <div className={cx("grid g3")}>
            {vm.reviews.slice(0, 9).map((r, i) => (
              <div className={cx("card review")} key={i}>
                <div className={cx("who")}>
                  <span className={cx("avatar")} style={{ background: AVATAR[i % AVATAR.length] }}>{r.name.charAt(0)}</span>
                  <div><strong>{r.name}</strong><small>{r.city}</small></div>
                </div>
                <span className={cx("stars")}>{starText(r.rating)}</span>
                <p style={{ margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </Wrap>
      );
    }

    case "comparison": {
      const cell = (v: string) => (v === "✓" ? <span className={cx("yes")}>✓</span> : v === "✕" ? <span className={cx("no")}>✕</span> : <span className={cx("muted")}>{v}</span>);
      return (
        <Wrap narrow>
          <H>{T.comparison}</H>
          <table className={cx("cmp")}>
            <thead><tr><th></th><th className={cx("us")}>{vm.u.us}</th><th>{vm.u.them}</th></tr></thead>
            <tbody>{vm.comparison.map((r, i) => <tr key={i}><td>{r.label}</td><td>{cell(r.us)}</td><td>{cell(r.them)}</td></tr>)}</tbody>
          </table>
        </Wrap>
      );
    }

    case "specs":
      return (
        <Wrap narrow>
          <H>{T.specs}</H>
          <div className={cx("specs")}>{vm.specs.map((s, i) => <div key={i}><span className={cx("muted")}>{s.label}</span><b>{s.value}</b></div>)}</div>
        </Wrap>
      );

    case "variants":
      return (
        <Wrap alt>
          <H>{T.variants}</H>
          <VariantPicker vm={vm} variant={p.variant} setVariant={p.setVariant} />
        </Wrap>
      );

    case "offers":
      return (
        <Wrap>
          <H>{T.offers}</H>
          <OfferPicker vm={vm} qty={p.qty} setQty={p.setQty} />
        </Wrap>
      );

    case "countdown":
      return (
        <section className={cx("section alt")}>
          <div className={cx("container center")}>
            <h2 style={{ fontSize: "clamp(22px,3cqi,30px)" }}>⏰ {T.countdown}</h2>
            <Countdown vm={vm} />
          </div>
        </section>
      );

    case "video":
      return (
        <Wrap narrow>
          <H>{T.video}</H>
          <VideoFrame vm={vm} />
        </Wrap>
      );

    case "whatsapp":
      return (
        <Wrap>
          <div className={cx("wa-block")}>
            <div>
              <h2 style={{ fontSize: "clamp(26px,3.6cqi,38px)" }}>💬 {T.whatsapp}</h2>
              <p style={{ opacity: 0.9 }}>{vm.name}{vm.price ? ` – ${formatPrice(vm.price, vm.currency)}` : ""}</p>
              <a className={cx("btn lg")} href={p.preview ? undefined : waHref(vm)} target="_blank" rel="noopener noreferrer">{vm.u.orderWhatsapp}</a>
            </div>
            <Stage src={vm.images[0]} alt="" />
          </div>
        </Wrap>
      );

    case "order":
      return (
        <section className={cx("section")} id="order">
          <div className={cx("container")} style={{ maxWidth: 560 }}>
            <H>{vm.orderTitle}</H>
            <OrderForm vm={vm} qty={p.qty} setQty={p.setQty} variant={p.variant} setVariant={p.setVariant} preview={p.preview} onSubmit={p.onSubmit} />
          </div>
        </section>
      );

    case "guarantee":
      return (
        <section className={cx("section alt")}>
          <div className={cx("container guarantee")}>
            <div className={cx("seal")}>100%<br />{vm.u.guarantee}</div>
            <div style={{ maxWidth: 440, textAlign: "start" }}>
              <h3 style={{ fontSize: 22 }}>{vm.guarantee.title}</h3>
              <p className={cx("muted")} style={{ margin: 0 }}>{vm.guarantee.text}</p>
            </div>
          </div>
        </section>
      );

    case "faq":
      return (
        <section className={cx("section")}>
          <div className={cx("container narrow faq")}>
            <H>{T.faq}</H>
            {vm.faq.map((f, i) => (
              <details key={i} open={i === 0}><summary>{f.question}</summary>{f.answer ? <p>{f.answer}</p> : null}</details>
            ))}
          </div>
        </section>
      );

    case "final_cta":
      return (
        <section className={cx("section final-cta")}>
          <div className={cx("container narrow")}>
            <h2 style={{ fontSize: "clamp(28px,4.5cqi,48px)" }}>{vm.finalCta.title}</h2>
            {vm.finalCta.text ? <p className={cx("muted")}>{vm.finalCta.text}</p> : null}
            <PriceRow vm={vm} center />
            <button type="button" className={cx("btn lg pulse")} onClick={scrollToOrder}>{vm.cta} →</button>
          </div>
        </section>
      );

    default:
      if (key.startsWith("custom-")) return renderCustom(vm, vm.custom[key]);
      return null;
  }
}

/** Blocs personnalisés de l'éditeur (Texte, Image + texte, Galerie, FAQ, CTA, Média). */
function renderCustom(vm: VM, b: any): React.ReactNode {
  if (!b) return null;
  const t = b.type || "text";
  if (t === "imageText")
    return (
      <Wrap>
        <div className={cx("image-text")}>
          {b.image ? <img src={b.image} alt={b.title || ""} loading="lazy" /> : null}
          <div><h2>{b.title}</h2><p className={cx("muted")} style={{ whiteSpace: "pre-line" }}>{b.text}</p></div>
        </div>
      </Wrap>
    );
  if (t === "gallery")
    return (
      <Wrap>
        {b.title ? <H>{b.title}</H> : null}
        <div className={cx("custom-gallery")}>{(b.images || []).map((x: string, i: number) => <img src={x} alt="" key={i} loading="lazy" />)}</div>
      </Wrap>
    );
  if (t === "faqBlock")
    return (
      <section className={cx("section")}>
        <div className={cx("container narrow faq")}>
          {b.title ? <H>{b.title}</H> : null}
          {(b.items || []).map((f: any, i: number) => <details key={i}><summary>{f.question}</summary>{f.answer ? <p>{f.answer}</p> : null}</details>)}
        </div>
      </section>
    );
  if (t === "ctaBlock")
    return (
      <section className={cx("section final-cta")}>
        <div className={cx("container narrow")}>
          <h2>{b.title}</h2>
          {b.text ? <p className={cx("muted")}>{b.text}</p> : null}
          <button type="button" className={cx("btn lg")} onClick={scrollToOrder}>{b.button || vm.cta}</button>
        </div>
      </section>
    );
  if (t === "vertical916")
    return (
      <Wrap>
        {b.title ? <H>{b.title}</H> : null}
        {b.text ? <p className={cx("section-sub")}>{b.text}</p> : null}
        {b.media ? (
          <div className={cx("media916")}>
            {b.mediaType === "video"
              ? <video src={b.media} controls={b.videoControls !== false} autoPlay={!!b.videoAutoplay} muted={!!b.videoAutoplay} loop={!!b.videoLoop} playsInline />
              : <img src={b.media} alt={b.title || ""} />}
          </div>
        ) : null}
        {b.button ? <div className={cx("center")} style={{ marginTop: 18 }}><button type="button" className={cx("btn")} onClick={scrollToOrder}>{b.button}</button></div> : null}
      </Wrap>
    );
  return (
    <Wrap narrow>
      {b.title ? <h2>{b.title}</h2> : null}
      {b.text ? <p className={cx("muted")} style={{ whiteSpace: "pre-line" }}>{b.text}</p> : null}
    </Wrap>
  );
}
