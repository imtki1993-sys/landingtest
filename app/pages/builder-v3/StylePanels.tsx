"use client";
// Panneaux « Thème » (toute la page) et « Style » (section sélectionnée) de l'éditeur.
// Chaque réglage vide reprend la valeur du template ; les champs affichent la vraie valeur utilisée.
import React, { useState } from "react";
import { uploadImages } from "../../../lib/builder-images";
import { getTemplate } from "../../../components/landpro/registry";
import { resolvePageTemplate } from "../../../components/landpro/legacy";
import { DESIGNS } from "../../../components/landpro/designs";
import { FONT_KEYS, type DeviceSizes, type SectionStyle } from "../../../components/landpro/styles";
import type { FontKey } from "../../../components/landpro/types";

type Patch = (k: string, v: any) => void;
type Viewport = "desktop" | "tablet" | "mobile";

const FONT_LABELS: Record<FontKey, string> = {
  sans: "Inter (moderne)",
  grotesk: "Space Grotesk (technique)",
  serif: "Playfair Display (élégant)",
  elegant: "Cormorant (luxe)",
  condensed: "Bebas Neue (affiche)",
  display: "Poppins (arrondi)",
  tech: "Orbitron (futuriste)",
  arabic: "Cairo (arabe)",
};

/** Couleur : affiche la vraie couleur utilisée, « Template » tant qu'elle n'est pas changée. */
function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (v: string) => void;
}) {
  const set = !!value;
  return (
    <div className="bv3-sx-row">
      <span>{label}</span>
      <div className="bv3-sx-color">
        <input type="color" value={value || fallback} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <code>{(value || fallback).toUpperCase()}</code>
        {set ? (
          <button type="button" onClick={() => onChange("")} title="Revenir à la couleur du template">
            ↺
          </button>
        ) : (
          <em>Template</em>
        )}
      </div>
    </div>
  );
}

/** Nombre en px, vide = valeur du template. */
function PxField({
  label,
  value,
  onChange,
  min = 0,
  max = 240,
  placeholder = "auto",
}: {
  label: string;
  value?: number | string;
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <label className="bv3-sx-row">
      <span>{label}</span>
      <span className="bv3-sx-px">
        <input
          type="number"
          min={min}
          max={max}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
        px
      </span>
    </label>
  );
}

