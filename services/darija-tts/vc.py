"""Conversion de voix (OpenVoice V2, licence MIT, usage commercial permis) : le vendeur enregistre son script avec
le ton, l'accent et le rythme qu'il veut ; la voix choisie le redit avec son propre timbre.

Le convertisseur ne touche qu'au timbre (« couleur » de la voix) : la darija, l'intonation et les pauses de
l'enregistrement sont gardées telles quelles. Pour passer d'une voix d'homme à une voix de femme (ou l'inverse),
la hauteur est d'abord décalée automatiquement vers celle de la voix cible.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np

from audio_utils import SAMPLE_RATE, pitch_track

OV_REPO = "myshell-ai/OpenVoiceV2"
OV_DIR = Path(os.environ.get("OPENVOICE_DIR", Path(__file__).parent / "openvoice"))
SRC_MIN, SRC_MAX = 2.0, 90.0
_vc: dict = {}


def download() -> None:
    """Poids du convertisseur (appelé à la construction de l'image)."""
    from huggingface_hub import hf_hub_download

    for name in ("converter/config.json", "converter/checkpoint.pth"):
        hf_hub_download(OV_REPO, name, local_dir=str(OV_DIR))


def converter():
    if "c" not in _vc:
        import torch
        from openvoice.api import OpenVoiceBaseClass, ToneColorConverter

        device = "cuda" if torch.cuda.is_available() else "cpu"
        # le constructeur d'OpenVoice transmet enable_watermark à sa classe de base (erreur) : construit à la main,
        # sans filigrane audio
        c = ToneColorConverter.__new__(ToneColorConverter)
        OpenVoiceBaseClass.__init__(c, str(OV_DIR / "converter/config.json"), device=device)
        c.watermark_model = None
        c.version = getattr(c.hps, "_version_", "v1")
        ckpt = torch.load(str(OV_DIR / "converter/checkpoint.pth"), map_location=device, weights_only=False)
        c.model.load_state_dict(ckpt["model"], strict=False)
        _vc["c"] = c
        _vc["se"] = {}
    return _vc["c"]


def _ffmpeg(src: str, dst: str, sr: int, extra: list[str] | None = None) -> None:
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-ac", "1", "-ar", str(sr), *(extra or []),
         "-c:a", "pcm_s16le", dst],
        capture_output=True,
        timeout=120,
    )
    if proc.returncode != 0:
        raise ValueError("Fichier audio illisible")


def _read(path: str) -> np.ndarray:
    import soundfile as sf

    w, _ = sf.read(path, dtype="float32")
    return w if w.ndim == 1 else w.mean(axis=1)


def median_pitch(wave: np.ndarray, sr: int = SAMPLE_RATE) -> float:
    f0 = pitch_track(wave, sr)
    v = f0[f0 > 0]
    return float(np.median(v)) if v.size > 20 else 0.0


def pitch_shift_semitones(src_hz: float, tgt_hz: float) -> float:
    """Décalage de hauteur vers la voix cible : seulement si l'écart est net (homme ↔ femme), borné à ±8 demi-tons."""
    if src_hz <= 0 or tgt_hz <= 0:
        return 0.0
    st = 12 * np.log2(tgt_hz / src_hz)
    return float(np.clip(round(st, 1), -8, 8)) if abs(st) >= 3 else 0.0


def _embedding(key: str, wav_path: str):
    c = converter()
    if key not in _vc["se"]:
        _vc["se"][key] = c.extract_se([wav_path])
    return _vc["se"][key]


def convert(source: bytes, target_wav: str, target_key: str, auto_pitch: bool = True) -> tuple[np.ndarray, dict]:
    """Enregistrement (tout format) + voix cible (WAV) → voix convertie à 24 kHz, et informations."""
    c = converter()
    sr = c.hps.data.sampling_rate
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "source.bin")
        Path(raw).write_bytes(source)
        src = os.path.join(tmp, "source.wav")
        _ffmpeg(raw, src, SAMPLE_RATE, ["-af", "highpass=f=70,loudnorm=I=-18:TP=-2"])
        wave = _read(src)
        seconds = len(wave) / SAMPLE_RATE
        if not (SRC_MIN <= seconds <= SRC_MAX):
            raise ValueError(f"Enregistrement de {seconds:.0f} s : {SRC_MIN:.0f} à {SRC_MAX:.0f} s acceptées")
        tgt24 = os.path.join(tmp, "target24.wav")
        _ffmpeg(target_wav, tgt24, SAMPLE_RATE)
        shift = pitch_shift_semitones(median_pitch(wave), median_pitch(_read(tgt24))) if auto_pitch else 0.0
        conv_in = os.path.join(tmp, "in.wav")
        filters = []
        if shift:
            # hauteur décalée sans changer la durée (le rythme de l'enregistrement est gardé)
            ratio = 2 ** (shift / 12)
            filters = ["-af", f"asetrate={SAMPLE_RATE * ratio:.0f},aresample={SAMPLE_RATE},atempo={1 / ratio:.5f}"]
        _ffmpeg(src, conv_in, sr, filters)
        tgt = os.path.join(tmp, "target.wav")
        _ffmpeg(target_wav, tgt, sr)
        src_se = c.extract_se([conv_in])
        tgt_se = _embedding(target_key, tgt)
        out = os.path.join(tmp, "out.wav")
        c.convert(audio_src_path=conv_in, src_se=src_se, tgt_se=tgt_se, output_path=out, tau=0.3)
        final = os.path.join(tmp, "final.wav")
        _ffmpeg(out, final, SAMPLE_RATE)
        return _read(final), {"pitch_shift": shift, "source_seconds": round(seconds, 1)}


def smoke_test(voices_dir: str) -> None:
    """Construction de l'image : le convertisseur charge et convertit une voix du catalogue en une autre (CPU)."""
    files = sorted(Path(voices_dir).glob("doda-*.wav"))
    files = [f for f in files if "-" not in f.stem[5:]]
    if len(files) < 2:
        print("smoke test VC : pas assez de voix")
        return
    wave, info = convert(files[0].read_bytes(), str(files[-1]), files[-1].stem)
    assert wave.size > SAMPLE_RATE, "conversion vide"
    print(f"VC OK : {files[0].stem} → {files[-1].stem}, {wave.size / SAMPLE_RATE:.1f} s, décalage {info['pitch_shift']} st")
