"use client";
// Pièce « Hero avant / après » : grande scène pleine largeur avec un vrai curseur à glisser
// (pointeur, tactile, clavier via un input range accessible) entre la photo 0 (avant) et la photo 1 (après).
// Une seule photo : la photo s'affiche simplement, sans curseur. Carte flottante en bas : titre + CTA prix.
import { useCallback, useRef, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const [pos, setPos] = useState(50);
  const [drag, setDrag] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const slider = vm.images.length >= 2;
  const d = discount(vm);
  const hasOld = !!vm.oldPrice && vm.oldPrice > vm.price;
  const before = tr(vm, "Avant", "قبل");
  const after = tr(vm, "Après", "بعد");

  const moveTo = useCallback((clientX: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.round(Math.min(100, Math.max(0, p)) * 10) / 10);
  }, []);

  const showPrice = vm.show.price && vm.price > 0;

  return (
    <section id={sid("hero")} className={"pc-hba" + (slider ? "" : " single")}>
      <div className="pc-hba-frame">
        <div
          ref={stage}
          className={"pc-hba-stage" + (drag ? " drag" : "")}
          dir="ltr"
          style={{ ["--pos" as string]: pos + "%" }}
          onPointerDown={
            slider
              ? (e) => {
                  if (e.button !== 0) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag(true);
                  moveTo(e.clientX);
                }
              : undefined
          }
          onPointerMove={slider && drag ? (e) => moveTo(e.clientX) : undefined}
          onPointerUp={slider ? () => setDrag(false) : undefined}
          onPointerCancel={slider ? () => setDrag(false) : undefined}
        >
          <Img vm={vm} i={0} className="pc-hba-img" alt={slider ? `${vm.name} — ${before}` : vm.name} />
          {slider ? (
            <>
              <div className="pc-hba-after">
                <Img vm={vm} i={1} className="pc-hba-img" alt={`${vm.name} — ${after}`} />
              </div>
              <span className="pc-hba-tag pc-hba-tag-b" aria-hidden="true">
                {before}
              </span>
              <span className="pc-hba-tag pc-hba-tag-a" aria-hidden="true">
                {after}
              </span>
              <input
                className="pc-hba-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pos)}
                aria-label={tr(vm, "Comparer avant et après", "قارن بين قبل وبعد")}
                aria-valuetext={`${before} ${Math.round(100 - pos)}% · ${after} ${Math.round(pos)}%`}
                onChange={(e) => setPos(Number(e.target.value))}
              />
              <div className="pc-hba-handle" aria-hidden="true">
                <span className="pc-hba-grip">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
                  </svg>
                </span>
              </div>
            </>
          ) : null}
        </div>

        <div className="pc-hba-card">
          <div className="pc-hba-copy">
            {slider ? (
              <span className="pc-hba-hint">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
                </svg>
                {tr(vm, "Glissez pour comparer", "اسحب للمقارنة")}
              </span>
            ) : vm.show.badge && vm.eyebrow ? (
              <span className="pc-hba-hint">{vm.eyebrow}</span>
            ) : null}
            <Headline vm={vm} className="pc-hba-title" />
            {vm.show.subtitle && vm.subheadline ? <p className="pc-hba-sub">{vm.subheadline}</p> : null}
          </div>
          {vm.show.cta || showPrice ? (
            <div className="pc-hba-buy">
              {vm.show.cta ? (
                <Buy vm={vm} className="pc-hba-cta">
                  {vm.cta}
                  {showPrice ? <span className="pc-hba-cta-p"> · {money(vm, vm.price)}</span> : null}
                </Buy>
              ) : (
                <b className="pc-hba-price">{money(vm, vm.price)}</b>
              )}
              {showPrice && (hasOld || vm.delivery) ? (
                <span className="pc-hba-meta">
                  {hasOld ? <s>{money(vm, vm.oldPrice as number)}</s> : null}
                  {d > 0 ? <i>-{d}%</i> : null}
                  {vm.delivery ? (
                    <span className="pc-hba-deliv">
                      <Icon name="truck" /> {vm.delivery}
                    </span>
                  ) : null}
                </span>
              ) : vm.delivery ? (
                <span className="pc-hba-meta">
                  <span className="pc-hba-deliv">
                    <Icon name="truck" /> {vm.delivery}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-avant-apres",
  kind: "hero",
  name: "Hero avant / après",
  render: (p) => <Render {...p} />,
};
export default piece;
