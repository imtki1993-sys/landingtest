"use client";
import { useId, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { sid, tr } from "../../../designs/kit";
import "./style.css";

/**
 * Caractéristiques en accordéon : les lignes de vm.specs sont réparties en groupes équilibrés (3 par groupe
 * environ) ; l'en-tête d'un groupe énumère ses critères, le panneau montre les valeurs.
 */
function Render({ vm }: SectionProps) {
  const uid = useId();
  const [open, setOpen] = useState<number[]>([0]);
  const specs = vm.specs.filter((s) => s.label);
  if (!specs.length) return null;
  const count = Math.max(1, Math.ceil(specs.length / 3));
  const size = Math.ceil(specs.length / count);
  const groups: { label: string; value: string }[][] = [];
  for (let i = 0; i < specs.length; i += size) groups.push(specs.slice(i, i + size));
  const allOpen = open.length === groups.length;
  const toggle = (g: number) => setOpen((o) => (o.includes(g) ? o.filter((x) => x !== g) : [...o, g]));
  const sep = vm.lang === "ar" ? "، " : " · ";
  return (
    <section id={sid("specs")} className="pc-sa">
      <div className="pc-sa-in">
        <div className="pc-sa-head">
          {vm.titles.specs ? <h2 className="pc-sa-title">{vm.titles.specs}</h2> : <span />}
          {groups.length > 1 ? (
            <button type="button" className="pc-sa-all" onClick={() => setOpen(allOpen ? [] : groups.map((_, i) => i))}>
              {allOpen ? tr(vm, "Tout replier", "طيّ الكل") : tr(vm, "Tout afficher", "عرض الكل")}
            </button>
          ) : null}
        </div>
        <div className="pc-sa-list">
          {groups.map((g, gi) => {
            const on = open.includes(gi);
            const pid = `${uid}-p${gi}`;
            const hid = `${uid}-h${gi}`;
            return (
              <div className={"pc-sa-group" + (on ? " on" : "")} key={gi}>
                <h3 className="pc-sa-h">
                  <button
                    type="button"
                    id={hid}
                    className="pc-sa-btn"
                    aria-expanded={on}
                    aria-controls={pid}
                    onClick={() => toggle(gi)}
                  >
                    <svg className="pc-sa-tri" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                      <path d="M3 1.5 9.5 6 3 10.5z" fill="currentColor" />
                    </svg>
                    <span className="pc-sa-name">{g.map((s) => s.label).join(sep)}</span>
                    <span className="pc-sa-cnt">{g.length}</span>
                  </button>
                </h3>
                <div className="pc-sa-panel" id={pid} role="region" aria-labelledby={hid} hidden={!on}>
                  <dl>
                    {g.map((s, i) => (
                      <div key={i}>
                        <dt>{s.label}</dt>
                        <dd>{s.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "specs-accordeon",
  kind: "section",
  section: "specs",
  name: "Caractéristiques : accordéon",
  render: (p) => <Render {...p} />,
};
export default piece;
