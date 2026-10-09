"use client";
// Pièce « FAQ : façon chat » : chaque question est une bulle client (à droite),
// chaque réponse une bulle boutique (à gauche), comme une conversation.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, sid, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import "./style.css";

function Render({ vm, preview }: SectionProps) {
  const items = vm.faq.filter((f) => f.question || f.answer);
  const initial = (vm.name || "").trim().charAt(0).toUpperCase();
  return (
    <section id={sid("faq")} className="pc-fqc">
      <div className="pc-fqc-in">
        {vm.titles.faq ? <h2 className="pc-fqc-title">{vm.titles.faq}</h2> : null}
        <ol className="pc-fqc-feed">
          {items.map((f, i) => (
            <li className="pc-fqc-turn" key={i} style={{ ["--d" as string]: `${Math.min(i, 8) * 70}ms` }}>
              {f.question ? (
                <p className="pc-fqc-q">
                  <span className="pc-fqc-sr">{tr(vm, "Question : ", "سؤال: ")}</span>
                  {f.question}
                </p>
              ) : null}
              {f.answer ? (
                <div className="pc-fqc-a">
                  {initial ? (
                    <span className="pc-fqc-av" aria-hidden="true">
                      {initial}
                    </span>
                  ) : null}
                  <p>
                    <span className="pc-fqc-sr">{tr(vm, "Réponse : ", "جواب: ")}</span>
                    {f.answer}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
        {vm.whatsapp ? (
          <div className="pc-fqc-more">
            <span>{tr(vm, "Une autre question ?", "عندك سؤال آخر؟")}</span>
            <a className="pc-fqc-wa" href={preview ? undefined : waHref(vm)} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" />
              {tr(vm, "Écrivez-nous sur WhatsApp", "كتب لينا ف واتساب")}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "faq-chat",
  kind: "section",
  section: "faq",
  name: "FAQ : façon chat",
  render: (p) => <Render {...p} />,
};
export default piece;
