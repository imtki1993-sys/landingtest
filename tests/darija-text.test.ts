import { describe, it, expect } from "vitest";
import { numberToDarija, normalizeDarija, estimateSeconds } from "../lib/darija-text";

describe("nombres en darija", () => {
  it.each([
    [0, "صفر"],
    [2, "جوج"],
    [11, "حداش"],
    [15, "خمسطاش"],
    [21, "واحد و عشرين"],
    [50, "خمسين"],
    [99, "تسعة و تسعين"],
    [100, "مية"],
    [150, "مية و خمسين"],
    [199, "مية و تسعة و تسعين"],
    [200, "ميتين"],
    [349, "تلت مية و تسعة و ربعين"],
    [1000, "ألف"],
    [1500, "ألف و خمس مية"],
    [2000, "ألفين"],
    [3000, "تلت آلاف"],
    [12000, "طناش ألف"],
    [250000, "ميتين و خمسين ألف"],
    [1000000, "مليون"],
  ])("%i → %s", (n, w) => expect(numberToDarija(n)).toBe(w));
});

describe("texte prêt pour la voix", () => {
  it("prix, pourcentage, livraison, emojis, mots latins", () => {
    const r = normalizeDarija("🔥 Promo -50% ! الثمن غير 199dh بلاصة 399 DH\nLivraison gratuite ف 24h لجميع المدن 🚚");
    expect(r.text).toContain("خمسين فالمية");
    expect(r.text).toContain("مية و تسعة و تسعين درهم");
    expect(r.text).toContain("تلت مية و تسعة و تسعين درهم");
    expect(r.text).toContain("التوصيل فابور");
    expect(r.text).toContain("ربعة و عشرين ساعة");
    expect(r.text).not.toMatch(/[A-Za-z0-9]|🔥|🚚/);
    expect(r.sentences.length).toBeGreaterThanOrEqual(2);
    expect(r.guessed).toEqual([]);
  });
  it("mot latin inconnu : transcrit et signalé", () => {
    const r = normalizeDarija("جربو Zenova دابا");
    expect(r.guessed).toHaveLength(1);
    expect(r.text).not.toMatch(/[A-Za-z]/);
  });
  it("décimales, milliers, téléphone, liens", () => {
    expect(normalizeDarija("99.5 درهم").text).toContain("تسعة و تسعين و نص");
    expect(normalizeDarija("1 200 درهم").text).toContain("ألف و ميتين درهم");
    expect(normalizeDarija("عيط ل 0661234567").text).toContain("صفر ستة ستة واحد");
    expect(normalizeDarija("شوف https://x.com/a دابا").text).toBe("شوف دابا.");
  });
  it("phrase longue coupée aux virgules", () => {
    const long = Array.from({ length: 12 }, () => "هاد المنتوج زوين بزاف").join("، ");
    const r = normalizeDarija(long);
    expect(r.sentences.length).toBeGreaterThan(1);
    expect(r.sentences.every((s) => s.length <= 145)).toBe(true);
  });
  it("durée estimée", () => {
    expect(estimateSeconds(Array(48).fill("كلمة").join(" "))).toBe(20);
  });
});
