# LandPro : 200 templates de landing page à partir de pièces combinables

Plan validé par le propriétaire du projet le 2026-10-08. À reprendre dans une nouvelle session.

## Objectif
200 nouveaux templates de landing page e-commerce (vente d'un seul produit, paiement à la livraison),
tous différents au niveau de l'architecture (header, hero, sections, footer), construits à partir de
pièces réutilisables plutôt que page par page.

Existant à ne pas modifier : 60 templates historiques (01 → 60) et 29 designs sur mesure
(61 → 89, `components/landpro/designs/`). Les nouveaux templates commencent au n° 90.

## Catalogue des pièces

### 20 headers
1. Logo à gauche, menu centré, bouton Commander
2. Logo centré, menu de part et d'autre
3. Barre flottante arrondie (pilule)
4. Transparent sur photo, devient blanc au défilement
5. Bandeau promo + header classique
6. Menu numéroté éditorial (01, 02, 03…)
7. Logo seul + bouton « Menu » plein écran
8. Barre latérale verticale d'icônes
9. Header avec barre de recherche large
10. Header deux étages (infos de livraison, puis menu)
11. Header minimal : logo + prix + bouton
12. Header sombre avec soulignement coloré
13. Header avec compte à rebours intégré
14. Header en onglets façon fiche produit
15. Logo géant qui rétrécit au défilement
16. Header avec pastilles d'avantages (livraison, COD, retour)
17. Header façon application mobile (icônes en bas sur mobile)
18. Header asymétrique (logo en biais)
19. Header avec bouton WhatsApp dominant
20. Header avec sélecteur de variante (couleur/taille)

### 40 heroes
- Produit au centre : produit flottant sur disque ; mot géant derrière le produit ; produit qui tourne (3 vues) ;
  produit sur socle avec ombre ; produit éclaté (pièces séparées) ; produit avec points d'info cliquables.
- Photo : photo plein écran texte en bas ; photo plein écran texte centré ; photo coupée en biais ;
  deux photos côte à côte ; collage de 3 photos ; photo dans une arche ; photo dans un cercle ;
  photo avec carte flottante d'avis.
- Texte d'abord : titre géant seul + produit petit ; titre en plusieurs couleurs ; titre manuscrit + photo ;
  manifeste (grand texte, peu d'image) ; question-problème en titre ; chiffre géant (prix ou remise).
- Vente : offre flash avec compte à rebours ; comparatif avant/après ; prix barré géant + stock ;
  packs 1/2/3 dans le hero ; formulaire de commande dans le hero ; hero WhatsApp (conversation simulée).
- Mise en page : grille bento ; écran partagé couleur/photo ; bandes horizontales ; carrousel plein écran ;
  diaporama de variantes de couleur ; slider avant/après glissable.
- Ambiance : vidéo en fond ; dégradé animé ; néon sur fond noir ; papier et texture artisanale ;
  minimal blanc luxe ; style magazine ; style catalogue technique (fiche) ; style story Instagram (vertical).

### 20 footers
1. Colonnes classiques · 2. Nom de la boutique géant · 3. Appel à commander · 4. Minimal une ligne ·
5. Deux panneaux (couleur + liens) · 6. Avec photo · 7. Garanties en icônes · 8. Centré ·
9. Sombre avec mini-produits · 10. FAQ express · 11. Carte de contact WhatsApp · 12. Dernier rappel du prix ·
13. En vague · 14. Bande défilante · 15. Avis vedette · 16. Type ticket de caisse · 17. Étapes de commande ·
18. Dégradé · 19. Collant (barre de commande) · 20. Carte de visite

### Sections (5 versions chacune)
- Avantages : icônes, cartes, liste numérotée, bento, zigzag photo/texte.
- Avis : cartes, carrousel, mur de captures WhatsApp, grand avis unique, note + barres.
- Galerie : grille, mosaïque, bande défilante, vues numérotées, zoom au survol.
- Fonctionnement : étapes, frise, vidéo, schéma annoté, avant/après.
- Caractéristiques : tableau, fiche technique, points sur l'image, comparatif, accordéon.
- FAQ : accordéon, deux colonnes, cartes, chat, numérotée.
- Offres et packs : cartes de prix, sélecteur, tableau, packs illustrés, bundle progressif.
- Formulaire de commande : carte simple, à côté du produit, en étapes, plein écran, compact collant.
- Garantie et confiance : badge, bandeau, carte, sceau, chiffres.
- Appel final : bandeau couleur, photo, compte à rebours, rappel du prix, WhatsApp.

## Règles d'assemblage
- 40 heroes, chacun utilisé 5 fois au maximum, avec à chaque fois des sections, couleurs et polices différentes.
- Aucune combinaison header + hero + footer ne revient deux fois (vérifié par un test).
- Chaque template a sa palette, ses polices et son ordre de sections.
- Formulaire COD toujours présent ; tout le contenu vient du marchand (VM), modifiable dans l'éditeur ;
  sections vides masquées ; aucun chiffre, avis ni marque inventés dans le code.
- FR + AR (RTL), mobile 390 px sans débordement.

## Ordre de construction (un lot = une PR)
1. 20 headers + 20 footers
2. Heroes par lots de 10 (4 lots)
3. Sections (10 familles × 5)
4. Générateur d'assemblage des 200 templates + tests d'unicité + produits de démo

## Méthode pour limiter la consommation
- Une nouvelle session par lot.
- Agents de construction sur le modèle léger (Sonnet) ; la session principale planifie et fait la vérification finale.
- Vérification déléguée : un agent léger compare les captures et ne renvoie que la liste des problèmes.
- Captures réduites, une seule passe de correction par pièce sauf défaut visible.
- Réutiliser le kit existant : `components/landpro/designs/kit.tsx`, `components/landpro/parts.tsx`
  (OrderForm, Countdown, OfferPicker…), `components/landpro/Sections.tsx`.

## Outils (dossier `tools/`)
- `demo-route-page.tsx` : à copier dans `app/landing/zz-demo/[id]/page.tsx` pour l'aperçu local
  (ne jamais committer cette route). `?l=ar` pour l'arabe, `&real=1` pour une vraie page avec une seule photo.
- `shot.py` : captures pleine page avec les vraies polices (polices locales via `npm i @fontsource/<police>`
  dans `/tmp/claude-0/fonts`, Google Fonts étant bloqué dans l'environnement). Dev server : `npx next dev -p 3210`.
- `cmp.py` : maquette / rendu côte à côte.
- `svgkit.py` : boîte à outils Python pour dessiner les images de démo en SVG.
- `GUIDE-designs.md` : conventions utilisées pour les designs 61 → 89 (VM, kit, CSS, RTL, vérifications).
