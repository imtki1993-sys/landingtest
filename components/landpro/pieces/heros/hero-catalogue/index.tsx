"use client";
// Pièce « Catalogue technique annoté » : papier quadrillé, fiche technique en monospace,
// photo produit cotée (dimensions tirées de vm.specs) et repères A/B/C/D reliés à la liste des specs.
// Toute partie sans donnée (cotes, repères, prix barré, livraison) est masquée.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import type { VM } from "../../../model";
import { Buy, discount, Headline, Img, money, sid, tr } from "../../../designs/kit";
import "./style.css";

const DIM_LABEL =
  /dimension|taille|largeur|hauteur|longueur|diam|[ée]paisseur|profondeur|size|width|height|length|depth|عرض|طول|ارتفاع|قياس|مقاس|سمك|قطر/i;
const DIM_VALUE = /^\s*[\d.,]+\s*(?:[x×]\s*[\d.,]+\s*)*(?:mm|cm|m|"|″|”|in|po|pouces?)\s*$/i;
const LETTERS = ["A", "B", "C", "D"];

function splitSpecs(vm: VM) {
  const specs = vm.specs.filter((s) => s.label && s.value);
  const dims: { label: string; value: string }[] = [];
  const rest: { label: string; value: string }[] = [];
  for (const s of specs) {
    const isDim = (DIM_LABEL.test(s.label) && /\d/.test(s.value) && s.value.length <= 22) || DIM_VALUE.test(s.value);
    if (isDim && dims.length < 2) dims.push(s);
    else rest.push(s);
  }
  return { dims, marks: rest.slice(0, 4) };
}

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const hasOld = !!vm.oldPrice && vm.oldPrice > vm.price;
  const showPrice = vm.show.price && vm.price > 0;
  const { dims, marks } = splitSpecs(vm);
  const [w, h] = dims;
  return (
    <section id={sid("hero")} className="pc-hct">
      <div className="pc-hct-in">
        <header className="pc-hct-head">
          <span className="pc-hct-ref">
            {tr(vm, "Fiche n° 01", "بطاقة رقم 01")}
            {vm.name ? <> — {vm.name}</> : null}
          </span>
          <span className="pc-hct-rule" aria-hidden="true" />
          {vm.show.badge && vm.eyebrow ? <span className="pc-hct-eyebrow">{vm.eyebrow}</span> : null}
        </header>

        <div className="pc-hct-copy">
          <Headline vm={vm} className="pc-hct-title" />
          {vm.show.subtitle && vm.subheadline ? <p className="pc-hct-sub">{vm.subheadline}</p> : null}
          {marks.length ? (
            <ol className="pc-hct-specs" aria-label={tr(vm, "Caractéristiques", "المميزات")}>
              {marks.map((s, i) => (
                <li key={i}>
                  <span className="pc-hct-key" aria-hidden="true">
                    {LETTERS[i]}
                  </span>
                  <span className="pc-hct-spec">
                    <small>{s.label}</small>
                    <span>{s.value}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        <figure className={"pc-hct-plate" + (w ? " has-w" : "") + (h ? " has-h" : "")} dir="ltr">
          <div className="pc-hct-pic">
            <span className="pc-hct-crop tl" aria-hidden="true" />
            <span className="pc-hct-crop tr" aria-hidden="true" />
            <span className="pc-hct-crop bl" aria-hidden="true" />
            <span className="pc-hct-crop br" aria-hidden="true" />
            <Img vm={vm} i={0} className="pc-hct-img" />
            {marks.map((_, i) => (
              <span key={i} className={"pc-hct-pin p" + i} aria-hidden="true">
                {LETTERS[i]}
              </span>
            ))}
          </div>
          {w ? (
            <span className="pc-hct-dim pc-hct-dim-w" title={w.label}>
              <span className="pc-hct-line" aria-hidden="true" />
              <span className="pc-hct-val">
                <span aria-hidden="true">← </span>
                {w.value}
                <span aria-hidden="true"> →</span>
              </span>
            </span>
          ) : null}
          {h ? (
            <span className="pc-hct-dim pc-hct-dim-h" title={h.label}>
              <span className="pc-hct-line" aria-hidden="true" />
              <span className="pc-hct-val">{h.value}</span>
            </span>
          ) : null}
        </figure>

        <div className="pc-hct-buy">
          {showPrice ? (
            <div className="pc-hct-price">
              {hasOld || d > 0 ? (
                <span className="pc-hct-was">
                  {hasOld ? <s>{money(vm, vm.oldPrice as number)}</s> : null}
                  {d > 0 ? <i>-{d}%</i> : null}
                </span>
              ) : null}
              <b>{money(vm, vm.price)}</b>
            </div>
          ) : null}
          {vm.show.cta ? (
            <Buy vm={vm} className="pc-hct-cta">
              {vm.cta}
              <span className="pc-hct-arrow" aria-hidden="true">
                {" "}
                {vm.rtl ? "←" : "→"}
              </span>
            </Buy>
          ) : null}
          {vm.delivery ? <p className="pc-hct-deliv">{vm.delivery}</p> : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-catalogue",
  kind: "hero",
  name: "Catalogue technique annoté",
  render: (p) => <Render {...p} />,
};
export default piece;
