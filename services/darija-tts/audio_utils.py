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


def style_of(sentence: str) -> str:
    """Intonation voulue d'après la ponctuation finale : question, exclamation, suspens (virgule) ou neutre."""
    s = sentence.strip()
    if s.endswith(("؟", "?")):
        return "question"
    if s.endswith("!"):
        return "exclaim"
    if s.endswith(("،", ",")):
        return "continue"
    return "neutral"


# légère variation de débit : l'enthousiasme va un peu plus vite, la question se pose
STYLE_SPEED = {"exclaim": 1.04, "question": 0.97, "continue": 1.0, "neutral": 1.0}


def sentence_speed(sentence: str, speed: float) -> float:
    return round(min(1.35, max(0.65, speed * STYLE_SPEED[style_of(sentence)])), 3)


def _valleys(rms: np.ndarray, min_frames: int = 3) -> list[int]:
    """Centres des creux de voix (≥ 60 ms sous le seuil) : les frontières possibles entre deux phrases."""
    thr = max(float(np.percentile(rms, 95)) * 0.08, 1e-4)
    out, run = [], 0
    for k, q in enumerate(np.append(rms < thr, False)):
        if q:
            run += 1
        else:
            if run >= min_frames:
                out.append(k - run // 2 - 1)
            run = 0
    return out


def _match(estimates: list[int], valleys: list[int], limit: int) -> list[int | None]:
    """Associe chaque fin de phrase estimée à un creux, dans l'ordre, au plus près (programmation dynamique)."""
    n, m = len(estimates), len(valleys)
    inf = float("inf")
    cost = [[inf] * (m + 1) for _ in range(n + 1)]
    back: list[list[tuple[int, int, bool] | None]] = [[None] * (m + 1) for _ in range(n + 1)]
    for j in range(m + 1):
        cost[0][j] = 0.0
    for i in range(1, n + 1):
        cost[i][0] = cost[i - 1][0] + limit
        back[i][0] = (i - 1, 0, False)
        for j in range(1, m + 1):
            best, arg = cost[i][j - 1], (i, j - 1, False)  # creux j inutilisé
            if cost[i - 1][j] + limit < best:  # fin de phrase i sans creux assez proche
                best, arg = cost[i - 1][j] + limit, (i - 1, j, False)
            d = abs(estimates[i - 1] - valleys[j - 1])
            if d < limit and cost[i - 1][j - 1] + d < best:
                best, arg = cost[i - 1][j - 1] + d, (i - 1, j - 1, True)
            cost[i][j], back[i][j] = best, arg
    res: list[int | None] = [None] * n
    i, j = n, m
    while i > 0:
        pi, pj, matched = back[i][j]  # type: ignore[misc]
        if matched:
            res[i - 1] = valleys[j - 1]
        i, j = pi, pj
    return res


def insert_pauses(
    wave: np.ndarray, splits: list[tuple[float, float]] | None, sr: int = SAMPLE_RATE, pause: float = 1.0
) -> np.ndarray:
    """Passage lu d'une traite : ajoute le silence voulu entre ses phrases (après « ؟ », « ! », « . »).

    `splits` : [(position estimée de la fin de phrase entre 0 et 1, silence en s)]. Chaque fin de phrase est associée,
    dans l'ordre, au creux de voix le plus proche (frontière de mot) ; le silence y est inséré avec un fondu court.
    Sans creux assez proche, aucune pause n'est ajoutée (jamais au milieu d'un mot).
    """
    w = np.asarray(wave, dtype=np.float32)
    if not splits or len(w) < sr // 2:
        return w
    win = int(sr * 0.02)
    n = len(w) // win
    if n < 5:
        return w
    rms = np.sqrt(np.mean(w[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    valleys = _valleys(rms)
    todo = [(f, g) for f, g in splits if 0.02 < f < 0.98]
    limit = max(int(0.9 * sr / win), int(0.2 * n))
    picked = _match([int(f * n) for f, _ in todo], valleys, limit)
    cuts: list[tuple[int, int]] = []
    for (f, gap), k in zip(todo, picked):
        if k is None:
            continue
        # le creux existant compte déjà un peu comme pause
        extra = max(0.0, min(1.5, gap) * min(2.0, max(0.3, pause)) - 0.06)
        if extra > 0.02:
            cuts.append((k * win + win // 2, int(extra * sr)))
    out = w
    for pos, length in sorted(cuts, reverse=True):
        f = min(int(sr * 0.006), pos, len(out) - pos)
        a, b = out[:pos].copy(), out[pos:].copy()
        if f > 0:
            ramp = np.linspace(1.0, 0.0, f, dtype=np.float32)
            a[-f:] *= ramp
            b[:f] *= ramp[::-1]
        out = np.concatenate([a, np.zeros(length, dtype=np.float32), b])
    return out


def assemble(
    segments: list[tuple[str, np.ndarray]],
    sr: int = SAMPLE_RATE,
    pause: float = 1.0,
    gaps: list[float] | None = None,
    inner: list[list[tuple[float, float]]] | None = None,
) -> np.ndarray:
    """Passages générés → une seule piste : silence retiré, pauses entre phrases d'un passage, fondus, pauses, volume."""
    parts: list[np.ndarray] = [np.zeros(int(0.15 * sr), dtype=np.float32)]
    for i, (sentence, wave) in enumerate(segments):
        w = trim_silence(np.asarray(wave, dtype=np.float32), sr)
        if inner is not None and len(inner) == len(segments):
            w = insert_pauses(w, inner[i], sr, pause)
        parts.append(fade(w, sr))
        if i < len(segments) - 1:
            if gaps is not None and len(gaps) == len(segments):
                # silence calculé par LandPro d'après la ponctuation (؟ ! . ، … et retours à la ligne)
                seconds = max(0.0, min(1.5, float(gaps[i]))) * min(2.0, max(0.3, pause))
                parts.append(np.zeros(int(seconds * sr), dtype=np.float32))
            else:
                parts.append(pause_after(sentence, sr, pause))
    parts.append(np.zeros(int(0.25 * sr), dtype=np.float32))
    return normalize(np.concatenate(parts))


def expected_seconds(sentence: str, speed: float = 1.0) -> float:
    """Durée attendue d'une phrase darija (~2,4 mots/s) : sert à repérer une génération qui boucle."""
    words = max(1, len(sentence.split()))
    return words / 2.4 / max(0.5, speed)


def pitch_track(wave: np.ndarray, sr: int = SAMPLE_RATE, fmin: float = 70.0, fmax: float = 400.0) -> np.ndarray:
    """Hauteur de la voix (Hz) toutes les 20 ms, 0 quand la trame n'est pas voisée (autocorrélation)."""
    wave = np.asarray(wave, dtype=np.float32)
    n, hop = int(sr * 0.04), int(sr * 0.02)
    if len(wave) < n:
        return np.zeros(0, dtype=np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(wave, n)[::hop]
    rms = np.sqrt(np.mean(frames**2, axis=1) + 1e-12)
    lo, hi = int(sr / fmax), min(n - 1, int(sr / fmin))
    out = np.zeros(len(frames), dtype=np.float32)
    loud = rms > rms.max() * 0.1
    spec = np.fft.rfft(frames[loud] - frames[loud].mean(axis=1, keepdims=True), 2 * n)
    ac = np.fft.irfft(np.abs(spec) ** 2)[:, :n]
    ac /= ac[:, :1] + 1e-12
    lags = lo + np.argmax(ac[:, lo:hi], axis=1)
    peak = ac[np.arange(len(lags)), lags]
    f0 = np.where(peak > 0.35, sr / lags, 0.0)
    out[loud] = f0
    return out


def expressiveness(wave: np.ndarray, sr: int = SAMPLE_RATE) -> dict:
    """Mélodie d'un extrait : variation de hauteur (demi-tons) et montée finale (demi-tons, > 0 = intonation de question)."""
    f0 = pitch_track(wave, sr)
    voiced = f0[f0 > 0]
    if voiced.size < 10:
        return {"range": 0.0, "rise": 0.0}
    st = 12 * np.log2(voiced / np.median(voiced))
    tail = st[-max(3, len(st) // 6):]
    return {"range": float(np.std(st)), "rise": float(np.median(tail) - np.median(st))}


MAX_TEMPO = 1.25


def fit_tempo(seconds: float, target: float | None) -> float:
    """Accélération nécessaire pour tenir dans la durée visée (1 = aucune ; 25 % au plus, au-delà la voix sonne pressée)."""
    if not target or target <= 0 or seconds <= target * 1.03:
        return 1.0
    return round(min(MAX_TEMPO, seconds / target), 3)


def audio_filters(tempo: float = 1.0) -> str:
    """Finition « pub » : graves parasites coupés, volume réseaux sociaux (-16 LUFS, crêtes à -1,5 dB) sans écraser
    la dynamique de la voix. atempo accélère sans changer la hauteur de la voix."""
    chain = ["highpass=f=70", "loudnorm=I=-16:TP=-1.5:LRA=9", "aresample=24000"]
    if abs(tempo - 1.0) > 0.005:
        chain.insert(0, f"atempo={tempo:.3f}")
    return ",".join(chain)


def _encode(wave: np.ndarray, sr: int, tempo: float, out_args: list[str]) -> bytes:
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "pipe:0",
         "-af", audio_filters(tempo), *out_args, "pipe:1"],
        input=np.asarray(wave, dtype=np.float32).tobytes(),
        capture_output=True,
        check=True,
    )
    return proc.stdout


def to_mp3(wave: np.ndarray, sr: int = SAMPLE_RATE, bitrate: str = "128k", tempo: float = 1.0) -> bytes:
    """Encode en MP3 mono avec ffmpeg (finition et éventuelle accélération comprises)."""
    return _encode(wave, sr, tempo, ["-codec:a", "libmp3lame", "-b:a", bitrate, "-f", "mp3"])


def to_wav(wave: np.ndarray, sr: int = SAMPLE_RATE, tempo: float = 1.0) -> bytes:
    """Même rendu que le MP3, en WAV 16 bits (montage vidéo sans perte)."""
    return _encode(wave, sr, tempo, ["-codec:a", "pcm_s16le", "-f", "wav"])


def to_pcm16(wave: np.ndarray) -> bytes:
    """Phrase brute (avant montage) → PCM 16 bits, pour la réutiliser quand on régénère une autre phrase."""
    return (np.clip(np.asarray(wave, dtype=np.float32), -1, 1) * 32767).astype("<i2").tobytes()


def from_pcm16(data: bytes) -> np.ndarray:
    return np.frombuffer(data, dtype="<i2").astype(np.float32) / 32767


def quality_report(wave: np.ndarray, sr: int = SAMPLE_RATE) -> dict:
    """Contrôles après génération : saturation, plus long silence, durée."""
    w = np.asarray(wave, dtype=np.float32)
    if not w.size:
        return {"seconds": 0.0, "peak": 0.0, "clipped": 0.0, "longest_silence": 0.0}
    win = max(1, int(sr * 0.02))
    frames = w[: len(w) // win * win].reshape(-1, win)
    rms = np.sqrt(np.mean(frames**2, axis=1) + 1e-12)
    quiet = rms < 10 ** (-45 / 20)
    longest = run = 0
    for q in quiet:
        run = run + 1 if q else 0
        longest = max(longest, run)
    return {
        "seconds": round(len(w) / sr, 2),
        "peak": round(float(np.max(np.abs(w))), 3),
        "clipped": round(float(np.mean(np.abs(w) >= 0.999)), 5),
        "longest_silence": round(longest * win / sr, 2),
    }
