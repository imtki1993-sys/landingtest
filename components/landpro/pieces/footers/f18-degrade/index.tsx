"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, navOf, tr } from "../../../designs/kit";
import "./style.css";

const PRODUCT = ["showcase", "features", "benefits", "story", "specs", "offers", "reviews"];
const HELP = ["how", "faq", "order"];

function Render({ vm }: SectionProps) {
  const fc = vm.finalCta.text;
  const tagline = fc && fc.length <= 110 ? fc : vm.delivery;
  const cols = [
    { title: tr(vm, "Produit", "المنتج"), links: navOf(vm, 3, PRODUCT) },
    { title: tr(vm, "Aide", "مساعدة"), links: navOf(vm, 3, HELP) },
  ].filter((c) => c.links.length);
  return (
    <footer className="pc-f18">
      <div className="pc-f18-in">
        <div className="pc-f18-brand">
          <strong className="pc-f18-name">
            {vm.name}
            <span className="pc-f18-dot" aria-hidden="true">
              .
            </span>
          </strong>
          {tagline ? <p className="pc-f18-tag">{tagline}</p> : null}
        </div>
        {cols.map((c) => (
          <nav key={c.title} className="pc-f18-col" aria-label={c.title}>
            <b>{c.title}</b>
            {c.links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
        ))}
        <p className="pc-f18-legal">
          © {new Date().getFullYear()} {vm.name}
        </p>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f18-degrade", kind: "footer", name: "Dégradé", render: (p) => <Render {...p} /> };
export default piece;
