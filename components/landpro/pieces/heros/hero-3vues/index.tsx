"use client";
// Pièce « Produit qui tourne (3 vues) » : texte sobre à gauche, carrousel des vues du produit à droite
// (vue active au centre, vues voisines estompées), flèches, points et légendes des vues.
import { useRef, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Img, discount, money, sid, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const n = vm.images.length;
  // au moins 3 vues (les photos tournent), au plus 5
  const count = Math.max(3, Math.min(n, 5));
  // moins de photos que de vues : la photo répétée est miroitée pour varier l'angle
  const flip = (k: number) => n > 0 && n < count && Math.floor(k / n) % 2 === 1;
  const [cur, setCur] = useState(0);
  const touch = useRef<number | null>(null);
  const go = (k: number) => setCur(((k % count) + count) % count);
  const label = (k: number) => vm.imageLabels[k] || `${tr(vm, "Vue", "زاوية")} ${k + 1}`;
  const showPrice = vm.show.price && vm.price > 0;
  const d = discount(vm);
  // sens visuel des flèches : en arabe « suivant » est à gauche
  const step = vm.rtl ? -1 : 1;

  return (
    <section className="pc-h3v" id={sid("hero")}>
      <div className="pc-h3v-in">
        <div className="pc-h3v-head">
          {vm.show.badge && vm.eyebrow ? <span className="pc-h3v-eyebrow">{vm.eyebrow}</span> : null}
          <h1 className="pc-h3v-title">{vm.headline}</h1>
          {vm.show.subtitle && vm.subheadline ? <p className="pc-h3v-sub">{vm.subheadline}</p> : null}
        </div>

        <div className="pc-h3v-buy">
          {showPrice ? (
            <div className="pc-h3v-price">
              <b>{money(vm, vm.price)}</b>
              {d > 0 ? <s>{money(vm, vm.oldPrice!)}</s> : null}
              {d > 0 ? <span className="pc-h3v-off">-{d}%</span> : null}
            </div>
          ) : null}
          {vm.show.cta ? <Buy vm={vm} className="pc-h3v-cta" /> : null}
          {vm.delivery ? <p className="pc-h3v-cod">{vm.delivery}</p> : null}
        </div>

        <div
          className="pc-h3v-stage"
          role="region"
          aria-roledescription={tr(vm, "carrousel", "عرض متتالي")}
          aria-label={vm.name}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(cur + step);
            if (e.key === "ArrowLeft") go(cur - step);
          }}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 40) go(cur + (dx < 0 ? step : -step));
          }}
        >
          <div className="pc-h3v-track">
            {Array.from({ length: count }, (_, k) => {
              let off = k - cur;
              if (off > count / 2) off -= count;
              if (off < -count / 2) off += count;
              const pos = off === 0 ? "is-on" : off === -1 ? "is-prev" : off === 1 ? "is-next" : "is-out";
              return (
                <button
                  key={k}
                  type="button"
                  className={"pc-h3v-view " + pos}
                  onClick={() => go(k)}
                  tabIndex={off === 0 ? -1 : pos === "is-out" ? -1 : 0}
                  aria-hidden={pos === "is-out"}
                  aria-label={label(k)}
                  aria-current={off === 0 ? "true" : undefined}
                >
                  <Img vm={vm} i={k} className={"pc-h3v-img" + (flip(k) ? " is-flip" : "")} alt={label(k)} />
                </button>
              );
            })}
          </div>
          <div className="pc-h3v-floor" aria-hidden="true" />

          <div className="pc-h3v-nav">
            <button
              type="button"
              className="pc-h3v-arrow is-prev"
              onClick={() => go(cur - 1)}
              aria-label={tr(vm, "Vue précédente", "الزاوية السابقة")}
            >
              ‹
            </button>
            <div className="pc-h3v-dots">
              {Array.from({ length: count }, (_, k) => (
                <button
                  key={k}
                  type="button"
                  className={"pc-h3v-dot" + (k === cur ? " is-on" : "")}
                  aria-label={label(k)}
                  aria-pressed={k === cur}
                  onClick={() => go(k)}
                />
              ))}
            </div>
            <button
              type="button"
              className="pc-h3v-arrow is-next"
              onClick={() => go(cur + 1)}
              aria-label={tr(vm, "Vue suivante", "الزاوية التالية")}
            >
              ›
            </button>
            <p className={"pc-h3v-labels" + (vm.imageLabels.length ? "" : " is-count")} aria-live="polite">
              {vm.imageLabels.length ? (
                Array.from({ length: count }, (_, k) => (
                  <span key={k} className={k === cur ? "is-on" : undefined}>
                    {label(k)}
                  </span>
                ))
              ) : (
                <span className="is-on">
                  {cur + 1} / {count}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-3vues",
  kind: "hero",
  name: "Produit qui tourne (3 vues)",
  render: (p) => <Render {...p} />,
};
export default piece;
