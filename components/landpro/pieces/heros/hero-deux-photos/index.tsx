"use client";
// Pièce « Deux photos côte à côte avec carte au centre » : deux moitiés teintées avec une photo chacune,
// carte centrale (accroche, titre, prix, bouton).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Img, discount, money, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const one = vm.images.length < 2;
  const showPrice = vm.show.price && vm.price > 0;
  const d = discount(vm);
  return (
    <section className="pc-dp" id={sid("hero")}>
      <div className="pc-dp-halves">
        <div className="pc-dp-half is-a">
          <Img vm={vm} i={0} className="pc-dp-img" />
        </div>
        <div className={"pc-dp-half is-b" + (one ? " is-same" : "")}>
          <Img vm={vm} i={1} className="pc-dp-img" />
        </div>
      </div>
      <div className="pc-dp-card">
        {vm.show.badge && vm.eyebrow ? <span className="pc-dp-eyebrow">{vm.eyebrow}</span> : null}
        <h1 className="pc-dp-title">{vm.headline}</h1>
        {showPrice ? (
          <div className="pc-dp-price">
            <b>{money(vm, vm.price)}</b>
            {d > 0 ? <s>{money(vm, vm.oldPrice!)}</s> : null}
            {d > 0 ? <span>-{d}%</span> : null}
          </div>
        ) : null}
        {vm.show.cta ? <Buy vm={vm} className="pc-dp-cta" /> : null}
        {vm.delivery ? <p className="pc-dp-cod">{vm.delivery}</p> : null}
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-deux-photos",
  kind: "hero",
  name: "Deux photos plein écran",
  render: (p) => <Render {...p} />,
};
export default piece;
