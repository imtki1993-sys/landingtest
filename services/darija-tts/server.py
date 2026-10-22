"""Service de voix off darija de LandPro : Habibi-TTS, modèle marocain (Specialized/MAR, Apache 2.0).

POST /synthesize  {"sentences": [...], "voice": "doda-f1", "speed": 1.0}  → audio/mpeg
GET  /voices      voix disponibles
GET  /health      état du service

Authentification : en-tête « Authorization: Bearer <TTS_SERVICE_TOKEN> ».
"""

from __future__ import annotations

import hmac
import json
import os
import threading
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

import base64

from audio_utils import (
    SAMPLE_RATE,
    assemble,
    expected_seconds,
    fit_tempo,
    from_pcm16,
    trim_silence,
    quality_report,
    sentence_speed,
    style_of,
    to_mp3,
    to_pcm16,
    to_wav,
)

MAR_CKPT = "hf://SWivid/Habibi-TTS/Specialized/MAR/model_100000.safetensors"
MAR_VOCAB = "hf://SWivid/Habibi-TTS/Specialized/MAR/vocab.txt"
# architecture F5-TTS v1 Base utilisée par Habibi (voir habibi_tts/infer/infer_gradio.py)
V1_BASE = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4)
VOICES_DIR = Path(os.environ.get("VOICES_DIR", Path(__file__).parent / "voices"))
MAX_SENTENCES = 40
MAX_CHARS = 1600

app = FastAPI(title="LandPro — voix off darija", docs_url=None, redoc_url=None)
_state: dict = {}
_lock = threading.Lock()  # un seul modèle sur le GPU : une génération à la fois


def download_models() -> None:
    """Télécharge le modèle marocain et le vocodeur (appelé à la construction de l'image)."""
    from cached_path import cached_path
    from f5_tts.infer.utils_infer import load_vocoder

    cached_path(MAR_CKPT)
    cached_path(MAR_VOCAB)
    load_vocoder(vocoder_name="vocos", is_local=False, device="cpu")


def load() -> None:
    """Charge le modèle, le vocodeur et les voix de référence (une fois par conteneur)."""
    if _state:
        return
    from cached_path import cached_path
    from f5_tts.infer.utils_infer import load_model, load_vocoder, preprocess_ref_audio_text
    from f5_tts.model import DiT

    model = load_model(DiT, V1_BASE, str(cached_path(MAR_CKPT)), vocab_file=str(cached_path(MAR_VOCAB)))
    vocoder = load_vocoder(vocoder_name="vocos", is_local=False)
    meta = json.loads((VOICES_DIR / "voices.json").read_text(encoding="utf-8"))
    voices = {}
    for vid, v in meta.items():
        ref_audio, ref_text = preprocess_ref_audio_text(str(VOICES_DIR / v["file"]), v["ref_text"], show_info=lambda *_: None)
        voices[vid] = {"ref_audio": ref_audio, "ref_text": ref_text, "label": v.get("label", vid), "styles": {}}
        # extraits d'intonation du même comédien : question (mélodie qui monte), exclamation (voix vivante)
        for style, sv in (v.get("styles") or {}).items():
            path = VOICES_DIR / sv["file"]
            if path.exists():
                a, t = preprocess_ref_audio_text(str(path), sv["ref_text"], show_info=lambda *_: None)
                voices[vid]["styles"][style] = {"ref_audio": a, "ref_text": t}
    _state.update(model=model, vocoder=vocoder, voices=voices)


def _check(authorization: str | None) -> None:
    token = os.environ.get("TTS_SERVICE_TOKEN", "").strip().strip("\"'")
    given = (authorization or "").removeprefix("Bearer ").strip().strip("\"'")
    if not token or not hmac.compare_digest(given, token):
        raise HTTPException(status_code=401, detail="Clé du service invalide")


class SynthesizeBody(BaseModel):
    sentences: list[str] = Field(min_length=1, max_length=MAX_SENTENCES)
    voice: str
    speed: float = Field(default=1.0, ge=0.7, le=1.3)
    pause: float = Field(default=1.0, ge=0.3, le=2.0)
    target_seconds: float | None = Field(default=None, ge=5, le=120)
    # silence après chaque phrase, calculé par LandPro d'après la ponctuation
    gaps: list[float] | None = None
    # pauses entre les phrases d'un même passage : [[position 0-1, silence en s], …] par passage
    inner_gaps: list[list[list[float]]] | None = None
    # intonation par extrait « question / exclamation » : désactivée par défaut (le timbre changeait d'une ligne à l'autre)
    expressive: bool = False
    # tirage commun à tous les passages : même voix, même élan du début à la fin
    seed: int | None = Field(default=None, ge=0, le=2**31 - 1)
    # phrases déjà générées à réutiliser (PCM 16 bits 24 kHz en base64), null = à générer : régénérer une seule phrase
    segments: list[str | None] | None = None
    # « json » : MP3 + WAV + phrases brutes (pour régénérer une phrase plus tard) ; « mp3 » : audio seul
    format: str = "mp3"
    # voix pub personnalisée : extrait de référence (WAV 24 kHz en base64, préparé par /reference) et son texte exact
    ref_audio: str | None = None
    ref_text: str | None = Field(default=None, max_length=400)


