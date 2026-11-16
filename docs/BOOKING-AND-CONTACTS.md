# Booking requests, school submissions and contacts: what the server must do

The site forms are built and validate in the browser. Today they only show a summary ("maquette"). The developer builds the server side described here. ResaParapente takes no payment: it passes requests to schools.

## 1. Two contact types, always named on the form

| Type | Code | Title shown on the form | Used when the chosen formula is |
| --- | --- | --- | --- |
| Baptême passenger | `bapteme-passenger` | Passager volant : vos coordonnées | a baptême |
| Student | `student` | Élève stagiaire : vos coordonnées | a stage |

The title changes with the formula chosen. The form also sends the code. Settings: `CONTACT_TYPES` in `src/config.ts`. Store the contact (email, name, phone, type, school, offer, date, consent text and date of the checkbox: it names the school that receives the data).

> **À jour (nov. 2026)** : le stockage D1, l'export, les lignes par participant et la page de remerciement sont décrits et livrés : voir `docs/CONTACTS-STOCKAGE.md`. L'adresse postale n'est plus demandée par le formulaire ; le reçu visiteur (étape 4) n'est pas encore envoyé (la page de remerciement le remplace).

## 2. Booking request (button "Réserver", then "Envoyer ma demande à l’école")

The button on a formula is **Réserver**; the form button stays "Envoyer ma demande à l’école" so that the visitor knows the request goes to the school and that nothing is paid on the site.

`POST /api/booking-request` (JSON), built by `src/scripts/school.js`:

```json
{
  "schoolId": "S064",
  "offerId": "OFF-…",
  "offerName": "Prestige",
  "contact": { "type": "bapteme-passenger", "name": "…", "email": "…", "phone": "…",
               "address": { "street": "…", "postcode": "38410", "city": "…" } },
  "dates": ["2027-05-14", "2027-05-15", "2027-05-21"],
  "participants": [{ "name": "…", "weight": 72 }],   // stage: also "height" (cm, 100 to 230)
  "message": "…"
}
```

Server steps:
1. Validate again: required fields, email format, postal address (street, 5-digit postcode, city), 1 to 8 participants, weights 15 to 200 kg, heights 100 to 230 cm for a stage, dates in the future and different (the two fallback dates are optional). Refuse bots (honeypot or Turnstile).
2. Store the request, status `sent`.
3. Email the school (workbook sheet Écoles, column "Email professionnel") with all the details and three signed, expiring buttons: accept the first date, propose another date, decline. Copy to the team.
4. Email the visitor a receipt: "Votre demande a été transmise à {école}. Elle vous répondra directement et organisera le paiement."
5. Create a random **request token** stored with the request. The day after the desired date, email the visitor once: "Vous avez volé avec {école} ? Donnez votre avis" with `https://resaparapente.fr/ecoles/{slug}/?avis={token}` (see `docs/AVIS-ET-NOTES.md`).
6. Log delivery of both emails. If the school has not answered after 48 hours, remind it once, then alert the team.

## 3. School submission (page /pour-les-ecoles/, footer link, bands "Publier mes stages")

`POST /api/school-submission` (JSON), built by `src/scripts/school-submit.js` (`SCHOOL_SUBMISSION.endpoint` in `src/config.ts`):

```json
{
  "school": "…", "site": "https://…",
  "contact": { "name": "…", "email": "…", "phone": "…" },
  "topics": ["stage", "bapteme", "bon", "promo"],
  "sessions": [{ "type": "initiation", "name": "…", "start": "2027-04-12", "end": "2027-04-16", "price": "690", "places": "6", "city": "Annecy", "url": "…" }],
  "bapteme": { "text": "…", "url": "…" },
  "gift": { "name": "…", "url": "…", "price": "…", "validity": "…" },
  "promo": { "title": "…", "price": "89", "regular": "110", "start": "…", "end": "…", "conditions": "…", "url": "…" },
  "message": "…"
}
```
(`bapteme`, `gift`, `promo` are `null` when the school did not tick the topic; `sessions` is empty without "stage". The consent box is validated in the browser: the server must also require it.)

Steps: validate, refuse bots, email the team a block that can be pasted into the workbook (sheets Sessions, Bons cadeaux écoles, Promotions écoles), email the school an acknowledgement. **Nothing is published without review**: a person checks the school's official site first (rules in `/classement-et-referencement/`). The same page offers a CSV template (`public/modele-stages-ecoles.csv`), imported with `python3 scripts/collect-sessions.py --csv-file file.csv --school Sxxx`. Full process: `docs/COLLECTE-DES-STAGES.md`.

## 4. School gift vouchers and promotions: data, not a flow

No form, no payment. The workbook decides what is shown:
- **Bons cadeaux écoles**: shown when Statut = "Vérifié – publiable", with a direct link and a check date. A broken or withdrawn link is switched to "Lien cassé ou expiré" / "Retiré à la demande de l’école" and disappears at the next build.
- **Promotions écoles**: shown when Statut = "Validée par l’école" with price, start, end and validation date; hidden automatically after the end date.

Tracking to add (deliverable F): click on "Voir le bon cadeau sur le site de l’école", click on "Offrir", click on a promotion.

## 5. Where the texts live

- Generic texts of the info tabs: workbook sheet **Textes génériques**, column E (editable without a developer).
- Formula- and school-specific texts: the "Fiche : …" and "Présentation : …" columns of the sheets Baptêmes, Stages and Écoles.
- Privacy information on the forms: `src/pages/politique-de-confidentialite.astro`; terms: `docs/CGV-ResaParapente.md`.
