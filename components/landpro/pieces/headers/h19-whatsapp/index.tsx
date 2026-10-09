"use client";
// Pièce « Bouton WhatsApp dominant » : logo et liens discrets, grand bouton WhatsApp (vert officiel) avec
// le numéro. Sans numéro WhatsApp, le bouton devient « Commander » (couleur principale) vers le formulaire.
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, Icon, navOf, scrollToOrder, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import "./style.css";

const WaIco = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2.5a9.43 9.43 0 0 0-8.1 14.27L2.5 21.5l4.87-1.4A9.43 9.43 0 1 0 12.04 2.5Zm0 17.2a7.77 7.77 0 0 1-3.96-1.09l-.28-.17-2.89.83.85-2.8-.19-.29a7.78 7.78 0 1 1 6.47 3.52Zm4.27-5.82c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.53.12-.15.23-.6.76-.74.92-.14.15-.27.17-.5.06a6.37 6.37 0 0 1-3.17-2.77c-.24-.41.24-.38.69-1.27.08-.15.04-.29-.02-.4-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.53-.4h-.46a.88.88 0 0 0-.64.3 2.68 2.68 0 0 0-.83 1.99 4.66 4.66 0 0 0 .98 2.47 10.66 10.66 0 0 0 4.08 3.6c1.52.66 2.12.71 2.88.6.46-.07 1.38-.57 1.58-1.11.2-.55.2-1.02.14-1.11-.06-.1-.21-.16-.44-.27Z" />
  </svg>
);

/** 2126XXXXXXXX → « 06 XX XX XX XX » ; autres formats : « +… » groupé par 3. */
function phoneLabel(d: string) {
  if (/^212[5-7]\d{8}$/.test(d)) return ("0" + d.slice(3)).replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  if (/^0[5-7]\d{8}$/.test(d)) return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  return "+" + d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

function Render({ vm }: SectionProps) {
  const links = navOf(vm, 3, ["showcase", "features", "benefits", "specs", "how", "reviews", "faq"]);
  const wa = !!vm.whatsapp;
  return (
    <header className="pc-h19">
      <div className="pc-h19-in">
        <a
          className="pc-h19-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {vm.name}
        </a>
        {links.length ? (
          <nav className="pc-h19-links">
            {links.map((l) => (
              <Go key={l.key} to={l.key} className="pc-h19-link">
                {l.label}
              </Go>
            ))}
          </nav>
        ) : null}
        {wa ? (
          <a className="pc-h19-btn wa" href={waHref(vm)} target="_blank" rel="noopener noreferrer">
            <span className="pc-h19-ic">
              <WaIco />
            </span>
            <span className="pc-h19-txt">
              <span className="pc-h19-long">{tr(vm, "Commander sur WhatsApp", "اطلب عبر واتساب")}</span>
              <span className="pc-h19-short">WhatsApp</span>
            </span>
            <span className="pc-h19-num" dir="ltr">
              {phoneLabel(vm.whatsapp)}
            </span>
          </a>
        ) : (
          <button type="button" className="pc-h19-btn" onClick={scrollToOrder}>
            <span className="pc-h19-ic">
              <Icon name="bag" />
            </span>
            <span className="pc-h19-txt">
              <span className="pc-h19-long">{vm.cta}</span>
              <span className="pc-h19-short">{tr(vm, "Commander", "اطلب")}</span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h19-whatsapp",
  kind: "header",
  name: "Bouton WhatsApp dominant",
  render: (p) => <Render {...p} />,
};
export default piece;
