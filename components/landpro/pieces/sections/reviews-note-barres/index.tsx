"use client";
import { useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Stars, sid, tr } from "../../../designs/kit";
import "./style.css";

const STAR = "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z";
const FIRST = 6;

/** Avis : note moyenne + barres de répartition, calculées à partir des vrais avis, puis les avis. */
function Render({ vm }: SectionProps) {
  const [all, setAll] = useState(false);
  const rs = vm.reviews
    .filter((r) => r.text)
    .map((r) => ({ ...r, rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))) }));
  const n = rs.length;
  if (!n) return null;
  const avg = rs.reduce((a, r) => a + r.rating, 0) / n;
  const avgTxt = vm.lang === "ar" ? avg.toFixed(1) : avg.toFixed(1).replace(".", ",");
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, c: rs.filter((r) => r.rating === s).length }));
  const based =
    vm.lang === "ar"
      ? `محسوبة على ${n} ${n > 1 ? "تقييمات حقيقية" : "تقييم حقيقي"}`
      : `Calculé sur ${n} ${n > 1 ? "vrais avis" : "vrai avis"}`;
  const shown = all ? rs : rs.slice(0, FIRST);
  return (
    <section id={sid("reviews")} className="pc-rb">
      <div className="pc-rb-in">
        {vm.titles.reviews ? <h2 className="pc-rb-title">{vm.titles.reviews}</h2> : null}
        <div className="pc-rb-summary">
          <div className="pc-rb-score">
            <b className="pc-rb-avg">{avgTxt}</b>
            <Stars n={avg} className="pc-rb-stars" />
            <span className="pc-rb-count">{based}</span>
          </div>
          <ul className="pc-rb-bars" aria-label={tr(vm, "Répartition des notes", "توزيع التقييمات")}>
            {dist.map((d) => {
              const pct = Math.round((d.c / n) * 100);
              return (
                <li key={d.s}>
                  <span className="pc-rb-lvl">
                    {d.s}
                    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                      <path d={STAR} fill="currentColor" />
                    </svg>
                  </span>
                  <span className="pc-rb-track" role="img" aria-label={`${d.s}/5 : ${d.c} (${pct}%)`}>
                    <span className="pc-rb-fill" style={{ width: (d.c ? Math.max(pct, 2) : 0) + "%" }} />
                  </span>
                  <span className="pc-rb-pct">{d.c}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="pc-rb-cards">
          {shown.map((r, i) => (
            <figure className="pc-rb-card" key={i}>
              <Stars n={r.rating} className="pc-rb-cstars" />
              <blockquote>{r.text}</blockquote>
              <figcaption>
                <span className="pc-rb-av" aria-hidden="true">
                  {(r.name || "?").trim().charAt(0).toUpperCase()}
                </span>
                <span className="pc-rb-who">
                  <b>{r.name}</b>
                  {r.city ? <small>{r.city}</small> : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        {n > FIRST ? (
          <div className="pc-rb-more">
            <button type="button" aria-expanded={all} onClick={() => setAll((a) => !a)}>
              {all
                ? tr(vm, "Afficher moins d'avis", "عرض أقل")
                : vm.lang === "ar"
                  ? `عرض كل التقييمات (${n})`
                  : `Voir tous les avis (${n})`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "reviews-note-barres",
  kind: "section",
  section: "reviews",
  name: "Avis : note + barres",
  render: (p) => <Render {...p} />,
};
export default piece;
