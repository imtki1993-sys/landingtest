import type { CSSProperties } from "react";
import type { FontKey, Theme } from "./types";

export const fonts: Record<FontKey, string> = {
  sans: '"Inter", system-ui, sans-serif',
  grotesk: '"Space Grotesk", "Inter", sans-serif',
  serif: '"Playfair Display", Georgia, serif',
  elegant: '"Cormorant Garamond", Georgia, serif',
  condensed: '"Bebas Neue", "Oswald", Impact, sans-serif',
  display: '"Poppins", "Inter", sans-serif',
  tech: '"Orbitron", "Space Grotesk", sans-serif',
  arabic: '"Cairo", "Tajawal", system-ui, sans-serif',
};

export const googleFontsHref =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cairo:wght@400;600;700;800&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@600;800&family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400&family=Poppins:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap";

/** Convertit un thème en variables CSS appliquées sur le wrapper du template. */
export function themeVars(t: Theme): CSSProperties {
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--surface2": t.surface2,
    "--text": t.text,
    "--muted": t.muted,
    "--border": t.border,
    "--primary": t.primary,
    "--primary-text": t.primaryText,
    "--accent": t.accent,
    "--hero-bg": t.heroBg ?? t.bg,
    "--radius": `${t.radius}px`,
    "--btn-radius": t.radius >= 20 ? "999px" : `${Math.max(t.radius - 4, 0)}px`,
    "--font": fonts[t.font],
    "--heading": fonts[t.heading],
    "--hw": String(t.headingWeight ?? 800),
    "--htt": t.uppercaseHeadings ? "uppercase" : "none",
    "--cd-bg": t.dark ? t.surface2 : "#111",
    colorScheme: t.dark ? "dark" : "light",
  } as CSSProperties;
}

// ─── Palettes de base réutilisables ───
const light = {
  dark: false,
  bg: "#ffffff",
  surface: "#f6f7f9",
  surface2: "#eef0f4",
  text: "#111318",
  muted: "#5d6573",
  border: "#e3e6ec",
  primaryText: "#ffffff",
  radius: 16,
  font: "sans" as FontKey,
  heading: "sans" as FontKey,
};

const dark = {
  dark: true,
  bg: "#0b0c0f",
  surface: "#14161b",
  surface2: "#1c1f26",
  text: "#f3f4f6",
  muted: "#9aa1ad",
  border: "#262a33",
  primaryText: "#ffffff",
  radius: 16,
  font: "sans" as FontKey,
  heading: "sans" as FontKey,
};

export const lightTheme = (o: Partial<Theme> & Pick<Theme, "primary" | "accent">): Theme => ({ ...light, ...o });
export const darkTheme = (o: Partial<Theme> & Pick<Theme, "primary" | "accent">): Theme => ({ ...dark, ...o });
