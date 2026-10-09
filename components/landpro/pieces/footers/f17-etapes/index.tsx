"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, navOf, tr } from "../../../designs/kit";
import "./style.css";

const GENERIC = {
  fr: [
    { title: "Formulaire", text: "Nom, téléphone, ville" },
    { title: "Appel", text: "On confirme avec vous" },
    { title: "Livraison", text: "Chez vous" },
    { title: "Paiement", text: "À la réception" },
  ],
  ar: [
    { title: "الاستمارة", text: "الاسم، الهاتف، المدينة" },
    { title: "المكالمة", text: "كنأكدو معاك الطلب" },
    { title: "التوصيل", text: "حتى لباب الدار" },
    { title: "الخلاص", text: "عند الاستلام" },
  ],
};

function Render({ vm }: SectionProps) {
  const own = vm.steps.filter((s) => s.title).slice(0, 4);
  const steps = own.length >= 2 ? own : GENERIC[vm.lang];
  const links = navOf(vm, 4);
  return (
    <footer className="pc-f17">
      <div className="pc-f17-in">
        <h2 className="pc-f17-title">
          {tr(vm, `Commander en ${steps.length} étapes`, `الطلب ف ${steps.length} مراحل`)}
        </h2>
        <ol className="pc-f17-steps" style={{ ["--pc-f17-n" as string]: steps.length }}>
          {steps.map((s, i) => (
            <li key={i} className="pc-f17-step">
              <span className="pc-f17-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="pc-f17-txt">
                <b>{s.title}</b>
                {s.text ? <span>{s.text}</span> : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="pc-f17-bar">
          <strong className="pc-f17-name">{vm.name}</strong>
          <nav className="pc-f17-links">
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
            <span className="pc-f17-legal">
              © {new Date().getFullYear()} {vm.name}
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f17-etapes", kind: "footer", name: "Étapes de commande", render: (p) => <Render {...p} /> };
export default piece;
