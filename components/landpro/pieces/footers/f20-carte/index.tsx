"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, Icon, Img, navOf, tr } from "../../../designs/kit";
import { waHref } from "../../../parts";
import "./style.css";

/** Accroche courte : titre d'histoire ou sous-titre, s'ils tiennent sur une carte. */
function tagline(vm: SectionProps["vm"]) {
  const fits = (s: string, max: number) => !!s && s !== vm.name && s.length <= max;
  if (fits(vm.story.title, 70)) return vm.story.title;
  if (fits(vm.subheadline, 90)) return vm.subheadline;
  return "";
}

function Render({ vm, preview }: SectionProps) {
  const tag = tagline(vm);
  const links = navOf(vm, 3);
  const wa = vm.whatsapp ? "+" + vm.whatsapp.replace(/^\+/, "") : "";
  return (
    <footer className="pc-f20">
      <div className="pc-f20-in">
        <div className="pc-f20-card">
          <div className="pc-f20-top">
            <div className="pc-f20-id">
              <strong className={"pc-f20-name" + (vm.name.length > 18 ? " is-long" : "")}>{vm.name}</strong>
              {tag ? <p className="pc-f20-tag">{tag}</p> : null}
            </div>
            <span className="pc-f20-seal" aria-hidden="true">
              {vm.images.length ? <Img vm={vm} i={0} alt="" /> : <span>{vm.name.trim().charAt(0)}</span>}
            </span>
          </div>
          <div className="pc-f20-bottom">
            <div className="pc-f20-contact">
              {wa ? (
                <a
                  className="pc-f20-wa"
                  href={preview ? undefined : waHref(vm)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" />
                  <span>
                    {tr(vm, "WhatsApp :", "واتساب :")} <span dir="ltr">{wa}</span>
                  </span>
                </a>
              ) : null}
              {vm.delivery ? <span className="pc-f20-del">{vm.delivery}</span> : null}
            </div>
            {links.length ? (
              <nav className="pc-f20-links">
                {links.map((l) => (
                  <Go key={l.key} to={l.key}>
                    {l.label}
                  </Go>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
        <p className="pc-f20-legal">
          © {new Date().getFullYear()} {vm.name}
        </p>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f20-carte", kind: "footer", name: "Carte de visite", render: (p) => <Render {...p} /> };
export default piece;
