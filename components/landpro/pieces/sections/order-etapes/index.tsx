"use client";
// Pièce « Commande : en étapes » : le VRAI formulaire COD découpé en étapes
// (choix → coordonnées → confirmation). Mêmes champs que OrderForm (name, phone,
// city, address), même gestion qty/variante/offres et même onSubmit : tous les
// champs restent dans le même <form> (les étapes inactives sont seulement masquées).
// Chaque étape est validée avant de passer à la suivante.
import { useId, useRef, useState, type FormEvent } from "react";
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

type StepKey = "choice" | "details" | "confirm";
type Info = { name: string; phone: string; city: string; address: string };

function Render({ vm, qty, setQty, variant, setVariant, preview, onSubmit }: SectionProps) {
  const u = vm.u;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const listId = "pc-ore-cities-" + uid;
  const waOnly = vm.orderMode === "whatsapp";
  const [picked, setPicked] = useState(-1);
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<Info>({ name: "", phone: "", city: "", address: "" });
  const [err, setErr] = useState("");
  const panels = useRef<Record<string, HTMLDivElement | null>>({});
  const headRef = useRef<HTMLHeadingElement | null>(null);

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
  const unit = offers.find((o) => o.qty === 1)?.price || vm.price;

  const hasChoice = offers.length > 1 || vm.variants.length > 0;
  const steps: StepKey[] = [
    ...(hasChoice ? (["choice"] as const) : []),
    ...(waOnly ? [] : (["details"] as const)),
    "confirm",
  ];
  const cur = steps[Math.min(step, steps.length - 1)];
  const last = step >= steps.length - 1;

  const labels: Record<StepKey, string> = {
    choice: tr(vm, "Votre choix", "اختيارك"),
    details: tr(vm, "Coordonnées", "معلوماتك"),
    confirm: tr(vm, "Confirmation", "التأكيد"),
  };
  const heads: Record<StepKey, string> = {
    choice: tr(vm, "Choisissez votre offre", "اختار العرض ديالك"),
    details: tr(vm, "Où livrer votre commande ?", "فين نوصلو ليك الطلبية؟"),
    confirm: tr(vm, "Vérifiez et confirmez", "راجع وأكد الطلب"),
  };

  /** Valide les champs de l'étape courante ; renvoie false (et signale) si invalide. */
  const validate = () => {
    const box = panels.current[cur];
    if (!box) return true;
    const fields = Array.from(box.querySelectorAll("input")) as HTMLInputElement[];
    for (const f of fields) {
      f.setCustomValidity("");
      if (!preview && f.name === "phone" && f.value.replace(/\D/g, "").length < 9 && f.value.trim()) {
        f.setCustomValidity(tr(vm, "Numéro de téléphone incomplet", "رقم الهاتف ناقص"));
      }
      if (!f.checkValidity()) {
        f.reportValidity();
        f.focus();
        setErr(u.form.error);
        return false;
      }
    }
    setErr("");
    return true;
  };

  const go = (to: number) => {
    setStep(Math.max(0, Math.min(steps.length - 1, to)));
    requestAnimationFrame(() => headRef.current?.focus({ preventScroll: true }));
  };

  const next = () => {
    if (!validate()) return;
    if (cur === "details") {
      const box = panels.current.details;
      const v = (n: string) => (box?.querySelector(`[name="${n}"]`) as HTMLInputElement | null)?.value.trim() || "";
      setInfo({ name: v("name"), phone: v("phone"), city: v("city"), address: v("address") });
    }
    go(step + 1);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    if (!last) {
      e.preventDefault();
      next();
      return;
    }
    if (preview || waOnly) {
      e.preventDefault();
      return;
    }
    onSubmit?.(e, qty);
  };

  const pickOffer = (i: number) => {
    setPicked(i);
    setQty(offers[i].qty);
  };

  return (
    <section id="order" className="pc-ore">
      <div className="pc-ore-in">
        {vm.orderTitle ? <h2 className="pc-ore-title">{vm.orderTitle}</h2> : null}
        <form
          className="pc-ore-card"
          onSubmit={submit}
          onKeyDown={(e) => {
            // Entrée dans un champ : passe à l'étape suivante (pas de bouton submit avant la fin)
            const t = e.target as HTMLElement;
            if (e.key === "Enter" && !last && t.tagName === "INPUT" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              next();
            }
          }}
        >
          {/* ─── Fil des étapes ─── */}
          <ol className="pc-ore-rail">
            {steps.map((k, i) => {
              const state = i < step ? "done" : i === step ? "now" : "todo";
              return (
                <li key={k} className={"pc-ore-st " + state}>
                  <button
                    type="button"
                    className="pc-ore-stb"
                    disabled={i >= step}
                    aria-current={i === step ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="pc-ore-num">{i < step ? <Icon name="check" /> : i + 1}</span>
                    <span className="pc-ore-stl">{labels[k]}</span>
                  </button>
                  {i < steps.length - 1 ? <span className="pc-ore-line" aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ol>

          <h3 className="pc-ore-head" ref={headRef} tabIndex={-1}>
            {heads[cur]}
          </h3>

          {/* ─── Étape : choix (offre + variante) ─── */}
          {hasChoice ? (
            <div
              className="pc-ore-panel"
              hidden={cur !== "choice"}
              ref={(el) => {
                panels.current.choice = el;
              }}
            >
              {offers.length > 1 ? (
                <div className="pc-ore-offers" role="radiogroup" aria-label={u.form.qty}>
                  {offers.map((o, i) => {
                    const on = i === selIdx;
                    const save = unit * o.qty > o.price ? unit * o.qty - o.price : 0;
                    return (
                      <label key={i} className={"pc-ore-offer" + (on ? " on" : "")}>
                        <input type="radio" name="offer" checked={on} onChange={() => pickOffer(i)} />
                        <span className="pc-ore-dot" aria-hidden="true" />
                        <span className="pc-ore-ol">
                          <b>{o.label}</b>
                          {o.badge ? <span className="pc-ore-badge">{o.badge}</span> : null}
                          {save ? (
                            <small>
                              {u.save} {money(vm, save)}
                            </small>
                          ) : null}
                        </span>
                        <span className="pc-ore-op">{money(vm, o.price)}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
              {vm.variants.length > 0 ? (
                <div className="pc-ore-vars">
                  <span className="pc-ore-vlab">
                    {u.variants}
                    {variantName ? <b> · {variantName}</b> : null}
                  </span>
                  <div className="pc-ore-vlist" role="radiogroup" aria-label={u.variants}>
                    {vm.variants.map((v, i) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={i === variant}
                        key={v.name + i}
                        className={"pc-ore-var" + (i === variant ? " on" : "")}
                        onClick={() => setVariant(i)}
                      >
                        {v.color ? <span className="pc-ore-sw" style={{ background: v.color }} /> : null}
                        {v.name}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="variant" value={variant} />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ─── Étape : coordonnées (mêmes champs que OrderForm) ─── */}
          {!waOnly ? (
            <div
              className="pc-ore-panel"
              hidden={cur !== "details"}
              ref={(el) => {
                panels.current.details = el;
              }}
            >
              <div className="pc-ore-fields">
                <label className="pc-ore-field">
                  <span>{u.form.name}</span>
                  <input
                    name="name"
                    required={!preview}
                    minLength={2}
                    autoComplete="name"
                    placeholder={tr(vm, "Votre nom", "سميتك")}
                  />
                </label>
                <label className="pc-ore-field">
                  <span>{u.form.phone}</span>
                  <input
                    name="phone"
                    required={!preview}
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    placeholder="06 XX XX XX XX"
                    autoComplete="tel"
                    onInput={(e) => e.currentTarget.setCustomValidity("")}
                  />
                </label>
                <label className="pc-ore-field">
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
                  <label className="pc-ore-field">
                    <span>{u.form.address}</span>
                    <input
                      name="address"
                      autoComplete="street-address"
                      placeholder={tr(vm, "Rue, quartier", "الزنقة، الحي")}
                    />
                  </label>
                ) : null}
              </div>
              <datalist id={listId}>
                {CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          ) : null}

          {/* ─── Étape : confirmation ─── */}
          <div
            className="pc-ore-panel"
            hidden={cur !== "confirm"}
            ref={(el) => {
              panels.current.confirm = el;
            }}
          >
            <div className="pc-ore-recap">
              <div className="pc-ore-prod">
                <span className="pc-ore-thumb">
                  <Img vm={vm} i={0} />
                </span>
                <span className="pc-ore-pn">
                  <b>{vm.name}</b>
                  <small>{[sel && offers.length > 1 ? sel.label : "", variantName].filter(Boolean).join(" · ")}</small>
                </span>
                <span className="pc-ore-pp">{money(vm, sel?.price ?? vm.price * qty)}</span>
              </div>
              {!waOnly && (info.name || info.phone || info.city) ? (
                <dl className="pc-ore-who">
                  {info.name ? (
                    <div>
                      <dt>{u.form.name}</dt>
                      <dd>{info.name}</dd>
                    </div>
                  ) : null}
                  {info.phone ? (
                    <div>
                      <dt>{u.form.phone}</dt>
                      <dd dir="ltr">{info.phone}</dd>
                    </div>
                  ) : null}
                  {info.city || info.address ? (
                    <div>
                      <dt>{u.form.city}</dt>
                      <dd>{[info.city, info.address].filter(Boolean).join(" · ")}</dd>
                    </div>
                  ) : null}
                  {steps.includes("details") ? (
                    <button type="button" className="pc-ore-edit" onClick={() => go(steps.indexOf("details"))}>
                      <Icon name="pen" />
                      {tr(vm, "Modifier", "بدّل")}
                    </button>
                  ) : null}
                </dl>
              ) : null}
              {vm.shipping > 0 ? (
                <div className="pc-ore-line2">
                  <span>{tr(vm, "Livraison", "التوصيل")}</span>
                  <span>{money(vm, vm.shipping)}</span>
                </div>
              ) : null}
              <div className="pc-ore-total">
                <span>{u.form.total}</span>
                <b>{money(vm, total)}</b>
              </div>
            </div>
          </div>

          {err ? (
            <p className="pc-ore-err" role="alert">
              {err}
            </p>
          ) : null}

          {/* ─── Navigation ─── */}
          <div className="pc-ore-nav">
            {step > 0 ? (
              <button type="button" className="pc-ore-back" onClick={() => go(step - 1)}>
                <Icon name="back" className="pc-ore-ar" />
                {tr(vm, "Retour", "رجوع")}
              </button>
            ) : (
              <span className="pc-ore-sum">
                {u.form.total} <b>{money(vm, total)}</b>
              </span>
            )}
            {!last ? (
              <button type="button" className="pc-ore-next" onClick={next}>
                {tr(vm, "Continuer", "متابعة")}
                <Icon name="arrow" className="pc-ore-ar" />
              </button>
            ) : !waOnly ? (
              <button className="pc-ore-next pc-ore-go" type={preview ? "button" : "submit"}>
                {vm.cta || u.form.submit}
                <Icon name="check" />
              </button>
            ) : null}
          </div>
          {last && vm.orderMode !== "form" ? (
            <a
              className="pc-ore-wa"
              href={preview ? undefined : waHref(vm, extra)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" />
              {u.orderWhatsapp}
            </a>
          ) : null}
          <p className="pc-ore-note">
            <Icon name="lock" />
            {vm.delivery}
          </p>
        </form>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "order-etapes",
  kind: "section",
  section: "order",
  name: "Commande : en étapes",
  render: (p) => <Render {...p} />,
};
export default piece;
