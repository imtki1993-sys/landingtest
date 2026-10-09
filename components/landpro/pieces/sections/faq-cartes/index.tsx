"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, sid, tr } from "../../../designs/kit";
import "./style.css";

/** FAQ en grille de cartes (question + réponse visibles) ; dernière carte « Autre question ? » vers WhatsApp. */
function Render({ vm, preview }: SectionProps) {
  const faq = vm.faq.filter((f) => f.question);
  if (!faq.length) return null;
  const msg =
    vm.lang === "ar"
      ? `السلام عليكم، عندي سؤال على ${vm.name}`.trim()
      : `Bonjour, j'ai une question sur : ${vm.name}`.trim();
  const wa = vm.whatsapp ? `https://wa.me/${vm.whatsapp}?text=${encodeURIComponent(msg)}` : "";
  // Galerie de démo sans numéro : la carte est montrée (inactive) pour présenter le design.
  const showWa = !!wa || vm.demo;
  return (
    <section id={sid("faq")} className="pc-fc">
      <div className="pc-fc-in">
        {vm.titles.faq ? <h2 className="pc-fc-title">{vm.titles.faq}</h2> : null}
        <dl className="pc-fc-grid">
          {faq.map((f, i) => (
            <div className="pc-fc-card" key={i}>
              <dt>{f.question}</dt>
              {f.answer ? <dd>{f.answer}</dd> : null}
            </div>
          ))}
          {showWa ? (
            <div className="pc-fc-card pc-fc-wa">
              <dt>{tr(vm, "Autre question ?", "سؤال آخر؟")}</dt>
              <dd>
                <a
                  href={preview || !wa ? undefined : wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-fc-link"
                >
                  <span className="pc-fc-wico" aria-hidden="true">
                    <Icon name="whatsapp" />
                  </span>
                  <span>{tr(vm, "Écrivez-nous sur WhatsApp", "راسلنا على واتساب")}</span>
                  <Icon name="arrow" className="pc-fc-arr" />
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "faq-cartes",
  kind: "section",
  section: "faq",
  name: "FAQ : cartes",
  render: (p) => <Render {...p} />,
};
export default piece;
