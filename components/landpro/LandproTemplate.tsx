"use client";
// Rendu complet d'une landing page LandPro.
// L'ordre des sections vient de content.section_order (éditable), les sections
// de content.hidden_sections sont masquées en ligne et grisées dans l'éditeur.
import React, { useEffect, useMemo, useState } from "react";
import type { LandingV4Data } from "./types";
import { buildVM } from "./model";
import { fonts, googleFontsHref, themeVars } from "./theme";
import { formatPrice } from "./i18n";
import { SECTION_LABELS } from "./registry";
import { cx, scrollToOrder } from "./parts";
import { Hero } from "./Hero";
import { EMPTY_HINT, isEmpty, renderSection } from "./Sections";
import "./landpro.css";

export interface LandproTemplateProps {
  data: LandingV4Data;
  /** aperçu : le formulaire n'envoie rien */
  preview?: boolean;
  /** démo : complète les champs vides avec le produit de démonstration (galerie, aperçu avant création) */
  demo?: boolean;
  /** éditeur : sections cliquables, sections masquées/vides visibles */
  builderMode?: boolean;
  onSectionSelect?: (id: string) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>, qty: number) => void;
}

/** Couleur de texte lisible sur un fond #rrggbb (sombre sur fond clair, claire sur fond sombre). */
function readableOn(bg: string): string | undefined {
  const m = /^#?([0-9a-f]{6})$/i.exec(bg.trim());
  if (!m) return undefined;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111318" : "#f3f4f6";
}

export default function LandproTemplate({
  data,
  preview = false,
  demo = false,
  builderMode = false,
  onSectionSelect,
  onSubmit,
}: LandproTemplateProps) {
  const vm = useMemo(() => buildVM(data, { demo }), [data, demo]);
  const [qty, setQty] = useState(vm.defaultQty);
  const [variant, setVariant] = useState(0);
  useEffect(() => setQty(vm.defaultQty), [vm.defaultQty]);
  // Polices des templates : ajoutées une seule fois dans <head>, sans bloquer l'affichage
  useEffect(() => {
    if (document.getElementById("lpx-fonts")) return;
    const l = document.createElement("link");
    l.id = "lpx-fonts";
    l.rel = "stylesheet";
    l.href = googleFontsHref;
    document.head.appendChild(l);
  }, []);

  const theme = {
    ...vm.t.theme,
    ...(vm.themeOverride.primary ? { primary: vm.themeOverride.primary } : {}),
    ...(vm.themeOverride.accent ? { accent: vm.themeOverride.accent } : {}),
    ...(vm.rtl ? { font: "arabic" as const, heading: "arabic" as const } : {}),
  };
  const style = themeVars(theme);
  const sp = { vm, qty, setQty, variant, setVariant, preview: preview || builderMode, onSubmit };

  const keys = vm.order;
  const announcementOn = keys.includes("announcement") && (!vm.hidden.has("announcement") || builderMode);

  // Styles de section enregistrés par l'éditeur (fond, couleur du texte, alignement, marges)
  const styleOf = (key: string): React.CSSProperties | undefined => {
    const st = vm.sectionStyles[key];
    if (!st || typeof st !== "object") return undefined;
    const pad = st.padding === "" || st.padding == null ? NaN : Number(st.padding);
    const out: Record<string, string | undefined> = {
      backgroundColor: st.background || undefined,
      // Fond choisi sans couleur de texte : texte sombre ou clair selon le fond, pour rester lisible
      color: st.color || (st.background ? readableOn(String(st.background)) : undefined),
      textAlign: st.align || undefined,
      // marge appliquée à la section intérieure (voir landpro.css)
      ["--lpx-sec-pad" as string]: Number.isFinite(pad) ? `${pad}px` : undefined,
    };
    return Object.values(out).some((v) => v !== undefined) ? (out as React.CSSProperties) : undefined;
  };

  const block = (key: string, node: React.ReactNode) => {
    const hidden = vm.hidden.has(key);
    const style = styleOf(key);
    if (!builderMode) {
      if (hidden) return null;
      return style ? (
        <div key={key} className={cx("styled")} style={style}>
          {node}
        </div>
      ) : (
        <React.Fragment key={key}>{node}</React.Fragment>
      );
    }
    const label = key.startsWith("custom-")
      ? "Bloc personnalisé"
      : SECTION_LABELS[key as keyof typeof SECTION_LABELS] || key;
    return (
      <div
        key={key}
        data-lpx-section={key}
        className={cx("block", hidden && "is-hidden", style && "styled")}
        style={style}
        onClick={() => onSectionSelect?.(key)}
      >
        <span className={cx("block-tag")}>
          {label}
          {hidden ? " · masquée" : ""}
        </span>
        {node}
      </div>
    );
  };

  const sectionNode = (key: string) => {
    if (key === "hero") return <Hero vm={vm} />;
    if (isEmpty(key, vm)) {
      return builderMode ? (
        <section className={cx("section")}>
          <div className={cx("container")}>
            <div className={cx("empty")}>
              <b>{SECTION_LABELS[key as keyof typeof SECTION_LABELS] || key}</b>
              <br />
              {EMPTY_HINT[key] || "Section vide."}
            </div>
          </div>
        </section>
      ) : null;
    }
    return renderSection(key, sp);
  };

  return (
    <div className={cx("root")}>
      <div
        className={["lpx", builderMode ? "lpx-builder" : "", theme.glow ? "lpx-glow" : "", `lpx-tpl-${vm.t.id}`]
          .filter(Boolean)
          .join(" ")}
        style={{ ...style, ["--font" as string]: fonts[theme.font], ["--heading" as string]: fonts[theme.heading] }}
        dir={vm.rtl ? "rtl" : "ltr"}
        lang={vm.lang}
        data-landing-template={vm.t.id}
      >
        {announcementOn && block("announcement", renderSection("announcement", sp))}
        <header className={cx("lp-header")}>
          <div className={cx("container")}>
            <span className={cx("header-name")}>{vm.name}</span>
            <div className={cx("header-actions")}>
              <button type="button" className={cx("btn")} onClick={scrollToOrder}>
                {vm.cta}
              </button>
            </div>
          </div>
        </header>

        {keys
          .filter((k) => k !== "announcement")
          .map((key) => {
            const node = sectionNode(key);
            if (node === null && !builderMode) return null;
            return block(key, node);
          })}

        <footer className={cx("lp-footer")}>
          <div className={cx("container")}>
            <p>
              © {new Date().getFullYear()} {vm.name}
            </p>
            <p>{vm.delivery}</p>
          </div>
        </footer>

        {vm.price > 0 && (
          <div className={cx("sticky-cta")}>
            <span className={cx("p")}>
              {formatPrice((vm.offers.find((o) => o.qty === qty)?.price ?? vm.price) + vm.shipping, vm.currency)}
            </span>
            <button type="button" className={cx("btn pulse")} onClick={scrollToOrder}>
              {vm.cta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
