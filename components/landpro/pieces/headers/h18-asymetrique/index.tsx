"use client";
// Pièce « Asymétrique, logo en biais » : bandeau contrasté (couleurs du thème inversées), nom du produit
// dans une étiquette penchée couleur principale, liens décalés en hauteur et bouton biseauté.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, navOf, scrollToOrder, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm }: SectionProps) {
  const links = navOf(vm, 3, ["showcase", "features", "benefits", "specs", "offers", "reviews", "how", "faq"]);
  return (
    <header className="pc-h18">
      <div className="pc-h18-in">
        <a
          className="pc-h18-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span>{vm.name}</span>
        </a>
        {links.length ? (
          <nav className="pc-h18-links">
            {links.map((l, i) => (
              <Go key={l.key} to={l.key} className={"pc-h18-link s" + (i % 3)}>
                {l.label}
              </Go>
            ))}
          </nav>
        ) : null}
        <div className="pc-h18-end">
          <button type="button" className="pc-h18-cta" onClick={scrollToOrder}>
            <span className="pc-h18-long">{vm.cta}</span>
            <span className="pc-h18-short">{tr(vm, "Commander", "اطلب")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h18-asymetrique",
  kind: "header",
  name: "Asymétrique, logo en biais",
  render: (p) => <Render {...p} />,
};
export default piece;
