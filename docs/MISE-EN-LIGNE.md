# Mise en ligne de ResaParapente
 
Pour le catalogue par domaine, voir [France, Suisse et Belgique](PAYS-ET-DOMAINES.md).

## Données et compilation

- La base utilisée est `data/resaparapente-base-ecoles-offres-v8.xlsx`. Après modification, lancer `npm run data` avec Python 3 et openpyxl. L’export applique les décisions de publication et relie chaque session à une formule publiable de la même école.
- `npm ci`, puis `npm run build`. Le dossier public généré est `dist/`. Le projet complet doit être fourni à Cloudflare Pages pour que `functions/api/booking-request.js` soit inclus. Le répertoire `server/` contient le fichier de routage des demandes et reste hors de `dist/`.
- En préproduction, laisser le mode brouillon par défaut. Utiliser `PUBLIC_DRAFT=0` sur la production uniquement. Vérifier sur le domaine final la réponse des pages, le fichier robots.txt, le sitemap et les balises canoniques, puis soumettre `sitemap-index.xml` dans Search Console.

## Parcours de réservation

- Par défaut, le visiteur accède au catalogue ou au site de l’école. L’école confirme le créneau et le prix et gère le paiement. Les bons cadeaux restent vendus directement par les écoles.
- Pour activer le formulaire, choisir et vérifier le domaine d’envoi chez Resend. Dans Cloudflare Pages, configurer `PUBLIC_BOOKING_ENABLED=1` à la compilation et `RESEND_API_KEY` (secret) et `BOOKING_FROM` à l’exécution. Configurer une limite de requêtes pour `POST /api/booking-request` dans Cloudflare. La fonction reconnaît aussi un binding `BOOKING_RATE_LIMIT` si le déploiement le fournit.
- En préproduction, définir `BOOKING_TEST_TO` sur la boîte de l’équipe. Tester l’envoi, la réception, le bouton Répondre et un échec de livraison. Les envois vers cette boîte ne déclenchent pas la conversion. Retirer la redirection de test avant l’ouverture au public.
- Paramétrer `PUBLIC_GA4_ID`, `PUBLIC_ADS_ID` et `PUBLIC_ADS_LEAD_LABEL` selon votre compte. La conversion primaire s’appelle « Demande transmise ». Elle part après acceptation par le service d’envoi, avec consentement et hors mode test. Le clic sortant vers l’école reste un événement distinct. Le site ne mesure ni achat ni réservation confirmée.
- Les formulaires d’avis et d’ajout d’offres des écoles nécessitent encore leur propre raccordement serveur. Vérifier les coordonnées, mentions et durées de conservation dans les pages juridiques avant publication.

## Lancement Google Ads

Les CSV dans `ads/` sont des fichiers d’import Google Ads Editor. Ils sont générés en pause. `npm run ads` les reconstruit à partir des offres publiques.

1. Commencer par quelques destinations où les données et le contact ont été revérifiés. Prévoir des groupes séparés pour les baptêmes en tandem et les stages d’initiation. Les mots clés et les annonces pointent vers la page locale correspondante.
2. Dans Google Ads Editor, contrôler les URL et paramètres d’import, les zones visées, le budget et les termes négatifs. Les groupes « enfants » et « hiver » ouvrent leur filtre sur la page locale.
3. Activer une campagne après avoir testé son parcours. Examiner les termes de recherche et le coût par demande transmise. Vérifier auprès des écoles le nombre de demandes qui obtiennent une réponse et un créneau.
