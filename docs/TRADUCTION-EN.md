# Traduction anglaise des fiches, offres et stages

Si le pilote choisit l'anglais (`EN` dans l'en-tête, ou `/en/`), il voit les fiches d'école, les offres de baptême, de stage et de formation, les dates, les prix, les durées, les âges, les poids, les périodes, les « inclus / non compris » et les options **en anglais**. Les trois sites (France, Suisse romande, Belgique francophone) sont concernés. Un concurrent comme ecole-de-parapente.fr n'est qu'en français : c'est un avantage pour les pilotes étrangers.

## Où est le contenu anglais
- `/en/schools/<école>/` : fiche d'école en anglais (une page par école ayant des offres).
- `/en/tandem-paragliding-schools/`, `/en/paragliding-course-schools/`, `/en/paragliding-course-calendar/` : annuaires et calendrier.
- Comparateurs, bon cadeau, parcours, guide : déjà en anglais (v11).
- Le formulaire de demande de réservation de la version France reste en français (le bouton « Request a booking » l'indique). À traduire ensuite : `school.js`, `school-submit.js`, `reviews.js`, `listing.js` (chaînes en dur).

## Comment la traduction est faite (4 couches, par ordre de priorité)
1. **Règles** (`src/i18n/rules-en.mjs`) : prix, durées, âges, poids, équipes (« Équipe citée par l'école »).
2. **Dictionnaire à la main** : `src/data/i18n/en.json` (CH/BE et noms d’offres France, 1 822 entrées) et `en.fr-hand.json` (France, compilé depuis `data/i18n/hand/*.py` avec `python3 scripts/i18n-hand.py`). Les clés sont les textes français : l'ordre du classeur n'a pas d'importance.
3. **Traduction automatique** : `src/data/i18n/en.auto.json`, produite par `scripts/i18n-translate.mjs` (voir ci-dessous).
4. **Sinon le texte reste en français**, balisé `lang="fr"` (bon pour les lecteurs d'écran), et la fiche anglaise est en `noindex` tant que la description de l'école n'est pas traduite (pas de contenu français sur une URL anglaise dans Google).

## Ce qui est fait à la main, ce qui reste
| | Fait à la main | Reste |
|---|---|---|
| Suisse romande, Belgique | tout (descriptions, offres, programmes, options) | rien (les écoles sans texte propre ont une description type, traduite par règle) |
| France | tout : 938 noms d'offres, âges, poids, périodes, durées, niveaux, groupes, inclus, non compris, options, météo, équipement, régions, **descriptions des écoles (333), programmes (727) et textes d'origine (276)**, traduits à la main (nov. 2026) | rien d'obligatoire. Les noms de lieux (place, ville de session) restent tels quels : ce sont des noms propres. |

## Traduction automatique (facultatif, plus nécessaire)
Tout le contenu actuel est déjà traduit : **le développeur n'a rien à lancer**. Le script ci-dessous ne sert que pour de **nouvelles** écoles ou offres ajoutées plus tard (sinon le texte reste en français, balisé `lang="fr"`, et la fiche anglaise passe en `noindex`). Le script a besoin d'un accès Internet, donc à lancer sur votre ordinateur (pas dans l'environnement de travail de l'assistant).
```
npm install
DEEPL_API_KEY=xxxx:fx node scripts/i18n-translate.mjs --countries FR          # DeepL Free : 500 000 caractères / mois, le reste tient dans un mois
# ou, avec Claude :
ANTHROPIC_API_KEY=sk-ant-... node scripts/i18n-translate.mjs --provider anthropic --countries FR
node scripts/i18n-translate.mjs --countries FR --dry-run                          # compte les caractères sans rien envoyer
PUBLIC_DRAFT=1 node scripts/build-markets.mjs
```
Le script reprend où il s'est arrêté (`en.auto.json` n'est jamais écrasé), accepte `--limit 100000` (caractères par exécution) et `--fields desc,program,orig`. **Il n'a pas pu être testé contre l'API réelle** : lancer d'abord `--limit 2000`, relire le résultat, puis le reste.

## Contrôle qualité conseillé
- Relire les 20 écoles les plus visitées : une traduction automatique transforme parfois « baptême » en « baptism » ; le dictionnaire à la main gagne toujours (ajouter une ligne dans `data/i18n/hand/` puis `python3 scripts/i18n-hand.py`).
- Un texte corrigé à la main dans `en.fr-hand.json` remplace la version automatique.
- Ajouter une école ou une offre : relancer `node scripts/i18n-extract.mjs --countries FR` pour voir ce qui manque.
- Les traductions manuelles de nov. 2026 sont dans `data/i18n/batches/*.txt` (une ligne `numéro|anglais`, numéro = ordre de `data/i18n/todo-fr.json`) et déjà fusionnées dans `src/data/i18n/en.json`. Pour corriger un texte : modifier la valeur dans `en.json` (la clé est le texte français).
- Pages anglaises vérifiées : 207 fiches d'école, aucune en `noindex` hors mode brouillon (`PUBLIC_DRAFT=0`).
