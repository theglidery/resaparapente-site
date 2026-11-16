# Bon cadeau — option B (formulaire relayé à l'école) — v11

**Page centrale** : `/bon-cadeau-parapente-noel/` (FR), `/en/paragliding-gift-voucher/`, `/de/gleitschirm-gutschein-geschenk/`.
Contenu : choix de la formule (premier vol, enfant, vol long, initiation) avec prix issus des comparateurs ; bons vendus directement par les écoles (feuille Bons cadeaux, 35 aujourd'hui) ; formulaire de demande ; promotions en cours (feuille Promotions) ; FAQ.

## Fonctionnement du formulaire
1. Le visiteur choisit l'école, le type de cadeau, sa formule ou son budget, laisse son e-mail et **accepte la transmission à l'école**.
2. `POST /api/gift-request` (`functions/api/gift-request.js`) vérifie la demande, retrouve l'adresse professionnelle de l'école dans `server/gift-directory.json` (privé, jamais envoyé au navigateur) et envoie un e-mail à l'école avec l'acheteur en `reply_to`. L'école répond directement : prix, paiement, envoi du bon. **ResaParapente n'encaisse rien.**
3. **Toutes les écoles sont en « Oui » par défaut** (feuille Écoles, colonne « Relais des demandes de bon cadeau »). Seules les écoles sans e-mail professionnel dans la base (47 aujourd'hui) n'apparaissent pas dans la liste : elles sont marquées « Sans email » à l'export. Une école qui demanderait à ne plus recevoir de demandes se règle en « Non » : elle disparaît du formulaire et n'est jamais contactée. L'adresse utilisée est « Email des demandes de bon cadeau » si renseignée, sinon l'e-mail professionnel.
4. Variables Cloudflare : `RESEND_API_KEY`, `BOOKING_FROM` (déjà utilisées pour les réservations), `GIFT_TEST_TO` (redirige tout vers une boîte de test pendant les essais), `BOOKING_RATE_LIMIT` (facultatif).
5. Sans l'endpoint, le formulaire propose un lien `mailto:` pré-rempli vers ResaParapente.

## Avant la mise en ligne
- Prévenir les écoles (e-mail court : « les demandes de bon cadeau vous seront transmises ; répondez directement au client ; dites-nous si vous ne souhaitez pas les recevoir ») et renseigner « Non » pour celles qui refusent.
- Mentionner la transmission dans la politique de confidentialité et les CGV (finalité : répondre à la demande ; destinataire : l'école choisie ; pas de prospection).
- Tester avec `GIFT_TEST_TO`.

## Publicité
Campagnes générées par `node scripts/make-ads-v11.mjs --market FR|CH|BE` : groupes « Bon cadeau », « Offrir un vol », « Noël », « Stage cadeau », « Réduction et promo ». L'annonce « réduction » ne promet aucune remise : elle renvoie vers les promotions réellement publiées.
