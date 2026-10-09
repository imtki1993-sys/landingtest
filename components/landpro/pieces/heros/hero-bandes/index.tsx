"use client";
// Pièce « Hero en bandes horizontales » : trois bandes pleine largeur empilées —
// bande encre (titre géant), bande photo (produit posé sur une ligne de sol), bande couleur (prix + livraison + CTA).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const hasOld = !!vm.oldPrice && vm.oldPrice > vm.price;
  const sub = vm.show.subtitle && vm.subheadline ? vm.subheadline : "";
  return (
    <section id={sid("hero")} className="pc-hbd">
      <div className="pc-hbd-band pc-hbd-top">
        <div className={"pc-hbd-w pc-hbd-head" + (sub ? "" : " solo")}>
          <div className="pc-hbd-titles">
            {vm.show.badge && vm.eyebrow ? <span className="pc-hbd-eyebrow">{vm.eyebrow}</span> : null}
            <Headline vm={vm} className="pc-hbd-title" />
          </div>
          {sub ? <p className="pc-hbd-sub">{sub}</p> : null}
        </div>
      </div>

      <div className="pc-hbd-band pc-hbd-photo">
        <Img vm={vm} i={0} className="pc-hbd-bg" alt="" />
        <div className="pc-hbd-veil" aria-hidden="true" />
        <div className="pc-hbd-stage">
          <Img vm={vm} i={0} className="pc-hbd-img" />
          <span className="pc-hbd-floor" aria-hidden="true" />
        </div>
        {vm.imageLabels[0] ? <span className="pc-hbd-label">{vm.imageLabels[0]}</span> : null}
      </div>

      <div className="pc-hbd-band pc-hbd-bottom">
        <div className="pc-hbd-w pc-hbd-row">
          {vm.show.price && vm.price > 0 ? (
            <div className="pc-hbd-price">
              <b>{money(vm, vm.price)}</b>
              {hasOld || d > 0 ? (
                <span className="pc-hbd-was">
                  {hasOld ? <s>{money(vm, vm.oldPrice as number)}</s> : null}
                  {d > 0 ? <i>-{d}%</i> : null}
                </span>
              ) : null}
            </div>
          ) : null}
          {vm.delivery ? (
            <span className="pc-hbd-deliv">
              <Icon name="truck" />
              <span>{vm.delivery}</span>
            </span>
          ) : null}
          {vm.show.cta ? (
            <Buy vm={vm} className="pc-hbd-cta" arrow>
              {vm.cta}
            </Buy>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-bandes",
  kind: "hero",
  name: "Hero en bandes horizontales",
  render: (p) => <Render {...p} />,
};
export default piece;
