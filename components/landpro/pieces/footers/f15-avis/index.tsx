"use client";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Go, Icon, navOf, Stars } from "../../../designs/kit";
import "./style.css";

/** L'avis mis en vedette : la meilleure note, puis un texte de longueur lisible en grand. */
function pick(reviews: SectionProps["vm"]["reviews"]) {
  const len = (t: string) => Math.abs(Math.min(t.length, 400) - 150);
  return [...reviews].filter((r) => r.text).sort((a, b) => b.rating - a.rating || len(a.text) - len(b.text))[0];
}

function Render({ vm }: SectionProps) {
  const best = pick(vm.reviews);
  const links = navOf(vm, 4);
  const g = vm.guarantee;
  return (
    <footer className="pc-f15">
      <div className="pc-f15-in">
        <div className="pc-f15-main">
          {best ? (
            <figure className="pc-f15-quote">
              <span className="pc-f15-mark" aria-hidden="true">
                “
              </span>
              <blockquote>{best.text}</blockquote>
              <figcaption>
                <span className="pc-f15-av" aria-hidden="true">
                  {best.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="pc-f15-who">
                  {best.name}
                  {best.city ? `, ${best.city}` : ""}
                </span>
                <Stars n={best.rating} className="pc-f15-stars" />
              </figcaption>
            </figure>
          ) : g.title || g.text ? (
            <div className="pc-f15-quote is-guarantee">
              <span className="pc-f15-seal" aria-hidden="true">
                <Icon name="shield" size={30} />
              </span>
              {g.title ? <p className="pc-f15-gt">{g.title}</p> : null}
              {g.text ? <p className="pc-f15-gx">{g.text}</p> : null}
            </div>
          ) : null}
        </div>
        <aside className="pc-f15-side">
          <strong className="pc-f15-name">{vm.name}</strong>
          {links.length ? (
            <nav className="pc-f15-links">
              {links.map((l) => (
                <Go key={l.key} to={l.key}>
                  {l.label}
                </Go>
              ))}
            </nav>
          ) : null}
          <p className="pc-f15-legal">
            © {new Date().getFullYear()} {vm.name}
          </p>
        </aside>
      </div>
    </footer>
  );
}

const piece: Piece = { id: "f15-avis", kind: "footer", name: "Avis vedette", render: (p) => <Render {...p} /> };
export default piece;
