"use client";
// Pièce « Sélecteur de couleur et de taille » : nom du produit, pastilles de couleur (vm.variants),
// choix de la quantité (vm.offers) quand il y a plusieurs offres, prix de la sélection et bouton.
// Le choix est partagé avec le formulaire de commande (setVariant / setQty).
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { money, scrollToOrder, tr } from "../../../designs/kit";
import "./style.css";

function Render({ vm, qty, setQty, variant, setVariant }: SectionProps) {
  const variants = vm.variants;
  const cur = variants[variant] ?? variants[0];
  const offers = vm.offers.length > 1 ? vm.offers : [];
  const offer = vm.offers.find((o) => o.qty === qty);
  const price = offer?.price ?? vm.price * Math.max(1, qty);
  const old = !offer && vm.oldPrice && vm.oldPrice > vm.price ? vm.oldPrice * Math.max(1, qty) : 0;
  const showPrice = vm.show.price && vm.price > 0;
  const unit = vm.offers.find((o) => o.qty === 1)?.price || vm.price;
  const save = (o: { qty: number; price: number }) =>
    o.qty > 1 && unit > 0 ? Math.round((1 - o.price / (unit * o.qty)) * 100) : 0;
  const hasPickers = variants.length > 0 || offers.length > 0;

  return (
    <header className={"pc-h20" + (hasPickers ? "" : " bare")}>
      <div className="pc-h20-in">
        <a
          className="pc-h20-name"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {vm.name}
        </a>

        {hasPickers ? (
          <div className="pc-h20-pick">
            {variants.length ? (
              <div className="pc-h20-group" role="group" aria-label={tr(vm, "Couleur", "اللون")}>
                <span className="pc-h20-lab">
                  {tr(vm, "Couleur", "اللون")}
                  {cur ? (
                    <>
                      {" : "}
                      <b>{cur.name}</b>
                    </>
                  ) : null}
                </span>
                <div className="pc-h20-opts">
                  {variants.map((v, i) =>
                    v.color ? (
                      <button
                        type="button"
                        key={v.name + i}
                        aria-pressed={i === variant}
                        aria-label={v.name}
                        title={v.name}
                        className={"pc-h20-sw" + (i === variant ? " on" : "")}
                        style={{ ["--sw" as string]: v.color }}
                        onClick={() => setVariant(i)}
                      />
                    ) : (
                      <button
                        type="button"
                        key={v.name + i}
                        aria-pressed={i === variant}
                        className={"pc-h20-chip" + (i === variant ? " on" : "")}
                        onClick={() => setVariant(i)}
                      >
                        {v.name}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {offers.length ? (
              <div className="pc-h20-group" role="group" aria-label={tr(vm, "Quantité", "الكمية")}>
                <span className="pc-h20-lab">{tr(vm, "Quantité", "الكمية")}</span>
                <div className="pc-h20-opts">
                  {offers.map((o) => (
                    <button
                      type="button"
                      key={o.qty + o.label}
                      aria-pressed={o.qty === qty}
                      title={o.label}
                      className={"pc-h20-box" + (o.qty === qty ? " on" : "")}
                      onClick={() => setQty(o.qty)}
                    >
                      {o.qty}
                      {save(o) > 0 ? (
                        <i className="pc-h20-badge" dir="ltr">
                          -{save(o)}%
                        </i>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="pc-h20-end">
          {showPrice ? (
            <div className="pc-h20-price" aria-live="polite">
              {old ? <s>{money(vm, old)}</s> : null}
              <b>{money(vm, price)}</b>
            </div>
          ) : null}
          <button type="button" className="pc-h20-cta" onClick={scrollToOrder}>
            <span className="pc-h20-long">{vm.cta}</span>
            <span className="pc-h20-short">{tr(vm, "Commander", "اطلب")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h20-selecteur",
  kind: "header",
  name: "Sélecteur de couleur et de taille",
  render: (p) => <Render {...p} />,
};
export default piece;
