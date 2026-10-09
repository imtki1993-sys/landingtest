"use client";
// Pièce « Manifeste » : grand texte éditorial (description ou sous-titre) avec un mot mis en valeur,
// CTA sobre + prix en bas, petite vignette du produit signée du titre (h1).
import React from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import type { VM } from "../../../model";
import { Buy, Headline, Img, money, sid } from "../../../designs/kit";
import "./style.css";

/** Garde les premières phrases (≈ 280 caractères) pour que le manifeste reste lisible. */
function trimText(s: string, max = 280) {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const parts = t.match(/[^.!?؟]+[.!?؟]+(\s|$)/g) || [];
  let out = "";
  for (const p of parts) {
    if ((out + p).length > max) break;
    out += p;
  }
  if (out.trim().length >= 60) return out.trim();
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–—-]\s*$/, "") + "…";
}

/** Met en valeur le premier mot/groupe trouvé (vm.highlight, sinon le nom du produit). */
function emphasize(text: string, vm: VM): React.ReactNode {
  for (const w of [vm.highlight, vm.name]) {
    if (!w) continue;
    const i = text.toLowerCase().indexOf(w.toLowerCase());
    if (i >= 0)
      return (
        <>
          {text.slice(0, i)}
          <em>{text.slice(i, i + w.length)}</em>
          {text.slice(i + w.length)}
        </>
      );
  }
  return text;
}

function Render({ vm }: SectionProps) {
  const raw = vm.description || (vm.show.subtitle ? vm.subheadline : "");
  const text = raw ? trimText(raw) : "";
  const size = text.length > 200 ? "m" : text.length > 110 ? "l" : "xl";
  return (
    <section id={sid("hero")} className={"pc-hmf" + (text ? "" : " short")}>
      <span className="pc-hmf-quote" aria-hidden="true">
        {vm.rtl ? "”" : "“"}
      </span>
      <div className="pc-hmf-in">
        {vm.show.badge && vm.eyebrow ? <span className="pc-hmf-eyebrow">{vm.eyebrow}</span> : null}
        {text ? (
          <p className={"pc-hmf-text s-" + size}>{emphasize(text, vm)}</p>
        ) : (
          <Headline vm={vm} className="pc-hmf-text s-xl" />
        )}
        <div className="pc-hmf-foot">
          <div className="pc-hmf-buy">
            {vm.show.cta ? <Buy vm={vm} className="pc-hmf-cta" arrow /> : null}
            {vm.show.price && vm.price > 0 ? (
              <span className="pc-hmf-price">
                <b>{money(vm, vm.price)}</b>
                {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              </span>
            ) : null}
          </div>
          <div className="pc-hmf-sign">
            {text ? <Headline vm={vm} className="pc-hmf-h1" /> : null}
            <span className="pc-hmf-thumb">
              <Img vm={vm} i={0} className="pc-hmf-img" />
            </span>
          </div>
        </div>
        {vm.delivery ? <p className="pc-hmf-deliv">{vm.delivery}</p> : null}
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-manifeste",
  kind: "hero",
  name: "Manifeste",
  render: (p) => <Render {...p} />,
};
export default piece;
