"use client";
// Pièce « FAQ express » : pied de page sombre, marque + liens à gauche, 3 questions en accordéon à droite.
import { useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Go, navOf, tr } from "../../../designs/kit";
import type { VM } from "../../../model";
import "./style.css";

const has = (vm: VM, k: string) => navOf(vm, 20, [k]).length > 0;

function Render({ vm }: SectionProps) {
  const faq = vm.faq.filter((f) => f.question).slice(0, 3);
  const [open, setOpen] = useState(0);
  const links = [
    { to: has(vm, "how") ? "how" : "order", label: tr(vm, "Livraison", "التوصيل") },
    has(vm, "faq") ? { to: "faq", label: tr(vm, "Conditions", "الشروط") } : null,
    { to: "order", label: tr(vm, "Commander", "اطلب الآن") },
  ].filter(Boolean) as { to: string; label: string }[];

  return (
    <footer className={"pc-f10" + (faq.length ? "" : " is-solo")}>
      <div className="pc-f10-in">
        <div className="pc-f10-brand">
          <strong className="pc-f10-name">{vm.name}</strong>
          <p className="pc-f10-deliv">
            {vm.delivery ||
              tr(
                vm,
                "Livraison partout au Maroc, paiement à la réception.",
                "التوصيل لجميع المدن، والدفع عند الاستلام.",
              )}
          </p>
          <nav className="pc-f10-links" aria-label={tr(vm, "Liens utiles", "روابط")}>
            {links.map((l, i) => (
              <Go key={i} to={l.to}>
                {l.label}
              </Go>
            ))}
          </nav>
          {faq.length ? null : (
            <Buy vm={vm} className="pc-f10-btn" arrow>
              {vm.cta}
            </Buy>
          )}
          <p className="pc-f10-legal">
            © {new Date().getFullYear()} {vm.name}
          </p>
        </div>

        {faq.length ? (
          <div className="pc-f10-faq">
            <h3 className="pc-f10-title">{tr(vm, "Questions rapides", "أسئلة سريعة")}</h3>
            {faq.map((f, i) => {
              const on = open === i;
              const id = "pc-f10-a" + i;
              return (
                <div key={i} className={"pc-f10-item" + (on ? " is-open" : "")}>
                  <h4 className="pc-f10-q">
                    <button type="button" aria-expanded={on} aria-controls={id} onClick={() => setOpen(on ? -1 : i)}>
                      <span className="pc-f10-tri" aria-hidden="true" />
                      <span>{f.question}</span>
                    </button>
                  </h4>
                  <div id={id} className="pc-f10-a" role="region" aria-hidden={!on}>
                    <div>
                      <p>{f.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f10-faq", kind: "footer", name: "FAQ express", render: (p) => <Render {...p} /> };
export default piece;
