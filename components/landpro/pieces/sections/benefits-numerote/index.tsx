"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { sid } from "../../../designs/kit";
import "./style.css";

/** Avantages en liste éditoriale numérotée : 01, 02, 03… séparés par de fins filets. */
function Render({ vm }: SectionProps) {
  const items = vm.benefits.filter((b) => b.title || b.text);
  if (!items.length) return null;
  return (
    <section id={sid("benefits")} className="pc-bn">
      <div className="pc-bn-in">
        {vm.titles.benefits ? <h2 className="pc-bn-title">{vm.titles.benefits}</h2> : null}
        <ol className="pc-bn-list">
          {items.map((b, i) => (
            <li className="pc-bn-item" key={i}>
              <span className="pc-bn-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pc-bn-body">
                <h3 className="pc-bn-h">{b.title || b.text}</h3>
                {b.title && b.text ? <p className="pc-bn-p">{b.text}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "benefits-numerote",
  kind: "section",
  section: "benefits",
  name: "Avantages : liste numérotée",
  render: (p) => <Render {...p} />,
};
export default piece;
