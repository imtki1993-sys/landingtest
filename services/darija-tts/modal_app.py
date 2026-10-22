"""Déploiement sur Modal (GPU à la demande, facturé à la seconde).

    pip install modal && modal setup
    cd services/darija-tts && TTS_SERVICE_TOKEN=<une longue clé secrète> modal deploy modal_app.py

L'adresse affichée (https://…modal.run) va dans TTS_SERVICE_URL sur Vercel, la même clé dans TTS_SERVICE_TOKEN.
"""

import os

import modal

# Carte graphique : T4 par défaut (la moins chère) ; L4 / A10G plus rapides. Choix au déploiement : MODAL_GPU=L4
GPU = os.environ.get("MODAL_GPU", "T4")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    .pip_install_from_requirements("requirements.txt")
    .add_local_file("audio_utils.py", "/app/audio_utils.py", copy=True)
    .add_local_file("server.py", "/app/server.py", copy=True)
    .add_local_file("prepare_voices.py", "/app/prepare_voices.py", copy=True)
    # voix DODa et modèle marocain intégrés à l'image : démarrage sans téléchargement
    .run_commands(
        "cd /app && python prepare_voices.py --out /app/voices",
        "cd /app && python -c 'import server; server.download_models()'",
    )
    # conversion de voix : OpenVoice V2 (MIT) ; installé sans ses dépendances lourdes (TTS de base, whisper)
    .pip_install(
        "librosa==0.10.2.post1",
        "inflect==7.4.0",
        "unidecode==1.3.8",
        "eng_to_ipa==0.0.2",
        "pypinyin==0.53.0",
        "jieba==0.42.1",
        "cn2an==0.5.22",
        "langid==1.1.6",
    )
    .run_commands("pip install --no-deps git+https://github.com/myshell-ai/OpenVoice.git")
    .add_local_file("vc.py", "/app/vc.py", copy=True)
    .run_commands(
        "cd /app && OPENVOICE_DIR=/app/openvoice python -c 'import vc; vc.download()'",
        "cd /app && OPENVOICE_DIR=/app/openvoice python -c 'import vc; vc.smoke_test(\"/app/voices\")'",
    )
    .env({"VOICES_DIR": "/app/voices", "PYTHONPATH": "/app", "OPENVOICE_DIR": "/app/openvoice"})
    # code du service monté à chaque déploiement (jamais figé dans le cache de l'image)
    .add_local_file("audio_utils.py", "/srv/audio_utils.py")
    .add_local_file("server.py", "/srv/server.py")
    .add_local_file("vc.py", "/srv/vc.py")
)


def _server():
    import sys

    if sys.path[0] != "/srv":
        sys.path.insert(0, "/srv")
    import server

    return server

app = modal.App("landpro-darija-tts", image=image)

# Clé du service : prise dans l'environnement du déploiement (secret GitHub TTS_SERVICE_TOKEN dans le workflow),
# sinon dans le secret Modal « landpro-tts » (déploiement en ligne de commande).
_token = "".join(os.environ.get("TTS_SERVICE_TOKEN", "").split())
_build = os.environ.get("BUILD_ID", "")
SECRETS = (
    [modal.Secret.from_dict({"TTS_SERVICE_TOKEN": _token, "BUILD_ID": _build})]
    if _token
    else [modal.Secret.from_name("landpro-tts")]
)


@app.cls(
    gpu=GPU,
    secrets=SECRETS,
    scaledown_window=300,  # le GPU s'éteint après 5 min sans demande
    timeout=600,
    max_containers=3,
)
class DarijaTTS:
    @modal.enter()
    def start(self):
        _server().load()

    @modal.asgi_app()
    def web(self):
        return _server().app
