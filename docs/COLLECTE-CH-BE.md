# Collecte Suisse romande et Belgique francophone (14/11/2026)

Classeur : `data/resaparapente-base-ecoles-offres-v10.xlsx`, construit par `scripts/build-v10.py` à partir du V9 et de `data/research_chbe.py` (écoles, offres, villes, avec l’URL source de chaque ligne).

## Ce qui a été ajouté
- **Suisse romande (CH, CHF)** : 18 écoles, 47 baptêmes, 10 stages. Fribourg (Gruyère), Valais (Crans-Montana, Verbier, Zinal, Val-d’Illiez), Vaud (Riviera, Les Diablerets, Villars, Suchet), Genève.
- **Belgique francophone (BE, EUR)** : 5 écoles répertoriées par la Fédération belge de vol libre (Buzet, Godinne, Liège, Marche-en-Famenne, Marilles), 1 baptême et 11 stages. Aucun tarif public lisible : les offres sont publiées sans prix.
- 17 villes de recherche (12 CH, 5 BE).

## Règles de saisie appliquées
- Les montants CH et BE sont saisis dans `Prix publié (montant)` et `Prix maximum publié (montant)` (Baptêmes, Stages), dans la devise du pays. Les colonnes en euros restent vides pour ces lignes.
- `Pays (ISO)` vaut FR sur toutes les lignes historiques.
- Écoles CH et BE : statut « Brouillon », identité « À confirmer », présentation « Rédigé ». Contact directement chez l’école (pas de formulaire).

## À compléter ou à vérifier
- Doublon possible : Fly Riviera (S341) et Les Ailes du Léman (S340) partagent le point de rendez-vous de Noville. ACBFLY Dents du Midi (S349) et Champéry Parapente sont le même pilote : une seule fiche, l’autre tarif est cité en note.
- Paradelta (S346) : le décollage est au sommet du Salève (Haute-Savoie), l’atterrissage à Troinex (Genève).
- Écoles repérées mais non ajoutées, faute de page lisible : Imala Parapente (Belgique, page illisible), Turbulence Club, Verbier Summits, Sam-Air, Fly Xperience (Villeneuve), les écoles de Villars (six selon l’office de tourisme), Leysin (deux), Les Diablerets (deux), un vol au Chasseral sans nom de prestataire.
- Clubs belges de la liste FBVL sans ville indiquée (La Roch’Ailes, Les Ailes du Levant, Mousquet’air, Potes en Ciel, Touch the Sky, Top Delta, Ikarus, Airsport) : à localiser avant ajout.
- Coordonnées GPS : approximatives (centre de la commune), à vérifier.
