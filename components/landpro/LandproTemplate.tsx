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
import { cx, HeroScope, scrollToOrder } from "./parts";
import { Hero } from "./Hero";
import { EMPTY_HINT, isEmpty, renderSection } from "./Sections";
import { DESIGNS } from "./designs";
import { PIECES } from "./pieces";
import { heroImageVars, pageThemeVars, sectionStyleProps } from "./styles";
import type { PieceChoice } from "./pieces/types";
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
  /** pièces imposées (aperçu des pièces, choix du marchand) : remplacent celles du template */
  pieces?: PieceChoice;
}

export default function LandproTemplate({
  data,
  preview = false,
  demo = false,
  builderMode = false,
  onSectionSelect,
  onSubmit,
  pieces,
}: LandproTemplateProps) {
  const vm = useMemo(() => buildVM(data, { demo }), [data, demo]);
  // design sur mesure : en-tête, hero, sections et pied de page propres au template
  const design = DESIGNS[vm.t.id];
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
  const designFonts = design?.fonts;
  useEffect(() => {
    if (!designFonts) return;
    const id = "lpx-fonts-" + vm.t.id;
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + designFonts + "&display=swap";
    document.head.appendChild(l);
  }, [designFonts, vm.t.id]);

  // Thème du template, puis réglages du vendeur (une valeur vide garde celle du template)
  const ov = vm.themeOverride;
  const pick = <T,>(v: T | undefined) => (v !== undefined && v !== null && v !== ("" as unknown) ? { v } : null);
  const theme = { ...vm.t.theme };
  for (const k of ["primary", "accent", "bg", "surface", "text", "muted", "radius"] as const) {
    const o = pick(ov[k]);
    if (o) (theme as Record<string, unknown>)[k] = o.v;
  }
  // Arabe : police arabe par défaut, sauf police choisie par le vendeur
  if (vm.rtl) Object.assign(theme, { font: "arabic", heading: "arabic" });
  if (ov.font) theme.font = ov.font;
  if (ov.heading) theme.heading = ov.heading;
  const style = themeVars(theme);
  const pageSx = pageThemeVars(ov);
  const heroImg = heroImageVars(vm.heroImage);
  const sp = { vm, qty, setQty, variant, setVariant, preview: preview || builderMode, onSubmit };
  // pièces combinables : celles imposées, sinon celles du template (un design sur mesure reste prioritaire)
  const pc: PieceChoice = { ...(vm.t.pieces || {}), ...(pieces || {}) };
  const piece = (id?: string) => (id && PIECES[id] ? PIECES[id].render(sp) : undefined);
  const pieceHeader = design?.header ? undefined : piece(pc.header);
  const pieceFooter = design?.footer ? undefined : piece(pc.footer);

  const keys = vm.order;
  const announcementOn = keys.includes("announcement") && (!vm.hidden.has("announcement") || builderMode);

  const block = (key: string, node: React.ReactNode) => {
    const hidden = vm.hidden.has(key);
    // Style de section réglé dans l'éditeur (fond, couleurs, tailles par appareil, marges…)
    const sx = sectionStyleProps(vm.sectionStyles[key]);
    const style = sx?.style as React.CSSProperties | undefined;
    if (!builderMode) {
      if (hidden) return null;
      // ancre pour les boutons qui mènent à une section (bouton secondaire du hero…)
      const anchor = <span id={"lpx-a-" + key} className={cx("anchor")} aria-hidden="true" />;
      return sx ? (
        <div key={key} className={cx("styled")} style={style} {...sx.attrs}>
          {anchor}
          {node}
        </div>
      ) : (
        <React.Fragment key={key}>
          {anchor}
          {node}
        </React.Fragment>
      );
    }
    const label = key.startsWith("custom-")
      ? "Bloc personnalisé"
      : SECTION_LABELS[key as keyof typeof SECTION_LABELS] || key;
    return (
      <div
        key={key}
        data-lpx-section={key}
        className={cx("block", hidden && "is-hidden", sx && "styled")}
        style={style}
        {...(sx?.attrs || {})}
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
    if (key === "hero")
      return (
        <HeroScope.Provider value={!design}>
          {design ? design.hero(sp) : (piece(pc.hero) ?? <Hero vm={vm} />)}
        </HeroScope.Provider>
      );
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
    const own = design?.sections?.[key];
    if (own) return own(sp);
    const pieceSection = piece(pc.sections?.[key as keyof typeof pc.sections]);
    return pieceSection ?? renderSection(key, sp);
  };

  return (
    <div className={cx("root")}>
      <div
        className={[
          "lpx",
          builderMode ? "lpx-builder" : "",
          theme.glow ? "lpx-glow" : "",
          design ? "lpx-design" : "",
          `lpx-tpl-${vm.t.id}`,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...style,
          ...pageSx.vars,
          ...heroImg.vars,
          // police choisie par le vendeur > police du design sur mesure > police du thème
          ["--font" as string]: (ov.font && fonts[ov.font]) || (!vm.rtl && design?.font) || fonts[theme.font],
          ["--heading" as string]:
            (ov.heading && fonts[ov.heading]) || (!vm.rtl && design?.heading) || fonts[theme.heading],
        }}
        {...pageSx.attrs}
        {...heroImg.attrs}
        dir={vm.rtl ? "rtl" : "ltr"}
        lang={vm.lang}
        data-landing-template={vm.t.id}
      >
        {announcementOn &&
          block("announcement", design?.sections?.announcement?.(sp) ?? renderSection("announcement", sp))}
        {design?.header ? (
          design.header(sp)
        ) : pieceHeader ? (
          pieceHeader
        ) : (
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
        )}

        {keys
          .filter((k) => k !== "announcement")
          .map((key) => {
            const node = sectionNode(key);
            if (node === null && !builderMode) return null;
            return block(key, node);
          })}

        {design?.footer ? (
          design.footer(sp)
        ) : pieceFooter ? (
          pieceFooter
        ) : (
          <footer className={cx("lp-footer")}>
            <div className={cx("container")}>
              <p>
                © {new Date().getFullYear()} {vm.name}
              </p>
              <p>{vm.delivery}</p>
            </div>
          </footer>
        )}

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
