"use client";
// Pièce « Minimal : logo, prix et bouton » (maquette Main_H11) :
// logotype espacé à gauche ; à droite, accroche courte du produit, prix (prix barré éventuel) et bouton.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, money, tr } from "../../../designs/kit";
import "./style.css";

/** Accroche courte (badge du hero / sous-titre) : affichée seulement si elle tient sur une ligne. */
function tagline(vm: SectionProps["vm"]) {
  const t = (vm.eyebrow || "").trim();
  return t && t.length <= 48 && t.toLowerCase() !== vm.name.trim().toLowerCase() ? t : "";
}

function Render({ vm }: SectionProps) {
  const showPrice = vm.show.price && vm.price > 0;
  const hasOld = showPrice && !!vm.oldPrice && vm.oldPrice > vm.price;
  const tag = tagline(vm);
  return (
    <header className="pc-h11">
      <div className="pc-h11-in">
        <a
          className={"pc-h11-brand" + (Array.from(vm.name).length > 18 ? " long" : "")}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {vm.name}
        </a>
        <div className="pc-h11-right">
          {tag ? <span className="pc-h11-tag">{tag}</span> : null}
          {showPrice ? (
            <div className="pc-h11-price">
              {hasOld ? <s className="pc-h11-old">{money(vm, vm.oldPrice!)}</s> : null}
              <b className="pc-h11-now">{money(vm, vm.price)}</b>
            </div>
          ) : null}
          <Buy vm={vm} className="pc-h11-cta">
            <span className="pc-h11-long">{vm.cta}</span>
            <span className="pc-h11-short">{tr(vm, "Commander", "اطلب")}</span>
          </Buy>
        </div>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h11-prix",
  kind: "header",
  name: "Minimal : logo, prix et bouton",
  render: (p) => <Render {...p} />,
};
export default piece;
