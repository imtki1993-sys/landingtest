"use client";
// Pièce « Carte de contact WhatsApp » : marque + liens à gauche, carte de contact WhatsApp à droite
// (sans numéro WhatsApp : carte « Commander » qui mène au formulaire).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Go, Icon, navOf, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import type { VM } from "../../../model";
import "./style.css";

const has = (vm: VM, k: string) => navOf(vm, 20, [k]).length > 0;

function Render({ vm, preview }: SectionProps) {
  const wa = !!vm.whatsapp;
  const links = [
    has(vm, "showcase") ? { to: "showcase", label: tr(vm, "Le produit", "المنتج") } : null,
    { to: has(vm, "how") ? "how" : "order", label: tr(vm, "Livraison", "التوصيل") },
    has(vm, "faq") ? { to: "faq", label: tr(vm, "Conditions", "الشروط") } : null,
  ].filter(Boolean) as { to: string; label: string }[];

  return (
    <footer className="pc-f11">
      <div className="pc-f11-in">
        <div className="pc-f11-brand">
          <strong className="pc-f11-name">{vm.name}</strong>
          <nav className="pc-f11-links" aria-label={tr(vm, "Liens utiles", "روابط")}>
            {links.map((l, i) => (
              <Go key={i} to={l.to}>
                {l.label}
              </Go>
            ))}
          </nav>
          <p className="pc-f11-legal">
            © {new Date().getFullYear()} {vm.name}
          </p>
        </div>

        <div className={"pc-f11-card" + (wa ? " is-wa" : "")}>
          <div className="pc-f11-head">
            <span className="pc-f11-ico">
              <Icon name={wa ? "whatsapp" : "bag"} size={26} />
            </span>
            <div className="pc-f11-txt">
              <h3 className="pc-f11-title">
                {wa ? tr(vm, "Une question ?", "عندك سؤال؟") : tr(vm, "Prêt à commander ?", "واجد تطلب؟")}
              </h3>
              <p className="pc-f11-sub">
                {wa
                  ? tr(vm, "Réponse en quelques minutes", "كنجاوبو فدقايق")
                  : vm.delivery || tr(vm, "Paiement à la livraison", "الدفع عند الاستلام")}
              </p>
            </div>
          </div>
          {wa ? (
            <a className="pc-f11-btn" href={preview ? undefined : waHref(vm)} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={19} />
              <span>{tr(vm, "Écrire sur WhatsApp", "راسلنا على واتساب")}</span>
            </a>
          ) : (
            <Buy vm={vm} className="pc-f11-btn" arrow>
              {vm.cta}
            </Buy>
          )}
        </div>
      </div>
    </footer>
  );
}

const piece: Piece = {
  id: "f11-whatsapp",
  kind: "footer",
  name: "WhatsApp / contact",
  render: (p) => <Render {...p} />,
};
export default piece;
