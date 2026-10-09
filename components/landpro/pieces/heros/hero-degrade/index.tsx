"use client";
// Pièce « Hero dégradé animé » : grand fond dégradé qui glisse lentement (couleurs dérivées du thème,
// arrêté si prefers-reduced-motion), produit en médaillon, titre centré, CTA pilule « Commander · prix ».
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const hasOld = !!vm.oldPrice && vm.oldPrice > vm.price;
  const showPrice = vm.show.price && vm.price > 0;
  return (
    <section id={sid("hero")} className="pc-hdg">
      <div className="pc-hdg-bg" aria-hidden="true">
        <span className="pc-hdg-blob b1" />
        <span className="pc-hdg-blob b2" />
        <span className="pc-hdg-blob b3" />
        <span className="pc-hdg-grain" />
      </div>
      <div className="pc-hdg-in">
        <div className="pc-hdg-prod">
          <span className="pc-hdg-ring" aria-hidden="true" />
          <Img vm={vm} i={0} className="pc-hdg-img" />
        </div>
        {vm.show.badge && vm.eyebrow ? <span className="pc-hdg-eyebrow">{vm.eyebrow}</span> : null}
        <Headline vm={vm} className="pc-hdg-title" />
        {vm.show.subtitle && vm.subheadline ? <p className="pc-hdg-sub">{vm.subheadline}</p> : null}
        {vm.show.cta ? (
          <Buy vm={vm} className="pc-hdg-cta">
            {vm.cta}
            {showPrice ? <span className="pc-hdg-cta-p"> · {money(vm, vm.price)}</span> : null}
          </Buy>
        ) : showPrice ? (
          <b className="pc-hdg-price">{money(vm, vm.price)}</b>
        ) : null}
        {showPrice && hasOld ? (
          <p className="pc-hdg-was">
            <s>{money(vm, vm.oldPrice as number)}</s>
            {d > 0 ? <i>-{d}%</i> : null}
          </p>
        ) : null}
      </div>
      {vm.delivery ? (
        <p className="pc-hdg-deliv">
          <Icon name="truck" /> {vm.delivery}
        </p>
      ) : null}
    </section>
  );
}

const piece: Piece = {
  id: "hero-degrade",
  kind: "hero",
  name: "Hero dégradé animé",
  render: (p) => <Render {...p} />,
};
export default piece;
