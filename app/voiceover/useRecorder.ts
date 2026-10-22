"use client";
// Enregistrement au micro (MediaRecorder), arrêt automatique à `maxSeconds`, ou fichier importé.
import { useEffect, useRef, useState } from "react";

export function useRecorder(maxSeconds: number) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [seconds, setSeconds] = useState(0); // durée écoulée pendant l'enregistrement, 0 = arrêté
  const [error, setError] = useState("");
  const media = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      media.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);

  function take(b: Blob | null) {
    setBlob(b);
    setUrl(b ? URL.createObjectURL(b) : "");
    setError("");
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setSeconds(0);
    if (media.current?.state === "recording") media.current.stop();
  }

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const chunks: Blob[] = [];
      const m = new MediaRecorder(stream);
      m.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        take(new Blob(chunks, { type: m.mimeType || "audio/webm" }));
      };
      media.current = m;
      m.start();
      const t0 = Date.now();
      setSeconds(0.1);
      timer.current = setInterval(() => {
        const s = (Date.now() - t0) / 1000;
        setSeconds(s);
        if (s >= maxSeconds) stop();
      }, 200);
    } catch {
      setError("Micro inaccessible : autorise le micro dans ton navigateur, ou importe un fichier audio.");
    }
  }

  return { blob, url, recording: seconds > 0, seconds, error, start, stop, take };
}

export const toBase64 = (blob: Blob) =>
  new Promise<string>((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] || "");
    r.onerror = () => ko(r.error);
    r.readAsDataURL(blob);
  });
