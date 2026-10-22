"use client";
// Enregistrer une voix pub personnalisée : 4 à 12 s lues avec le ton d'une pub, depuis le micro ou un fichier.
import React, { useState } from "react";
import { toBase64, useRecorder } from "./useRecorder";

const SAMPLE =
  "واش باغي حاجة زوينة وبثمن مناسب؟ هاد المنتوج غادي يعجبك بزاف! الجودة عالية، والتوصيل لجميع المدن. طلب دابا!";
const MAX_S = 12;

export interface CustomVoice {
  id: string;
  name: string;
  gender: "m" | "f";
  ref_text: string;
  seconds: number | null;
}

export default function VoiceRecorder({
  onSaved,
  onClose,
}: {
  onSaved: (v: CustomVoice) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(SAMPLE);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("m");
  const [consent, setConsent] = useState(false);
  const r = useRecorder(MAX_S);
  const { blob, url } = r;
  const rec = r.seconds;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string[]>([]);
  const take = r.take;
  const start = r.start;
  const stop = r.stop;

  async function save() {
    if (!blob) return;
    setBusy(true);
    setMsg([]);
    try {
      const r = await fetch("/api/voiceover/voices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, gender, text, consent, audio: await toBase64(blob) }),
      });
      const x = await r.json().catch(() => ({}));
      if (r.status === 422) setMsg(x.problems || ["Enregistrement à refaire."]);
      else if (!r.ok) setMsg([x.error || "Enregistrement impossible, réessaie."]);
      else onSaved(x.voice);
    } catch {
      setMsg(["Connexion perdue, réessaie."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vo-rec">
      <div className="vo-rec-head">
        <b>Ma voix pub</b>
        <button type="button" className="vo-link" onClick={onClose}>
          Fermer
        </button>
      </div>
      <p>
        Lis ce texte <strong>comme dans une vraie pub</strong> : souriant, énergique, en darija naturelle. Toutes tes
        voix off reprendront ce ton. Pièce calme, téléphone à 20 cm, 4 à 12 secondes.
      </p>
      <label>
        Texte lu (il doit correspondre exactement à l’enregistrement)
        <textarea dir="rtl" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="vo-rec-actions">
        {rec ? (
          <button type="button" className="vo-small vo-rec-on" onClick={stop}>
            ■ Arrêter ({Math.floor(rec)} / {MAX_S} s)
          </button>
        ) : (
          <button type="button" className="vo-small" onClick={start}>
            ● {blob ? "Recommencer" : "Enregistrer"}
          </button>
        )}
        <label className="vo-link vo-file">
          ou importer un fichier
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) take(f);
            }}
          />
        </label>
      </div>
      {url ? <audio controls src={url} /> : null}
      <div className="vo-row">
        <label>
          Nom de la voix
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Mohamed pub" maxLength={40} />
        </label>
        <fieldset>
          <legend>Voix</legend>
          <div className="vo-seg vo-seg-2">
            <button type="button" className={gender === "m" ? "on" : ""} onClick={() => setGender("m")}>
              Homme
            </button>
            <button type="button" className={gender === "f" ? "on" : ""} onClick={() => setGender("f")}>
              Femme
            </button>
          </div>
        </fieldset>
      </div>
      <label className="vo-check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        C’est ma voix, ou la personne enregistrée m’a donné son accord pour l’utiliser dans mes pubs.
      </label>
      {r.error ? <p className="vo-warn">{r.error}</p> : null}
      {msg.length ? (
        <ul className="vo-warn vo-rec-msg">
          {msg.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : null}
      <button type="button" className="vo-primary" disabled={!blob || !consent || busy || !!rec} onClick={save}>
        {busy ? "Vérification de l’enregistrement…" : "Enregistrer cette voix"}
      </button>
    </div>
  );
}
