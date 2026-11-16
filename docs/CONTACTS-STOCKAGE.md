# Contacts passagers et stagiaires : stockage, export, page de remerciement

Document pour le développeur. Rien n'est à « programmer » : le code est livré. Il faut seulement créer la base, poser les variables et publier (≈ 30 min).

## 1. Ce qui est enregistré

Chaque demande envoyée depuis le formulaire d'une école est **enregistrée dans une base Cloudflare D1** (`CONTACTS_DB`) **avant** l'envoi de l'e-mail à l'école. Si l'e-mail échoue, la ligne reste (statut `echec_email`) et le visiteur peut renvoyer : la demande n'est pas dupliquée (identifiant `request_id` unique).

| Table | Une ligne par | Contenu |
| --- | --- | --- |
| `demandes` | demande | type (passager / stagiaire), école, formule, nom, e-mail, téléphone, dates souhaitées, nombre de participants, message, texte exact du consentement, opt-in MonParapente.fr, page source, statut, dates |
| `participants` | passager ou stagiaire | prénom (facultatif), poids (kg), taille (cm, stages uniquement) |

Schéma : `server/schema-contacts.sql`. Classeur modèle pour lire l'export : `data/resaparapente-contacts-v1.xlsx` (Lisez-moi, Demandes, Participants, Synthèse).

Non collecté par le formulaire actuel : adresse postale (l'école la demande à la confirmation).

## 2. Mise en place (une fois)

```bash
npx wrangler d1 create resaparapente-contacts
npx wrangler d1 execute resaparapente-contacts --remote --file=server/schema-contacts.sql
```

Dans Cloudflare Pages > Settings > Functions : lier la base D1 sous le nom `CONTACTS_DB`, puis poser :

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` (secret) | envoi des e-mails |
| `BOOKING_FROM` | expéditeur vérifié, ex. `Resa Parapente <demandes@resaparapente.fr>` |
| `EXPORT_TOKEN` (secret, ≥ 32 caractères) | accès à l'export |
| `BOOKING_TEAM_TO` (facultatif) | copie cachée de chaque demande à l'équipe |
| `BOOKING_TEST_TO` (facultatif) | en test : tous les e-mails vont à cette adresse, jamais aux écoles |
| `PUBLIC_BOOKING_ENABLED=1` (variable de build) | active le formulaire réel |

## 3. Exporter les contacts

```bash
curl -H "Authorization: Bearer $EXPORT_TOKEN" \
  "https://resaparapente.fr/api/contacts-export?table=demandes&format=csv" -o demandes.csv
curl -H "Authorization: Bearer $EXPORT_TOKEN" \
  "https://resaparapente.fr/api/contacts-export?table=participants&format=csv" -o participants.csv
```

Option `&since=2027-01-01` pour n'exporter que les nouveautés ; `format=json` possible. CSV en `;` avec BOM (s'ouvre directement dans Excel). Les cellules commençant par `= + - @` sont neutralisées. Coller les lignes sous les en-têtes des onglets du classeur modèle.

## 4. Page de remerciement

Après envoi réussi, le visiteur est redirigé vers :
- `/merci/passager/` (baptême) ou `/merci/stagiaire/` (stage), avec `?ref=…&ecole=…&slug=…`. Pages `noindex`, absentes du sitemap.
- Contenu : « Merci, votre demande est bien prise en compte » ; l'école recontacte pour confirmer et organiser la suite ; **bon de réduction monparapente.fr** ; **guide gratuit** (PDF différent passager / stagiaire) ; pour les stagiaires : **carnet de vol** et goodies (T-shirt, bandana, « bientôt en ligne »).
- Événement analytique `generate_lead` une seule fois par demande.

À renseigner dans **`src/data/thanks.ts`** (valeurs provisoires) :
- `voucher.amount` (`10 %`), `voucher.code` (`RESA10`), `voucher.scope`, `voucher.until` : à remplacer par le vrai bon créé dans Shopify (monparapente.fr).
- `goodies[].status` : passer de `soon` à `live` et ajouter l'URL produit quand T-shirt et bandana sont en ligne.

PDF : `public/documents/guide-passager-parapente.pdf`, `guide-stagiaire-parapente.pdf`, `carnet-de-progression-parapente.pdf`. Pour les régénérer après modification des articles : `node scripts/build-guides.mjs` (Python + reportlab requis ; les PDF livrés sont déjà générés).

## 5. RGPD

- Consentement : case « transmission à l'école » obligatoire, texte exact stocké avec la demande. Opt-in MonParapente.fr distinct, non coché, facultatif.
- Durée de conservation proposée : 3 ans après le dernier contact (à confirmer par TheGlidery SAS), puis suppression ; suppression sur demande (`DELETE FROM participants WHERE request_id=…; DELETE FROM demandes WHERE request_id=…;`).
- Ne démarcher que les lignes `optin_monparapente = 1`.
- Politique de confidentialité mise à jour : `src/pages/politique-de-confidentialite.astro`.
