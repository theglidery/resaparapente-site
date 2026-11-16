# Resa Parapente

Pour la compilation et le lancement de cette version, voir [Mise en ligne](docs/MISE-EN-LIGNE.md).

A working draft of resaparapente.fr: home, baptême and stage search, school pages (328, generated from the master workbook), stage calendar, school-own gift vouchers and promotions, stage-type, baptême and learning pages. It is a **static site**: every page is built in advance, so it loads fast and costs almost nothing to host. There is no shop, no payment and no voucher issuing: the site sends free booking requests to schools (see `DEVELOPER-BRIEF.md`).

Screenshots of every page are in `screenshots/`.

## 1. See it on your computer (15 minutes, once)

1. Install **Node.js 22 or newer** (LTS) from https://nodejs.org. Accept the defaults.
2. Install a code editor: **VS Code** (https://code.visualstudio.com) or **Cursor** (https://cursor.com).
3. Unzip this folder, open it in the editor (File > Open Folder), then open the built-in terminal (Terminal > New Terminal).
4. Type these two commands, one at a time:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:4321 in your browser. Edit any file and the page updates when you save. Stop with `Ctrl+C`.

`npm run build` creates the final site in the `dist/` folder (about 1.5 seconds). `npm run preview` serves that build.

## 2. Git and GitHub in plain words

Git is a history of your files: every saved state is a **commit**, so you can go back. GitHub is where the history is stored online, so Tarim or Gunja, you and the AI all work on the same copy.

1. Create a free account at https://github.com, then a **private** repository named `resaparapente-site`.
2. Install **GitHub Desktop** (https://desktop.github.com), the simplest way to start (no commands).
3. In GitHub Desktop: File > Add local repository, choose this folder, then "Publish repository" (keep it private).
4. After each batch of changes: write a short summary ("Update home page text"), click **Commit**, then **Push origin**.

Rule of thumb: commit before asking the AI for a big change. If the result is bad, discard it in one click.

## 3. Put it online for free (Cloudflare Pages)

1. Create a free account at https://dash.cloudflare.com.
2. Workers & Pages > Create > Pages > Connect to Git, pick `resaparapente-site`.
3. Build command: `npm run build`. Output directory: `dist`. Add the variable `NODE_VERSION` = `22`.
4. Each push to GitHub now publishes a new version in about a minute, at an address like `resaparapente-site.pages.dev`.
5. The site is in **draft mode**: it shows a banner and tells Google not to index it. For the real launch, set `PUBLIC_DRAFT=0`; Astro generates robots.txt and the sitemap.

Later: connect the domain `resaparapente.fr` in the same screen. Nothing else is needed on the domain: no shop subdomain.

## 4. Editing with AI

Open the folder in **Claude Code** (terminal) or **Cursor**, and ask in plain French or English. Examples that work well:

- "Change the home page headline to … and keep the same style."
- "On school pages, show the flying sites before the description."
- "Add a page /a-propos/ with the same layout as /apprendre/licence-ffvl/."
- "Make the buttons rounder everywhere." (colours, fonts and spacing are in `src/styles/global.css`, top of the file)

Then check the preview in the browser before you commit. Never paste passwords or API keys into the files.

## 5. Where things are

| You want to change | File |
| --- | --- |
| Colours, fonts, spacing, buttons | `src/styles/global.css` (the `:root` block) |
| Contact e-mail, form endpoints, calendar threshold, draft mode | `src/config.ts` |
| Home page | `src/pages/index.astro` |
| Baptême and stage search pages | `src/components/ListingPage.astro`, filters in `src/scripts/listing.js` |
| School gift vouchers and promotions page | `src/pages/bons-cadeaux.astro` (data: workbook sheets "Bons cadeaux écoles" and "Promotions écoles") |
| Calendar | `src/pages/calendrier.astro` |
| Header, footer, page frame, SEO tags | `src/components/Header.astro`, `Footer.astro`, `src/layouts/Base.astro` |
| School page: offer selection, booking form, school voucher and promotion cards | `src/pages/ecoles/[slug].astro`, behaviour in `src/scripts/school.js` |
| Booking, contacts and school-submission rules for the server | `docs/BOOKING-AND-CONTACTS.md` |
| How stages are collected from schools | `docs/COLLECTE-DES-STAGES.md`, `scripts/collect-sessions.py` |
| Where the text of the guide pages comes from | `docs/CONTENT-SOURCES.md` |
| Texts of the four info tabs (practical info, school, details, school voucher) | `src/lib/content.ts` reads the workbook sheet "Textes génériques" and the "Fiche" columns |
| Logos (shown unless "Afficher le logo" = Non in the workbook) | `public/schools/<school>/logo.png`, see `IMAGES.md` |
| Pictures | `public/images/`, `public/schools/` (see `IMAGES.md`) |
| School, offer, city, session data | `src/data/*.json` (generated from the workbook, do not edit by hand) |

## 6. Updating the data

The master workbook is in `data/`. To refresh the site from it:

```
npm run data
npm run build
```

Only offers with **Publiable = Oui** appear (Actif is not enough: an offer with a contradictory duration stays hidden until it is fixed). The workbook (version 7: `data/resaparapente-base-ecoles-offres-v7.xlsx`) also feeds the search cities, the stage levels, the order of the offers, the place where each stage is held, and the logo and photo fields. A school with no active offer gets a page marked `noindex` and is left out of the sitemap.  The stage calendar page is always on (empty until schools publish dates). There is no demo mode.

## 7. What the draft does and does not do

Does: static pages, price and date display, "verified on" lines; search by nearby big city (drop-down with free text), by school name (flexible), by region and, for stages, by level; price and distance sort; "around me" button; logos in the results and on school pages; journey-aware school pages (`?parcours=stage` shows only stages and never changes the canonical address); baptêmes from cheapest to most expensive with variants kept together; stages by level of progression; school cards in the results (photo, logo, number of formulas, starting price); four info tabs under the offers for the chosen formula; the contact title "Passager volant" or "Élève stagiaire"; one formula selected on the school page with the booking request form beside it (contact, date, two alternative dates, passengers and their weights); an "Offrir" link on a formula, only for schools with a verified gift voucher, opening the school's own sales page; month calendar that filters on where the stage is held and appears only with 5 or more upcoming dates; picture slots (headers, school photos, library) with fallbacks; accessible forms; mobile layout.

Does not yet: send the booking request and the school submissions (the form validates and shows a summary only), send emails, geocode an arbitrary French address (search uses our list of about 100 cities), fill the yellow `[…]` placeholders of the legal pages. The pictures themselves are not in the project yet. These are listed as deliverables in `DEVELOPER-BRIEF.md`.

## 8. Data cautions

- The school list comes from a third-party directory, and the workbook says this does not authorise republishing it. Use the draft internally until the legal check (specification, section 13, item 11) is done.
- Search cities (workbook sheet **Villes de recherche**) have approximate coordinates typed by hand: check them.
- School descriptions are empty ("Présentation de l'école à venir"). Flying-site names are unconfirmed candidates.
- 159 of the 328 schools have no verified active offer yet. Their pages say so, are marked `noindex` and are left out of the sitemap. 6 schools still have the region "À vérifier" and 3 have no coordinates (they never appear in distance searches).
- Every school is set to "Lien école" (booking on the school's own site). Other modes are supported in `src/lib/data.ts` (`bookingLabel`).

## Static HTML copy (to look at pages without a server)

After `npm run build`: `python3 scripts/make-html-copy.py dist resaparapente-html` creates a folder whose pages open by double-click. It is for viewing only; edit the project, not that folder.


## Version 7 additions (look, logo, legal pages, blog)

- **Look**: colours are tokens at the top of `src/styles/global.css` (sky blue, sun, alpine green, logo blue and orange). Mountains are drawn by `src/components/Mountains.astro`. Section "v7" at the end of the style sheet holds the overrides.
- **Logo**: `public/images/brand/` (logo.png, logo@2x.png, pictogramme.png, og-image.png), favicon and apple-touch icon in `public/`. Header and footer use them.
- **Legal pages**: `/conditions-generales-de-vente/` (built from `docs/CGV-ResaParapente.md` with `npm run cgv`, Part I only), `/mentions-legales/`, `/politique-de-confidentialite/`, `/a-propos/`, `/contact/`, `/classement-et-referencement/`. Yellow highlighted `[…]` passages must be completed before launch.
- **Blog**: articles live in `src/data/blog.ts` (add an entry, nothing else to touch). The home page shows the three latest and a link to `/blog/`.
- **School pages**: short description under the name (workbook column "Description"), and a hover drop-down with the extract and link from "Description originelle du site".


## Version 8 (school-own vouchers, promotions, guide pages, school submissions)

- **Business model**: ResaParapente sells nothing and takes no payment. A gift voucher appears only if the school sells it itself and announces it on its official site: the page shows "Voir le bon cadeau sur le site de l’école" (new tab) and the note "Bon vendu et géré par {école}". Partner schools can also show a promotional price on their card. No badge, no effect on ranking. Rules: `docs/CGV-ResaParapente.md` (regenerated into `src/content/cgv.html` with `npm run cgv`) and the page `/classement-et-referencement/`.
- **Data**: workbook v7, sheets **Bons cadeaux écoles** (shown only when Statut = "Vérifié – publiable" with a direct link and a check date), **Promotions écoles** (shown only when Statut = "Validée par l’école" with price, start, end and validation date; expired promotions disappear at build time and, between two builds, in the browser), **Sources de collecte** (one row per school: how its stage dates are collected). Today: 1 verified voucher (Akènefly) and no promotion until the school gives price, dates and conditions. About 124 voucher candidates are "À vérifier".
- **Menus**: Baptême (Biplace and Saut en parapente lead to one in-depth page), Stage (calendar + 7 stage-type pages), Apprendre le parapente (path, three brevets, licence, 6 course modules), Bons cadeaux, Pour les écoles. Content files: `src/data/bapteme-guide.ts`, `stage-types.ts`, `learn.ts`; templates `src/components/ArticlePage.astro`, `Sections.astro`.
- **Stage search**: type chips with counts and a month select, with all location criteria kept (`src/scripts/filters-lib.js`). `?level=` and `?region=` prefill from the URL.
- **Schools publishing their dates**: band "Vous êtes une école de parapente ?" on baptême, stage, calendar and voucher pages (`src/components/SchoolCta.astro`), page `/pour-les-ecoles/` (form, CSV template `public/modele-stages-ecoles.csv`), footer mail link "Rendre visibles vos stages ou baptêmes". Collection process and script: `docs/COLLECTE-DES-STAGES.md`.
- **Removed**: cart, shop address, voucher code page, per-formula gift amount, centralised vouchers, WooCommerce and Monetico.
- **Daily rebuild**: schedule a daily Cloudflare Pages deploy hook so that expired promotions and past dates disappear without a manual build.

## Version 9 (growth: local pages, structured data, tracking, UX)

- **Local landing pages** (about 230): `/bapteme-parapente/<lieu>/`, `/stage-parapente/<lieu>/` and `/stage-parapente/<lieu>/<niveau>/`, plus two hubs. Computed from the workbook in `src/lib/places.ts` and `src/lib/local-content.ts`; hand-written introductions in `src/data/places-extra.ts` (to validate by a local school). Thresholds: 2 schools per région or département, 3 per city.
- **Price pages**: `/prix-bapteme-parapente/` and `/prix-stage-parapente/` (tables computed from the data), and 7 new blog articles (`src/data/blog.ts`).
- **School pages**: structured data (offers, events, breadcrumbs), a factual introduction when the description is empty, nearby schools, optional **video** and **rating** (workbook columns "Vidéo (URL)", "Note moyenne", "Nombre d’avis", "Source des avis", "URL des avis"; see `docs/DATA-FILE-SPEC.md`).
- **UX**: booking form in two steps, sticky "Voir les formules" / "Continuer ma demande" bar on phones, filters "Accepte les enfants", "Vol en hiver", "Bon cadeau de l’école", tags on cards, trust block on the home page.
- **Tracking and consent**: `src/scripts/analytics.js`, banner in `src/components/Consent.astro`, IDs in environment variables (`PUBLIC_GA4_ID`, `PUBLIC_ADS_ID`, `PUBLIC_ADS_LEAD_LABEL`). Off until set. Events in `docs/SEA-PLAN.md`.
- **Launch switch**: `PUBLIC_DRAFT=0` makes the site indexable; `robots.txt` is generated (`src/pages/robots.txt.ts`). Keep the default (draft) on every other environment.
- Plans: `docs/SEO-PLAN.md`, `docs/SEA-PLAN.md`; next data file: `docs/DATA-FILE-SPEC.md`.

## Version 10 (reviews, Google rating, comparison, ad files)

- **Workbook v8** (`data/resaparapente-base-ecoles-offres-v8.xlsx`, used by `npm run data`): new sheet **Avis** (moderation) and columns Google Place ID, Vidéo (URL), Note moyenne, Nombre d’avis, Source des avis, URL des avis in sheet Écoles. Same offers as v7.
- **Customer reviews**: form on every school page (`src/components/Reviews.astro`, `src/scripts/reviews.js`), published from the sheet Avis after moderation, average and list on the school page, rating on cards from 3 reviews, sort "Mieux notées", structured data from our own reviews only. Rules page `/avis-clients/`. Process, endpoint and legal notes: `docs/AVIS-ET-NOTES.md`.
- **Google Maps rating**: only the Place ID is stored. `scripts/find-place-ids.py` proposes IDs; `functions/api/google-rating.js` reads the rating live (no storage), shown with attribution on the school page. Needs the secret `GOOGLE_PLACES_API_KEY`.
- **Comparison on local pages**: filters (children, winter), sort, switch cards / comparison table. Presets by address: `?kids=1`, `?winter=1`, `?tri=prix|note`, `?vue=tableau`.
- **Google Ads files**: `npm run ads` writes Ads Editor import files in `ads/` (baptême, stage, brand; all paused) from the same data as the pages. Plan and competitor analysis: `docs/SEA-PLAN.md`.
- The Cloudflare Pages Function lives in `functions/`: keep this folder in the repository.
