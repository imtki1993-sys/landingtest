"use client";
// Pièce « Offres : remise progressive » : une réglette à paliers (un palier par
// offre de vm.offers). Chaque palier affiche son prix et l'économie CALCULÉE
// par rapport au prix unitaire (aucun pourcentage inventé). Choisir un palier
// règle la quantité ; le bouton commande ce palier (setQty + scrollToOrder).
import { useRef, useState, type KeyboardEvent } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, money, sid, tr } from "../../../designs/kit";
import { scrollToOrder } from "../../../parts";
import "./style.css";

function Render({ vm, qty, setQty }: SectionProps) {
  const offers = vm.offers;
  const n = offers.length;
  const [picked, setPicked] = useState(-1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = Math.max(
    0,
    offers.findIndex((o) => o.qty === qty),
  );
  const sel = picked >= 0 && offers[picked]?.qty === qty ? picked : first;
  const unit = offers.find((o) => o.qty === 1)?.price || vm.price;
  const info = offers.map((o) => {
    const full = unit * o.qty;
    const save = unit && full > o.price ? full - o.price : 0;
    const pct = save ? Math.round((save / full) * 100) : 0;
    return { full, save, pct };
  });
  const pick = (i: number, focus = false) => {
    const j = Math.max(0, Math.min(n - 1, i));
    setPicked(j);
    setQty(offers[j].qty);
    if (focus) refs.current[j]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const rtl = vm.rtl;
    const next = e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowDown";
    const prev = e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowUp";
    if (next || prev || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      pick(e.key === "Home" ? 0 : e.key === "End" ? n - 1 : sel + (next ? 1 : -1), true);
    }
  };
  const pos = (i: number) => `${((i + 0.5) / n) * 100}%`;
  const chosen = offers[sel];
  const anyBadge = offers.some((o) => o.badge);
  const best = info.reduce((m, x) => Math.max(m, x.pct), 0);
  return (
    <section id={sid("offers")} className="pc-ofp">
      <div className="pc-ofp-in">
        <div className="pc-ofp-head">
          {vm.titles.offers ? <h2 className="pc-ofp-title">{vm.titles.offers}</h2> : null}
          {best > 0 ? (
            <span className="pc-ofp-up">
              <Icon name="tag" />
              {tr(vm, "Jusqu'à", "حتى")} <bdi dir="ltr">−{best} %</bdi>
            </span>
          ) : null}
        </div>

        <div className="pc-ofp-scale" style={{ ["--n" as string]: n }}>
          {n > 1 ? (
            <div className="pc-ofp-track" aria-hidden="true">
              <span className="pc-ofp-fill" style={{ width: pos(sel) }} />
              {offers.map((_, i) => (
                <span
                  key={i}
                  className={"pc-ofp-tick" + (i <= sel ? " done" : "")}
                  style={{ insetInlineStart: pos(i) }}
                />
              ))}
              <span className="pc-ofp-knob" style={{ insetInlineStart: pos(sel) }} />
            </div>
          ) : null}
          <div
            className="pc-ofp-steps"
            role="radiogroup"
            aria-label={vm.titles.offers || tr(vm, "Offres", "العروض")}
            onKeyDown={onKey}
          >
            {offers.map((o, i) => {
              const on = i === sel;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  key={i}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  className={"pc-ofp-step" + (on ? " on" : "")}
                  onClick={() => pick(i)}
                >
                  {o.badge ? (
                    <span className="pc-ofp-badge">{o.badge}</span>
                  ) : anyBadge ? (
                    <span className="pc-ofp-badge pc-ofp-ghost" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <span className="pc-ofp-lab">
                    {o.label}
                    {info[i].pct ? <em dir="ltr"> −{info[i].pct} %</em> : null}
                  </span>
                  <span className="pc-ofp-price">
                    {info[i].save ? <s>{money(vm, info[i].full)}</s> : null}
                    <b>{money(vm, o.price)}</b>
                  </span>
                  {info[i].save ? (
                    <span className="pc-ofp-save">
                      {vm.u.save} <bdi>{money(vm, info[i].save)}</bdi>
                    </span>
                  ) : o.qty > 1 ? (
                    <span className="pc-ofp-unit">
                      {money(vm, Math.round(o.price / o.qty))} / {tr(vm, "unité", "الوحدة")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {chosen ? (
          <div className="pc-ofp-foot">
            <button
              type="button"
              className="pc-ofp-cta"
              onClick={() => {
                setQty(chosen.qty);
                scrollToOrder();
              }}
            >
              <span>
                {tr(vm, "Commander", "اطلب")} · {chosen.label}
              </span>
              <Icon name="arrow" className="pc-ofp-arrow" />
            </button>
            <span className="pc-ofp-note">
              <Icon name="cash" />
              {vm.u.cod}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "offers-progressive",
  kind: "section",
  section: "offers",
  name: "Offres : remise progressive",
  render: (p) => <Render {...p} />,
};
export default piece;
