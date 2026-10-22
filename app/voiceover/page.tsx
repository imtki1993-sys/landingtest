"use client";
// Voix off darija : script écrit par Meta AI, texte préparé pour la voix, voix marocaine (Habibi-TTS / Azure).
import React, { useEffect, useMemo, useState } from "react";
import SaaSSidebar from "../components/SaaSSidebar";
import SaaSTopbar from "../components/SaaSTopbar";
import { normalizeDarija, type Lexicon } from "../../lib/darija-text";

interface Voice {
  id: string;
  label: string;
  gender: "f" | "m";
  provider: "habibi" | "azure";
  hint: string;
}
interface Item {
  id: string;
  title: string | null;
  script: string;
  voice: string;
  provider: string;
  speed: number;
  seconds: number | null;
  created_at: string;
  parent_id: string | null;
  preset: string | null;
  exact: boolean;
  settings: { pause?: string; target_seconds?: number | null; redone?: number };
  sentences: string[] | null;
  has_wav: boolean;
  can_redo: boolean;
  quality: { clipped?: number; longest_silence?: number } | null;
  /** lecture (lien signé après vérification du compte) */
  audio: string;
}
interface Preset {
  id: string;
  label: string;
  hint: string;
  voice: string;
  speed: number;
  pause: string;
  tone: string;
  angle: string;
  seconds: number;
}
interface Product {
  id: string;
  name: string;
  price: number;
}

const DURATIONS = [15, 30, 45, 60];
const TONES: [string, string][] = [
  ["energique", "Énergique"],
  ["chaleureux", "Chaleureux"],
  ["premium", "Haut de gamme"],
  ["drole", "Drôle"],
  ["temoignage", "Témoignage client"],
  ["ugc", "Créateur TikTok (UGC)"],
];
const ANGLES: [string, string][] = [
  ["probleme", "Problème → solution"],
  ["offre", "Offre limitée"],
  ["benefices", "3 bénéfices"],
  ["demonstration", "Démonstration"],
];
const AUDIENCES: [string, string][] = [
  ["", "Tout le monde"],
  ["femmes", "Femmes"],
  ["hommes", "Hommes"],
  ["parents", "Parents"],
  ["jeunes", "Jeunes (18-30 ans)"],
];

const PAUSE_OPTIONS: [string, string][] = [
  ["courtes", "Courtes"],
  ["normales", "Normales"],
  ["longues", "Longues"],
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("fr-MA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtSec = (s: number | null) =>
  s == null ? "" : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, { cache: "no-store", ...init }).catch(() => null);
  const x = await r?.json().catch(() => ({}));
  if (!r?.ok) throw new Error(x?.error || "Erreur, réessaie.");
  return x;
}

