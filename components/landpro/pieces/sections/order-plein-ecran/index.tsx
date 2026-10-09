"use client";
// Pièce « Commande : plein écran » : un écran entier, contrasté (couleurs du thème
// inversées), centré sur le VRAI formulaire COD. Mêmes champs que OrderForm
// (name, phone, city, address), même gestion qty/variante/offres, même onSubmit.
import { useId, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Icon, Img, money, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import "./style.css";

const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Témara",
  "Safi",
  "Mohammedia",
  "El Jadida",
  "Béni Mellal",
  "Nador",
  "Khouribga",
  "Settat",
  "Laâyoune",
];

function Render({ vm, qty, setQty, variant, setVariant, preview, onSubmit }: SectionProps) {
  const u = vm.u;
  const listId = "pc-orp-cities-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const waOnly = vm.orderMode === "whatsapp";
  const [picked, setPicked] = useState(-1);
  const offers = vm.offers;
  const first = Math.max(
    0,
    offers.findIndex((o) => o.qty === qty),
  );
  const selIdx = picked >= 0 && offers[picked]?.qty === qty ? picked : first;
  const sel = offers[selIdx];
  const total = (sel?.price ?? vm.price * qty) + vm.shipping;
  const variantName = vm.variants[variant]?.name;
  const extra = `– ${sel?.label || qty}${variantName ? ` – ${variantName}` : ""} – ${money(vm, total)}`;
  const hasImg = vm.images.length > 0;

  return (
    <section id="order" className="pc-orp">
      <div className="pc-orp-glow" aria-hidden="true" />
      <div className="pc-orp-in">
        {vm.name ? (
          <div className="pc-orp-chip">
            {hasImg ? (
              <span className="pc-orp-thumb">
                <Img vm={vm} i={0} />
              </span>
            ) : null}
            <span className="pc-orp-name">{vm.name}</span>
          </div>
        ) : null}
        {vm.orderTitle ? <h2 className="pc-orp-title">{vm.orderTitle}</h2> : null}

        <form
          className="pc-orp-form"
          onSubmit={(e) => {
            if (preview || waOnly) {
              e.preventDefault();
              return;
            }
            onSubmit?.(e, qty);
          }}
        >
          {offers.length > 1 ? (
            <div className="pc-orp-group">
              <span className="pc-orp-lab">{u.form.qty}</span>
              <div className="pc-orp-offers" role="radiogroup" aria-label={u.form.qty}>
                {offers.map((o, i) => {
                  const on = i === selIdx;
                  return (
                    <label key={i} className={"pc-orp-offer" + (on ? " on" : "")}>
                      <input
                        type="radio"
                        name="offer"
                        checked={on}
                        onChange={() => {
                          setPicked(i);
                          setQty(o.qty);
                        }}
                      />
                      {o.badge ? <span className="pc-orp-badge">{o.badge}</span> : null}
                      <b>{o.label}</b>
                      <span>{money(vm, o.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {vm.variants.length > 0 ? (
            <div className="pc-orp-group">
              <span className="pc-orp-lab">
                {u.variants}
                {variantName ? <b> · {variantName}</b> : null}
              </span>
              <div className="pc-orp-vars" role="radiogroup" aria-label={u.variants}>
                {vm.variants.map((v, i) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={i === variant}
                    key={v.name + i}
                    className={"pc-orp-var" + (i === variant ? " on" : "")}
                    onClick={() => setVariant(i)}
                  >
                    {v.color ? <span className="pc-orp-sw" style={{ background: v.color }} /> : null}
                    {v.name}
                  </button>
                ))}
              </div>
              <input type="hidden" name="variant" value={variant} />
            </div>
          ) : null}

          {!waOnly ? (
            <div className="pc-orp-fields">
              <label className="pc-orp-field">
                <span>{u.form.name}</span>
                <input
                  name="name"
                  required={!preview}
                  minLength={2}
                  autoComplete="name"
                  placeholder={tr(vm, "Votre nom", "سميتك")}
                />
              </label>
              <label className="pc-orp-field">
                <span>{u.form.phone}</span>
                <input
                  name="phone"
                  required={!preview}
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder="06 XX XX XX XX"
                  autoComplete="tel"
                />
              </label>
              <label className="pc-orp-field">
                <span>{u.form.city}</span>
                <input
                  name="city"
                  required={!preview}
                  list={listId}
                  autoComplete="address-level2"
                  placeholder="Casablanca"
                />
              </label>
              {vm.show.address ? (
                <label className="pc-orp-field">
                  <span>{u.form.address}</span>
                  <input
                    name="address"
                    autoComplete="street-address"
                    placeholder={tr(vm, "Rue, quartier", "الزنقة، الحي")}
                  />
                </label>
              ) : null}
              <datalist id={listId}>
                {CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          ) : null}

          {vm.shipping > 0 ? (
            <div className="pc-orp-ship">
              <span>{tr(vm, "Livraison", "التوصيل")}</span>
              <span>{money(vm, vm.shipping)}</span>
            </div>
          ) : null}

          {!waOnly ? (
            <button className="pc-orp-go" type={preview ? "button" : "submit"}>
              <span>{vm.cta || u.form.submit}</span>
              <span className="pc-orp-sep" aria-hidden="true" />
              <b>{money(vm, total)}</b>
            </button>
          ) : null}
          {vm.orderMode !== "form" ? (
            <a
              className="pc-orp-wa"
              href={preview ? undefined : waHref(vm, extra)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" />
              {u.orderWhatsapp}
              {waOnly ? <b> · {money(vm, total)}</b> : null}
            </a>
          ) : null}
          <p className="pc-orp-note">
            <Icon name="lock" />
            {vm.delivery}
          </p>
        </form>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "order-plein-ecran",
  kind: "section",
  section: "order",
  name: "Commande : plein écran",
  render: (p) => <Render {...p} />,
};
export default piece;
