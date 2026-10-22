import { describe, it, expect } from "vitest";
import { numberToDarija, normalizeDarija, cleanLexicon, estimateSeconds, GAP } from "../lib/darija-text";

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

describe("darija parlée et dictionnaire", () => {
  it("remplace l'arabe classique par la darija", () => {
    const r = normalizeDarija("هذا المنتج رائع جدا. وهذا فقط ب 199 درهم! الدفع عند الاستلام");
    expect(r.text).toContain("هاد المنتج واعر بزاف.");
    expect(r.text).toContain("وهاد غير ب مية و تسعة و تسعين درهم!");
    expect(r.text).toContain("الخلاص عند الاستلام");
    expect(r.adapted).toContain("هذا → هاد");
  });
  it("ne touche pas aux mots plus longs", () => {
    expect(normalizeDarija("كيفاش هذاك").text).toBe("كيفاش هذاك.");
  });
  it("applique le dictionnaire du vendeur (latin, arabe et texte préparé)", () => {
    const lex = cleanLexicon({ MagSafe: "ماك سيف", "مية و تسعة و تسعين": "تسعة و تسعين و مية", " ": "x" });
    expect(Object.keys(lex)).toHaveLength(2);
    const r = normalizeDarija("Support MagSafe ب 199 درهم", lex);
    expect(r.text).toContain("ماك سيف");
    expect(r.text).toContain("تسعة و تسعين و مية درهم");
    expect(r.guessed.join(" ")).not.toContain("MagSafe");
  });
  it("le dictionnaire a priorité sur les remplacements automatiques", () => {
    expect(normalizeDarija("هذا", { هذا: "هادا" }).text).toBe("هادا.");
  });
});

describe("ponctuation expressive", () => {
  it("pauses selon la ponctuation et les retours à la ligne", () => {
    const r = normalizeDarija("واش عييتي؟ هاد الحامل واعر!\nالثمن غير 199 درهم. طلب دابا");
    expect(r.sentences).toEqual(["واش عييتي؟", "هاد الحامل واعر!", "الثمن غير مية و تسعة و تسعين درهم.", "طلب دابا."]);
    expect(r.gaps).toEqual([GAP.question, GAP.exclaim + GAP.newline, GAP.stop, 0]);
  });
  it("hésitation « ... » : la voix reste en suspens, silence plus long", () => {
    const r = normalizeDarija("وكاين واحد الحاجة... الثمن!");
    expect(r.sentences).toEqual(["وكاين واحد الحاجة،", "الثمن!"]);
    expect(r.gaps[0]).toBe(GAP.hesitation);
  });
  it("?! et !!! simplifiés", () => {
    expect(normalizeDarija("بصح؟! واو!!!").sentences).toEqual(["بصح؟", "واو!"]);
  });
  it("phrase longue coupée aux virgules, intonation qui continue", () => {
    const long = Array.from({ length: 6 }, (_, i) => `هادي جملة طويلة شوية رقم ${i + 1} ديال الوصف`).join("، ") + ".";
    const r = normalizeDarija(long);
    expect(r.sentences.length).toBeGreaterThan(1);
    expect(r.sentences[0].endsWith("،")).toBe(true);
    expect(r.gaps[0]).toBe(GAP.comma);
    expect(r.sentences.at(-1)!.endsWith(".")).toBe(true);
    expect(r.gaps.length).toBe(r.sentences.length);
  });
});

const S11 = `واش التيليفون ديالك ديما كيطيح ليك فالطوموبيل؟

دابا الحل وصل!

مع السبور الذكي ديال التيليفون، اللي فيه شارجور بلا خيط، غادي تسوق مرتاح وبلا صداع الراس!

غير كتقرب ليه التيليفون، السانسور الذكي كيحل ليك الدراعات، وكيسدهم بوحدو!

وزيد عليها، شارج رابيد بلا خيط، بلا كابلات وبلا تعقيدات!

وتقدر تثبتو بجوج طرق، يا إما فالكليم، يا إما فالباربريز!

والجي بي إس ديما قدام عينيك، باش تبقى مركز فالطريق!

كيشد التيليفون مزيان، حتى فالطريق اللي فيها الهزات!

والديزاين ديالو أنيق وعصري، وكيزيد لمسة زوينة لطوموبيلتك!

والأحسن من هادشي كامل؟

التوصيل لجميع أنحاء المغرب!

والخلاص حتى توصلك السلعة!

آش كتسنى؟

طلب السبور الذكي ديالك دابا، وسوق مرتاح وبلا صداع الراس!`;

describe("script S11 (test de référence)", () => {
  it("texte exact : chaque phrase lue telle qu'écrite, ponctuation respectée", () => {
    const r = normalizeDarija(S11, {}, { exact: true });
    expect(r.sentences).toHaveLength(14);
    expect(r.sentences[0]).toBe("واش التيليفون ديالك ديما كيطيح ليك فالطوموبيل؟");
    expect(r.sentences[9]).toBe("والأحسن من هادشي كامل؟");
    expect(r.sentences.at(-1)).toBe("طلب السبور الذكي ديالك دابا، وسوق مرتاح وبلا صداع الراس!");
    expect(r.adapted).toEqual([]);
    expect(r.guessed).toEqual([]);
    // mots d'origine française gardés tels quels
    for (const w of ["شارجور", "السانسور", "الكليم", "الباربريز", "الديزاين", "شارج رابيد", "الجي بي إس"])
      expect(r.text).toContain(w);
    expect(r.gaps[0]).toBe(GAP.question + GAP.newline);
  });
  it("même script en lettres latines mélangées : rendu lisible en arabe", () => {
    const r = normalizeDarija("Support S11 m3a chargeur sans fil, GPS w clim. Prix 199 DH!");
    expect(r.text).toContain("سبور إس حداش");
    expect(r.text).toContain("شارجور بلا خيط");
    expect(r.text).toContain("جي بي إس");
    expect(r.text).toContain("كليم");
    expect(r.text).toContain("مية و تسعة و تسعين درهم!");
  });
  it("sigles inconnus épelés, références produit lues", () => {
    expect(normalizeDarija("écran LCD").text).toBe("ايكران إل سي دي.");
    expect(normalizeDarija("A54").text).toBe("آ ربعة و خمسين.");
  });
  it("sans « texte exact », l'arabe classique est adapté", () => {
    expect(normalizeDarija("هذا رائع").adapted.length).toBe(2);
    expect(normalizeDarija("هذا رائع", {}, { exact: true }).text).toBe("هذا رائع.");
  });
});
