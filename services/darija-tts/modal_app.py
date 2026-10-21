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
    .env({"VOICES_DIR": "/app/voices", "PYTHONPATH": "/app"})
)

app = modal.App("landpro-darija-tts", image=image)

# Clé du service : prise dans l'environnement du déploiement (secret GitHub TTS_SERVICE_TOKEN dans le workflow),
# sinon dans le secret Modal « landpro-tts » (déploiement en ligne de commande).
_token = "".join(os.environ.get("TTS_SERVICE_TOKEN", "").split())
SECRETS = [modal.Secret.from_dict({"TTS_SERVICE_TOKEN": _token})] if _token else [modal.Secret.from_name("landpro-tts")]


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
        import server

        server.load()

    @modal.asgi_app()
    def web(self):
        import server

        return server.app
