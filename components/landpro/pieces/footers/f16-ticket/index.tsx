"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Go, money, navOf, totalFor, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm, qty, variant }: SectionProps) {
  const q = Math.max(1, qty || 1);
  const hasPrice = vm.price > 0;
  const total = totalFor(vm, q);
  const lines = total - vm.shipping;
  const v = vm.variants[variant]?.name;
  const links = navOf(vm, 4);
  return (
    <footer className="pc-f16">
      <div className="pc-f16-in">
        <div className="pc-f16-paper">
          <div className="pc-f16-ticket">
            <p className="pc-f16-head">
              <span>{vm.name}</span>
              <span aria-hidden="true"> · </span>
              <span>{tr(vm, "Reçu", "وصل")}</span>
            </p>
            <hr />
            <div className="pc-f16-row">
              <span className="pc-f16-lab">
                {vm.name} <b dir="ltr">×{q}</b>
                {v ? <small>{v}</small> : null}
              </span>
              {hasPrice ? <span className="pc-f16-val">{money(vm, lines)}</span> : null}
            </div>
            <div className="pc-f16-row">
              <span className="pc-f16-lab">{tr(vm, "Livraison", "التوصيل")}</span>
              <span className="pc-f16-val">{money(vm, vm.shipping)}</span>
            </div>
            {hasPrice ? (
              <>
                <hr />
                <div className="pc-f16-row is-total">
                  <span>{tr(vm, "Total", "المجموع")}</span>
                  <span className="pc-f16-val">{money(vm, total)}</span>
                </div>
              </>
            ) : null}
            <p className="pc-f16-cod">{vm.u.cod}</p>
            <p className="pc-f16-bars" aria-hidden="true" />
          </div>
        </div>
        <Buy vm={vm} className="pc-f16-btn" arrow>
          {vm.cta}
        </Buy>
        <div className="pc-f16-foot">
          {links.length ? (
            <nav className="pc-f16-links">
              {links.map((l) => (
                <Go key={l.key} to={l.key}>
                  {l.label}
                </Go>
              ))}
            </nav>
          ) : null}
          <p className="pc-f16-legal">
            © {new Date().getFullYear()} {vm.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f16-ticket", kind: "footer", name: "Ticket de caisse", render: (p) => <Render {...p} /> };
export default piece;
