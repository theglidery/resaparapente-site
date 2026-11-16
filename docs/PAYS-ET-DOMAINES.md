# France, Suisse romande et Belgique francophone

> **À jour (nov. 2026)** : les domaines `resaparapente.fr/.ch/.be` et `bookparaglide.com/.de/.ch/.fr` sont achetés. Rôle de chacun et marche à suivre : `docs/DOMAINES.md`.

Un dépôt Astro, un classeur, un projet Cloudflare Pages. Le domaine de la requête sélectionne le catalogue. Il n’y a ni redirection fondée sur la position du visiteur ni conversion de monnaie. Les pages françaises gardent leurs URL. Les guides communs restent sur le domaine français et sont accessibles depuis la navigation régionale.

## Déployer

1. Dans le projet Pages existant, conserver `npm run build` et le dossier de sortie `dist`. Le répertoire `functions` à la racine du projet fait partie du déploiement. Le script prépare les variantes dans le même build et la fonction de routage choisit la bonne variante à chaque requête.
2. Rattacher les domaines réellement détenus au **même projet Pages**, dans **Custom domains**. Le code prévoit `resaparapente.fr`, `resaparapente.ch` et `resaparapente.be`, sans accent, ainsi que la redirection vers le domaine sans `www` si l’alias est raccordé. Si un nom de domaine avec accent est retenu, définir le domaine canonique et les redirections DNS/HTTP en conséquence.
3. Vérifier les noms de domaine, le HTTPS et les réponses HTTP sur chacun. Activer les liens externes du menu avec `PUBLIC_CH_LIVE=1` et `PUBLIC_BE_LIVE=1` quand les domaines correspondants répondent. Auparavant, le menu français ouvre les présentations locales sous `/suisse-romande/` et `/belgique-francophone/`.
4. Pour l’ouverture, `PUBLIC_DRAFT=0` active la compilation de production. Un domaine régional sans formule reste en préparation, avec interdiction d’indexation et sans sitemap de catalogue. Les présentations hébergées en France restent hors sitemap. Chaque domaine indexable utilise ses propres canoniques et son sitemap. Les catalogues couvrant des écoles différentes ne sont pas déclarés comme traductions de la même page.

La Suisse et la Belgique démarrent avec des liens de contact directement chez l’école. Les formulaires d’envoi et les campagnes publicitaires configurés pour la France restent propres au domaine français.

## Ajouter les écoles dans le même classeur

- Onglet **Écoles** : ajouter une colonne `Pays (ISO)` avec `FR`, `CH` ou `BE`. Pour les lignes historiques, une cellule vide signifie France. L’identifiant école doit être unique dans le classeur. Renseigner la ville, la région ou le canton et le site officiel. Saisir uniquement les écoles retenues pour le périmètre francophone.
- Onglets **Baptêmes** et **Stages** : conserver le lien par identifiant école et ajouter `Prix publié (montant)` et, si utile, `Prix maximum publié (montant)` pour les nouvelles lignes CH et BE. Saisir le nombre en **CHF** pour CH et en **EUR** pour BE. Les colonnes historiques en euros restent utilisées pour FR. Ces montants ne sont pas convertis.
- Onglet **Sessions** : l’identifiant doit pointer vers une formule de stage de la même école. Pour CH et BE, utiliser `Prix session (montant)` si un tarif propre à la session est publié.
- Relancer `npm run data` puis `npm run build`. Vérifier les lignes effectivement publiables, les tarifs dans leur devise, le lien vers chaque école et les dates avant d’ouvrir le catalogue.

Un aperçu statique de `dist/` sert le site français et ses deux présentations. Le choix selon le domaine nécessite l’exécution de la fonction Pages dans l’environnement de déploiement.


## État de la V10

Le classeur `data/resaparapente-base-ecoles-offres-v10.xlsx` applique déjà ces règles : 18 écoles suisses romandes et 5 écoles belges sont saisies. Voir `docs/COLLECTE-CH-BE.md`.