class ReferenceBody(BaseModel):
    audio: str  # fichier enregistré ou importé (webm, m4a, mp3, wav…) en base64
    text: str = Field(min_length=3, max_length=400)


REF_MIN, REF_MAX = 4.0, 12.0  # le modèle n'utilise que 12 s de référence : au-delà le texte ne correspondrait plus
_custom: dict[str, dict] = {}  # voix personnalisées déjà préparées dans ce conteneur (clé : empreinte de l'audio)


def _to_wav24(data: bytes) -> bytes:
    """N'importe quel fichier audio → WAV mono 24 kHz 16 bits (ffmpeg)."""
    import subprocess

    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-ac", "1", "-ar", "24000",
         "-af", "highpass=f=70,loudnorm=I=-18:TP=-2", "-c:a", "pcm_s16le", "-f", "wav", "pipe:1"],
        input=data,
        capture_output=True,
        timeout=60,
    )
    if proc.returncode != 0 or len(proc.stdout) < 1000:
        raise HTTPException(status_code=400, detail="Fichier audio illisible")
    return proc.stdout


def _custom_voice(audio_b64: str, text: str) -> dict:
    """Voix personnalisée prête pour le modèle (préparée une fois par conteneur)."""
    import hashlib
    import tempfile

    from f5_tts.infer.utils_infer import preprocess_ref_audio_text

    raw = base64.b64decode(audio_b64)
    key = hashlib.sha1(raw + text.encode()).hexdigest()
    if key not in _custom:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(raw)
        a, t = preprocess_ref_audio_text(f.name, text, show_info=lambda *_: None)
        _custom[key] = {"ref_audio": a, "ref_text": t, "label": "custom", "styles": {}}
    return _custom[key]


def _reference(sentence: str, voice: dict, expressive: bool) -> dict:
    """Extrait de référence à imiter : la question pour « ؟ », l'extrait vivant pour « ! », sinon la voix neutre."""
    if expressive:
        style = style_of(sentence)
        if style in voice.get("styles", {}):
            return voice["styles"][style]
    return voice


def _generate(sentence: str, voice: dict, speed: float, expressive: bool = False, seed: int | None = None):
    import torch
    from habibi_tts.infer.utils_infer import infer_process

    ref = _reference(sentence, voice, expressive)
    if expressive:
        speed = sentence_speed(sentence, speed)

    def run(nfe: int):
        if seed is not None:
            torch.manual_seed(seed)
        wave, sr, _ = infer_process(
            ref["ref_audio"],
            ref["ref_text"],
            sentence,
            _state["model"],
            _state["vocoder"],
            nfe_step=nfe,
            cfg_strength=2.0,
            speed=speed,
            dialect_id=None,  # modèle spécialisé MAR : pas de balise de dialecte
            show_info=lambda *_: None,
            progress=None,
        )
        return wave, sr

    wave, sr = run(48)
    # phrase qui boucle (beaucoup trop longue) ou mots avalés (beaucoup trop courte) → nouvel essai plus précis
    expected = expected_seconds(sentence, speed)
    got = len(wave) / sr
    if got > expected * 2.2 + 1.0 or got < expected * 0.4:
        wave, sr = run(64)
    return wave, sr


def _fingerprint(value: str) -> str:
    """Empreinte courte de la clé (jamais la clé) : vérifier que LandPro et le service ont la même."""
    import hashlib

    return hashlib.sha256(value.encode()).hexdigest()[:8] if value else ""


@app.get("/health")
def health():
    token = os.environ.get("TTS_SERVICE_TOKEN", "").strip().strip("\"'")
    return {
        "ok": True,
        "loaded": bool(_state),
        "voices": sorted(_state.get("voices", {})),
        "styles": {k: sorted(v.get("styles", {})) for k, v in _state.get("voices", {}).items()},
        "key": _fingerprint(token),
        "build": os.environ.get("BUILD_ID", ""),
    }


@app.get("/voices")
def voices(authorization: str | None = Header(default=None)):
    _check(authorization)
    load()
    return {vid: v["label"] for vid, v in _state["voices"].items()}


