"use client";
// Pièce « Garantie : sceau » : grand sceau rond à double anneau + titre et texte.
// La durée affichée dans le sceau n'est jamais inventée : elle est lue dans le
// titre ou le texte de la garantie (« 30 jours », « 1 an »…) ; sinon, un bouclier.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, sid, tr } from "../../../designs/kit";
import "./style.css";

// durée de garantie (« 30 jours », « 2 ans », « 6 mois »…) ; ignore les horaires du type « 7j/7 »
const DURATION =
  /(\d{1,3})\s*(jours?|j|semaines?|mois|ans?|années?|days?|weeks?|months?|years?|يوم|أيام|ايام|أسبوع|أسابيع|شهر|أشهر|اشهر|شهور|سنة|سنوات)(?![\p{L}\d]|\s*\/)/iu;

function findDuration(...texts: string[]): { n: string; unit: string } | null {
  for (const t of texts) {
    const m = (t || "").match(DURATION);
    if (m) return { n: m[1], unit: m[2] };
  }
  return null;
}

function Render({ vm }: SectionProps) {
  const { title, text } = vm.guarantee;
  const d = findDuration(title, text);
  return (
    <section id={sid("guarantee")} className="pc-gsc">
      <div className="pc-gsc-in">
        <div className="pc-gsc-seal" aria-hidden="true">
          <span className="pc-gsc-top">{tr(vm, "Garantie", "ضمان")}</span>
          {d ? (
            <span className="pc-gsc-dur" dir="auto">
              <b>{d.n}</b>
              <small>{d.unit}</small>
            </span>
          ) : (
            <Icon name="shield" className="pc-gsc-ico" />
          )}
          <span className="pc-gsc-orn">
            <i />
            <Icon name="sparkle" />
            <i />
          </span>
        </div>
        <div className="pc-gsc-txt">
          {title ? <h2 className="pc-gsc-title">{title}</h2> : null}
          {text ? <p className="pc-gsc-text">{text}</p> : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "guarantee-sceau",
  kind: "section",
  section: "guarantee",
  name: "Garantie : sceau",
  render: (p) => <Render {...p} />,
};
export default piece;