/** Taille sur les trois appareils ; l'appareil affiché dans l'aperçu est mis en avant. */
function SizeField({
  label,
  value,
  onChange,
  viewport,
  min,
  max,
  hint,
}: {
  label: string;
  value?: DeviceSizes;
  onChange: (v: DeviceSizes | undefined) => void;
  viewport: Viewport;
  min: number;
  max: number;
  hint: string;
}) {
  const v = value || {};
  const set = (k: keyof DeviceSizes, n: string) => {
    const next = { ...v, [k]: n === "" ? undefined : Math.min(max, Math.max(min, Number(n))) };
    onChange(next.d || next.t || next.m ? next : undefined);
  };
  const cells: [keyof DeviceSizes, Viewport, string][] = [
    ["d", "desktop", "Ordinateur"],
    ["t", "tablet", "Tablette"],
    ["m", "mobile", "Mobile"],
  ];
  return (
    <div className="bv3-sx-block">
      <span className="bv3-sx-label">{label}</span>
      <div className="bv3-sx-sizes">
        {cells.map(([k, vp, name]) => (
          <label key={k} className={viewport === vp ? "is-current" : ""}>
            <small>{name}</small>
            <input
              type="number"
              min={min}
              max={max}
              value={v[k] ?? ""}
              placeholder="auto"
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <small>{hint}</small>
    </div>
  );
}

function FontField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <label className="bv3-sx-row">
      <span>{label}</span>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Celle du template</option>
        {FONT_KEYS.map((k) => (
          <option key={k} value={k}>
            {FONT_LABELS[k]}
          </option>
        ))}
      </select>
    </label>
  );
}

const THEME_KEYS = [
  "theme_primary",
  "theme_accent",
  "theme_bg",
  "theme_surface",
  "theme_text",
  "theme_muted",
  "theme_heading_font",
  "theme_body_font",
  "theme_radius",
  "theme_section_pad",
  "theme_title_size",
  "theme_text_size",
];

/** Templates « sur mesure » : certaines couleurs sont encore fixées par leur design. */
function DesignNote({ draft }: { draft: any }) {
  if (!DESIGNS[resolvePageTemplate(draft).templateId]) return null;
  return (
    <p className="bv3-sx-note">
      Template sur mesure : certains éléments gardent encore leurs propres couleurs. Vérifie le résultat dans l'aperçu.
    </p>
  );
}

/** Thème de toute la page : couleurs, polices, arrondi, espacement et tailles par défaut. */
export function ThemePanel({
  draft,
  patch,
  commit,
  viewport,
}: {
  draft: any;
  patch: Patch;
  commit: (next: any) => void;
  viewport: Viewport;
}) {
  const t = getTemplate(resolvePageTemplate(draft).templateId).theme;
  const changed = THEME_KEYS.some((k) => draft[k] !== undefined && draft[k] !== "" && draft[k] !== null);
  return (
    <div className="bv3-sx">
      <p className="bv3-sx-intro">
        S'applique à toute la page. Une section peut ensuite avoir son propre style (onglet Style).
      </p>
      <DesignNote draft={draft} />
      <h4>Couleurs</h4>
      <ColorField
        label="Principale (boutons)"
        value={draft.theme_primary}
        fallback={t.primary}
        onChange={(v) => patch("theme_primary", v)}
      />
      <ColorField
        label="Accent (prix, badges)"
        value={draft.theme_accent}
        fallback={t.accent}
        onChange={(v) => patch("theme_accent", v)}
      />
      <ColorField label="Fond de page" value={draft.theme_bg} fallback={t.bg} onChange={(v) => patch("theme_bg", v)} />
      <ColorField
        label="Fond des cartes"
        value={draft.theme_surface}
        fallback={t.surface}
        onChange={(v) => patch("theme_surface", v)}
      />
      <ColorField label="Texte" value={draft.theme_text} fallback={t.text} onChange={(v) => patch("theme_text", v)} />
      <ColorField
        label="Texte secondaire"
        value={draft.theme_muted}
        fallback={t.muted}
        onChange={(v) => patch("theme_muted", v)}
      />
      <h4>Typographie</h4>
      <FontField
        label="Police des titres"
        value={draft.theme_heading_font}
        onChange={(v) => patch("theme_heading_font", v)}
      />
      <FontField label="Police du texte" value={draft.theme_body_font} onChange={(v) => patch("theme_body_font", v)} />
      <SizeField
        label="Taille des titres"
        value={draft.theme_title_size}
        onChange={(v) => patch("theme_title_size", v)}
        viewport={viewport}
        min={14}
        max={120}
        hint="Titres de toutes les sections. Vide sur tablette ou mobile : réduit automatiquement."
      />
      <SizeField
        label="Taille du texte"
        value={draft.theme_text_size}
        onChange={(v) => patch("theme_text_size", v)}
        viewport={viewport}
        min={11}
        max={32}
        hint="Paragraphes, listes et réponses de la FAQ."
      />
      <h4>Formes et espaces</h4>
      <PxField
        label="Arrondi des coins"
        value={draft.theme_radius}
        placeholder={String(t.radius)}
        max={40}
        onChange={(v) => patch("theme_radius", v)}
      />
      <PxField
        label="Espace en haut et en bas des sections"
        value={draft.theme_section_pad}
        placeholder="64"
        max={200}
        onChange={(v) => patch("theme_section_pad", v)}
      />
      {changed && (
        <button
          type="button"
          className="bv3-sx-reset"
          onClick={() => commit({ ...draft, ...Object.fromEntries(THEME_KEYS.map((k) => [k, ""])) })}
        >
          Revenir au thème du template
        </button>
      )}
    </div>
  );
}

/** Style de la section sélectionnée : le même panneau pour toutes les sections. */
export function SectionStylePanel({
  draft,
  selected,
  sectionLabel,
  patch,
  viewport,
}: {
  draft: any;
  selected: string;
  sectionLabel: string;
  patch: Patch;
  viewport: Viewport;
}) {
  const t = getTemplate(resolvePageTemplate(draft).templateId).theme;
  const all: Record<string, SectionStyle> =
    draft.section_styles && typeof draft.section_styles === "object" ? draft.section_styles : {};
  const s: SectionStyle = all[selected] || {};
  const [busy, setBusy] = useState(false);
  const set = (k: keyof SectionStyle, v: unknown) => {
    const next: Record<string, unknown> = { ...s, [k]: v };
    for (const key of Object.keys(next)) {
      const x = next[key];
      if (x === "" || x === undefined || x === null || x === false) delete next[key];
    }
    // ancien réglage unique : remplacé dès qu'on règle le haut ou le bas
    if ((k === "padTop" || k === "padBottom") && "padding" in next) {
      next.padTop = next.padTop ?? next.padding;
      next.padBottom = next.padBottom ?? next.padding;
      delete next.padding;
    }
    const rest = { ...all };
    if (Object.keys(next).length) rest[selected] = next as SectionStyle;
    else delete rest[selected];
    patch("section_styles", rest);
  };
  const pageText = draft.theme_text || t.text;
  const legacyPad = s.padding === "" || s.padding == null ? undefined : s.padding;
  return (
    <div className="bv3-sx">
      <p className="bv3-sx-intro">
        Style de la section <b>{sectionLabel}</b> uniquement. Vide = comme le reste de la page.
      </p>
      <DesignNote draft={draft} />
      <h4>Fond</h4>
      <ColorField
        label="Couleur de fond"
        value={s.background}
        fallback={draft.theme_bg || t.bg}
        onChange={(v) => set("background", v)}
      />
      <label className="bv3-sx-row">
        <span>Image de fond (URL)</span>
        <input
          value={s.bgImage || ""}
          placeholder="https://…"
          onChange={(e) => set("bgImage", e.target.value.trim())}
        />
      </label>
      <label className="bv3-upload">
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            setBusy(true);
            try {
              const urls = await uploadImages(files, 1);
              if (urls[0]) set("bgImage", urls[0]);
            } catch (err: any) {
              alert(err?.message || "Envoi de l'image impossible");
            } finally {
              setBusy(false);
            }
          }}
        />
        <span>{busy ? "Envoi…" : "Charger une image de fond"}</span>
      </label>
      <h4>Couleurs</h4>
      <ColorField label="Texte" value={s.color} fallback={pageText} onChange={(v) => set("color", v)} />
      <ColorField
        label="Titres"
        value={s.titleColor}
        fallback={s.color || pageText}
        onChange={(v) => set("titleColor", v)}
      />
      <ColorField
        label="Boutons"
        value={s.btnBg}
        fallback={draft.theme_primary || t.primary}
        onChange={(v) => set("btnBg", v)}
      />
      <ColorField
        label="Texte des boutons"
        value={s.btnText}
        fallback={t.primaryText}
        onChange={(v) => set("btnText", v)}
      />
      <h4>Texte</h4>
      <SizeField
        label="Taille du titre"
        value={s.titleSize}
        onChange={(v) => set("titleSize", v)}
        viewport={viewport}
        min={14}
        max={120}
        hint="Vide sur tablette ou mobile : réduit automatiquement."
      />
      <SizeField
        label="Taille du texte"
        value={s.textSize}
        onChange={(v) => set("textSize", v)}
        viewport={viewport}
        min={11}
        max={32}
        hint="Paragraphes et listes de la section."
      />
      <div className="bv3-sx-block">
        <span className="bv3-sx-label">Alignement</span>
        <div className="bv3-sx-seg" role="group" aria-label="Alignement">
          {(
            [
              ["", "Template"],
              ["left", "Gauche"],
              ["center", "Centre"],
              ["right", "Droite"],
            ] as const
          ).map(([v, name]) => (
            <button
              key={v}
              type="button"
              className={(s.align || "") === v ? "active" : ""}
              onClick={() => set("align", v)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <h4>Espaces</h4>
      <PxField label="Espace en haut" value={s.padTop ?? legacyPad} onChange={(v) => set("padTop", v)} />
      <PxField label="Espace en bas" value={s.padBottom ?? legacyPad} onChange={(v) => set("padBottom", v)} />
      <label className="bv3-sx-row">
        <span>Largeur du contenu</span>
        <select
          value={s.width ? String(s.width) : ""}
          onChange={(e) => set("width", e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Celle du template</option>
          <option value="640">Étroite (640 px)</option>
          <option value="860">Moyenne (860 px)</option>
          <option value="1180">Normale (1180 px)</option>
          <option value="1400">Large (1400 px)</option>
        </select>
      </label>
      <h4>Affichage</h4>
      <label className="bv3-check">
        <input type="checkbox" checked={!!s.hideMobile} onChange={(e) => set("hideMobile", e.target.checked)} /> Masquer
        sur mobile
      </label>
      <label className="bv3-check">
        <input type="checkbox" checked={!!s.hideDesktop} onChange={(e) => set("hideDesktop", e.target.checked)} />{" "}
        Masquer sur ordinateur
      </label>
      {Object.keys(s).length > 0 && (
        <button
          type="button"
          className="bv3-sx-reset"
          onClick={() => {
            const rest = { ...all };
            delete rest[selected];
            patch("section_styles", rest);
          }}
        >
          Réinitialiser le style de cette section
        </button>
      )}
    </div>
  );
}
