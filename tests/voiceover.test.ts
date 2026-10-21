import { describe, it, expect, vi, afterEach } from "vitest";
import { availableProviders, scriptPrompt, synthesize, VOICES } from "../lib/voiceover";

const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.unstubAllGlobals();
});

describe("voix off : fournisseurs", () => {
  it("aucun fournisseur configuré : message clair, pas d'appel réseau", async () => {
    delete process.env.TTS_SERVICE_URL;
    delete process.env.AZURE_SPEECH_KEY;
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(availableProviders()).toEqual([]);
    await expect(synthesize(["سلام."], "doda-f1")).rejects.toThrow("pas encore branché");
    expect(f).not.toHaveBeenCalled();
  });
  it("Habibi : phrases, voix et vitesse envoyées au service avec la clé", async () => {
    process.env.TTS_SERVICE_URL = "https://tts.example.com/";
    process.env.TTS_SERVICE_TOKEN = " secret\n";
    const f = vi.fn(
      async () =>
        new Response(new Uint8Array([1, 2, 3]), {
          headers: { "content-type": "audio/mpeg", "x-audio-seconds": "12.5" },
        }),
    );
    vi.stubGlobal("fetch", f);
    const out = await synthesize(["جملة لولى.", "جملة تانية."], "doda-m2", {
      speed: 2,
      pause: "longues",
      targetSeconds: 30,
    });
    const [url, init] = f.mock.calls[0] as any;
    expect(url).toBe("https://tts.example.com/synthesize");
    expect(init.headers.authorization).toBe("Bearer secret");
    expect(JSON.parse(init.body)).toEqual({
      sentences: ["جملة لولى.", "جملة تانية."],
      voice: "doda-m2",
      speed: 1.3,
      pause: 1.5,
      target_seconds: 30,
      gaps: null,
      expressive: true,
    });
    expect(out).toMatchObject({ mime: "audio/mpeg", seconds: 12.5 });
    expect(out.audio.length).toBe(3);
  });
  it("Azure : voix marocaine, texte échappé, pauses entre phrases", async () => {
    process.env.AZURE_SPEECH_KEY = "k";
    process.env.AZURE_SPEECH_REGION = "westeurope";
    const f = vi.fn(async () => new Response(new Uint8Array([9])));
    vi.stubGlobal("fetch", f);
    await synthesize(["واش <نتا> & هي؟", "يالاه."], "azure-mouna", { speed: 0.9 });
    const [url, init] = f.mock.calls[0] as any;
    expect(url).toBe("https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1");
    expect(init.body).toContain('voice name="ar-MA-MounaNeural"');
    expect(init.body).toContain("&lt;نتا&gt; &amp;");
    expect(init.body).toContain('<break time="350ms"/>');
    expect(init.body).toContain('rate="-10%"');
  });
  it("7 voix DODa + 2 Azure", () => {
    expect(VOICES.filter((v) => v.provider === "habibi")).toHaveLength(7);
    expect(VOICES.filter((v) => v.provider === "azure")).toHaveLength(2);
  });
});

describe("prompt du script", () => {
  it("durée en mots, produit, prix, règles darija", () => {
    const p = scriptPrompt({
      name: "Support magnétique",
      price: 199,
      oldPrice: 299,
      seconds: 30,
      tone: "energique",
      angle: "offre",
    });
    expect(p).toContain("environ 72 mots");
    expect(p).toContain("Support magnétique");
    expect(p).toContain("199 درهم");
    expect(p).toContain("PAS de mots en lettres latines");
  });
});

describe("pauses selon la ponctuation", () => {
  it("Azure : un silence par phrase d'après les gaps", async () => {
    process.env.AZURE_SPEECH_KEY = "k";
    process.env.AZURE_SPEECH_REGION = "westeurope";
    const f = vi.fn(async () => new Response(new Uint8Array([9])));
    vi.stubGlobal("fetch", f);
    await synthesize(["واش؟", "واو!", "طلب."], "azure-jamal", { gaps: [0.5, 0.38, 0], pause: "longues" });
    const body = (f.mock.calls[0] as any)[1].body as string;
    expect(body).toContain('واش؟<break time="750ms"/>واو!<break time="570ms"/>طلب.');
  });
});
