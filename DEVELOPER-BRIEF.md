# Brief and quote request: resaparapente.fr

For: Tarim / Gunja. From: Philippe, TheGlidery SAS. Version 8 (replaces the earlier brief that included a WooCommerce shop).

## What we are building

resaparapente.fr is a directory of paragliding schools. A visitor finds a school, picks a baptême or stage formula and sends a **free booking request** to the school, which answers, confirms the slot and organises the payment itself. **We sell nothing and take no payment.** There is no shop, no cart, no voucher issuing and no refund.

Gift vouchers exist only when a school sells its own: the site shows a link to the school's sales page ("Voir le bon cadeau sur le site de l’école"). Partner schools can also show a promotional price on their card. Both are data in the workbook (sheets "Bons cadeaux écoles" and "Promotions écoles"), with checks and expiry rules described in `docs/CGV-ResaParapente.md`.

A second goal is to fill the stage calendar with every school's dates (see `docs/COLLECTE-DES-STAGES.md`).

## Architecture

- **Static front end** (this repository, Astro, Cloudflare Pages): home, baptême and stage search, 328 school pages from the master workbook, stage calendar with type and month filters, stage-type pages, baptême guide, learning pages, school-own vouchers and promotions, school submission page, legal pages.
- **Two small endpoints** (a Cloudflare Worker or Pages Function is enough, no database server needed; a D1 table or a log is fine for history):
  1. `POST /api/booking-request`: sends the visitor's request to the school. Spec in `docs/BOOKING-AND-CONTACTS.md`.
  2. `POST /api/school-submission`: receives what a school publishes through `/pour-les-ecoles/` (stage dates, baptêmes, voucher link, promotion) and emails it to Philippe's team for review. Spec in the same document.
- **Daily rebuild** (Cloudflare deploy hook called by a cron): expired promotions and past dates disappear without a manual build.
- No third-party payment, no WooCommerce, no Monetico.

## What is already done (this repository)

A visual draft of every public page reading the workbook v7: 328 schools, 641 baptême and 414 stage offers marked Publiable, 4 dated sessions, 1 verified school voucher, no promotion yet, about 100 search cities. Forms validate in the browser and show a summary only. The code is plain Astro with vanilla JavaScript, no framework; please keep it that way, since Philippe edits it with AI tools. See `README.md` (section "Version 8") and `screenshots/`.

## Deliverables to quote (one price each, please)

| # | Deliverable | Notes |
| --- | --- | --- |
| A | Repository, deployment, environments | GitHub repo, Cloudflare Pages staging and production, `resaparapente.fr`, redirects from other owned domains, daily rebuild hook |
| B | Design finish | Real photographs, logo, style guide, e-mail design; WCAG 2.1 AA; tokens in `src/styles/global.css` stay the single source |
| C | Booking request endpoint | Server validation, anti-bot (honeypot or Turnstile), e-mail to the school with signed expiring links (accept, propose another date, decline), receipt to the visitor, delivery log, reminder after 48 h |
| D | School submission endpoint | Receives the form on `/pour-les-ecoles/` and the CSV template; e-mail to the team with a ready-to-paste block; acknowledgement to the school |
| E | Stage collection script in production | `scripts/collect-sessions.py` (written and tested on sample iCal, schema.org and CSV sources) run weekly, output reviewed by a person; optional Google Sheet intake |
| F | Tracking | **Built** (`src/scripts/analytics.js`, consent banner, events listed in `docs/SEA-PLAN.md`); to do: set the IDs, move `generate_lead` to the server's OK answer, test in Tag Assistant |
| G | SEO | **Mostly built**: local pages, price pages, JSON-LD, sitemap, generated `robots.txt`. To do: launch checklist in `docs/SEO-PLAN.md` (`PUBLIC_DRAFT=0`, Search Console, redirects), validate on the Rich Results Test |
| H | Search polish (optional) | French address geocoding (api-adresse.data.gouv.fr), Pagefind for text search |
| J | Reviews endpoint | `POST /api/review`, post-flight email with the personal link (`?avis=<token>`), moderation block to the team, author emails; spec in `docs/AVIS-ET-NOTES.md`. The booking endpoint must create the token |
| K | Google rating | **Built** (`functions/api/google-rating.js`, `scripts/find-place-ids.py`); to do: Google Cloud project, key, quota and budget alert, secret in Cloudflare, run the finder, test one page |
| I | Security, backups, handover | Two-factor on admins, written deployment steps, one handover session |

