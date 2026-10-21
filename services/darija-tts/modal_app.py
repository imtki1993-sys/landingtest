"""Déploiement sur Modal (GPU à la demande, facturé à la seconde).

    pip install modal && modal setup
    modal secret create landpro-tts TTS_SERVICE_TOKEN=<une longue clé secrète>
    cd services/darija-tts && modal deploy modal_app.py

L'adresse affichée (https://…modal.run) va dans TTS_SERVICE_URL sur Vercel, la même clé dans TTS_SERVICE_TOKEN.
"""

import modal

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


@app.cls(
    gpu="L4",
    secrets=[modal.Secret.from_name("landpro-tts")],
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
