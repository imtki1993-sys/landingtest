// Réglages de style choisis par le vendeur dans l'éditeur, convertis en variables CSS.
// Deux niveaux : le thème de la page (content.theme_*) et le style de chaque section
// (content.section_styles[clé]). Une valeur vide = on garde celle du template.
// Fichier sans React : testable et utilisable côté serveur.
import type { FontKey } from "./types";

export const FONT_KEYS: FontKey[] = ["sans", "grotesk", "serif", "elegant", "condensed", "display", "tech", "arabic"];

/** Tailles par appareil, en px. Tablette et mobile reprennent la taille au-dessus si vides. */
export interface DeviceSizes {
  d?: number;
  t?: number;
  m?: number;
}

export interface SectionStyle {
  background?: string;
  bgImage?: string;
  color?: string;
  titleColor?: string;
  btnBg?: string;
  btnText?: string;
  align?: "" | "left" | "center" | "right";
  /** ancien réglage unique (haut et bas) : toujours lu pour les pages existantes */
  padding?: number | string;
  padTop?: number | string;
  padBottom?: number | string;
  /** largeur maximale du contenu, en px */
  width?: number | string;
  titleSize?: DeviceSizes;
  textSize?: DeviceSizes;
  hideMobile?: boolean;
  hideDesktop?: boolean;
}

export interface PageTheme {
  primary?: string;
  accent?: string;
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
  radius?: number;
  font?: FontKey;
  heading?: FontKey;
  sectionPad?: number;
  titleSize?: DeviceSizes;
  textSize?: DeviceSizes;
}

