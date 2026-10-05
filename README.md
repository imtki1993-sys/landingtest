# LandPro

Plateforme SaaS de landing pages et de boutiques e-commerce **COD (paiement à la livraison)**, pensée pour le Maroc.

- **Landing pages** : 60 templates, éditeur visuel (sections à ajouter, masquer, déplacer, modifier), génération du contenu par IA, domaines personnalisés.
- **Boutiques** : vitrine multi-produits avec panier.
- **Commandes** : formulaire COD, suivi des leads, expédition et synchronisation Ozon Express.
- **Marketing** : Pixel Meta + API Conversions, statistiques de visites et de conversion.
- **Comptes** : espaces de travail (workspaces), validation des comptes par un administrateur, abonnements avec quotas.

Stack : Next.js 15 (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth + Storage) · Vercel.

## Démarrer en local

```bash
npm ci
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

Les variables d'environnement sont toutes décrites dans [`.env.example`](.env.example).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (génère d'abord `app/landing-public.css`) |
| `npm test` | Tests automatiques (Vitest) |
| `npm run lint` | Lint ciblé (hooks React, code inaccessible…) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run format` | Formate le code (Prettier) — à lancer avant de commiter |

La CI GitHub (`.github/workflows/ci.yml`) vérifie, à chaque pull request : formatage, lint, types, tests et build. Vercel déploie automatiquement `main` en production et chaque pull request en prévisualisation.

## Organisation du code

```
app/
├─ api/                 Routes API (une par dossier, route.ts)
├─ landing/[slug]/      Landing page publique (+ api/landing/[slug] pour l'aperçu)
├─ store/[slug]/        Boutique publique
├─ pages/               Tableau de bord des landing pages + éditeur (builder-v3/)
├─ orders/, products/, stores/, analytics/, settings/…   Tableau de bord
├─ globals.css          CSS du tableau de bord
└─ landing-public.css   CSS des pages publiques — GÉNÉRÉ, ne pas modifier
components/
├─ landpro/             Moteur des 60 templates (registre, sections, hero, modèle de rendu)
├─ LandingTemplateV4.tsx Point d'entrée des templates (délègue à landpro/)
└─ public/              Composants des pages publiques (polices, langue)
lib/
├─ server-auth.ts       authContext() : compte connecté + approuvé + workspace
├─ public-landing.ts    Lecture (mise en cache) d'une landing publiée
├─ landing-cache.ts     Vidage du cache après modification
├─ monitoring.ts        Suivi des erreurs (logs + alerte webhook)
├─ public-error.ts      Message d'erreur montré à l'utilisateur
└─ landing-template-presets.ts  Interface historique des templates
scripts/build-landing-css.js    Génère app/landing-public.css à chaque build
tests/                  Tests Vitest
```

## Règles à respecter

**Sécurité — isolation entre clients.** Les routes utilisent la clé de service Supabase : les règles RLS de la base ne s'appliquent pas. Chaque route du tableau de bord doit donc :

1. appeler `authContext(req)` (compte connecté **et** approuvé) ;
2. filtrer **chaque** lecture et écriture par `.eq("workspace_id", workspaceId)`.

Un oubli expose les données d'un autre client (voir `tests/products-security.test.ts`).

**Erreurs.** Dans un `catch`, appeler `reportError(e, "api/ma-route")` et répondre avec `publicMessage(e)` : les messages métier restent visibles, les erreurs techniques sont masquées.

**Cache des landing pages.** Une route qui modifie ce qu'affiche une landing (page, produit, réglages) doit être enveloppée par `withLandingInvalidation(...)`, sinon la page publiée peut rester en cache jusqu'à 5 minutes.

**CSS.** Modifier `app/globals.css`, jamais `app/landing-public.css` (régénéré automatiquement).

## Templates de landing pages

Les 60 templates sont définis dans `components/landpro/registry.ts` : un thème (couleurs, typographie), une variante de hero et une liste de sections par défaut. Les identifiants `01 → 35` sont enregistrés dans les pages existantes : ne pas les renommer (ou ajouter un alias dans `TEMPLATE_ALIASES`).

L'ordre réel des sections d'une page vient de `content.section_order` (modifié dans l'éditeur) ; `content.hidden_sections` masque une section sans la supprimer. Les sections sans contenu (avis, comparatif…) sont signalées dans l'éditeur et masquées en ligne.

## Alertes d'erreur

Définir `ERROR_WEBHOOK_URL` (webhook Slack, Discord, Google Chat ou Make) dans Vercel pour recevoir une alerte à chaque erreur serveur (une par minute maximum pour une même erreur). Sans cette variable, les erreurs restent visibles dans les logs Vercel (filtre `[monitoring]`).
