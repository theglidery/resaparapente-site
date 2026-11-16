# Spec for the next data file (workbook v8)

Philippe is collecting more stages, baptêmes, photos and videos. This page says exactly what to provide so that it appears on the site at the next `npm run data && npm run build`, with no code change. Columns marked **new** are read by the export script as soon as they exist; today the site works without them.

## 1. Sheet Écoles (one row per school)

| Column | Status | Format | What the site does with it |
| --- | --- | --- | --- |
| Description (nos mots, 400 à 600 caractères) | exists | plain text, our words, no copy from the school | Introduction of the school page. Without it the page shows a short factual text built from the data, which Google may see as thin: **this is the highest-value column to fill** |
| Slug (URL) | exists | lower case, hyphens | Page address, never change after launch |
| Sites de vol | sheet exists | name + status "Confirmé" only when the school or its site names the take-off | Local pages never name a flying site that is "À confirmer" |
| Photo principale : fichier école | exists | file name, e.g. `main.jpg`, placed in `public/schools/<slug>/` | Main picture |
| Photos supplémentaires : fichiers école | exists | up to 3 names `photo-2.jpg`… | Gallery |
| Crédit photo école, Autorisation photos école (date) | exists | text, date | Credit line; no school photo is published without a date |
| **Vidéo (URL)** | new | YouTube or Vimeo address, or a `.mp4` link. An own file `public/schools/<slug>/video.mp4` (max 15 MB, 30 s) wins over the link | Click-to-load player: no third-party request before the visitor clicks |
| **Google Place ID** | new | ID proposed by `scripts/find-place-ids.py` and checked on Google Maps | The only Google datum we may keep. The rating itself is read live and never typed in |
| **Note moyenne** | new | number 1 to 5, decimal comma accepted | Shown with the source; needed for a star rating in Google |
| **Nombre d’avis** | new | integer | Shown, and sent as `reviewCount` |
| **Source des avis** | new | "Google", "Facebook", "Tripadvisor"… | **Required**: a rating without source is ignored |
| **URL des avis** | new | public page where the reviews can be read | Link next to the rating |

Rules for ratings: **never copy Google ratings here** (Google's terms). The columns below are for a rating a school or another source publishes (for example Facebook), shown with its source and without structured data. Only reviews that exist on a public page, copied as they are, with the date of reading in the column "Dernière vérification". Never an average computed by us from an unknown base, never a rating for a school that did not publish one.

## 2. Sheets Baptêmes and Stages (one row per formula)

Already read: name, price (and maximum), unit, per-person price, URL source, URL réservation, check date, duration (min/max), age, weight, period, included/not included, the "Fiche : …" columns.

To fill with priority because they drive the filters and the local pages:

| Column | Why |
| --- | --- |
| Âge (text such as "dès 4 ans", "à partir de 12 ans") | Filter "Accepte les enfants" and the children answer on local pages. The rule recognises "enfant", "dès/à partir de N ans" with N from 3 to 12, "N à M ans" |
| Poids (text such as "20 à 110 kg") | Shown on the card and in the booking form hint |
| Période / saison (words "hiver", "ski" for winter flights) | Filter "Vol en hiver" |
| Durée du vol min / max (min) | "Durée du vol" tile and FAQ on local pages |
| Fiche : photos et vidéo incluses | Answers a frequent question and the visitor's decision |
| Lieu / décollage | Only when confirmed by the school |

For stages: Niveau (normalisé) must come from the list in sheet Listes (initiation, progression, perfectionnement, SIV, encadré, marche et vol, séjours et voyages…). A formula whose name contains voyage, séjour, itinérant, etc. is classified "Séjours et voyages" automatically.

## 3. Sheet Sessions (dated stages)

One row per start date: school, formula, start, end, price, places, source, check date, status. The site shows only future, visible, verified sessions. Dated sessions create calendar entries and `Event` structured data; the more there are, the more the calendar and the stage pages are worth. Process: `docs/COLLECTE-DES-STAGES.md`.

## 4. Photos and videos: file rules

- Photos: JPG or WebP, 1600 px wide minimum for the main picture, 4:3 or 16:9, under 400 KB after compression (the build does not resize). Name `main`, `photo-2`, `photo-3`, `photo-4`; folder `public/schools/<slug>/`.
- Logo: `logo.svg` or `logo.png` in the same folder, with "Logo validé pour publication" = Oui.
- Describe each photo in a sentence in the sheet "Bibliothèque photos" (column "Texte alternatif"): it is the alt text read by screen readers and used by Google Images.
- Never a photo of an identifiable person without the school's written consent; keep the date of the consent in the column "Autorisation photos école (date)".

## 5. Email to send to a school to validate its page

> Bonjour,
> Votre école figure sur resaparapente.fr, annuaire gratuit où les visiteurs vous envoient une demande de réservation (aucun paiement sur le site : vous répondez et organisez le paiement).
> Voici votre fiche : {URL}. Pouvez-vous nous dire en retour : (1) si les formules, prix et dates sont exacts, (2) le nom du site de décollage principal, (3) l’âge et le poids minimum pour un baptême, (4) si vous volez en hiver, (5) une photo de l’école ou de vos vols (avec l’autorisation de la publier), et une courte vidéo si vous en avez une.
> Pour publier vos prochains stages datés : {URL de /pour-les-ecoles/}.
> Merci, Philippe, TheGlidery (ResaParapente)

## 6. Checks before delivering the file

- No empty "Statut publication" on a school that has offers.
- Every published price has a check date less than 90 days old.
- No video or photo whose rights are unknown.
- `npm run data` prints the counts: compare them with the previous run (schools, offers, sessions). A drop means a column was renamed.

## 7. Sheet Avis (customer reviews)

One row per review, moderated by a person. Columns: ID avis, ID école, École (calculated), Statut (À modérer, Publié, Refusé, Retiré à la demande de l’auteur), Vérification (Demande vérifiée, Déclaré par le participant), Formule, Note (1 à 5), Titre, Texte, Prénom affiché (first name and initial), Date de l’expérience (mois), Date de dépôt, Date de publication, Réponse de l’école, Date de la réponse, Motif de refus, Email de l’auteur (not published), Jeton de demande, Remarque interne. Published only when Statut = Publié with note, text and publication date. Process and rules: `docs/AVIS-ET-NOTES.md`.
