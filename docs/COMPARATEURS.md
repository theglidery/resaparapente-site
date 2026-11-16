# Comparateurs (baptêmes, coût jusqu'au brevet, premières dates) — v11

Tout vient de `data/resaparapente-base-ecoles-offres-v11.xlsx` (`npm run data`).

## Comparateur de baptêmes — `/comparateur-baptemes-parapente/`
Colonnes ajoutées à la feuille **Baptêmes** : `Photo / vidéo : statut` (calculé), `Remontée : montant à ajouter`, `Prix total estimé par personne` (calculé), `Total : ce qui reste à confirmer` (calculé), `Profil conseillé`, `Profil : relu ?`. Colonnes existantes utilisées : `Fiche : photos et vidéo incluses`, `Photo et vidéo (supplément)`, `Remontée : inclusion`, `Langue du vol (confirmée)`.
- Filtres : région, durée, budget total, photo/vidéo, remontée, profil, tri (total, prix, durée, prix/minute). **Le filtre de langue du pilote n'apparaît que lorsque 10 offres au moins ont une langue saisie** (aujourd'hui : 0).
- Règle : « non » n'est jamais affiché sans information ; sinon « non précisé » / « à confirmer ». Aucun supplément n'est inventé.
- Liens de présélection (pour la publicité) : `?profile=Enfant`, `?photo=any`, `?lift=yes`, `?dur=3`, `?budget=150`, `?region=…`.
- Données au 15/11/2026 : photo/vidéo connue pour 60 baptêmes sur 949, remontée chiffrée pour 47, langue pour 0. **C'est le premier chantier de collecte** : chaque champ renseigné améliore directement le comparateur.

## Coût jusqu'au brevet — `/comparateur-prix-formation-parapente/` (FR, CH, BE)
Même page pour les trois pays, alimentée par le pays du build.
1. **Forfaits complets** (feuille **Parcours brevet**) : affichés tels que l'école les publie, avec ce qu'ils couvrent, le supplément « matériel acheté hors école » (ex. Thalia : 2 510 CHF avec matériel de l'école, 3 380 CHF avec matériel acheté ailleurs), les examens (feuille **Frais fédéraux**) et le reste à prévoir. Une ligne n'est publiée que si son statut est « Vérifié – publiable » avec prix, URL source et date de relevé.
2. **Estimation par étapes** : pour chaque école, le stage de 3 à 7 jours le moins cher publié pour Initiation, Progression, Perfectionnement. Le visiteur règle le nombre de stages ; les valeurs par défaut sont dans la feuille **Hypothèses parcours** (statut « À valider avec un moniteur »). Les écoles sans prix publié pour une étape demandée sont **exclues**, pas comptées à zéro.
3. Le matériel n'est jamais estimé : le visiteur saisit son budget s'il le souhaite. Les examens fédéraux ne sont ajoutés que s'ils sont vérifiés (CH : 125 + 125 CHF).
- Données au 15/11/2026 : FR 17 écoles avec les trois étapes (38 avec deux), CH 1, BE 2. Les 18 parcours suisses saisis sont « Relevé à relire » sauf Thalia (2) : **relire et passer en « Vérifié – publiable »** les fait apparaître.
- À compléter : licence FFVL (montant), frais belges, forfaits français et belges publiés.

## Quand commencer — `/quand-commencer-parapente/`
Prochaines dates d'initiation et de découverte (feuille Sessions) + prix d'initiation par école. Filtre région.

## Quel baptême choisir — `/quel-bapteme-parapente-choisir/`
Profils (première fois, enfant, sensations, vol long, petit budget) d'après la colonne `Profil conseillé`, calculée par des règles simples (durée, prix, texte). **À relire** (`Profil : relu ?`).
