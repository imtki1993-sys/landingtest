"""Prépare les 7 voix de référence à partir du corpus DODa (Darija Open Dataset, AtlasIA).

DODa : 12 743 phrases en darija enregistrées en studio par 7 comédiens marocains (4 femmes, 3 hommes).
Source utilisée : la copie libre d'accès « Jip7e/doda-darija-cosyvoice2 » (mêmes enregistrements, 24 kHz,
licence CC-BY-4.0, transcriptions en alphabet arabe, comédien de chaque phrase dans utt2spk, audio dans wavs.tar.gz).
L'original « atlasia/DODa-audio-dataset » est protégé (compte Hugging Face requis).

Pour chaque comédien, on garde l'extrait le plus adapté au clonage de voix : 5 à 9 secondes, phrase complète
en alphabet arabe, volume régulier. Sortie : voices/<id>.wav (24 kHz mono) + voices/voices.json.

Usage : python prepare_voices.py --out voices
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

REPO = "Jip7e/doda-darija-cosyvoice2"
SOURCE = "DODa (Darija Open Dataset, AtlasIA) via " + REPO
LABELS = {"F1": "Salma", "F2": "Nadia", "F3": "Imane", "F4": "Kenza", "M1": "Youssef", "M2": "Hamza", "M3": "Karim"}
TARGET_SR = 24_000
CANDIDATES = 40  # extraits téléchargés et évalués par comédien


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


def read_kaldi(path: str) -> dict[str, str]:
    """Fichier « <id> <valeur> » par ligne → dictionnaire."""
    out = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        parts = line.strip().split(maxsplit=1)
        if len(parts) == 2:
            out[parts[0]] = parts[1].strip()
    return out


def text_ok(text: str) -> bool:
    words = len(text.split())
    return 8 <= words <= 24 and not re.search(r"[A-Za-z0-9]", text) and bool(re.search(r"[\u0600-\u06FF]", text))


def main() -> None:
    from huggingface_hub import hf_hub_download

    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="voices")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    def get(name: str) -> str:
        return hf_hub_download(REPO, name, repo_type="dataset")


    texts: dict[str, str] = {}
    speakers: dict[str, str] = {}
    for split in ("train", "dev"):
        texts.update(read_kaldi(get(f"{split}/text")))
        speakers.update(read_kaldi(get(f"{split}/utt2spk")))

    by_spk: dict[str, list[str]] = {}
    for utt, spk in speakers.items():
        if spk in LABELS and text_ok(texts.get(utt, "")):
            by_spk.setdefault(spk, []).append(utt)

    # extraits candidats : phrases moyennes (≈ 6-8 s) en premier
    wanted: dict[str, tuple[str, str]] = {}  # « 000123.wav » → (comédien, utt)
    for spk, utts in by_spk.items():
        utts.sort(key=lambda u: abs(len(texts[u].split()) - 15))
        for utt in utts[:CANDIDATES]:
            wanted[utt.split("_")[-1] + ".wav"] = (spk, utt)

    # l'audio est dans une seule archive (wavs.tar.gz, ~1,2 Go) : lue en flux, seuls les candidats sont décodés,
    # puis supprimée pour garder l'image légère
    import io
    import os
    import shutil
    import tarfile
    import tempfile

    tmp = tempfile.mkdtemp(prefix="doda-")
    best: dict[str, tuple[float, np.ndarray, int, str]] = {}
    try:
        archive = hf_hub_download(REPO, "wavs.tar.gz", repo_type="dataset", local_dir=tmp)
        found = 0
        with tarfile.open(archive, mode="r|gz") as tar:
            for member in tar:
                name = os.path.basename(member.name)
                if not member.isfile() or name not in wanted:
                    continue
                spk, utt = wanted[name]
                data = tar.extractfile(member)
                if data is None:
                    continue
                found += 1
                try:
                    wave, sr = sf.read(io.BytesIO(data.read()), dtype="float32")
                except Exception:
                    continue
                if wave.ndim > 1:
                    wave = wave.mean(axis=1)
                sc = score(wave, sr, texts[utt])
                if sc is not None and (spk not in best or sc < best[spk][0]):
                    best[spk] = (sc, wave, sr, texts[utt])
        print(f"{found} extraits candidats lus dans l'archive")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    meta = {}
    for spk in sorted(LABELS):
        if spk not in best:
            print(f"{spk}: aucun extrait valable")
            continue
        _, wave, sr, text = best[spk]
        vid = "doda-" + spk.lower()
        sf.write(out / f"{vid}.wav", resample(wave, sr), TARGET_SR)
        meta[vid] = {"file": f"{vid}.wav", "ref_text": text, "label": LABELS[spk], "speaker": spk, "source": SOURCE}
        print(f"{vid}: {LABELS[spk]} · {len(wave) / sr:.1f}s · {text}")

    if len(meta) < 2:
        raise SystemExit(f"Trop peu de voix préparées ({len(meta)}) : vérifier l'accès à {REPO}")
    missing = sorted(set(LABELS) - {m["speaker"] for m in meta.values()})
    if missing:
        print("Comédiens sans extrait (voix non proposées) :", ", ".join(missing))
    (out / "voices.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
