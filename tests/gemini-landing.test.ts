import { describe, it, expect, vi, afterEach } from "vitest";
import { geminiImage, geminiJson } from "../lib/gemini";
import { analyzePrompt, cleanAnalysis, cleanCopy, copyPrompt, imagePrompt } from "../lib/gemini-landing";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GEMINI_API_KEY;
});
const reply = (parts: any[]) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts } }] }), {
    headers: { "content-type": "application/json" },
  });

describe("Gemini (texte, images)", () => {
  it("JSON : modèle texte, photos jointes, réponse lue", async () => {
    process.env.GEMINI_API_KEY = "k";
    const f = vi.fn(async () => reply([{ text: '```json\n{"a":1}\n```' }]));
    vi.stubGlobal("fetch", f);
    const out = await geminiJson("prompt", [{ inline_data: { mime_type: "image/jpeg", data: "AAA" } }]);
    expect(out).toEqual({ a: 1 });
    const [url, init] = f.mock.calls[0] as any;
    expect(url).toContain("/models/gemini-3.6-flash:generateContent");
    const body = JSON.parse(init.body);
    expect(body.contents[0].parts[0].inline_data.mime_type).toBe("image/jpeg");
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });
  it("image : modèle Nano Banana, image renvoyée", async () => {
    process.env.GEMINI_API_KEY = "k";
    const f = vi.fn(async () => reply([{ text: "ok" }, { inlineData: { mimeType: "image/png", data: "iVBORw0K" } }]));
    vi.stubGlobal("fetch", f);
    const img = await geminiImage("scene", [], "4:5");
    expect(img.mime).toBe("image/png");
    const [url, init] = f.mock.calls[0] as any;
    expect(url).toContain("/models/gemini-nano-banana-2.1:generateContent");
    expect(JSON.parse(init.body).generationConfig).toEqual({
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "4:5" },
    });
  });
  it("sans clé / quota : messages clairs", async () => {
    await expect(geminiJson("x")).rejects.toThrow("GEMINI_API_KEY");
    process.env.GEMINI_API_KEY = "k";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 429 })),
    );
    await expect(geminiJson("x")).rejects.toThrow("Quota Gemini");
  });
});

describe("landing Gemini (prompts, nettoyage)", () => {
  const analysis = cleanAnalysis({
    product_type: "Support téléphone",
    niche: "Auto",
    audience: "Conducteurs",
    features: ["Charge sans fil", "", "Bras automatiques"],
    use_cases: ["Voiture"],
    objections: ["Tient-il sur les routes abîmées ?"],
    angle: "Fini le téléphone qui tombe",
    avoid: ["Charge en 10 min"],
  });
  it("analyse : listes nettoyées, prompt sans invention", () => {
    expect(analysis.features).toEqual(["Charge sans fil", "Bras automatiques"]);
    expect(analyzePrompt({ name: "S11", language: "ar-MA" })).toContain("N'invente aucune caractéristique");
  });
  it("textes : darija, caractéristiques réelles, interdits, pas de faux avis", () => {
    const p = copyPrompt({ name: "S11", price: 199, oldPrice: 299, language: "ar-MA", analysis, imageCount: 2 });
    expect(p).toContain("darija marocaine");
    expect(p).toContain("Charge sans fil ; Bras automatiques");
    expect(p).toContain("Interdit de promettre : Charge en 10 min");
    expect(p).toContain("Aucun faux avis");
    expect(p).toContain("au lieu de 299 DH");
  });
  it("réponse textes nettoyée (FAQ incomplète retirée, idées de photos limitées)", () => {
    const c = cleanCopy(
      {
        headline: "واش التيليفون ديما كيطيح؟",
        headline_b: "سوق مرتاح",
        faq: [{ question: "التوصيل؟", answer: "لجميع المدن" }, { question: "x" }],
        image_briefs: [{ kind: "hero", prompt: "in a car" }, { prompt: "" }],
      },
      "S11",
    );
    expect(c.faq).toHaveLength(1);
    expect(c.image_briefs).toEqual([{ kind: "hero", prompt: "in a car" }]);
    expect(cleanCopy({}, "S11").headline).toBe("S11");
  });
  it("photo : produit identique, pas de texte ni de logo", () => {
    const p = imagePrompt("on a car dashboard", "S11");
    expect(p).toContain("EXACTLY identical");
    expect(p).toContain("any text");
  });
});
