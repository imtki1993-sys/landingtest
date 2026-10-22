import { describe, it, expect, vi, afterEach } from "vitest";
import { findAudio, geminiStyle, pcmFromAudio, pcmToMp3 } from "../lib/gemini-tts";
import { synthesize, wavFromPcm, VOICES, availableProviders } from "../lib/voiceover";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GEMINI_API_KEY;
});

const tone = (seconds: number) => {
  const pcm = Buffer.alloc(seconds * 24_000 * 2);
  for (let i = 0; i < pcm.length / 2; i++)
    pcm.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 220 * i) / 24_000)), i * 2);
  return pcm;
};

describe("Gemini TTS", () => {
  it("consigne : darija marocaine + ton choisi", () => {
    const s = geminiStyle({ tone: "premium", pause: "longues", speed: 0.9 });
    expect(s).toContain("Moroccan Darija");
    expect(s).toContain("Never Modern Standard Arabic");
    expect(s).toContain("medium-slow");
    expect(s).toContain("breathing pauses");
    expect(s).toContain("slower");
  });
  it("audio trouvé dans la réponse (Interactions ou generateContent)", () => {
    const data = "A".repeat(200);
    expect(findAudio({ steps: [{ content: [{ type: "audio", mime_type: "audio/wav", data }] }] })?.data).toBe(data);
    expect(
      findAudio({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "audio/L16", data } }] } }] })?.mime,
    ).toBe("audio/L16");
    expect(findAudio({ steps: [{ content: [{ type: "text", text: "x" }] }] })).toBeNull();
  });
  it("WAV → PCM, PCM → MP3", () => {
    const pcm = tone(1);
    expect(pcmFromAudio(wavFromPcm(pcm)).equals(pcm)).toBe(true);
    expect(pcmFromAudio(pcm).equals(pcm)).toBe(true);
    const mp3 = pcmToMp3(pcm);
    expect(mp3.length).toBeGreaterThan(10_000);
    expect(mp3[0] === 0xff || mp3.subarray(0, 3).toString() === "ID3").toBe(true);
  });
  it("voix Orus : requête Interactions, script d'un bloc, MP3 + WAV", async () => {
    process.env.GEMINI_API_KEY = "g-key";
    expect(availableProviders()).toContain("gemini");
    expect(VOICES.find((v) => v.id === "gemini-orus")?.label).toBe("Orus");
    const wav = wavFromPcm(tone(2));
    const f = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            steps: [{ content: [{ type: "audio", mime_type: "audio/wav", data: wav.toString("base64") }] }],
          }),
          {
            headers: { "content-type": "application/json" },
          },
        ),
    );
    vi.stubGlobal("fetch", f);
    const out = await synthesize(["واش عييتي؟", "دابا الحل وصل!"], "gemini-orus", { style: "STYLE" });
    const [url, init] = f.mock.calls[0] as any;
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(init.headers["x-goog-api-key"]).toBe("g-key");
    const body = JSON.parse(init.body);
    expect(body.generation_config.speech_config[0].voice).toBe("Orus");
    expect(body.input[0].content[0].text).toBe("واش عييتي؟\nدابا الحل وصل!");
    expect(body.input[0].content[0].annotations[0].style).toBe("STYLE");
    expect(out.seconds).toBe(2);
    expect(out.mime).toBe("audio/mpeg");
    expect(out.wav?.subarray(0, 4).toString()).toBe("RIFF");
  });
  it("clé refusée : message clair", async () => {
    process.env.GEMINI_API_KEY = "bad";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { message: "API key not valid" } }), { status: 400 })),
    );
    await expect(synthesize(["طلب."], "gemini-orus")).rejects.toThrow("GEMINI_API_KEY");
  });
});

describe("quota voix Gemini", () => {
  it("429 → modèle de voix suivant ; 429 partout → message clair", async () => {
    process.env.GEMINI_API_KEY = "k";
    const wav = wavFromPcm(tone(1));
    const f = vi.fn(async (_u: string, init: any) =>
      JSON.parse(init.body).model === "gemini-3.8-flash-tts"
        ? new Response(JSON.stringify({ error: { message: "quota" } }), { status: 429 })
        : new Response(
            JSON.stringify({ steps: [{ content: [{ mime_type: "audio/wav", data: wav.toString("base64") }] }] }),
          ),
    );
    vi.stubGlobal("fetch", f);
    const out = await synthesize(["طلب."], "gemini-orus");
    expect(out.seconds).toBe(1);
    expect(JSON.parse((f.mock.calls[1] as any)[1].body).model).toBe("gemini-3.8-flash-lite-tts");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 429 })),
    );
    await expect(synthesize(["طلب."], "gemini-orus")).rejects.toThrow("Autres voix");
  });
});
