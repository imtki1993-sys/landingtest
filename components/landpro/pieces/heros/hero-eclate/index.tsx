"use client";
// Pièce « Produit éclaté (pièces séparées) » : texte à gauche, bouton « Commander · prix » en bas ;
// à droite la photo du produit au centre, entourée de 3–4 étiquettes reliées par de fins traits.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Img, discount, money, scrollToOrder, sid } from "../../../designs/kit";
import "./style.css";

// Étiquettes : position (en % de la scène, côté début de ligne) et point d'ancrage sur le produit.
const SPOTS = [
  { x: 4, y: 8, ax: 40, ay: 30, side: "s" },
  { x: 66, y: 4, ax: 58, ay: 24, side: "e" },
  { x: 4, y: 74, ax: 42, ay: 66, side: "s" },
  { x: 66, y: 80, ax: 60, ay: 72, side: "e" },
] as const;
// Point de départ du trait sur chaque étiquette (bord tourné vers le produit).
const START = [
  { x: 30, y: 13 },
  { x: 66, y: 9 },
  { x: 30, y: 79 },
  { x: 66, y: 85 },
];

function Render({ vm }: SectionProps) {
  const fromSpecs = vm.specs.filter((s) => s.label).map((s) => ({ t: s.label, v: s.value }));
  const fromFeat = vm.features.filter((f) => f.title).map((f) => ({ t: f.title, v: f.text }));
  const items = (fromSpecs.length >= 3 ? fromSpecs : fromFeat.length ? fromFeat : fromSpecs).slice(0, 4);
  const showPrice = vm.show.price && vm.price > 0;
  const d = discount(vm);

  return (
    <section className={"pc-ecl" + (items.length ? "" : " is-solo")} id={sid("hero")}>
      <div className="pc-ecl-in">
        <div className="pc-ecl-copy">
          <div>
            {vm.show.badge && vm.eyebrow ? <span className="pc-ecl-eyebrow">{vm.eyebrow}</span> : null}
            <h1 className="pc-ecl-title">{vm.headline}</h1>
            {vm.show.subtitle && vm.subheadline ? <p className="pc-ecl-sub">{vm.subheadline}</p> : null}
          </div>
          <div className="pc-ecl-buy">
            {showPrice && d > 0 ? (
              <p className="pc-ecl-was">
                <s>{money(vm, vm.oldPrice!)}</s>
                <span>-{d}%</span>
              </p>
            ) : null}
            {vm.show.cta ? (
              <button type="button" className="pc-ecl-cta" onClick={scrollToOrder}>
                <span>{vm.cta}</span>
                {showPrice ? (
                  <>
                    <i aria-hidden="true">·</i>
                    <b>{money(vm, vm.price)}</b>
                  </>
                ) : null}
              </button>
            ) : showPrice ? (
              <b className="pc-ecl-price">{money(vm, vm.price)}</b>
            ) : null}
            {vm.delivery ? <p className="pc-ecl-cod">{vm.delivery}</p> : null}
          </div>
        </div>

        <div className={"pc-ecl-stage" + (items.length ? "" : " is-solo")}>
          <div className="pc-ecl-grid" aria-hidden="true" />
          <div className="pc-ecl-ring" aria-hidden="true" />
          <div className="pc-ecl-ring is-in" aria-hidden="true" />
          <Img vm={vm} i={0} className="pc-ecl-img" />
          {items.length ? (
            <svg className="pc-ecl-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {items.map((_, k) => {
                const s = SPOTS[k];
                const a = START[k];
                return (
                  <polyline
                    key={k}
                    points={`${a.x},${a.y} ${(a.x + s.ax) / 2},${a.y} ${s.ax},${s.ay}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          ) : null}
          {items.map((_, k) => (
            <i
              key={"d" + k}
              className="pc-ecl-dot"
              style={{ insetInlineStart: SPOTS[k].ax + "%", top: SPOTS[k].ay + "%" }}
              aria-hidden="true"
            />
          ))}
          <ul className="pc-ecl-tags">
            {items.map((it, k) => (
              <li
                key={k}
                className={"pc-ecl-tag is-" + SPOTS[k].side}
                style={{ insetInlineStart: SPOTS[k].x + "%", top: SPOTS[k].y + "%" }}
              >
                <b>{it.t}</b>
                {it.v ? <span>{it.v}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-eclate",
  kind: "hero",
  name: "Produit éclaté + légendes",
  render: (p) => <Render {...p} />,
};
export default piece;
