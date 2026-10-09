"use client";
// Pièce « Offres : tableau comparatif » : une colonne par offre (vm.offers),
// lignes calculées (prix unitaire, économie, livraison, prix). La colonne
// choisie est mise en avant ; le bouton commande ce pack (setQty + scrollToOrder).
import { useState, type ReactNode } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, money, sid, tr } from "../../../designs/kit";
import { scrollToOrder } from "../../../parts";
import "./style.css";

function Render({ vm, qty, setQty }: SectionProps) {
  const offers = vm.offers;
  const [picked, setPicked] = useState(-1);
  const first = Math.max(
    0,
    offers.findIndex((o) => o.qty === qty),
  );
  const sel = picked >= 0 && offers[picked]?.qty === qty ? picked : first;
  const unit = offers.find((o) => o.qty === 1)?.price || vm.price;
  const full = (o: (typeof offers)[number]) => unit * o.qty;
  const saving = (o: (typeof offers)[number]) => (unit && full(o) > o.price ? full(o) - o.price : 0);
  const anySaving = offers.some((o) => saving(o) > 0);
  const anyMulti = offers.some((o) => o.qty > 1);
  const pick = (i: number) => {
    setPicked(i);
    setQty(offers[i].qty);
  };
  const delivery = vm.shipping > 0 ? money(vm, vm.shipping) : tr(vm, "Offerte", "مجانية");
  const rows: { key: string; label: string; strong?: boolean; cell: (o: (typeof offers)[number]) => ReactNode }[] = [];
  if (anyMulti)
    rows.push({
      key: "unit",
      label: tr(vm, "Prix unitaire", "ثمن الوحدة"),
      cell: (o) => money(vm, Math.round(o.price / o.qty)),
    });
  if (anySaving)
    rows.push({
      key: "save",
      label: vm.u.save,
      cell: (o) =>
        saving(o) ? (
          <span className="pc-oft-save" dir="ltr">
            −{money(vm, saving(o))}
          </span>
        ) : (
          <span className="pc-oft-dash">—</span>
        ),
    });
  rows.push({ key: "ship", label: tr(vm, "Livraison", "التوصيل"), cell: () => delivery });
  rows.push({
    key: "price",
    label: tr(vm, "Prix", "الثمن"),
    strong: true,
    cell: (o) => (
      <>
        {saving(o) ? <s>{money(vm, full(o))}</s> : null}
        <b>{money(vm, o.price)}</b>
      </>
    ),
  });
  const n = offers.length;
  const chosen = offers[sel];
  return (
    <section id={sid("offers")} className="pc-oft">
      <div className="pc-oft-in">
        <div className="pc-oft-head">
          {vm.titles.offers ? <h2 className="pc-oft-title">{vm.titles.offers}</h2> : null}
          <p className="pc-oft-sub">
            <Icon name="cash" />
            {vm.u.cod}
          </p>
        </div>
        <div className="pc-oft-scroll">
          <div
            className="pc-oft-grid"
            role="radiogroup"
            aria-label={vm.titles.offers || tr(vm, "Offres", "العروض")}
            style={{ ["--n" as string]: n }}
          >
            <span className="pc-oft-corner" style={{ gridColumn: 1, gridRow: 1 }} />
            {offers.map((o, i) => (
              <button
                type="button"
                role="radio"
                aria-checked={i === sel}
                key={"h" + i}
                className={"pc-oft-col pc-oft-th" + (i === sel ? " on" : "")}
                style={{ gridColumn: i + 2, gridRow: 1 }}
                onClick={() => pick(i)}
              >
                {o.badge ? <span className="pc-oft-badge">{o.badge}</span> : null}
                <span className="pc-oft-lab">{o.label}</span>
                <span className="pc-oft-radio" aria-hidden="true" />
              </button>
            ))}
            {rows.map((r, ri) => (
              <Row key={r.key} label={r.label} row={ri + 2} strong={r.strong}>
                {offers.map((o, i) => (
                  <span
                    key={i}
                    className={"pc-oft-td" + (r.strong ? " pc-oft-price" : "") + (i === sel ? " on" : "")}
                    style={{ gridColumn: i + 2, gridRow: ri + 2 }}
                    onClick={() => pick(i)}
                  >
                    {r.cell(o)}
                  </span>
                ))}
              </Row>
            ))}
          </div>
        </div>
        {chosen ? (
          <div className="pc-oft-foot">
            <button
              type="button"
              className="pc-oft-cta"
              onClick={() => {
                setQty(chosen.qty);
                scrollToOrder();
              }}
            >
              <span>
                {tr(vm, "Commander", "اطلب")} · {chosen.label}
              </span>
              <Icon name="arrow" className="pc-oft-arrow" />
            </button>
            <span className="pc-oft-total">
              {tr(vm, "Total", "المجموع")} <b>{money(vm, chosen.price + vm.shipping)}</b>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Row({ label, row, strong, children }: { label: string; row: number; strong?: boolean; children: ReactNode }) {
  return (
    <>
      <span className={"pc-oft-rh" + (strong ? " strong" : "")} style={{ gridColumn: 1, gridRow: row }}>
        {label}
      </span>
      {children}
    </>
  );
}

const piece: Piece = {
  id: "offers-tableau",
  kind: "section",
  section: "offers",
  name: "Offres : tableau comparatif",
  render: (p) => <Render {...p} />,
};
export default piece;