const HEX = /^#[0-9a-f]{3,8}$/i;
const color = (v: unknown) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : undefined);
const px = (v: unknown, min: number, max: number) => {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined;
};
const sizes = (v: unknown, min: number, max: number): DeviceSizes | undefined => {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const out = { d: px(o.d, min, max), t: px(o.t, min, max), m: px(o.m, min, max) };
  return out.d || out.t || out.m ? out : undefined;
};
const font = (v: unknown) => (FONT_KEYS.includes(v as FontKey) ? (v as FontKey) : undefined);
/** Image de fond : seulement des adresses http(s) ou relatives, jamais d'url() injectée. */
const imageUrl = (v: unknown) =>
  typeof v === "string" && /^(https?:\/\/|\/)[^\s"'()<>\\]+$/i.test(v.trim()) ? v.trim() : undefined;

/** Thème de la page lu dans le contenu (content.theme_*). */
export function pageThemeFrom(c: Record<string, any>): PageTheme {
  return {
    primary: color(c.theme_primary),
    accent: color(c.theme_accent),
    bg: color(c.theme_bg),
    surface: color(c.theme_surface),
    text: color(c.theme_text),
    muted: color(c.theme_muted),
    radius: px(c.theme_radius, 0, 40),
    font: font(c.theme_body_font),
    heading: font(c.theme_heading_font),
    sectionPad: px(c.theme_section_pad, 0, 200),
    titleSize: sizes(c.theme_title_size, 14, 120),
    textSize: sizes(c.theme_text_size, 11, 32),
  };
}

/** Couleur de texte lisible sur un fond #rrggbb (sombre sur fond clair, claire sur fond sombre). */
export function readableOn(bg: string): string | undefined {
  const m = /^#?([0-9a-f]{6})$/i.exec(bg.trim());
  if (!m) return undefined;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111318" : "#f3f4f6";
}

type Vars = Record<string, string>;
type Attrs = Record<string, string>;

/** Variables et attributs des tailles de titre et de texte (thème ou section). */
function sizeVars(vars: Vars, attrs: Attrs, title?: DeviceSizes, text?: DeviceSizes) {
  if (title) {
    const z = resolveSizes(title, true);
    vars["--sx-h-d"] = `${z.d}px`;
    vars["--sx-h-t"] = `${z.t}px`;
    vars["--sx-h-m"] = `${z.m}px`;
    attrs["data-sx-h"] = "";
  }
  if (text) {
    const z = resolveSizes(text, false);
    vars["--sx-p-d"] = `${z.d}px`;
    vars["--sx-p-t"] = `${z.t}px`;
    vars["--sx-p-m"] = `${z.m}px`;
    attrs["data-sx-p"] = "";
  }
}

/**
 * Complète les tailles manquantes. Les trois sont toujours posées ensemble : une section réglée
 * ne reprend jamais une taille venue du thème. Titres : tablette ≈ 85 % de l'ordinateur et
 * mobile ≈ 75 % de la tablette (jamais sous 18 px) ; texte : même taille partout.
 */
export function resolveSizes(s: DeviceSizes, title: boolean): Required<DeviceSizes> {
  const base = (s.d ?? s.t ?? s.m) as number;
  const d = s.d ?? base;
  const t = s.t ?? (title ? Math.max(18, Math.round(d * 0.85)) : d);
  const m = s.m ?? (title ? Math.min(t, Math.max(18, Math.round(t * 0.75))) : t);
  return { d, t, m };
}

/** Variables CSS posées sur la racine de la landing pour le thème de la page. */
export function pageThemeVars(t: PageTheme): { vars: Vars; attrs: Attrs } {
  const vars: Vars = {};
  const attrs: Attrs = {};
  if (t.sectionPad != null) {
    vars["--sx-gap"] = `${t.sectionPad}px`;
    attrs["data-sx-gap"] = "";
  }
  sizeVars(vars, attrs, t.titleSize, t.textSize);
  return { vars, attrs };
}

/** Normalise un style de section enregistré (valeurs invalides ignorées). */
export function cleanSectionStyle(raw: unknown): SectionStyle {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, any>;
  const align = ["left", "center", "right"].includes(s.align) ? s.align : undefined;
  const both = px(s.padding, 0, 240);
  return {
    background: color(s.background),
    bgImage: imageUrl(s.bgImage),
    color: color(s.color),
    titleColor: color(s.titleColor),
    btnBg: color(s.btnBg),
    btnText: color(s.btnText),
    align,
    padTop: px(s.padTop, 0, 240) ?? both,
    padBottom: px(s.padBottom, 0, 240) ?? both,
    width: px(s.width, 320, 1600),
    titleSize: sizes(s.titleSize, 14, 120),
    textSize: sizes(s.textSize, 11, 32),
    hideMobile: s.hideMobile === true || undefined,
    hideDesktop: s.hideDesktop === true || undefined,
  };
}

/** Style inline + attributs data-* du bloc d'une section ; null si rien n'est réglé. */
export function sectionStyleProps(raw: unknown): { style: Record<string, string>; attrs: Attrs } | null {
  const s = cleanSectionStyle(raw);
  const style: Record<string, string> = {};
  const attrs: Attrs = {};
  if (s.background) style.backgroundColor = s.background;
  if (s.bgImage) {
    style.backgroundImage = `url("${s.bgImage}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }
  if (s.background || s.bgImage) attrs["data-sx-bg"] = "";
  // Fond choisi sans couleur de texte : texte sombre ou clair selon le fond, pour rester lisible
  const text = s.color || (s.background ? readableOn(s.background) : undefined);
  if (text) {
    style.color = text;
    style["--text"] = text;
    style["--muted"] = `color-mix(in srgb, ${text} 72%, transparent)`;
    attrs["data-sx-text"] = "";
  }
  // Fond réglé : cartes, puces et bordures de la section suivent ce fond (sinon texte clair sur carte claire)
  if (s.background && text) {
    style["--bg"] = s.background;
    style["--surface"] = `color-mix(in srgb, ${text} 7%, ${s.background})`;
    style["--surface2"] = `color-mix(in srgb, ${text} 12%, ${s.background})`;
    style["--border"] = `color-mix(in srgb, ${text} 18%, ${s.background})`;
  }
  if (s.titleColor) {
    style["--sx-title"] = s.titleColor;
    attrs["data-sx-title"] = "";
  }
  if (s.btnBg) {
    style["--primary"] = s.btnBg;
    if (!s.btnText) style["--primary-text"] = readableOn(s.btnBg) || "#ffffff";
  }
  if (s.btnText) style["--primary-text"] = s.btnText;
  if (s.align) {
    style.textAlign = s.align;
    attrs["data-sx-align"] = s.align;
  }
  if (s.padTop != null) {
    style["--sx-pt"] = `${s.padTop}px`;
    attrs["data-sx-pt"] = "";
  }
  if (s.padBottom != null) {
    style["--sx-pb"] = `${s.padBottom}px`;
    attrs["data-sx-pb"] = "";
  }
  if (s.width) {
    style["--sx-w"] = `${s.width}px`;
    attrs["data-sx-w"] = "";
  }
  sizeVars(style, attrs, s.titleSize, s.textSize);
  if (s.hideMobile) attrs["data-sx-hide-m"] = "";
  if (s.hideDesktop) attrs["data-sx-hide-d"] = "";
  return Object.keys(style).length || Object.keys(attrs).length ? { style, attrs } : null;
}
