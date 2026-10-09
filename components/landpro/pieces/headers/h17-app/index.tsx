"use client";
// Pièce « Style application » : sur ordinateur, barre classique (logo, liens, bouton « Commander · prix ») ;
// en largeur étroite (< 560px), logo centré en haut et barre d'onglets fixée en bas façon application
// (Accueil, Produit, Avis/FAQ, Commander) avec l'onglet de la section visible mis en valeur.
import { useEffect, useState } from "react";
import type React from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, money, navOf, scrollToOrder, sid, tr } from "../../../designs/kit";
import "./style.css";

const svg = (d: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);
const HomeIco = () => svg(<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" />);
const ProductIco = () =>
  svg(
    <>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M4 9h16" />
    </>,
  );
const StarIco = () => svg(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />);
const HelpIco = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7M12 16.6v.1" />
    </>,
  );
const BagIco = () =>
  svg(
    <>
      <path d="M5 8h14l-1.3 11.5a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </>,
  );

type Tab = { key: string; label: string; icon: React.ReactNode };

function Render({ vm }: SectionProps) {
  const links = navOf(vm, 4, ["showcase", "features", "benefits", "specs", "offers", "reviews", "how", "faq"]);
  const present = (k: string) => navOf(vm, 20, [k]).length > 0;
  const [active, setActive] = useState("home");
  const showPrice = vm.show.price && vm.price > 0;

  const tabs: Tab[] = [{ key: "home", label: tr(vm, "Accueil", "الرئيسية"), icon: <HomeIco /> }];
  const prod = ["showcase", "features", "benefits", "specs"].find(present);
  if (prod) tabs.push({ key: prod, label: tr(vm, "Produit", "المنتج"), icon: <ProductIco /> });
  if (present("reviews")) tabs.push({ key: "reviews", label: tr(vm, "Avis", "الآراء"), icon: <StarIco /> });
  else if (present("faq")) tabs.push({ key: "faq", label: tr(vm, "FAQ", "أسئلة"), icon: <HelpIco /> });
  tabs.push({ key: "order", label: tr(vm, "Commander", "اطلب"), icon: <BagIco /> });

  const go = (k: string) => {
    if (k === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else if (k === "order") scrollToOrder();
    else document.getElementById(sid(k))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Onglet actif = dernière section dont le haut a dépassé ~45 % de l'écran.
  const sig = tabs.map((t) => t.key).join("|");
  useEffect(() => {
    const keys = sig.split("|").filter((k) => k !== "home");
    const onScroll = () => {
      let cur = "home";
      for (const k of keys) {
        const el = document.getElementById(k === "order" ? "order" : sid(k));
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) cur = k;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sig]);

  // La barre fixe du bas ne doit pas cacher la fin de la page : marge basse en largeur étroite.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lpx");
    if (!root) return;
    const apply = () => {
      root.style.paddingBottom = root.clientWidth < 560 ? "72px" : "";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.paddingBottom = "";
    };
  }, []);

  return (
    <>
      <header className="pc-h17">
        <div className="pc-h17-in">
          <a
            className="pc-h17-brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
          >
            <span className="pc-h17-name">{vm.name}</span>
            {vm.name.length <= 20 ? (
              <span className="pc-h17-dot" aria-hidden="true">
                .
              </span>
            ) : null}
          </a>
          {links.length ? (
            <nav className="pc-h17-links">
              {links.map((l) => (
                <Go key={l.key} to={l.key} className="pc-h17-link">
                  {l.label}
                </Go>
              ))}
            </nav>
          ) : null}
          <button type="button" className="pc-h17-cta" onClick={scrollToOrder}>
            <span>{vm.cta}</span>
            {showPrice ? (
              <>
                <span className="pc-h17-sep" aria-hidden="true">
                  ·
                </span>
                <b className="pc-h17-price">{money(vm, vm.price)}</b>
              </>
            ) : null}
          </button>
        </div>
      </header>
      <nav className="pc-h17-tab" aria-label={tr(vm, "Navigation", "التنقل")}>
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            className={"pc-h17-item" + (t.key === "order" ? " cta" : "") + (t.key === active ? " on" : "")}
            aria-current={t.key === active ? "true" : undefined}
            onClick={() => {
              setActive(t.key);
              go(t.key);
            }}
          >
            <span className="pc-h17-ic">{t.icon}</span>
            <span className="pc-h17-lb">{t.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

const piece: Piece = {
  id: "h17-app",
  kind: "header",
  name: "Style application",
  render: (p) => <Render {...p} />,
};
export default piece;
