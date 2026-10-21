# Image générique (RunPod, Hugging Face Endpoint, serveur GPU…) : CUDA + Habibi-TTS + voix DODa.
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg git && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY audio_utils.py server.py prepare_voices.py ./
RUN python prepare_voices.py --out /app/voices && python -c "import server; server.download_models()"
ENV VOICES_DIR=/app/voices
EXPOSE 8000
# TTS_SERVICE_TOKEN est fourni au lancement : docker run -e TTS_SERVICE_TOKEN=… --gpus all -p 8000:8000 image
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