## Acceptance criteria

- Mobile Lighthouse performance 90 or more and largest contentful paint under 2.5 s on the home page, a school page and a stage-type page.
- A calendar month displays in under 800 ms with 200 sessions; type chips and month select filter instantly.
- One complete test: visitor sends a request, school receives the e-mail, answers through a signed link, visitor gets the answer.
- A school submission reaches the team and is not published without review.
- Expired promotions and past sessions are gone after the daily rebuild.

## Questions to answer in your quote

1. Worker or Pages Function for the two endpoints, and where is the history stored?
2. Which e-mail provider (deliverability, EU hosting)?
3. Fixed price or day rate per deliverable, timeline, monthly maintenance and hosting after launch.
4. Who owns the code and accounts (they must be in TheGlidery's name).

## Known gaps in the draft

- Version 9 adds about 230 local pages, price pages, tracking and a consent banner (README, "Version 9"). Tracking stays off until `PUBLIC_GA4_ID` / `PUBLIC_ADS_ID` are set; the site stays `noindex` until `PUBLIC_DRAFT=0`.
- `src/data/places-extra.ts` holds hand-written local introductions that a local school or instructor must validate.
- No flying-site names are shown: all are "À confirmer" in the workbook.
- Reviews, photos and videos wait for the next data file (`docs/DATA-FILE-SPEC.md`). The review form is a mockup until `POST /api/review` exists; the Google rating block stays hidden until the function has its key and Place IDs.
- Review rules (`/avis-clients/`) and the retention period must be validated by a lawyer (consumer-review rules).
- The two endpoints and the e-mails do not exist yet: the forms show a summary only (`TODO(developer)` in `src/scripts/school.js` and `school-submit.js`).
- No real pictures yet: see `IMAGES.md`. Every slot has a fallback.
- Legal pages carry yellow `[…]` placeholders (address, VAT, phone, mediator, dates).
- The guide pages (baptême, stage types, brevets, courses) are general texts written from public sources (`docs/CONTENT-SOURCES.md`); a certified instructor should read them before launch.
- The school list comes from a third-party directory; the workbook says this does not authorise republishing it, so a legal check comes before launch.
- 159 of 328 schools have no verified offer yet; their pages are marked `noindex`.

## Mise à jour du 15 nov. 2026 (v12) : à lire en premier
1. **Rien à traduire ni à lancer** : tout le contenu anglais (fiches d'école, offres, programmes) est livré traduit (`docs/TRADUCTION-EN.md`).
2. **Contacts passagers et stagiaires** : stockés en base Cloudflare D1, exportables en CSV. Mise en place en 30 min : `docs/CONTACTS-STOCKAGE.md`. Fichier Excel modèle : `data/resaparapente-contacts-v1.xlsx`.
3. **Page de remerciement** (`/merci/passager/`, `/merci/stagiaire/`) : bon de réduction monparapente.fr, guide PDF gratuit (passager ≠ stagiaire), carnet de vol et goodies pour les stagiaires. Valeurs provisoires à remplacer dans `src/data/thanks.ts` (montant et code du bon, T-shirt et bandana).
4. Variables de build/exécution : voir le tableau de `docs/CONTACTS-STOCKAGE.md` (`PUBLIC_BOOKING_ENABLED=1`, `CONTACTS_DB`, `RESEND_API_KEY`, `BOOKING_FROM`, `EXPORT_TOKEN`).
5. Build : `PUBLIC_DRAFT=0 node scripts/build-markets.mjs` pour la mise en ligne (`PUBLIC_DRAFT=1` = brouillon `noindex`).

## Mise à jour du 15 nov. 2026 (v13) : domaines
Sept domaines sont achetés : `resaparapente.fr/.ch/.be` (sites servis) et `bookparaglide.com/.de/.ch/.fr` (marque internationale BookParaglide, redirections 301 vers le site central avec conservation des paramètres de campagne). Tout est déjà dans le code (`markets.mjs`, `functions/_middleware.js`). Il reste à les rattacher dans Cloudflare Pages (Custom domains) et à tester : voir `docs/DOMAINES.md`.
