"use client";
// Pièce « Titre en plusieurs couleurs » : titre géant découpé en lignes de couleurs différentes
// (dérivées du thème), photo du produit inclinée qui empiète sur le titre, bouton « Commander · prix ».
import type { CSSProperties } from "react";
import type { Piece } from "../../types";
import type { SectionProps } from "../../../Sections";
import { Img, money, scrollToOrder, sid } from "../../../designs/kit";
import "./style.css";

/** Découpe le titre en 2 à 4 lignes : d'abord à la ponctuation, sinon en groupes de mots équilibrés. */
function splitLines(headline: string): string[] {
  const t = headline.trim();
  const byPunct = t
    .split(/(?<=[.,!?;:،؛؟])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (byPunct.length >= 2 && byPunct.length <= 4 && byPunct.every((x) => x.length <= 16)) return byPunct;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  const n = Math.min(words.length, t.length > 34 ? 4 : t.length > 12 ? 3 : 2);
  // répartition gloutonne par longueur de caractères
  const target = t.length / n;
  const out: string[] = [];
  let line = "";
  words.forEach((w, i) => {
    const left = words.length - i;
    const need = n - out.length - 1;
    if (line && ((line + " " + w).length > target * 1.15 || left <= need) && out.length < n - 1) {
      out.push(line);
      line = w;
    } else line = line ? line + " " + w : w;
  });
  if (line) out.push(line);
  return out;
}

/** Distance approximative entre deux couleurs hexadécimales (0–441). */
function dist(a?: string, b?: string) {
  const p = (h?: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec((h || "").trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const x = p(a);
  const y = p(b);
  if (!x || !y) return 999;
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function Render({ vm }: SectionProps) {
  const rows = splitLines(vm.headline);
  const longest = Math.max(8, ...rows.map((r) => r.length));
  const primary = vm.themeOverride.primary || vm.t.theme.primary;
  const accent = vm.themeOverride.accent || vm.t.theme.accent;
  // 3e couleur : l'accent du thème s'il se distingue assez, sinon la couleur principale décalée sur le cercle chromatique
  const third =
    dist(primary, accent) > 90 ? "var(--accent)" : "oklch(from var(--primary) l max(c, 0.12) calc(h + 150))";
  const showPrice = vm.show.price && vm.price > 0;
  const style = { ["--mc-len" as string]: longest, ["--mc-3" as string]: third } as CSSProperties;

  return (
    <section className="pc-mc" id={sid("hero")} style={style}>
      <div className="pc-mc-in">
        <h1 className="pc-mc-title">
          {rows.map((r, k) => (
            <span key={k} className={"pc-mc-line is-" + (k % 3)}>
              {r}
            </span>
          ))}
        </h1>
        <div className="pc-mc-media">
          <Img vm={vm} i={0} className="pc-mc-img" />
        </div>
        <div className="pc-mc-actions">
          {vm.show.cta ? (
            <button type="button" className="pc-mc-cta" onClick={scrollToOrder}>
              <span>{vm.cta}</span>
              {showPrice ? (
                <>
                  <i aria-hidden="true">·</i>
                  <b>{money(vm, vm.price)}</b>
                </>
              ) : null}
            </button>
          ) : showPrice ? (
            <b className="pc-mc-price">{money(vm, vm.price)}</b>
          ) : null}
          {vm.delivery ? <span className="pc-mc-cod">{vm.delivery}</span> : null}
        </div>
      </div>
    </section>
  );
}

const piece: Piece = {
  id: "hero-multicolore",
  kind: "hero",
  name: "Titre géant multicolore",
  render: (p) => <Render {...p} />,
};
export default piece;
