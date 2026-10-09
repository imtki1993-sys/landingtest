"use client";
// Pièce « Onglets façon fiche produit » (maquette Main_H14) :
// logo · onglets pleine hauteur vers les sections présentes (soulignement de l'onglet actif, suivi au défilement) · prix + bouton.
import { useEffect, useRef, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, goTo, money, navOf, sid, tr } from "../../../designs/kit";
import "./style.css";

const KEYS = ["showcase", "features", "benefits", "specs", "reviews", "how", "faq", "offers"];

function Render({ vm }: SectionProps) {
  const tabs = navOf(vm, 5, KEYS);
  const [active, setActive] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const sig = tabs.map((t) => t.key).join("|");

  // Onglet actif = dernière section dont le haut a passé sous l'en-tête.
  useEffect(() => {
    const keys = sig ? sig.split("|") : [];
    if (!keys.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const head = navRef.current?.closest("header")?.getBoundingClientRect().bottom ?? 0;
      let cur = "";
      for (const k of keys) {
        const el = document.getElementById(sid(k));
        if (el && el.getBoundingClientRect().top <= head + 40) cur = k;
      }
      setActive(cur || keys[0]);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sig]);

  // Sur mobile, l'onglet actif reste visible dans la rangée défilante.
  useEffect(() => {
    const nav = navRef.current;
    const on = nav?.querySelector<HTMLElement>(".pc-h14-tab.on");
    if (!nav || !on || nav.scrollWidth <= nav.clientWidth) return;
    const n = nav.getBoundingClientRect();
    const r = on.getBoundingClientRect();
    if (r.left < n.left || r.right > n.right) nav.scrollBy({ left: r.left - n.left - 16, behavior: "smooth" });
  }, [active]);

  const showPrice = vm.show.price && vm.price > 0;
  const hasOld = showPrice && !!vm.oldPrice && vm.oldPrice > vm.price;
  return (
    <header className={"pc-h14" + (tabs.length ? "" : " no-tabs")}>
      <div className="pc-h14-in">
        <a
          className={"pc-h14-logo" + (Array.from(vm.name).length > 14 ? " long" : "")}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="pc-h14-name">{vm.name}</span>
          <span className="pc-h14-dot" aria-hidden="true">
            .
          </span>
        </a>
        {tabs.length ? (
          <nav className="pc-h14-tabs" ref={navRef} aria-label={tr(vm, "Sections du produit", "أقسام المنتج")}>
            {tabs.map((t) => (
              <a
                key={t.key}
                className={"pc-h14-tab" + (t.key === active ? " on" : "")}
                aria-current={t.key === active ? "location" : undefined}
                href={"#" + sid(t.key)}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(t.key);
                  goTo(t.key);
                }}
              >
                {t.label}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="pc-h14-buy">
          {showPrice ? (
            <span className="pc-h14-price">
              {hasOld ? <s>{money(vm, vm.oldPrice!)}</s> : null}
              <b>{money(vm, vm.price)}</b>
            </span>
          ) : null}
          <Buy vm={vm} className="pc-h14-cta">
            <span className="pc-h14-long">{vm.cta}</span>
            <span className="pc-h14-short">{tr(vm, "Commander", "اطلب")}</span>
          </Buy>
        </div>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h14-onglets",
  kind: "header",
  name: "Onglets fiche produit",
  render: (p) => <Render {...p} />,
};
export default piece;
