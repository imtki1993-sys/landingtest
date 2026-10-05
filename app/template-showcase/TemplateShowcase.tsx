"use client";
// Galerie des 60 templates LandPro (aperçus en direct avec produit de démonstration).
import { useEffect, useRef, useState } from "react";
import {
  LANDING_TEMPLATE_PRESETS,
  LANDING_TEMPLATE_CATEGORIES,
  landingTemplate,
} from "../../lib/landing-template-presets";
import LandingTemplateV4 from "../../components/LandingTemplateV4";
type Device = "desktop" | "tablet" | "mobile";
const demoData = (id: string) => ({ templateId: id, name: "", price: 0, locale: landingTemplate(id).locale });

/** N'affiche l'aperçu qu'une fois la carte visible (60 aperçus restent fluides). */
function LazyPreview({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null),
    [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="v4-gallery-scale">
      {on && <LandingTemplateV4 data={demoData(id)} preview demo />}
    </div>
  );
}

export default function TemplateShowcase() {
  const [selected, setSelected] = useState<string | null>(null),
    [device, setDevice] = useState<Device>("desktop"),
    [cat, setCat] = useState("Tous");
  const t = selected ? landingTemplate(selected) : null;
  const list = LANDING_TEMPLATE_PRESETS.filter((x) => cat === "Tous" || x.category === cat);
  return (
    <main className="v4-gallery-page">
      <header className="v4-gallery-head">
        <div>
          <span>LANDPRO LIBRARY</span>
          <h1>{LANDING_TEMPLATE_PRESETS.length} Templates Landing Page</h1>
          <p>
            Cliquez sur un modèle pour l’ouvrir en grand et tester Desktop, Tablette et Mobile. Chaque section reste
            modifiable dans l’éditeur.
          </p>
        </div>
        <b>{list.length} modèles</b>
      </header>
      <div
        className="landing-template-cats"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 24px 16px" }}
      >
        {LANDING_TEMPLATE_CATEGORIES.map((c) => (
          <button type="button" key={c} className={cat === c ? "active" : ""} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <section className="v4-gallery-grid">
        {list.map((x) => (
          <button
            type="button"
            className="v4-gallery-card"
            key={x.id}
            onClick={() => {
              setSelected(x.id);
              setDevice("desktop");
            }}
          >
            <div className="v4-gallery-card-head">
              <strong>{String(x.number).padStart(2, "0")}</strong>
              <span>
                <b>{x.name}</b>
                <small>{x.category}</small>
              </span>
              <i>Voir</i>
            </div>
            <div className="v4-gallery-shot">
              <LazyPreview id={x.id} />
            </div>
          </button>
        ))}
      </section>
      {selected && t && (
        <div className="v4-gallery-modal" role="dialog" aria-modal="true">
          <div className="v4-gallery-modalbar">
            <div>
              <b>{t.name}</b>
              <span>{t.description}</span>
            </div>
            <div className="v4-gallery-devices">
              <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>
                Desktop
              </button>
              <button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")}>
                Tablette
              </button>
              <button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>
                Mobile
              </button>
              <button className="close" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>
          </div>
          <div className="v4-gallery-modalbody">
            <div className={"v4-frame " + device}>
              <LandingTemplateV4 data={demoData(selected)} preview demo />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
