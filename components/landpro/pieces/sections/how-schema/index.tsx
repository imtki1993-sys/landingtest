"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Img, sid } from "../../../designs/kit";
import "./style.css";

/** Fonctionnement : photo du produit au centre, étapes annotées reliées à la photo par des traits. */
function Render({ vm }: SectionProps) {
  const steps = vm.steps.filter((s) => s.title || s.text);
  const n = steps.length;
  if (!n) return null;
  // Première moitié à droite de la photo (côté fin), le reste à gauche (côté début).
  const a = Math.ceil(n / 2);
  const groups = [
    { cls: "end", from: 0, list: steps.slice(0, a) },
    { cls: "start", from: a, list: steps.slice(a) },
  ].filter((g) => g.list.length);
  return (
    <section id={sid("how")} className="pc-hs">
      <div className="pc-hs-in">
        {vm.titles.how ? <h2 className="pc-hs-title">{vm.titles.how}</h2> : null}
        <div className={"pc-hs-fig" + (n === 1 ? " solo" : "")}>
          <div className="pc-hs-photo">
            <Img vm={vm} i={0} />
          </div>
          {groups.map((g) => (
            <ol className={"pc-hs-col " + g.cls} start={g.from + 1} key={g.cls}>
              {g.list.map((st, i) => (
                <li className="pc-hs-step" key={i}>
                  <span className="pc-hs-line" aria-hidden="true">
                    <i />
                  </span>
                  <span className="pc-hs-num" aria-hidden="true">
                    {g.from + i + 1}
                  </span>
                  <div className="pc-hs-txt">
                    <b>
                      <span className="pc-hs-k" aria-hidden="true">
                        {g.from + i + 1} ·{" "}
                      </span>
                      {st.title || st.text}
                    </b>
                    {st.title && st.text ? <p>{st.text}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "how-schema",
  kind: "section",
  section: "how",
  name: "Fonctionnement : schéma annoté",
  render: (p) => <Render {...p} />,
};
export default piece;
