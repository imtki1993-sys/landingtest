// Réglages de style de l'éditeur : thème de page et style de section -> variables CSS.
import { describe, expect, it } from "vitest";
import {
  cleanSectionStyle,
  pageThemeFrom,
  pageThemeVars,
  resolveSizes,
  sectionStyleProps,
} from "../components/landpro/styles";

describe("thème de la page", () => {
  it("garde seulement les valeurs valides", () => {
    const t = pageThemeFrom({
      theme_primary: "#ff0000",
      theme_bg: "red",
      theme_radius: "99",
      theme_heading_font: "serif",
      theme_body_font: "comic",
    });
    expect(t.primary).toBe("#ff0000");
    expect(t.bg).toBeUndefined();
    expect(t.radius).toBe(40);
    expect(t.heading).toBe("serif");
    expect(t.font).toBeUndefined();
  });
  it("pose l'espacement et les tailles sur la racine", () => {
    const { vars, attrs } = pageThemeVars(pageThemeFrom({ theme_section_pad: 40, theme_title_size: { d: 48 } }));
    expect(vars["--sx-gap"]).toBe("40px");
    expect(vars["--sx-h-d"]).toBe("48px");
    expect(attrs).toHaveProperty("data-sx-h");
  });
});

describe("style de section", () => {
  it("rien de réglé : pas de style", () => {
    expect(sectionStyleProps({})).toBeNull();
    expect(sectionStyleProps(null)).toBeNull();
  });
  it("fond sans couleur de texte : texte lisible automatique", () => {
    const r = sectionStyleProps({ background: "#111111" })!;
    expect(r.style.backgroundColor).toBe("#111111");
    expect(r.style.color).toBe("#f3f4f6");
    expect(r.style["--text"]).toBe("#f3f4f6");
  });
  it("bouton : couleur du bouton et texte lisible", () => {
    const r = sectionStyleProps({ btnBg: "#ffd400" })!;
    expect(r.style["--primary"]).toBe("#ffd400");
    expect(r.style["--primary-text"]).toBe("#111318");
  });
  it("ancien réglage « padding » toujours appliqué en haut et en bas", () => {
    const s = cleanSectionStyle({ padding: 30 });
    expect([s.padTop, s.padBottom]).toEqual([30, 30]);
    expect(cleanSectionStyle({ padding: 30, padTop: 10 }).padTop).toBe(10);
  });
  it("tailles : complétées par appareil", () => {
    expect(resolveSizes({ d: 60 }, true)).toEqual({ d: 60, t: 51, m: 38 });
    expect(resolveSizes({ d: 16 }, false)).toEqual({ d: 16, t: 16, m: 16 });
    expect(resolveSizes({ d: 60, m: 30 }, true)).toEqual({ d: 60, t: 51, m: 30 });
    const r = sectionStyleProps({ titleSize: { d: 60 } })!;
    expect(r.style["--sx-h-m"]).toBe("38px");
    expect(r.attrs).toHaveProperty("data-sx-h");
  });
  it("refuse une image de fond qui casserait le CSS", () => {
    expect(cleanSectionStyle({ bgImage: 'x") ; background:red' }).bgImage).toBeUndefined();
    expect(cleanSectionStyle({ bgImage: "https://cdn.x.com/a.jpg" }).bgImage).toBe("https://cdn.x.com/a.jpg");
  });
  it("masquage mobile / ordinateur", () => {
    const r = sectionStyleProps({ hideMobile: true })!;
    expect(r.attrs).toHaveProperty("data-sx-hide-m");
  });
});
