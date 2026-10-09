"use client";
import { useEffect, useState } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Buy, Go, Img, money, navOf, totalFor } from "../../../designs/kit";
import "./style.css";

function Render({ vm, qty }: SectionProps) {
  // la barre se retire quand le formulaire de commande (#order) est à l'écran
  const [orderVisible, setOrderVisible] = useState(false);
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const watch = () => {
      const el = document.getElementById("order");
      if (!el) {
        if (tries++ < 10) timer = setTimeout(watch, 400);
        return;
      }
      io = new IntersectionObserver((entries) => setOrderVisible(entries.some((e) => e.isIntersecting)), {
        rootMargin: "0px 0px -80px 0px",
      });
      io.observe(el);
    };
    watch();
    return () => {
      io?.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const q = Math.max(1, qty || 1);
  const price = vm.price > 0 ? totalFor(vm, q) - vm.shipping : 0;
  const links = navOf(vm, 4);
  const on = !orderVisible;

  return (
    <footer className="pc-f19">
      <div className="pc-f19-in">
        <div className="pc-f19-brand">
          <strong className="pc-f19-name">{vm.name}</strong>
          {vm.delivery ? <p className="pc-f19-deliv">{vm.delivery}</p> : null}
        </div>
        {links.length ? (
          <nav className="pc-f19-links">
            {links.map((l) => (
              <Go key={l.key} to={l.key}>
                {l.label}
              </Go>
            ))}
          </nav>
        ) : null}
        <p className="pc-f19-legal">
          © {new Date().getFullYear()} {vm.name}
        </p>
      </div>

      <div className={"pc-f19-bar" + (on ? " is-on" : "")} aria-hidden={!on} inert={!on || undefined}>
        <div className="pc-f19-bar-in">
          {vm.images.length ? (
            <span className="pc-f19-thumb">
              <Img vm={vm} i={0} alt="" />
            </span>
          ) : null}
          <span className="pc-f19-info">
            <b>{vm.name}</b>
            <span>
              {price ? (
                <>
                  <em>{money(vm, price)}</em>
                  {q > 1 ? <i dir="ltr"> ×{q}</i> : null}
                  {" · "}
                </>
              ) : null}
              {vm.u.cod}
            </span>
          </span>
          <Buy vm={vm} className="pc-f19-btn">
            {vm.cta}
          </Buy>
        </div>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f19-collant", kind: "footer", name: "Barre collante", render: (p) => <Render {...p} /> };
export default piece;
