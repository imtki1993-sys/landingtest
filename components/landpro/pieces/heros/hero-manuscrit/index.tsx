"use client";
// Pièce « Titre manuscrit + photo » : accroche à la main (Caveat), texte court, CTA + prix,
// photo du produit façon polaroïd avec légende manuscrite (2e polaroïd derrière s'il y a d'autres photos).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const caption = vm.imageLabels[0] || vm.name;
  const back = vm.images.length > 1;
  return (
    <section id={sid("hero")} className="pc-hms">
      <div className="pc-hms-in">
        <div className="pc-hms-copy">
          {vm.show.badge && vm.eyebrow ? <span className="pc-hms-eyebrow">{vm.eyebrow}</span> : null}
          <Headline vm={vm} className="pc-hms-title" />
          <svg className="pc-hms-scribble" viewBox="0 0 220 18" aria-hidden="true" preserveAspectRatio="none">
            <path d="M3 12c38-7 76-9 112-6s70 4 102-4" />
          </svg>
          {vm.show.subtitle && vm.subheadline ? <p className="pc-hms-sub">{vm.subheadline}</p> : null}
          {vm.show.cta || vm.show.price ? (
            <div className="pc-hms-buy">
              {vm.show.cta ? (
                <Buy vm={vm} className="pc-hms-cta" arrow>
                  {vm.cta}
                </Buy>
              ) : null}
              {vm.show.price && vm.price > 0 ? (
                <div className="pc-hms-price">
                  <b>{money(vm, vm.price)}</b>
                  {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
                  {d > 0 ? <i>-{d}%</i> : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {vm.delivery ? (
            <p className="pc-hms-deliv">
              <Icon name="truck" /> {vm.delivery}
            </p>
          ) : null}
        </div>
        <div className={"pc-hms-visual" + (back ? " two" : "")}>
          {back ? (
            <div className="pc-hms-pola back" aria-hidden="true">
              <div className="pc-hms-shot">
                <Img vm={vm} i={1} className="pc-hms-img" alt="" />
              </div>
            </div>
          ) : null}
          <figure className="pc-hms-pola front">
            <span className="pc-hms-tape" aria-hidden="true" />
            <div className="pc-hms-shot">
              <Img vm={vm} i={0} className="pc-hms-img" />
            </div>
            {caption ? <figcaption>{caption}</figcaption> : null}
          </figure>
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-manuscrit",
  kind: "hero",
  name: "Titre manuscrit + photo",
  render: (p) => <Render {...p} />,
};
export default piece;