export default function VoiceoverPage() {
  const [d, setD] = useState<{
    installed: boolean;
    providers: string[];
    voices: Voice[];
    items?: Item[];
    presets?: Preset[];
    studio?: boolean;
    lexicon?: Lexicon;
    lexiconInstalled?: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  // 1. produit et consignes
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [description, setDescription] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [tone, setTone] = useState("energique");
  const [angle, setAngle] = useState("probleme");
  const [audience, setAudience] = useState("");
  const [notes, setNotes] = useState("");
  const [writing, setWriting] = useState(false);
  // 2. script
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [spokenEdit, setSpokenEdit] = useState<string | null>(null);
  const [showSpoken, setShowSpoken] = useState(false);
  // 3. voix
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(1);
  const [pause, setPause] = useState("normales");
  const [fit, setFit] = useState(true);
  const [lexicon, setLexicon] = useState<Lexicon>({});
  const [rows, setRows] = useState<[string, string][]>([]);
  const [showLex, setShowLex] = useState(false);
  const [lexState, setLexState] = useState<"" | "saving" | "saved">("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  // studio : style de pub, texte exact, phrase régénérée, comparaison
  const [preset, setPreset] = useState("");
  const [exact, setExact] = useState(false);
  const [redoing, setRedoing] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    api("/api/voiceover")
      .then((x) => {
        setD(x);
        setLexicon(x.lexicon || {});
        setRows(Object.entries(x.lexicon || {}));
        const first = (x.voices as Voice[]).find((v) => x.providers.includes(v.provider));
        if (first) setVoice(first.id);
      })
      .catch((e) => setError(e.message));
    api("/api/products?limit=100")
      .then((x) => setProducts(x.products || []))
      .catch(() => {});
  }, []);

  const spoken = useMemo(
    () => normalizeDarija(spokenEdit ?? script, lexicon, { exact }),
    [script, spokenEdit, lexicon, exact],
  );
  const items = d?.items || [];
  const itemById = new Map(items.map((i) => [i.id, i]));
  const presetById = new Map((d?.presets || []).map((p) => [p.id, p]));

  function applyPreset(p: Preset) {
    setPreset(p.id);
    setTone(p.tone);
    setAngle(p.angle);
    setSeconds(p.seconds);
    setSpeed(p.speed);
    setPause(p.pause);
    if (d?.voices.some((v) => v.id === p.voice && d.providers.includes(v.provider))) setVoice(p.voice);
  }
  const voices = d?.voices || [];
  const voiceById = new Map(voices.map((v) => [v.id, v]));
  const ready = (v: Voice) => !!d?.providers.includes(v.provider);
  const noProvider = !!d && !d.providers.length;
  const tooLong = spoken.text.length > 1500;

  function pickProduct(id: string) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setName(p.name);
      setPrice(String(p.price || ""));
    }
  }

  async function writeScript(e?: React.FormEvent) {
    e?.preventDefault();
    setWriting(true);
    setError("");
    try {
      const x = await api("/api/voiceover/script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_id: productId || undefined,
          name,
          price: Number(price) || undefined,
          oldPrice: Number(oldPrice) || undefined,
          description,
          seconds,
          tone,
          angle,
          audience: AUDIENCES.find(([k]) => k === audience)?.[1] || "",
          notes,
          preset: preset || undefined,
        }),
      });
      setTitle(x.title || name);
      setScript(x.script);
      setSpokenEdit(null);
      setResult(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWriting(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError("");
    setResult(null);
    try {
      const x = await api("/api/voiceover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          script,
          spoken: spokenEdit ?? undefined,
          voice,
          speed,
          pause,
          target_seconds: fit ? seconds : undefined,
          exact,
          preset: preset || undefined,
          title: title || name,
          product_id: productId || undefined,
        }),
      });
      setResult(x.item);
      setD((v) => (v ? { ...v, items: [x.item, ...(v.items || [])] } : v));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function redo(item: Item, index: number, text?: string) {
    setRedoing(index);
    setError("");
    try {
      const x = await api("/api/voiceover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "redo", id: item.id, index, text }),
      });
      setResult(x.item);
      setEditIdx(null);
      setD((v) => (v ? { ...v, items: [x.item, ...(v.items || [])] } : v));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRedoing(null);
    }
  }

  function toggleCompare(id: string) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.slice(-1), id]));
  }

  function addWord(word = "", say = "") {
    setShowLex(true);
    setLexState("");
    setRows((r) => (word && r.some(([w]) => w === word) ? r : [...r, [word, say]]));
  }

  async function saveLexicon() {
    setLexState("saving");
    setError("");
    const words = Object.fromEntries(
      rows.filter(([w, v]) => w.trim() && v.trim()).map(([w, v]) => [w.trim(), v.trim()]),
    );
    try {
      const x = await api("/api/voiceover", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lexicon: words }),
      });
      setLexicon(x.lexicon);
      setRows(Object.entries(x.lexicon));
      setLexState("saved");
    } catch (err: any) {
      setError(err.message);
      setLexState("");
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette voix off ?")) return;
    try {
      await api("/api/voiceover?id=" + id, { method: "DELETE" });
      setD((v) => (v ? { ...v, items: (v.items || []).filter((i) => i.id !== id) } : v));
      if (result?.id === id) setResult(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="dash-shell has-shared-topbar">
      <SaaSTopbar />
      <SaaSSidebar />
      <section className="dash-content vo-page">
        <header className="dash-header">
          <div>
            <span className="eyebrow">VOIX OFF</span>
            <h1>Voix off darija</h1>
            <p>Un script de pub écrit par l’IA, lu par une voix marocaine. Prêt pour Facebook et TikTok.</p>
          </div>
        </header>

        {error ? <div className="dash-error vo-error">{error}</div> : null}
        {d && !d.installed ? (
          <div className="vo-note">
            <b>Activation nécessaire</b>
            <span>Lance le script SQL « voiceovers » dans Supabase pour enregistrer l’historique des voix off.</span>
          </div>
        ) : null}
        {noProvider ? (
          <div className="vo-note">
            <b>La voix n’est pas encore branchée</b>
            <span>
              Tu peux déjà écrire et préparer tes scripts. La génération de la voix s’activera dès que le service de
              voix darija sera en ligne.
            </span>
          </div>
        ) : null}

        {d?.presets?.length ? (
          <section className="vo-presets" aria-label="Style de pub">
            <span>Style de pub</span>
            <div>
              {d.presets.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={"vo-preset" + (preset === p.id ? " on" : "")}
                  aria-pressed={preset === p.id}
                  onClick={() => applyPreset(p)}
                >
                  <b>{p.label}</b>
                  <small>{p.hint}</small>
                  <em>
                    {voiceById.get(p.voice)?.label || p.voice} · {p.speed.toFixed(2).replace(/0$/, "")}× · {p.seconds} s
                  </em>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="vo-grid">
          {/* 1. Produit */}
          <form className="vo-card" onSubmit={writeScript}>
            <h2>
              <i>1</i> Le produit
            </h2>
            <label>
              Choisir dans mes produits
              <select value={productId} onChange={(e) => pickProduct(e.target.value)}>
                <option value="">— Saisir à la main —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nom du produit
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex. Support téléphone magnétique"
              />
            </label>
            <div className="vo-row">
              <label>
                Prix
                <span className="vo-money">
                  <input
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="199"
                  />
                  DH
                </span>
              </label>
              <label>
                Prix barré
                <span className="vo-money">
                  <input
                    inputMode="decimal"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="299"
                  />
                  DH
                </span>
              </label>
            </div>
            {!productId ? (
              <label>
                Ce que fait le produit
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Points forts, à qui il sert, ce qu’on voit dans la vidéo…"
                />
              </label>
            ) : null}
            <fieldset>
              <legend>Durée</legend>
              <div className="vo-seg">
                {DURATIONS.map((s) => (
                  <button type="button" key={s} className={seconds === s ? "on" : ""} onClick={() => setSeconds(s)}>
                    {s} s
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="vo-row">
              <label>
                Ton
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Angle
                <select value={angle} onChange={(e) => setAngle(e.target.value)}>
                  {ANGLES.map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Public
              <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                {AUDIENCES.map(([k, l]) => (
                  <option key={k || "all"} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Consignes <small>(facultatif)</small>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex. insister sur la livraison en 24 h"
              />
            </label>
            <button type="submit" className="vo-primary" disabled={writing || !name.trim()}>
              {writing ? "L’IA écrit le script…" : script ? "Réécrire le script" : "Écrire le script avec l’IA"}
            </button>
          </form>

          {/* 2. Script + 3. Voix */}
          <div className="vo-col">
            <div className="vo-card">
              <h2>
                <i>2</i> Le script
                {script ? (
                  <span className="vo-meta">
                    ≈ {spoken.seconds} s · {spoken.sentences.length} phrase{spoken.sentences.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </h2>
              {script ? (
                <>
                  <input
                    className="vo-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de la voix off"
                  />
                  <textarea
                    className="vo-script"
                    dir="rtl"
                    rows={9}
                    value={script}
                    onChange={(e) => {
                      setScript(e.target.value);
                      setSpokenEdit(null);
                    }}
                  />
                  <p className="vo-hint">
                    La voix suit ta ponctuation : <b>؟</b> question (la voix monte), <b>!</b> enthousiasme, <b>،</b>{" "}
                    respiration, <b>…</b> suspense avant le prix, retour à la ligne = petite pause.
                  </p>
                  {spoken.guessed.length ? (
                    <div className="vo-warn">
                      Mots en lettres latines lus approximativement. Indique comment les dire :
                      <span className="vo-chips">
                        {spoken.guessed.map((g) => {
                          const [w, ar] = g.split(" → ");
                          return (
                            <button type="button" key={g} onClick={() => addWord(w, ar)}>
                              {w} <small dir="rtl">{ar}</small>
                            </button>
                          );
                        })}
                      </span>
                    </div>
                  ) : null}
                  {spoken.adapted.length ? (
                    <p className="vo-info">
                      Arabe classique remplacé par la darija pour un accent marocain :{" "}
                      <span dir="rtl">{spoken.adapted.map((x) => x.replace(" → ", " ← ")).join(" · ")}</span>
                    </p>
                  ) : null}
                  {tooLong ? <p className="vo-warn">Texte trop long pour une voix off (60 s au maximum).</p> : null}
                  <label className="vo-check">
                    <input type="checkbox" checked={exact} onChange={(e) => setExact(e.target.checked)} />
                    Texte exact : lire mon script tel quel, sans remplacer de mots (seuls chiffres, prix et sigles sont
                    écrits comme ils se disent)
                  </label>
                  <button type="button" className="vo-link" onClick={() => setShowSpoken((v) => !v)}>
                    {showSpoken ? "Masquer le texte lu par la voix" : "Voir le texte exact lu par la voix"}
                  </button>
                  <button type="button" className="vo-link" onClick={() => setShowLex((v) => !v)}>
                    Dictionnaire de prononciation ({Object.keys(lexicon).length} mot
                    {Object.keys(lexicon).length > 1 ? "s" : ""})
                  </button>
                  {showLex ? (
                    <div className="vo-spoken vo-lex">
                      <p>
                        Un mot mal prononcé ? Écris-le tel qu’il apparaît dans le script, puis comment le dire en
                        darija. Il sera corrigé dans toutes tes voix off.
                      </p>
                      {d?.lexiconInstalled === false ? (
                        <p className="vo-warn">
                          Exécute d’abord la migration « voiceover_lexicon » dans Supabase pour enregistrer le
                          dictionnaire.
                        </p>
                      ) : null}
                      {rows.map(([w, v], i) => (
                        <div className="vo-lex-row" key={i}>
                          <input
                            value={w}
                            placeholder="Mot écrit (ex. MagSafe)"
                            aria-label="Mot écrit"
                            onChange={(e) => {
                              setLexState("");
                              setRows((r) => r.map((x, j) => (j === i ? [e.target.value, x[1]] : x)));
                            }}
                          />
                          <input
                            dir="rtl"
                            value={v}
                            placeholder="كيفاش يتقرا (ماك سيف)"
                            aria-label="Prononciation"
                            onChange={(e) => {
                              setLexState("");
                              setRows((r) => r.map((x, j) => (j === i ? [x[0], e.target.value] : x)));
                            }}
                          />
                          <button
                            type="button"
                            aria-label="Retirer ce mot"
                            onClick={() => {
                              setLexState("");
                              setRows((r) => r.filter((_, j) => j !== i));
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className="vo-lex-actions">
                        <button type="button" className="vo-link" onClick={() => addWord()}>
                          + Ajouter un mot
                        </button>
                        <button
                          type="button"
                          className="vo-small"
                          disabled={lexState === "saving"}
                          onClick={saveLexicon}
                        >
                          {lexState === "saving"
                            ? "Enregistrement…"
                            : lexState === "saved"
                              ? "Enregistré"
                              : "Enregistrer"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {showSpoken ? (
                    <div className="vo-spoken">
                      <p>Chiffres, prix et mots latins sont écrits comme ils se prononcent. Tu peux corriger ici.</p>
                      <textarea
                        dir="rtl"
                        rows={6}
                        value={spokenEdit ?? spoken.text}
                        onChange={(e) => setSpokenEdit(e.target.value)}
                      />
                      {spokenEdit !== null ? (
                        <button type="button" className="vo-link" onClick={() => setSpokenEdit(null)}>
                          Revenir au texte préparé automatiquement
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="vo-empty">
                  Remplis le produit à gauche puis clique sur « Écrire le script avec l’IA ». Tu peux aussi
                  <button type="button" className="vo-link" onClick={() => setScript("اكتب السكريبت ديالك هنا…")}>
                    écrire ton propre script
                  </button>
                  .
                </div>
              )}
            </div>

            <div className="vo-card">
              <h2>
                <i>3</i> La voix
              </h2>
              {(["f", "m"] as const).map((g) => (
                <div key={g} className="vo-voices">
                  <span>{g === "f" ? "Voix de femme" : "Voix d’homme"}</span>
                  <div>
                    {voices
                      .filter((v) => v.gender === g)
                      .map((v) => (
                        <button
                          type="button"
                          key={v.id}
                          className={"vo-voice" + (voice === v.id ? " on" : "") + (ready(v) ? "" : " off")}
                          onClick={() => ready(v) && setVoice(v.id)}
                          disabled={!ready(v)}
                          title={ready(v) ? v.hint : "Pas encore disponible"}
                        >
                          <b>{v.label}</b>
                          <small>{ready(v) ? v.hint.split(" · ")[1] || v.hint : "bientôt"}</small>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              <fieldset>
                <legend>Pauses entre les phrases</legend>
                <div className="vo-seg vo-seg-3">
                  {PAUSE_OPTIONS.map(([k, l]) => (
                    <button type="button" key={k} className={pause === k ? "on" : ""} onClick={() => setPause(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="vo-check">
                <input type="checkbox" checked={fit} onChange={(e) => setFit(e.target.checked)} />
                Tenir dans {seconds} s (accélère légèrement la voix si elle dépasse, sans changer le timbre)
              </label>
              <label className="vo-speed">
                Vitesse <b>{speed.toFixed(2).replace(/0$/, "")}×</b>
                <input
                  type="range"
                  min={0.8}
                  max={1.2}
                  step={0.05}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </label>
              <button
                type="button"
                className="vo-primary"
                disabled={generating || !script.trim() || !voice || noProvider || tooLong}
                onClick={generate}
              >
                {generating ? "Génération de la voix… (20 à 60 s)" : "Générer la voix off"}
              </button>
              {result ? (
                <div className="vo-result">
                  {result.parent_id && itemById.get(result.parent_id) ? (
                    <div className="vo-ab">
                      <div>
                        <span>Avant</span>
                        <audio controls preload="none" src={itemById.get(result.parent_id)!.audio} />
                      </div>
                      <div>
                        <span>
                          Après{result.settings.redone != null ? ` (passage ${result.settings.redone + 1} refait)` : ""}
                        </span>
                        <audio controls autoPlay src={result.audio} />
                      </div>
                    </div>
                  ) : (
                    <audio controls autoPlay src={result.audio} />
                  )}
                  {result.seconds && result.seconds > seconds * 1.1 ? (
                    <p className="vo-warn">
                      La voix dure {fmtSec(result.seconds)} pour une pub de {seconds} s : raccourcis le script d’une
                      phrase ou monte la vitesse.
                    </p>
                  ) : null}
                  {result.quality?.clipped ? (
                    <p className="vo-warn">Son saturé par endroits : régénère la phrase concernée.</p>
                  ) : null}
                  <div className="vo-downloads">
                    <a href={`${result.audio}&dl=1`} className="vo-small">
                      Télécharger MP3
                    </a>
                    {result.has_wav ? (
                      <a href={`${result.audio}&format=wav&dl=1`} className="vo-small vo-ghost">
                        WAV (montage vidéo)
                      </a>
                    ) : null}
                  </div>
                  {result.can_redo && result.sentences ? (
                    <div className="vo-lines">
                      <p>Un passage sonne mal ? Refais seulement celui-là (le reste ne change pas).</p>
                      <ol>
                        {result.sentences.map((line, i) => (
                          <li key={i}>
                            {editIdx === i ? (
                              <input
                                dir="rtl"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                aria-label={`Texte du passage ${i + 1}`}
                              />
                            ) : (
                              <span dir="rtl">{line}</span>
                            )}
                            <div>
                              {editIdx === i ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={redoing !== null || !editText.trim()}
                                    onClick={() => redo(result, i, editText)}
                                  >
                                    {redoing === i ? "…" : "Refaire avec ce texte"}
                                  </button>
                                  <button type="button" className="vo-ghost" onClick={() => setEditIdx(null)}>
                                    Annuler
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button type="button" disabled={redoing !== null} onClick={() => redo(result, i)}>
                                    {redoing === i ? "Nouvelle prise…" : "↻ Refaire"}
                                  </button>
                                  <button
                                    type="button"
                                    className="vo-ghost"
                                    disabled={redoing !== null}
                                    onClick={() => {
                                      setEditIdx(i);
                                      setEditText(line);
                                    }}
                                  >
                                    Modifier
                                  </button>
                                </>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : d?.studio === false ? (
                    <p className="vo-info">
                      Pour refaire une seule phrase et télécharger en WAV, exécute la migration « voiceover_studio »
                      dans Supabase.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {items.length ? (
          <section className="vo-card vo-history">
            <h2>
              Mes voix off
              <span className="vo-meta">Coche 2 versions pour les comparer</span>
            </h2>
            {compare.length === 2 ? (
              <div className="vo-ab vo-compare">
                {compare.map((id, k) => {
                  const it = itemById.get(id);
                  return it ? (
                    <div key={id}>
                      <span>
                        {k ? "B" : "A"} · {it.title || "Voix off"} · {voiceById.get(it.voice)?.label || it.voice}
                        {it.preset ? ` · ${presetById.get(it.preset)?.label || it.preset}` : ""} · {it.speed}×
                      </span>
                      <audio controls preload="none" src={it.audio} />
                    </div>
                  ) : null;
                })}
                <button type="button" className="vo-link" onClick={() => setCompare([])}>
                  Fermer la comparaison
                </button>
              </div>
            ) : null}
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  <label className="vo-pick" title="Comparer">
                    <input
                      type="checkbox"
                      checked={compare.includes(it.id)}
                      onChange={() => toggleCompare(it.id)}
                      aria-label={`Comparer ${it.title || "cette voix off"}`}
                    />
                  </label>
                  <div className="vo-h-info">
                    <b>{it.title || "Voix off"}</b>
                    <small>
                      {voiceById.get(it.voice)?.label || it.voice} · {fmtSec(it.seconds)} · {fmtDate(it.created_at)}
                      {it.parent_id && it.settings.redone != null ? ` · passage ${it.settings.redone + 1} refait` : ""}
                    </small>
                  </div>
                  <audio controls preload="none" src={it.audio} />
                  <div className="vo-h-actions">
                    <a href={`${it.audio}&dl=1`}>MP3</a>
                    {it.has_wav ? <a href={`${it.audio}&format=wav&dl=1`}>WAV</a> : null}
                    {it.can_redo ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResult(it);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Phrases
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setScript(it.script);
                        setTitle(it.title || "");
                        setExact(it.exact);
                        setSpokenEdit(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Reprendre
                    </button>
                    <button type="button" className="danger" onClick={() => remove(it.id)}>
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    </main>
  );
}
