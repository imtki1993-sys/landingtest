"use client";
import { useEffect, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { pic, sid, tr } from "../../../designs/kit";
import "./style.css";

/** Galerie : bande de photos qui défile seule (pause au survol, au focus ou avec le bouton). */
function Render({ vm }: SectionProps) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    // Respecte « réduire les animations » : la bande démarre à l'arrêt.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);
  const n = vm.images.length;
  if (!n) return null;
  // Assez de cartes pour remplir un grand écran, puis la série est doublée pour boucler sans saut.
  const reps = Math.max(1, Math.ceil(7 / n));
  const base = Array.from({ length: n * reps }, (_, i) => i % n);
  const dur = Math.max(28, base.length * 6);
  const card = (i: number, k: number, clone: boolean) => (
    <figure
      className={"pc-sd-item" + (k % 3 === 1 ? " alt" : "")}
      key={(clone ? "c" : "o") + k}
      aria-hidden={clone || undefined}
    >
      <div className="pc-sd-ph">
        <img src={pic(vm, i)} alt={clone ? "" : vm.imageLabels[i] || vm.name} loading="lazy" decoding="async" />
      </div>
      {vm.imageLabels[i] ? <figcaption>{vm.imageLabels[i]}</figcaption> : null}
    </figure>
  );
  return (
    <section id={sid("showcase")} className="pc-sd">
      <div className="pc-sd-head">
        {vm.titles.showcase ? <h2 className="pc-sd-title">{vm.titles.showcase}</h2> : <span />}
        <button
          type="button"
          className="pc-sd-ctl"
          aria-pressed={paused}
          aria-label={
            paused ? tr(vm, "Relancer le défilement", "تشغيل التمرير") : tr(vm, "Mettre en pause", "إيقاف مؤقت")
          }
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M7 5v14l12-7z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
      <div
        className={"pc-sd-view" + (paused ? " paused" : "")}
        role="region"
        aria-label={vm.titles.showcase || vm.name}
      >
        <div className="pc-sd-track" style={{ animationDuration: dur + "s" }}>
          {base.map((i, k) => card(i, k, false))}
          {base.map((i, k) => card(i, k, true))}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "showcase-defilante",
  kind: "section",
  section: "showcase",
  name: "Galerie : bande défilante",
  render: (p) => <Render {...p} />,
};
export default piece;
