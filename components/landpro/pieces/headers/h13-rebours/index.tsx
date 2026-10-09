"use client";
// Pièce « Compte à rebours intégré » (maquette Main_H13) :
// logo à gauche · « L'offre −X % se termine dans » + tuiles HH MM SS au centre · bouton « Commander · prix » à droite.
import { useEffect, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, discount, money, tr } from "../../../designs/kit";
import "./style.css";

/** Même clé de session que Countdown (parts.tsx) : tous les comptes à rebours de la page restent synchronisés. */
function useSecondsLeft(minutes: number, id: string) {
  const [left, setLeft] = useState(minutes * 60_000);
  useEffect(() => {
    if (minutes <= 0) return;
    const key = `lpx-cd-${id}-${minutes}`;
    let end = 0;
    try {
      end = Number(sessionStorage.getItem(key) || 0);
    } catch {}
    if (!end || end < Date.now()) {
      end = Date.now() + minutes * 60_000;
      try {
        sessionStorage.setItem(key, String(end));
      } catch {}
    }
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [minutes, id]);
  return Math.floor(left / 1000);
}

const two = (n: number) => String(n).padStart(2, "0");

function Render({ vm }: SectionProps) {
  const on = vm.countdownMinutes > 0;
  const s = useSecondsLeft(vm.countdownMinutes, vm.t.id);
  const off = vm.show.price ? discount(vm) : 0;
  const showPrice = vm.show.price && vm.price > 0;
  const cells: [number, string][] = [
    [Math.floor(s / 3600), vm.u.hours],
    [Math.floor((s % 3600) / 60), vm.u.minutes],
    [s % 60, vm.u.seconds],
  ];
  const lead = off ? tr(vm, `L'offre −${off} % se termine dans`, `عرض −${off}% كيسالي من بعد`) : vm.u.countdown;
  const spoken = `${lead} ${cells.map(([v, l]) => `${v} ${l}`).join(" ")}`;

  return (
    <header className={"pc-h13" + (on ? "" : " no-timer")}>
      <div className="pc-h13-in">
        <a
          className="pc-h13-name"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {vm.name}
        </a>
        {on ? (
          <div className="pc-h13-offer" role="timer" aria-label={spoken}>
            <span className="pc-h13-lead" aria-hidden="true">
              <span className="pc-h13-dot" />
              {lead}
            </span>
            <span className="pc-h13-tiles" dir="ltr" aria-hidden="true">
              {cells.map(([v, l], i) => (
                <span className="pc-h13-tile" key={i}>
                  <b suppressHydrationWarning>{two(v)}</b>
                  <small>{l}</small>
                </span>
              ))}
            </span>
          </div>
        ) : null}
        <Buy vm={vm} className="pc-h13-cta">
          <span className="pc-h13-long">{vm.cta}</span>
          <span className="pc-h13-short">{tr(vm, "Commander", "اطلب")}</span>
          {showPrice ? (
            <>
              <i className="pc-h13-sep" aria-hidden="true" />
              <span className="pc-h13-price">{money(vm, vm.price)}</span>
            </>
          ) : null}
        </Buy>
      </div>
    </header>
  );
}

const piece: Piece = {
  id: "h13-rebours",
  kind: "header",
  name: "Compte à rebours intégré",
  render: (p) => <Render {...p} />,
};
export default piece;
