# Customer reviews and Google ratings

Two separate things, kept apart on the site:

| | Reviews of participants on ResaParapente | Google Maps rating |
| --- | --- | --- |
| Source | People who flew or trained, through our form | Google, read live |
| Stored by us | Yes (workbook sheet **Avis**) | **No**, only the Place ID |
| Shown | School page (list, average, replies), cards from 3 reviews, sort "Mieux notées" | School page header: "★ 4,6/5 (321 avis) sur Google Maps", link to Google |
| Structured data for Google Search | Yes: `AggregateRating` and `Review` (only our own reviews) | **No** (ratings copied from another site are not eligible) |
| Rules page | `/avis-clients/` | `/avis-clients/#google` |

## 1. Our reviews

### Flow
1. Visitor sends a booking request. The server stores a **request token** (random, not guessable) tied to the school, and emails the receipt.
2. The day after the desired date (or the end of the stage), the server emails: "Vous avez volé avec {école} ? Donnez votre avis" with the link `https://resaparapente.fr/ecoles/{slug}/?avis={token}`. The form opens, the review is marked "Demande vérifiée". One email only, no reminder.
3. Anyone can also leave a review without the link (it is then "Déclaré par le participant"): same moderation, no badge.
4. `POST /api/review` (`src/scripts/reviews.js`, `REVIEWS.endpoint` in `src/config.ts`): payload `{schoolId, token|null, rating 1..5, kind, experienceMonth "YYYY-MM", title|null, text, author:{first,last,email}}`.
   - Validate again (rating 1 to 5, text of at least 40 characters, no phone, email or link in the text, month not in the future). Refuse bots (honeypot field `website`, Turnstile).
   - One review per token and one per email and school per 12 months.
   - Store with status "À modérer". Email the team a block to paste into the sheet **Avis** (columns in this order: ID avis, ID école, Statut, Vérification, Formule, Note, Titre, Texte, Prénom affiché = first name + initial of the last name, mois, date de dépôt…). Email the author: "Votre avis sera relu sous 7 jours".
   - If the token is valid, set Vérification = "Demande vérifiée".
5. Moderation (a person, within 7 days): check against the rules of `/avis-clients/`, then set **Statut = Publié** and **Date de publication**; or **Refusé** with a reason (sent to the author). The review appears at the next build (daily rebuild or deploy hook).
6. School reply: the school answers by email; paste the text in **Réponse de l’école** with the date. A school cannot delete or edit a review. A school that disputes a review sends proof; the team asks the author and decides.
7. Author withdrawal: set **Retiré à la demande de l’auteur** (disappears at the next build).

### What the site does
- Publishes only rows with Statut = Publié, a rating, a text and a publication date (`scripts/export-data.py` -> `src/data/reviews.json`).
- School page: average (simple mean), count, how many come from a verified request, list newest first (5 shown, the rest in a fold), dates of publication and experience, school replies.
- Cards and the "Mieux notées" sort: only from `REVIEWS.minOnCard` (3) reviews. The sort is never the default.
- Structured data (`SportsActivityLocation` with `aggregateRating` and up to 10 `review`) only when reviews exist. Check with the Rich Results Test after the first reviews.

### French rules to confirm with a lawyer before launch
Online consumer reviews are regulated (Code de la consommation, article L111-7-2 and decree 2017-1434; DGCCRF guidance): the site must say whether reviews are checked and how, show the date of the review and of the experience, say that nothing is paid for reviews, state the ranking criteria, let the professional see why a review was refused, and keep a procedure to report a review. `/avis-clients/` is written to cover these points; the retention period is left as a yellow placeholder. Personal data: first name and initial only, email never shown, withdrawal on request (CNIL/RGPD).

### Do not
- Do not ask schools to write or submit reviews of themselves, do not offer a discount or gift for a review, do not write or edit a review.
- Do not copy reviews from Google, Facebook or the schools' sites into the sheet.

## 2. Google Maps rating

### What Google allows (read on 13 November 2026, to re-check)
- **Place IDs** may be stored indefinitely. Other Places content (rating, count, text) may not be pre-fetched, cached or stored beyond the exceptions in the terms. Source: [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies) and the [Maps service terms](https://cloud.google.com/maps-platform/terms/maps-service-terms/index-20240522).
- Displaying it requires attribution ("Google Maps"), a link to the place on Google Maps, and information that reviews are not verified by Google.
- Scraping Google Maps pages is not allowed. Use the API.

### How we do it
1. **Find Place IDs** (once, then for new schools): `GOOGLE_PLACES_API_KEY=... python3 scripts/find-place-ids.py` writes `place-ids-a-verifier.csv` with a confidence level (name, distance, same website). Check each on Google Maps, then paste the IDs in the workbook column **Google Place ID** (sheet Écoles).
2. **Live read**: the school page asks `functions/api/google-rating.js` (Cloudflare Pages Function) when the header comes into view. The function calls Places API (New) Place Details with field mask `rating,userRatingCount,googleMapsUri`, returns it with `Cache-Control: no-store`, and stores nothing. It answers only for the IDs listed in `/google-places.json` (built from the workbook) and only for requests from our own pages.
3. If the function, the key or Google is unavailable, the block stays hidden. The page never breaks.

### Setup (developer)
1. Google Cloud: create a project, enable **Places API (New)**, create an API key restricted to that API. Set a **daily quota** and a **budget alert** (each school page view that shows a rating is one Place Details call; check the current price list and the monthly free allowance before launch).
2. Cloudflare Pages: add the secret `GOOGLE_PLACES_API_KEY` (production only). Optional `PLACES_BASE_URL` is for tests.
3. Run the finder script, fill the column, `npm run data`, deploy.
4. Check one school page: the rating shows with "Google Maps" and a working link. Check the privacy page mentions that the page contacts our own server only (no Google script runs in the visitor's browser).

### Cost control
Only school pages, only when the block is visible, never on lists. If traffic grows, restrict to schools with at least 20 Google reviews, or move to a paid caching licence if Google offers one for your use. Do not add your own cache: it would break the terms.

### Why not show it on cards or sort by it
It would mean one call per card or a stored copy, both outside the terms and costly.
