"use client";
// Pièce « Garantie : carte » : une carte centrée, pastille bouclier + titre et texte de la garantie.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, sid } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const { title, text } = vm.guarantee;
  return (
    <section id={sid("guarantee")} className="pc-gcar">
      <div className="pc-gcar-card">
        <span className="pc-gcar-ico" aria-hidden="true">
          <Icon name="shield" />
        </span>
        <div className="pc-gcar-body">
          {title ? <h2 className="pc-gcar-title">{title}</h2> : null}
          {text ? <p className="pc-gcar-text">{text}</p> : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "guarantee-carte",
  kind: "section",
  section: "guarantee",
  name: "Garantie : carte",
  render: (p) => <Render {...p} />,
};
export default piece;
