"use client";
// Pièce « Format story (vertical) » : cadre 9:16 façon story (barres de progression qui avancent
// automatiquement entre les photos, nom, accroche, bouton en bas) à côté d'un court texte.
import { useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Headline, Icon, Img, discount, money, sid, tr } from "../../../designs/kit";
import "./style.css";

const DURATION = 5200; // ms par écran

function Render({ vm }: SectionProps) {
  const n = Math.max(1, Math.min(5, vm.images.length));
  const [cur, setCur] = useState(0);
  const [loop, setLoop] = useState(0); // relance l'animation quand on reboucle
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);

  const go = (k: number) => {
    const next = ((k % n) + n) % n;
    if (next === cur || n === 1) setLoop((l) => l + 1);
    setCur(next);
  };

  const showPrice = vm.show.price && vm.price > 0;
  const d = discount(vm);
  const caption =
    vm.imageLabels[cur] || vm.benefits[cur]?.title || vm.features[cur]?.title || vm.subheadline || vm.headline;
  const initial = (vm.name.trim()[0] || "•").toUpperCase();
  const trust = vm.trust.slice(0, 3);
  const stopped = paused || hold;

  return (
    <section id={sid("hero")} className="pc-hst">
      <div className="pc-hst-in">
        <div className="pc-hst-stage">
          <div className="pc-hst-glow" aria-hidden="true" />
          <div
            className={"pc-hst-story" + (stopped ? " is-paused" : "")}
            role="region"
            aria-roledescription={tr(vm, "story", "ستوري")}
            aria-label={vm.name}
            onPointerDown={() => setHold(true)}
            onPointerUp={() => setHold(false)}
            onPointerLeave={() => setHold(false)}
            onPointerCancel={() => setHold(false)}
          >
            <div className="pc-hst-media">
              {Array.from({ length: n }, (_, k) => (
                <div key={k} className={"pc-hst-slide" + (k === cur ? " is-on" : "")} aria-hidden={k !== cur}>
                  <Img vm={vm} i={k} className="pc-hst-img" alt={vm.imageLabels[k] || vm.name} />
                </div>
              ))}
              {!vm.images.length ? (
                <span className="pc-hst-mono" aria-hidden="true">
                  {initial}
                </span>
              ) : null}
            </div>
            <div className="pc-hst-veil" aria-hidden="true" />

            <div className="pc-hst-bars" aria-hidden="true">
              {Array.from({ length: n }, (_, k) => (
                <span key={k} className="pc-hst-bar">
                  <i
                    key={k === cur ? "on-" + cur + "-" + loop : "off"}
                    className={k < cur ? "is-done" : k === cur ? "is-run" : ""}
                    style={{ animationDuration: DURATION + "ms" }}
                    onAnimationEnd={k === cur ? () => go(cur + 1) : undefined}
                  />
                </span>
              ))}
            </div>

            <div className="pc-hst-top">
              <span className="pc-hst-avatar" aria-hidden="true">
                {initial}
              </span>
              <span className="pc-hst-who">
                <b>{vm.name}</b>
                {vm.show.badge && vm.eyebrow ? <small>{vm.eyebrow}</small> : null}
              </span>
              <button
                type="button"
                className="pc-hst-pause"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? tr(vm, "Lecture", "تشغيل") : tr(vm, "Pause", "إيقاف")}
              >
                {paused ? (
                  <Icon name="play" />
                ) : (
                  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>

            {n > 1 ? (
              <>
                <button
                  type="button"
                  className="pc-hst-tap is-prev"
                  onClick={() => go(cur - 1)}
                  aria-label={tr(vm, "Photo précédente", "الصورة السابقة")}
                />
                <button
                  type="button"
                  className="pc-hst-tap is-next"
                  onClick={() => go(cur + 1)}
                  aria-label={tr(vm, "Photo suivante", "الصورة التالية")}
                />
              </>
            ) : null}

            <div className="pc-hst-bottom">
              {caption && caption.trim().toLowerCase() !== vm.name.trim().toLowerCase() ? (
                <p className="pc-hst-caption" key={"c" + cur} aria-live="polite">
                  {caption}
                </p>
              ) : null}
              {vm.show.cta ? (
                <Buy vm={vm} className="pc-hst-cta">
                  {vm.cta}
                  {showPrice ? <span className="pc-hst-cta-price"> · {money(vm, vm.price)}</span> : null}
                </Buy>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pc-hst-copy">
          {vm.show.badge && vm.eyebrow ? <span className="pc-hst-badge">{vm.eyebrow}</span> : null}
          <Headline vm={vm} className="pc-hst-title" />
          {vm.show.subtitle && (vm.description || vm.subheadline) ? (
            <p className="pc-hst-sub">{vm.description || vm.subheadline}</p>
          ) : null}
          {showPrice ? (
            <div className="pc-hst-price">
              <b>{money(vm, vm.price)}</b>
              {d > 0 ? <s>{money(vm, vm.oldPrice!)}</s> : null}
              {d > 0 ? <span className="pc-hst-off">-{d}%</span> : null}
            </div>
          ) : null}
          {trust.length ? (
            <ul className="pc-hst-trust">
              {trust.map((t, i) => (
                <li key={i}>
                  <Icon name="check" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          ) : vm.delivery ? (
            <p className="pc-hst-cod">
              <Icon name="truck" /> {vm.delivery}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-story",
  kind: "hero",
  name: "Format story (vertical)",
  render: (p) => <Render {...p} />,
};
export default piece;
