"use client";
import { useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, pic, sid, tr } from "../../../designs/kit";
import "./style.css";

const Z = 2.6; // facteur de zoom

/**
 * Galerie zoom : sur ordinateur, une loupe suit la souris et le détail s'agrandit dans le cadre voisin ;
 * sur mobile, on touche la photo pour zoomer sur place, puis on glisse pour se déplacer.
 */
function Render({ vm }: SectionProps) {
  const [cur, setCur] = useState(0);
  const [hover, setHover] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const n = vm.images.length;
  if (!n) return null;
  const src = pic(vm, cur);
  const label = vm.imageLabels[cur] || "";
  const at = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  };
  const key = (e: React.KeyboardEvent) => {
    const d = 8;
    const mv: Record<string, [number, number]> = {
      ArrowLeft: [-d, 0],
      ArrowRight: [d, 0],
      ArrowUp: [0, -d],
      ArrowDown: [0, d],
    };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setZoom((z) => !z);
    } else if (mv[e.key]) {
      e.preventDefault();
      const [dx, dy] = mv[e.key];
      setPos((p) => ({ x: Math.min(100, Math.max(0, p.x + dx)), y: Math.min(100, Math.max(0, p.y + dy)) }));
    } else if (e.key === "Escape") setZoom(false);
  };
  const pick = (i: number) => {
    setCur(i);
    setZoom(false);
    setPos({ x: 50, y: 50 });
  };
  return (
    <section id={sid("showcase")} className="pc-sz">
      <div className="pc-sz-in">
        {vm.titles.showcase ? <h2 className="pc-sz-title">{vm.titles.showcase}</h2> : null}
        <div className="pc-sz-stage">
          <div className="pc-sz-left">
            <div
              className={"pc-sz-main" + (zoom ? " on" : "") + (hover ? " hov" : "")}
              role="button"
              tabIndex={0}
              aria-pressed={zoom}
              aria-label={
                (label || vm.name) +
                " — " +
                tr(vm, "zoom : Entrée, puis flèches pour se déplacer", "التكبير: Enter ثم الأسهم للتنقل")
              }
              onPointerMove={(e) => {
                if (e.pointerType === "mouse") {
                  at(e);
                  if (!hover) setHover(true);
                } else if (zoom) at(e);
              }}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
              onPointerUp={(e) => {
                if (e.pointerType !== "mouse") {
                  if (!zoom) at(e);
                  setZoom((z) => !z);
                }
              }}
              onKeyDown={key}
            >
              <img
                src={src}
                alt={label || vm.name}
                style={{ transformOrigin: `${pos.x}% ${pos.y}%` }}
                decoding="async"
                draggable={false}
              />
              <span className="pc-sz-lens" style={{ left: pos.x + "%", top: pos.y + "%" }} aria-hidden="true" />
              <span className="pc-sz-chip" aria-hidden="true">
                <Icon name={zoom ? "close" : "search"} />
                {zoom ? tr(vm, "Toucher pour fermer", "المس للإغلاق") : tr(vm, "Toucher pour zoomer", "المس للتكبير")}
              </span>
            </div>
            {n > 1 ? (
              <div className="pc-sz-thumbs" role="group" aria-label={vm.titles.showcase || vm.name}>
                {vm.images.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    aria-pressed={i === cur}
                    aria-label={vm.imageLabels[i] || `${vm.name} ${i + 1}`}
                    className={"pc-sz-thumb" + (i === cur ? " on" : "")}
                    onClick={() => pick(i)}
                  >
                    <img src={pic(vm, i)} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="pc-sz-right">
            <div
              className={"pc-sz-pane" + (hover || zoom ? " live" : "")}
              aria-hidden="true"
              style={{
                backgroundImage: `url("${src}")`,
                backgroundSize: Z * 100 + "%",
                backgroundPosition: `${pos.x}% ${pos.y}%`,
              }}
            >
              <span className="pc-sz-x">×{String(Z).replace(".", vm.lang === "ar" ? "." : ",")}</span>
            </div>
            <div className="pc-sz-text">
              {label ? <b className="pc-sz-cap">{label}</b> : null}
              <p className="pc-sz-hint">
                {tr(
                  vm,
                  "Survolez la photo : le détail s'agrandit ici.",
                  "مرّر الفأرة فوق الصورة: تظهر التفاصيل مكبّرة هنا.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "showcase-zoom",
  kind: "section",
  section: "showcase",
  name: "Galerie : zoom au survol",
  render: (p) => <Render {...p} />,
};
export default piece;
