"use client";
// Pièce « Prix barré géant + stock » : badge de remise calculé, prix géant, prix barré (si vm.oldPrice),
// jauge de stock UNIQUEMENT avec une donnée de stock réelle — sinon ligne de réassurance (vm.delivery).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import type { VM } from "../../../model";
import { Buy, discount, Headline, Icon, Img, money, sid, tr } from "../../../designs/kit";
import "./style.css";

/** Stock réel de la page s'il existe (jamais inventé). */
function realStock(vm: VM): number {
  const v = Number((vm as VM & { stock?: unknown }).stock);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/** Montant séparé en chiffre + devise (« 249 » / « DH »). */
function splitMoney(vm: VM, v: number) {
  const s = money(vm, v);
  const m = s.match(/^([^\d]*)([\d\s.,  ]+)(.*)$/);
  return m ? { pre: m[1].trim(), num: m[2].trim(), post: m[3].trim() } : { pre: "", num: s, post: "" };
}

function Render({ vm }: SectionProps) {
  const d = discount(vm);
  const stock = realStock(vm);
  const showPrice = vm.show.price && vm.price > 0;
  const p = splitMoney(vm, vm.price);
  const saved = vm.oldPrice ? vm.oldPrice - vm.price : 0;
  const reassure = vm.delivery
    .split(/\s*[·|•]\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);
  const icons = ["cash", "truck", "shield"];
  return (
    <section id={sid("hero")} className="pc-hps">
      <div className="pc-hps-in">
        <div className="pc-hps-copy">
          {d > 0 ? (
            <span className="pc-hps-badge">
              −{d} % {tr(vm, "de réduction", "تخفيض")}
            </span>
          ) : vm.show.badge && vm.eyebrow ? (
            <span className="pc-hps-badge soft">{vm.eyebrow}</span>
          ) : null}
          <Headline vm={vm} className={"pc-hps-title" + (showPrice ? "" : " big")} />
          {showPrice ? (
            <div className="pc-hps-pricebox">
              <div className="pc-hps-price" aria-label={money(vm, vm.price)}>
                {p.pre ? <span className="cur">{p.pre}</span> : null}
                <span className="num">{p.num}</span>
                {p.post ? <span className="cur">{p.post}</span> : null}
              </div>
              {vm.oldPrice ? (
                <div className="pc-hps-old">
                  <s>{money(vm, vm.oldPrice)}</s>
                  {saved > 0 ? (
                    <span className="pc-hps-save">
                      {vm.u.save} {money(vm, saved)}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {!showPrice && vm.show.subtitle && vm.subheadline ? <p className="pc-hps-sub">{vm.subheadline}</p> : null}
          {stock ? (
            <div className="pc-hps-stock">
              <div className="pc-hps-bar" aria-hidden="true">
                <span style={{ width: `${Math.max(6, Math.min(100, stock * 2))}%` }} />
              </div>
              <p>
                <span className="pc-hps-dot" aria-hidden="true" />
                {vm.u.onlyLeft(stock)}
              </p>
            </div>
          ) : reassure.length ? (
            <ul className="pc-hps-reassure">
              {reassure.map((r, i) => (
                <li key={r + i}>
                  <Icon name={icons[i % icons.length]} />
                  {r}
                </li>
              ))}
            </ul>
          ) : null}
          {vm.show.cta ? (
            <Buy vm={vm} className="pc-hps-cta" arrow>
              {vm.cta}
            </Buy>
          ) : null}
        </div>
        <div className="pc-hps-visual">
          <div className="pc-hps-disc" aria-hidden="true" />
          <Img vm={vm} i={0} className="pc-hps-img" />
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-prix-stock",
  kind: "hero",
  name: "Prix barré géant + stock",
  render: (p) => <Render {...p} />,
};
export default piece;
