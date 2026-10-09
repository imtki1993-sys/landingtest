"use client";
// Pièce « Logo géant qui rétrécit » (maquette Main_H15) :
// en haut de page, petits liens + prix au-dessus d'un logotype géant (vm.name) ;
// au défilement, le logotype glisse et se réduit dans une barre compacte collante (nom · prix · bouton).
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, goTo, money, navOf, sid, tr } from "../../../designs/kit";
import "./style.css";

const KEYS = ["showcase", "features", "benefits", "reviews", "how", "faq", "specs", "offers"];

function Render({ vm }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const links = navOf(vm, 3, KEYS);
  const showPrice = vm.show.price && vm.price > 0;
  const hasOld = showPrice && !!vm.oldPrice && vm.oldPrice > vm.price;
  const len = Math.max(4, Array.from(vm.name.trim()).length);
  // Nom court : le logotype géant « glisse » dans la barre. Nom long : il passe sur 2 lignes et la barre
  // affiche son propre logo compact (fondu enchaîné), pour rester lisible à toutes les largeurs.
  const morph = len <= 14;

  // Progression 0 → 1 du défilement, écrite en variables CSS (aucun re-render React).
  useEffect(() => {
    const el = ref.current;
    const nm = nameRef.current;
    if (!el || !nm) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const bar = el.querySelector<HTMLElement>(".pc-h15-bar")?.offsetHeight || 60;
      const span = Math.max(1, el.offsetHeight - bar);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / span));
      // Échelle finale : le logotype géant devient un logo de barre (≈ 28 px de haut).
      const big = parseFloat(getComputedStyle(nm).fontSize) || 100;
      const small = parseFloat(getComputedStyle(el).getPropertyValue("--pc-small")) || 28;
      // Décalage vertical : du centre du logotype géant au centre de la barre.
      const top = nm.offsetTop + nm.offsetHeight / 2;
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--s", Math.min(1, small / big).toFixed(4));
      el.style.setProperty("--dy", `${(span + bar / 2 - top).toFixed(1)}px`);
      el.style.top = `${-span}px`;
      el.classList.toggle("is-compact", p >= 0.995);
      el.classList.toggle("is-bar", p >= 0.72);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(onScroll).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const price = showPrice ? (
    <span className="pc-h15-price">
      {hasOld ? <s>{money(vm, vm.oldPrice!)}</s> : null}
      <b>{money(vm, vm.price)}</b>
    </span>
  ) : null;

  return (
    <header
      className={"pc-h15 " + (morph ? "is-morph" : "is-wrap")}
      ref={ref}
      style={{ "--len": len, "--len2": Math.ceil(len / 2) + 2 } as CSSProperties}
    >
      <div className="pc-h15-top">
        {links.length ? (
          <nav className="pc-h15-links" aria-label={tr(vm, "Sections", "الأقسام")}>
            {links.map((l, i) => (
              <span key={l.key}>
                {i ? (
                  <i aria-hidden="true" className="pc-h15-sep">
                    ·
                  </i>
                ) : null}
                <a
                  href={"#" + sid(l.key)}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(l.key);
                  }}
                >
                  {l.label}
                </a>
              </span>
            ))}
          </nav>
        ) : (
          <span />
        )}
        <span className="pc-h15-toprice">
          {price}
          <Buy vm={vm} className="pc-h15-toplink" arrow />
        </span>
      </div>

      <a
        className="pc-h15-logo"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className="pc-h15-name" ref={nameRef}>
          {vm.name}
        </span>
      </a>

      <div className="pc-h15-bar">
        <div className="pc-h15-bar-in">
          <span className="pc-h15-mini" aria-hidden="true">
            {vm.name}
          </span>
          <span className="pc-h15-barprice">{price}</span>
          <Buy vm={vm} className="pc-h15-cta">
            <span className="pc-h15-long">{vm.cta}</span>
            <span className="pc-h15-short">{tr(vm, "Commander", "اطلب")}</span>
          </Buy>
        </div>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h15-logo-geant",
  kind: "header",
  name: "Logo géant qui rétrécit",
  render: (p) => <Render {...p} />,
};
export default piece;
