"use client";
// Pièce « Hero papier et texture artisanale » : fond papier (dégradés CSS), cadre intérieur en pointillés,
// texte éditorial à gauche, photo sur une étiquette au bord déchiré, légèrement inclinée, à droite.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const hasOld = !!vm.oldPrice && vm.oldPrice > vm.price;
  const showPrice = vm.show.price && vm.price > 0;
  const label = vm.imageLabels[0] || vm.name;
  return (
    <section id={sid("hero")} className="pc-hpp">
      <div className="pc-hpp-sheet">
        <span className="pc-hpp-dash" aria-hidden="true" />
        <div className="pc-hpp-in">
          <div className="pc-hpp-copy">
            {vm.show.badge && vm.eyebrow ? <span className="pc-hpp-eyebrow">{vm.eyebrow}</span> : null}
            <Headline vm={vm} className="pc-hpp-title" />
            {vm.show.subtitle && vm.subheadline ? <p className="pc-hpp-sub">{vm.subheadline}</p> : null}
            {vm.show.cta || showPrice ? (
              <div className="pc-hpp-buy">
                {vm.show.cta ? (
                  <Buy vm={vm} className="pc-hpp-cta">
                    {vm.cta}
                  </Buy>
                ) : null}
                {showPrice ? (
                  <div className="pc-hpp-price">
                    <b>{money(vm, vm.price)}</b>
                    {hasOld ? <s>{money(vm, vm.oldPrice as number)}</s> : null}
                    {d > 0 ? <i>-{d}%</i> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
            {vm.delivery ? (
              <p className="pc-hpp-deliv">
                <Icon name="truck" /> {vm.delivery}
              </p>
            ) : null}
          </div>
          <figure className="pc-hpp-tag">
            <div className="pc-hpp-label">
              <span className="pc-hpp-hole" aria-hidden="true" />
              <div className="pc-hpp-pic">
                <Img vm={vm} i={0} className="pc-hpp-img" />
              </div>
              {label ? <figcaption>{label}</figcaption> : null}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-papier",
  kind: "hero",
  name: "Hero papier / kraft",
  render: (p) => <Render {...p} />,
};
export default piece;
