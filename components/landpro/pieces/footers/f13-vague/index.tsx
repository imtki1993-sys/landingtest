"use client";
// Pièce « En forme de vague » : vague SVG en haut (couleur du thème), puis marque + colonnes de liens.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, navOf, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import type { VM } from "../../../model";
import "./style.css";

const has = (vm: VM, k: string) => navOf(vm, 20, [k]).length > 0;
type L = { to: string; label: string } | null;

function Render({ vm, preview }: SectionProps) {
  const aide = [
    { to: has(vm, "how") ? "how" : "order", label: tr(vm, "Livraison", "التوصيل") },
    { to: "order", label: tr(vm, "Commander", "اطلب الآن") },
  ];
  const infos = [
    has(vm, "faq") ? { to: "faq", label: tr(vm, "Conditions", "الشروط") } : null,
    has(vm, "reviews") ? { to: "reviews", label: tr(vm, "Avis clients", "آراء الزبناء") } : null,
    has(vm, "showcase") ? { to: "showcase", label: tr(vm, "Le produit", "المنتج") } : null,
  ].filter(Boolean) as Exclude<L, null>[];

  return (
    <footer className="pc-f13">
      <svg className="pc-f13-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path className="pc-f13-wave2" d="M0 70C180 22 340 18 520 52s330 70 520 40 300-62 400-56v84H0z" />
        <path d="M0 64C200 4 400 112 620 60 800 18 960 40 1100 52s250 0 340-24v92H0z" />
      </svg>
      <div className="pc-f13-body">
        <div className={"pc-f13-in" + (infos.length ? "" : " is-two")}>
          <div className="pc-f13-brand">
            <strong className="pc-f13-name">{vm.name}</strong>
            <p className="pc-f13-deliv">
              {vm.delivery ||
                tr(vm, "Livré chez vous, payé à la réception.", "كيوصلك لباب الدار، وكتخلص عند الاستلام.")}
            </p>
          </div>
          <nav className="pc-f13-col" aria-label={tr(vm, "Aide", "مساعدة")}>
            <b>{tr(vm, "Aide", "مساعدة")}</b>
            {aide.map((l, i) => (
              <Go key={i} to={l.to}>
                {l.label}
              </Go>
            ))}
            {vm.whatsapp ? (
              <a href={preview ? undefined : waHref(vm)} target="_blank" rel="noopener noreferrer">
                {tr(vm, "WhatsApp", "واتساب")}
              </a>
            ) : null}
          </nav>
          {infos.length ? (
            <nav className="pc-f13-col" aria-label={tr(vm, "Infos", "معلومات")}>
              <b>{tr(vm, "Infos", "معلومات")}</b>
              {infos.map((l, i) => (
                <Go key={i} to={l.to}>
                  {l.label}
                </Go>
              ))}
            </nav>
          ) : null}
        </div>
        <p className="pc-f13-legal">
          © {new Date().getFullYear()} {vm.name}
        </p>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f13-vague", kind: "footer", name: "Vague", render: (p) => <Render {...p} /> };
export default piece;
