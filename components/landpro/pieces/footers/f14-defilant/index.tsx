"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, navOf, tr } from "../../../designs/kit";
import "./style.css";

const PRODUCT = ["showcase", "features", "benefits", "story", "specs", "offers", "reviews"];
const HELP = ["how", "faq", "order"];

function Render({ vm }: SectionProps) {
  const base = (vm.trust.length ? vm.trust : [vm.delivery]).filter(Boolean);
  // assez d'éléments pour couvrir les grands écrans, puis la moitié est dupliquée (boucle sans saut)
  const reps = Math.max(2, Math.ceil(8 / Math.max(1, base.length)));
  const half = Array.from({ length: reps }, () => base).flat();
  const cols = [
    { title: tr(vm, "Le produit", "المنتج"), links: navOf(vm, 3, PRODUCT) },
    { title: tr(vm, "Aide", "مساعدة"), links: navOf(vm, 3, HELP) },
  ].filter((c) => c.links.length);

  const row = (hidden: boolean) => (
    <div className="pc-f14-half" aria-hidden={hidden || undefined}>
      {half.map((t, i) => (
        <span key={i} className={"pc-f14-item" + (i >= base.length ? " is-dup" : "")}>
          {t}
          <span className="pc-f14-star" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <footer className="pc-f14">
      {base.length ? (
        <div className="pc-f14-band">
          <div className="pc-f14-track">
            {row(false)}
            {row(true)}
          </div>
        </div>
      ) : null}
      <div className="pc-f14-in">
        <strong className={"pc-f14-name" + (vm.name.length > 26 ? " is-xl" : vm.name.length > 14 ? " is-l" : "")}>
          {vm.name}
        </strong>
        {cols.map((c) => (
          <nav key={c.title} className="pc-f14-col" aria-label={c.title}>
            <b>{c.title}</b>
            {c.links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
        ))}
        <p className="pc-f14-legal">
          © {new Date().getFullYear()} {vm.name}
        </p>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f14-defilant", kind: "footer", name: "Bandeau défilant", render: (p) => <Render {...p} /> };
export default piece;