@app.post("/reference")
def reference(body: ReferenceBody, authorization: str | None = Header(default=None)):
    """Vérifie et prépare un extrait de voix pub : durée 4-12 s, volume, saturation → WAV 24 kHz à enregistrer."""
    _check(authorization)
    try:
        raw = base64.b64decode(body.audio, validate=False)
    except Exception:
        raise HTTPException(status_code=400, detail="Fichier audio illisible")
    if len(raw) > 6 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop lourd (6 Mo maximum)")
    import io

    import soundfile as sf

    wave, _ = sf.read(io.BytesIO(_to_wav24(raw)), dtype="float32")
    trimmed = trim_silence(wave)
    seconds = len(trimmed) / SAMPLE_RATE
    q = quality_report(wave)
    problems = []
    if seconds < REF_MIN:
        problems.append(f"Enregistrement trop court ({seconds:.1f} s) : lis tout le texte, 4 à 12 s.")
    if seconds > REF_MAX:
        problems.append(f"Enregistrement trop long ({seconds:.1f} s) : 12 s au maximum, lis un texte plus court.")
    if q["clipped"] > 0.002:
        problems.append("Son saturé : éloigne un peu le téléphone de la bouche.")
    if q["peak"] < 0.05:
        problems.append("Son trop faible : rapproche-toi du micro.")
    return JSONResponse(
        {
            "ok": not problems,
            "problems": problems,
            "seconds": round(seconds, 1),
            "wav": base64.b64encode(to_wav(trimmed)).decode() if not problems else None,
        }
    )


@app.post("/synthesize")
def synthesize(body: SynthesizeBody, authorization: str | None = Header(default=None)):
    _check(authorization)
    sentences = [s.strip() for s in body.sentences]
    if not sentences or any(not s for s in sentences):
        raise HTTPException(status_code=400, detail="Aucune phrase")
    if sum(len(s) for s in sentences) > MAX_CHARS:
        raise HTTPException(status_code=400, detail="Texte trop long")
    load()
    voices_ = _state["voices"]
    voice_id = body.voice
    if body.ref_audio and body.ref_text:
        voice_id = "custom"
        voices_ = {**voices_, "custom": _custom_voice(body.ref_audio, body.ref_text.strip())}
    if voice_id not in voices_:
        # voix non préparée (pas d'extrait valable pour ce comédien) : une autre voix du même genre
        same = sorted(v for v in voices_ if v[:6] == voice_id[:6]) or sorted(voices_)
        if not same:
            raise HTTPException(status_code=400, detail="Aucune voix disponible")
        voice_id = same[0]
    voice = voices_[voice_id]
    reuse = body.segments if body.segments and len(body.segments) == len(sentences) else [None] * len(sentences)
    segments = []
    generated = 0
    with _lock:
        for s, old in zip(sentences, reuse):
            if old:
                try:
                    segments.append((s, from_pcm16(base64.b64decode(old))))
                    continue
                except Exception:
                    pass  # segment illisible : régénéré
            wave, sr = _generate(s, voice, body.speed, body.expressive, body.seed)
            if sr != SAMPLE_RATE:
                raise HTTPException(status_code=500, detail="Fréquence inattendue")
            segments.append((s, wave))
            generated += 1
    gaps = body.gaps if body.gaps and len(body.gaps) == len(sentences) else None
    inner = None
    if body.inner_gaps and len(body.inner_gaps) == len(sentences):
        inner = [[(float(p[0]), float(p[1])) for p in row if len(p) == 2] for row in body.inner_gaps]
    final = assemble(segments, pause=body.pause, gaps=gaps, inner=inner)
    seconds = len(final) / SAMPLE_RATE
    tempo = fit_tempo(seconds, body.target_seconds)
    mp3 = to_mp3(final, tempo=tempo)
    if body.format == "json":
        raws = [to_pcm16(w) for _, w in segments]
        bounds, total = [], 0
        for r in raws:
            total += len(r) // 2
            bounds.append(total)
        b64 = lambda b: base64.b64encode(b).decode()  # noqa: E731
        return JSONResponse(
            {
                "mp3": b64(mp3),
                "wav": b64(to_wav(final, tempo=tempo)),
                "segments": b64(b"".join(raws)),
                "bounds": bounds,
                "seconds": round(seconds / tempo, 1),
                "tempo": tempo,
                "voice_used": voice_id,
                "generated": generated,
                "seed": body.seed,
                "quality": quality_report(final),
            },
            headers={"Cache-Control": "no-store"},
        )
    return Response(
        content=mp3,
        media_type="audio/mpeg",
        headers={
            "X-Audio-Seconds": f"{seconds / tempo:.1f}",
            "X-Tempo": f"{tempo:.3f}",
            "X-Voice-Used": voice_id,
            "Cache-Control": "no-store",
        },
    )


@app.exception_handler(Exception)
def _error(_, exc: Exception):  # pragma: no cover - message court, détails dans les logs
    print("synthesize error:", repr(exc))
    return JSONResponse(status_code=500, content={"detail": "Erreur du service de voix"})
