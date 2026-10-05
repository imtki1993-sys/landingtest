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

  const block = (key: string, node: React.ReactNode) => {
    const hidden = vm.hidden.has(key);
    if (!builderMode) return hidden ? null : <React.Fragment key={key}>{node}</React.Fragment>;
    const label = key.startsWith("custom-")
      ? "Bloc personnalisé"
      : SECTION_LABELS[key as keyof typeof SECTION_LABELS] || key;
    return (
      <div
        key={key}
        data-lpx-section={key}
        className={cx("block", hidden && "is-hidden")}
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
              {formatPrice(vm.offers.find((o) => o.qty === qty)?.price ?? vm.price, vm.currency)}
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
