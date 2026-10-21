"""Prépare les 7 voix de référence à partir du corpus DODa (atlasia/DODa-audio-dataset).

DODa : 12 743 phrases en darija enregistrées en studio par 7 comédiens marocains (4 femmes, 3 hommes).
Pour chaque comédien, on garde l'extrait le plus adapté au clonage de voix : 5 à 9 secondes, phrase complète
en alphabet arabe, volume régulier. Sortie : voices/<id>.wav (24 kHz mono) + voices/voices.json.

Usage : python prepare_voices.py --out voices
"""

from __future__ import annotations

import argparse
import io
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

DATASET = "atlasia/DODa-audio-dataset"
# Répartition des enregistrements par comédien (fiche du dataset)
RANGES = [
    (0, 999, "F1"), (1000, 1999, "M3"), (2000, 2730, "F2"), (2731, 2800, "M1"), (2801, 2999, "M2"),
    (3000, 3999, "M2"), (4000, 4999, "M1"), (5000, 5999, "F3"), (6000, 6999, "M1"), (7000, 7999, "F4"),
    (8000, 8999, "F1"), (9000, 9999, "M2"), (10000, 10999, "M1"), (11000, 11999, "M1"), (12000, 12350, "M2"),
    (12351, 12742, "M1"),
]
LABELS = {"F1": "Salma", "F2": "Nadia", "F3": "Imane", "F4": "Kenza", "M1": "Youssef", "M2": "Hamza", "M3": "Karim"}
TARGET_SR = 24_000
CANDIDATES = 60  # extraits examinés par comédien


def speaker_of(i: int) -> str | None:
    for a, b, spk in RANGES:
        if a <= i <= b:
            return spk
    return None


def resample(wave: np.ndarray, sr: int, target: int = TARGET_SR) -> np.ndarray:
    if sr == target:
        return wave
    n = int(round(len(wave) * target / sr))
    return np.interp(np.linspace(0, len(wave), n, endpoint=False), np.arange(len(wave)), wave).astype(np.float32)


def score(wave: np.ndarray, sr: int, text: str) -> float | None:
    """Plus petit = meilleur. None = extrait écarté."""
    seconds = len(wave) / sr
    words = len(text.split())
    if not (5.0 <= seconds <= 9.0) or not (6 <= words <= 26):
        return None
    if re.search(r"[A-Za-z0-9]", text) or not re.search(r"[؀-ۿ]", text):
        return None
    win = int(sr * 0.05)
    frames = wave[: len(wave) // win * win].reshape(-1, win)
    rms = np.sqrt(np.mean(frames**2, axis=1) + 1e-12)
    voiced = rms[rms > np.max(rms) * 0.1]
    if voiced.size < 10 or np.max(np.abs(wave)) > 0.99:  # saturé
        return None
    # régularité du volume + durée proche de 7 s
    return float(np.std(20 * np.log10(voiced))) + abs(seconds - 7.0)


def main() -> None:
    from datasets import Audio, load_dataset

    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="voices")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    ds = load_dataset(DATASET, split="train", streaming=True).cast_column("audio", Audio(decode=False))
    seen: dict[str, int] = {}
    best: dict[str, tuple[float, np.ndarray, int, str]] = {}
    for i, row in enumerate(ds):
        spk = speaker_of(i)
        if not spk or seen.get(spk, 0) >= CANDIDATES:
            if all(seen.get(s, 0) >= CANDIDATES for s in LABELS):
                break
            continue
        text = (row.get("darija_Arab_new") or row.get("darija_Arab_old") or "").strip()
        audio = row["audio"]
        try:
            wave, sr = sf.read(io.BytesIO(audio["bytes"]) if audio.get("bytes") else audio["path"], dtype="float32")
        except Exception:
            continue
        if wave.ndim > 1:
            wave = wave.mean(axis=1)
        seen[spk] = seen.get(spk, 0) + 1
        sc = score(wave, sr, text)
        if sc is not None and (spk not in best or sc < best[spk][0]):
            best[spk] = (sc, wave, sr, text)

    meta = {}
    for spk, (sc, wave, sr, text) in sorted(best.items()):
        vid = "doda-" + spk.lower()
        sf.write(out / f"{vid}.wav", resample(wave, sr), TARGET_SR)
        meta[vid] = {"file": f"{vid}.wav", "ref_text": text, "label": LABELS[spk], "speaker": spk, "source": DATASET}
        print(f"{vid}: {LABELS[spk]} · {len(wave) / sr:.1f}s · {text}")
    missing = sorted(set(LABELS) - set(best))
    if missing:
        raise SystemExit(f"Aucun extrait valable pour : {missing}")
    (out / "voices.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
