"use client";
// Pièce « Packs 1/2/3 dans le hero » : produit + titre d'un côté, liste des offres (choix radio qui appelle setQty)
// de l'autre ; le CTA mène au formulaire avec la quantité choisie.
import React from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, Headline, Icon, Img, money, sid, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm, qty, setQty }: SectionProps) {
  const offers = vm.offers.length > 1 ? vm.offers : [];
  const sel = offers.find((o) => o.qty === qty);
  const unit = vm.offers.find((o) => o.qty === 1)?.price || vm.price;
  const total = sel?.price ?? vm.price;
  const d = discount(vm);
  const layers = Math.min(sel ? qty : 1, 3);
  const showPrice = vm.show.price && vm.price > 0;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const k = e.key;
    const fwd = vm.rtl ? "ArrowLeft" : "ArrowRight";
    const back = vm.rtl ? "ArrowRight" : "ArrowLeft";
    let n = -1;
    if (k === "ArrowDown" || k === fwd) n = (i + 1) % offers.length;
    else if (k === "ArrowUp" || k === back) n = (i - 1 + offers.length) % offers.length;
    if (n < 0) return;
    e.preventDefault();
    setQty(offers[n].qty);
    const group = (e.currentTarget as HTMLElement).parentElement;
    (group?.children[n] as HTMLElement | undefined)?.focus();
  };

  return (
    <section id={sid("hero")} className="pc-hpk">
      <div className="pc-hpk-in">
        <div className="pc-hpk-product">
          <div className="pc-hpk-visual">
            <div className="pc-hpk-stack" data-n={layers}>
              {Array.from({ length: layers }).map((_, k) => (
                <Img key={k} vm={vm} i={0} className="pc-hpk-img" alt={k ? "" : vm.name} />
              ))}
            </div>
            {sel && qty > 1 ? <span className="pc-hpk-qty">×{qty}</span> : null}
          </div>
          {vm.show.badge && vm.eyebrow ? <span className="pc-hpk-eyebrow">{vm.eyebrow}</span> : null}
          <Headline vm={vm} className="pc-hpk-title" />
          {vm.show.subtitle && vm.subheadline ? <p className="pc-hpk-sub">{vm.subheadline}</p> : null}
        </div>

        <div className="pc-hpk-side">
          {offers.length ? (
            <>
              <p className="pc-hpk-label" id="pc-hpk-label">
                {tr(vm, "Choisissez votre pack", "اختار العرض ديالك")}
              </p>
              <div className="pc-hpk-list" role="radiogroup" aria-labelledby="pc-hpk-label">
                {offers.map((o, i) => {
                  const on = o.qty === qty;
                  const save = unit * o.qty - o.price;
                  return (
                    <button
                      key={o.qty + o.label}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      tabIndex={on || (!sel && i === 0) ? 0 : -1}
                      className={"pc-hpk-row" + (on ? " on" : "")}
                      onClick={() => setQty(o.qty)}
                      onKeyDown={(e) => onKey(e, i)}
                    >
                      <span className="pc-hpk-radio" aria-hidden="true" />
                      <span className="pc-hpk-rlabel">
                        <span className="pc-hpk-rtop">
                          <span className="pc-hpk-rname">{o.label}</span>
                          {o.badge ? <span className="pc-hpk-badge">{o.badge}</span> : null}
                        </span>
                        {showPrice && o.qty > 1 && save > 0 ? (
                          <span className="pc-hpk-rsave">
                            {vm.u.save} {money(vm, save)}
                          </span>
                        ) : null}
                      </span>
                      {showPrice ? (
                        <span className="pc-hpk-rprice">
                          <b>{money(vm, o.price)}</b>
                          {o.qty > 1 && save > 0 ? <s>{money(vm, unit * o.qty)}</s> : null}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : showPrice ? (
            <div className="pc-hpk-single">
              <b>{money(vm, vm.price)}</b>
              {vm.oldPrice ? <s>{money(vm, vm.oldPrice)}</s> : null}
              {d > 0 ? <i>-{d}%</i> : null}
            </div>
          ) : null}
          {vm.show.cta ? (
            <Buy vm={vm} className="pc-hpk-cta" arrow>
              {vm.cta}
              {showPrice ? <span className="pc-hpk-total"> · {money(vm, total)}</span> : null}
            </Buy>
          ) : null}
          {vm.delivery ? (
            <p className="pc-hpk-deliv">
              <Icon name="truck" /> {vm.delivery}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-packs",
  kind: "hero",
  name: "Packs 1/2/3 dans le hero",
  render: (p) => <Render {...p} />,
};
export default piece;
