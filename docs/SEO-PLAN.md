# SEO plan (organic search)

## What exists in the code

| Page type | Address | Count (v9) | Target searches |
| --- | --- | --- | --- |
| Local baptême | `/bapteme-parapente/<région, département ou ville>/` | 46 | "baptême parapente annecy", "… en haute-savoie" |
| Local stage | `/stage-parapente/<lieu>/` and `/stage-parapente/<lieu>/<niveau>/` | 41 places + 143 by level | "stage parapente initiation alpes" |
| Hubs | `/bapteme-parapente/`, `/stage-parapente/` | 2 | all destinations |
| Price pages | `/prix-bapteme-parapente/`, `/prix-stage-parapente/` | 2 | "prix baptême parapente" |
| Guides | `/bapteme/…`, `/stage/<type>/`, `/apprendre-le-parapente/…` | about 20 | informational |
| Blog | `/blog/…` | 7 new + older | long tail |
| School | `/ecoles/<slug>/` | 328 (169 indexable) | brand and "école + ville" |

A local page exists only when enough schools back it (2 for a région or département, 3 for a city), and a city page is kept only if its list differs from the département page by at least 25 percent (no duplicate content). Text, prices, durations, children and winter answers are computed from the workbook, so they match it exactly and change with it.

## Structured data (JSON-LD)

School: `SportsActivityLocation` with `makesOffer` (price, unit) and `Event` for each dated session; breadcrumbs. Local pages: `BreadcrumbList`, `ItemList`, `FAQPage`. Articles: `Article`. Star rating (`AggregateRating`) and `Review` only from reviews collected and published on this site (sheet Avis); never from Google Maps or other sites, which Google does not accept. Check with the Rich Results Test on one page of each type after launch.

## Launch checklist

1. Set `PUBLIC_DRAFT=0` in Cloudflare Pages (production only). In draft mode `robots.txt` blocks everything and the pages are `noindex`.
2. Add the domain to Google Search Console and Bing Webmaster Tools; submit `/sitemap-index.xml`.
3. 301 redirects from every other owned domain; keep one version (no `www` duplicate).
4. Daily rebuild hook so prices, promotions and dates stay current.
5. Replace the yellow placeholders in the legal pages; add the unique school descriptions (see `DATA-FILE-SPEC.md`).
6. Validate `src/data/places-extra.ts` (hand-written local introductions) with a local school or instructor; delete any line that cannot be confirmed.

## Content to add, in order of value

1. A unique description (400 to 600 characters) for each of the 169 schools with offers.
2. Confirmed flying sites per school, then local pages can mention them.
3. Dated stage sessions (Event data, calendar).
4. Photos and short videos per school.
5. Reviews with a public source.
6. One blog article per month from real questions seen in Search Console; link each to a local or price page.

## Measuring

Search Console: impressions and position by page type; watch "Discovered, not indexed" on local pages (a sign of thin content: raise the thresholds in `src/lib/places.ts`). Analytics events (see `SEA-PLAN.md`) show which pages lead to a request sent.

## Do not

- Do not publish a local page for a place with one school.
- Do not name a site, a price or a rating we have not checked.
- Do not copy school texts: the quote on a school page stays marked as an extract with a link.
