# Service de voix off darija (LandPro)

Synthèse vocale en darija marocaine pour la page **Voix off** de LandPro.

- **Modèle** : [Habibi-TTS](https://github.com/SWivid/Habibi-TTS), version spécialisée marocaine
  (`Specialized/MAR/model_100000.safetensors`, licence Apache 2.0, usage commercial autorisé).
- **Voix** : 7 comédiens marocains du corpus DODa (4 femmes, 3 hommes, enregistrements studio), téléchargés
  depuis la copie libre d'accès [Jip7e/doda-darija-cosyvoice2](https://huggingface.co/datasets/Jip7e/doda-darija-cosyvoice2)
  (CC-BY-4.0 ; l'original `atlasia/DODa-audio-dataset` demande un compte Hugging Face).
  `prepare_voices.py` choisit pour chacun un extrait de 5 à 9 secondes qui sert de voix de référence.
  Un comédien sans extrait valable est remplacé par une autre voix du même genre (en-tête `X-Voice-Used`).
- **Montage** : chaque phrase est générée séparément (moins de répétitions), puis assemblée avec des pauses,
  des fondus, un volume homogène (≈ -18 dBFS) et exportée en MP3 128 kb/s.

LandPro envoie un texte déjà préparé (chiffres en lettres, mots latins réécrits en arabe : `lib/darija-text.ts`).

## API

| Méthode | Chemin | Rôle |
|---|---|---|
| `POST` | `/synthesize` | `{"sentences": ["…"], "voice": "doda-f1", "speed": 1.0}` → `audio/mpeg` (en-tête `X-Audio-Seconds`) |
| `GET` | `/voices` | voix disponibles |
| `GET` | `/health` | état du service |

Toutes les routes sauf `/health` demandent `Authorization: Bearer <TTS_SERVICE_TOKEN>`.

## Déployer depuis GitHub (sans terminal)

1. Compte sur [modal.com](https://modal.com) → **Settings → API Tokens → New Token**.
2. Dépôt GitHub → **Settings → Secrets and variables → Actions** → ajouter
   `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET` (le jeton Modal) et `TTS_SERVICE_TOKEN` (une longue clé inventée).
3. Onglet **Actions** → **Déployer la voix off darija** → **Run workflow**.
4. Le résumé du déploiement donne l'adresse à mettre dans Vercel (`TTS_SERVICE_URL`) et une voix de test
   à écouter (Artifacts → `voix-test`).

## Déployer sur Modal en ligne de commande

GPU à la demande, facturé à la seconde ; il s'éteint après 5 minutes sans demande.

```bash
pip install modal
modal setup                                   # connexion au compte Modal
cd services/darija-tts
TTS_SERVICE_TOKEN=<la même clé que dans Vercel> modal deploy modal_app.py
```

La première construction télécharge le modèle (~1,4 Go) et prépare les 7 voix : compter 10 à 20 minutes.
Modal affiche ensuite l'adresse du service (`https://…--landpro-darija-tts-darijatts-web.modal.run`).

Dans **Vercel → Settings → Environment Variables** :

- `TTS_SERVICE_URL` = l'adresse affichée par Modal
- `TTS_SERVICE_TOKEN` = la même clé que celle utilisée au déploiement

puis redéployer LandPro. Les voix Salma, Nadia, Imane, Kenza, Youssef, Hamza et Karim deviennent actives.

> Premier appel après une pause : le GPU démarre (≈ 20 à 40 s de plus).

## Autre hébergeur (RunPod, Hugging Face Endpoint, serveur GPU)

```bash
docker build -t landpro-darija-tts services/darija-tts
docker run --gpus all -e TTS_SERVICE_TOKEN=<clé> -p 8000:8000 landpro-darija-tts
```

## Test rapide

```bash
curl -X POST "$TTS_SERVICE_URL/synthesize" \
  -H "Authorization: Bearer $TTS_SERVICE_TOKEN" -H "Content-Type: application/json" \
  -d '{"sentences":["واش عييتي من الشاحن اللي كيطيح ليك فالطوموبيل؟","هاد الحامل المغناطيسي كيشد التيليفون مزيان."],"voice":"doda-f1"}' \
  -o test.mp3
```

## Réglages utiles

- Phrase qui se répète : le service relance automatiquement la phrase avec `nfe_step=64` (plus précis).
- Vitesse : `speed` de 0,7 à 1,3 (1,0 par défaut).
- Tests du montage audio, sans GPU : `python -m unittest test_audio_utils`.

## Licences et mentions

- Habibi-TTS : code MIT ; modèle MAR Apache 2.0.
- DODa audio : Darija Open Dataset (AtlasIA), CC-BY-4.0. Citer la source si les voix sont présentées publiquement.
- Ne pas utiliser `assets/MAR.mp3` fourni par Habibi : cette voix vient de la bibliothèque ElevenLabs.
