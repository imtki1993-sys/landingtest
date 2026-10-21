"""Montage audio de la voix off : pauses entre phrases, fondus, volume homogène, export MP3.

Sans dépendance au GPU : testable seul (python -m unittest test_audio_utils).
"""

from __future__ import annotations

import subprocess

import numpy as np

SAMPLE_RATE = 24_000


def pause_after(sentence: str, sr: int = SAMPLE_RATE, scale: float = 1.0) -> np.ndarray:
    """Silence après une phrase : plus long après une question ou une exclamation (scale : courtes 0,6 → longues 1,5)."""
    s = sentence.strip()
    seconds = (0.45 if s.endswith(("؟", "?", "!")) else 0.3) * min(2.0, max(0.3, scale))
    return np.zeros(int(seconds * sr), dtype=np.float32)


def fade(wave: np.ndarray, sr: int = SAMPLE_RATE, ms: float = 12.0) -> np.ndarray:
    """Fondu d'entrée et de sortie très court : évite les clics entre les phrases."""
    n = min(int(sr * ms / 1000), len(wave) // 2)
    if n <= 0:
        return wave
    out = wave.astype(np.float32).copy()
    ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
    out[:n] *= ramp
    out[-n:] *= ramp[::-1]
    return out


def trim_silence(wave: np.ndarray, sr: int = SAMPLE_RATE, threshold_db: float = -42.0, keep_ms: float = 60.0) -> np.ndarray:
    """Retire le silence au début et à la fin d'une phrase générée (garde une marge de keep_ms)."""
    if wave.size == 0:
        return wave
    win = max(1, int(sr * 0.02))
    frames = len(wave) // win
    if frames == 0:
        return wave
    energy = np.sqrt(np.mean(wave[: frames * win].reshape(frames, win) ** 2, axis=1) + 1e-12)
    loud = np.where(20 * np.log10(energy) > threshold_db)[0]
    if loud.size == 0:
        return wave
    keep = int(sr * keep_ms / 1000)
    start = max(0, loud[0] * win - keep)
    end = min(len(wave), (loud[-1] + 1) * win + keep)
    return wave[start:end]


def normalize(wave: np.ndarray, target_rms_db: float = -18.0, peak_db: float = -1.0) -> np.ndarray:
    """Volume homogène (≈ -18 dBFS RMS) sans dépasser -1 dBFS en crête."""
    if wave.size == 0:
        return wave
    rms = float(np.sqrt(np.mean(wave**2)) + 1e-12)
    out = wave * (10 ** (target_rms_db / 20) / rms)
    peak = float(np.max(np.abs(out)) + 1e-12)
    limit = 10 ** (peak_db / 20)
    if peak > limit:
        out = out * (limit / peak)
    return out.astype(np.float32)


def assemble(segments: list[tuple[str, np.ndarray]], sr: int = SAMPLE_RATE, pause: float = 1.0) -> np.ndarray:
    """Phrases générées → une seule piste : silence retiré, fondus, pauses, volume final."""
    parts: list[np.ndarray] = [np.zeros(int(0.15 * sr), dtype=np.float32)]
    for i, (sentence, wave) in enumerate(segments):
        parts.append(fade(trim_silence(np.asarray(wave, dtype=np.float32), sr), sr))
        if i < len(segments) - 1:
            parts.append(pause_after(sentence, sr, pause))
    parts.append(np.zeros(int(0.25 * sr), dtype=np.float32))
    return normalize(np.concatenate(parts))


def expected_seconds(sentence: str, speed: float = 1.0) -> float:
    """Durée attendue d'une phrase darija (~2,4 mots/s) : sert à repérer une génération qui boucle."""
    words = max(1, len(sentence.split()))
    return words / 2.4 / max(0.5, speed)


MAX_TEMPO = 1.25


def fit_tempo(seconds: float, target: float | None) -> float:
    """Accélération nécessaire pour tenir dans la durée visée (1 = aucune ; 25 % au plus, au-delà la voix sonne pressée)."""
    if not target or target <= 0 or seconds <= target * 1.03:
        return 1.0
    return round(min(MAX_TEMPO, seconds / target), 3)


def audio_filters(tempo: float = 1.0) -> str:
    """Finition « pub » : graves parasites coupés, compression douce (voix présente), crêtes limitées.
    atempo accélère sans changer la hauteur de la voix."""
    chain = ["highpass=f=70", "acompressor=threshold=0.125:ratio=2.5:attack=5:release=90:makeup=1.4", "alimiter=limit=0.9"]
    if abs(tempo - 1.0) > 0.005:
        chain.insert(0, f"atempo={tempo:.3f}")
    return ",".join(chain)


def to_mp3(wave: np.ndarray, sr: int = SAMPLE_RATE, bitrate: str = "128k", tempo: float = 1.0) -> bytes:
    """Encode en MP3 mono avec ffmpeg (finition et éventuelle accélération comprises)."""
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "pipe:0",
         "-af", audio_filters(tempo), "-codec:a", "libmp3lame", "-b:a", bitrate, "-f", "mp3", "pipe:1"],
        input=np.asarray(wave, dtype=np.float32).tobytes(),
        capture_output=True,
        check=True,
    )
    return proc.stdout
