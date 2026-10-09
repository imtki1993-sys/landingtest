"use client";
// Pièce « Dernier rappel du prix » : rappel produit (photo, nom, livraison) + prix (+ ancien prix) + bouton,
// puis ligne de bas de page : marque et liens.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Go, Img, discount, money, navOf, tr } from "../../../designs/kit";
import type { VM } from "../../../model";
import "./style.css";

const has = (vm: VM, k: string) => navOf(vm, 20, [k]).length > 0;

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const showPrice = vm.show.price && vm.price > 0;
  const links = [
    { to: has(vm, "how") ? "how" : "order", label: tr(vm, "Livraison", "التوصيل") },
    has(vm, "reviews") ? { to: "reviews", label: tr(vm, "Avis", "الآراء") } : null,
    has(vm, "faq") ? { to: "faq", label: tr(vm, "Conditions", "الشروط") } : null,
    { to: "order", label: tr(vm, "Commander", "اطلب الآن") },
  ].filter(Boolean) as { to: string; label: string }[];

  return (
    <footer className="pc-f12">
      <div className="pc-f12-in">
        <div className="pc-f12-top">
          {vm.images.length ? (
            <div className="pc-f12-thumb">
              <Img vm={vm} i={0} />
            </div>
          ) : null}
          <div className="pc-f12-prod">
            <h3 className="pc-f12-name">{vm.name}</h3>
            <p className="pc-f12-deliv">
              {vm.delivery ||
                tr(
                  vm,
                  "Livraison partout au Maroc · paiement à la livraison",
                  "التوصيل لجميع المدن · الدفع عند الاستلام",
                )}
            </p>
          </div>
          {showPrice ? (
            <div className="pc-f12-price">
              <strong>{money(vm, vm.price)}</strong>
              {d > 0 ? (
                <span className="pc-f12-was">
                  <s>{money(vm, vm.oldPrice!)}</s>
                  <em>-{d}%</em>
                </span>
              ) : null}
            </div>
          ) : null}
          <Buy vm={vm} className="pc-f12-btn">
            {vm.cta}
          </Buy>
        </div>
        <div className="pc-f12-bottom">
          <span className="pc-f12-brand">{vm.name}</span>
          <nav className="pc-f12-links" aria-label={tr(vm, "Liens utiles", "روابط")}>
            {links.map((l, i) => (
              <Go key={i} to={l.to}>
                {l.label}
              </Go>
            ))}
          </nav>
          <span className="pc-f12-copy">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

const piece: Piece = {
  id: "f12-rappel-prix",
  kind: "footer",
  name: "Rappel de prix",
  render: (p) => <Render {...p} />,
};
export default piece;
