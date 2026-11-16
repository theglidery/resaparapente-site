# SEA plan (Google Ads): how to win against Prévol and Takamaka

**Settle first**: the site takes no payment and the lead is free for the visitor. Decide how ResaParapente earns (commission per request or per flight, school subscription, featured placement) before spending: without it there is no cost-per-request ceiling. Note also that **both competitors are schools listed in our directory** (Prévol, Saint-Hilaire-du-Touvet, 4 baptêmes; Takamaka Annecy, 4 stages), so some of our leads can go to them.

## 1. What the two competitors show (pages read on 13 November 2026)

| | Prévol (page "voler en biplace") | Takamaka (page "parapente France") |
| --- | --- | --- |
| Who | One school (since 1986, FFVL label) at one site | One brand, 9 regional sites (about 18 destinations in the menu) |
| Promise | A dream flight over Saint-Hilaire, "ages 6 to 99" | A turnkey tandem experience, instructors "diplômés d’État" |
| Prices on the page | None | None |
| Reviews or ratings | None | 3 short quotes, first names, no stars or count |
| Choice between schools | No (it is the school) | No (one brand) |
| Filters (children, winter, duration) | In a booking pop-up only | None |
| Payment / cancellation said | Not on the page | Weather policy only, no refund terms |
| Distractions | Full shop menu, cart, account, cookie tables | Language switch, many destinations |

They sell their own flights, with strong brand and direct booking. They are weak where a visitor who is still choosing wants answers: **how much, how long, can my child fly, can I fly in winter, what do others say**. That is our ground.

## 2. Our differentiators, and where each one is on the site

| Promise in the ad | Proof on the landing page | Status |
| --- | --- | --- |
| "27 écoles comparées" | Local pages list every school, with a **comparison table** (price, duration, children, winter, rating) | built |
| "Dès 65 € par personne" | Price tile and table, each price dated on the school page | built |
| "Enfants, vol d’hiver : filtres" | Filter boxes on local pages and the baptême list | built |
| "Demande gratuite, aucun paiement" | Trust strip on every local page and the home page | built |
| "Avis des participants" | Reviews, average, school replies, verified-request badge | built, empty until the first reviews |
| "Note Google" | Live Google Maps rating on school pages | built, needs the API key (see `AVIS-ET-NOTES.md`) |
| "Prix dans votre ville" | 46 baptême destinations and 143 stage pages by level (they have 9 to 18) | built |

Do not claim "meilleur prix", "n°1" or "avis vérifiés" (we verify the request, not the flight).

## 3. Search intents and how to bid

| Intent | Examples | Our angle | Landing page |
| --- | --- | --- | --- |
| Generic + place | "baptême parapente annecy" | Comparison, price from, free request | Local page |
| Price | "prix baptême parapente", "baptême parapente pas cher" | Price table by flight length and region | `/prix-bapteme-parapente/` |
| Criteria | "baptême parapente enfant", "baptême parapente hiver" | Filter already ticked | Local page with `?kids=1` or `?winter=1` (also `?tri=prix`, `?tri=note`, `?vue=tableau`) |
| Learning | "stage parapente initiation", "stage SIV" | Levels and dates | `/stage-parapente/<lieu>/<niveau>/` |
| Gift | "bon cadeau parapente" | Vouchers sold by the schools themselves | `/bons-cadeaux/` |
| Brand | "resaparapente" | Protect the name | Home |
| Competitor names | "prevol", "takamaka" | **Do not bid.** Both are listed schools, a competitor-name ad can mislead and annoy partners, and their Quality Score on their own name is higher than ours | none |

Where we will lose: queries where the visitor already chose the operator ("takamaka annecy prix"). Where we can win: queries where the visitor has not chosen, and every destination the operators do not cover.

## 4. Campaign files (generated, always paused)

`npm run ads` writes, from the same data as the pages (so prices and counts in ads always match the landing page):

- `ads/campagne-bapteme.csv`: one ad group per place with at least 3 schools, plus "Enfants" and "Hiver" groups where at least 2 formulas mention them, 10 or more headlines, 3 to 4 descriptions, phrase and exact keywords, campaign negatives.
- `ads/campagne-stage.csv`: 150 ad groups (places and stage levels).
- `ads/campagne-marque.csv`: brand protection.
- `ads/RAPPORT.txt`: what was left out (headlines over 30 characters, descriptions over 90).

Import in **Google Ads Editor** (Account, Import, From file), check, enable one campaign at a time. The columns follow the Editor's documented names; test with the brand campaign first, since Google can change the format. Re-run the command before each import (prices and counts move with the workbook).

Settings used: Search network only, no search partners, France, French, manual CPC 0.60 € as a starting point (change after data), daily budget 10 € per campaign (3 € for brand). Move to "Maximise conversions" only after 30 `generate_lead` conversions in 30 days.

## 5. Negative keywords (already in the files)
gratuit, occasion, voile, aile, achat, fabricant, simulateur, jeu, emploi, formation moniteur, brevet moniteur, paramoteur, pendulaire, saut en parachute, parachute, wingsuit, canada, maroc, bali, prix voile, pdf, cours en ligne, location voile, chute libre. Add from the search-terms report every week.

## 6. Extensions and assets to add by hand
- **Sitelinks**: Prix d’un baptême, Stage initiation, Bons cadeaux, Écoles près de moi.
- **Callouts**: Demande gratuite, Aucun paiement sur le site, Prix datés, Écoles indépendantes.
- **Structured snippet** (Types): Baptême, Stage, Initiation, SIV, Séjours.
- **Price assets**: baptême from the price page; only values shown on the page.
- **Images**: school photos only with written permission.

## 7. Landing page quality (what Google scores)
Relevance (place and kind in H1, title and ad), speed (static pages, no third-party script before consent), mobile (sticky button, filters), clear next step (cards and "Réserver"). After launch check Core Web Vitals in Search Console and PageSpeed on one local page.

## 8. Tracking (already in the code, off until IDs are set)
Environment variables in Cloudflare Pages: `PUBLIC_GA4_ID`, `PUBLIC_ADS_ID`, `PUBLIC_ADS_LEAD_LABEL`. Nothing loads before the visitor accepts the banner; with no ID there is no banner and no cookie.

| Event | When | Use |
| --- | --- | --- |
| `select_school` | card or table "Voir" | interest |
| `compare_filter`, `compare_view` | filters, sort, table | shows which criteria matter |
| `select_offer`, `begin_request`, `request_step2` | formula, form | funnel |
| **`generate_lead`** | request sent | **main conversion** (move to the server's OK answer when the endpoint exists) |
| `click_school_site`, `click_voucher`, `click_promo` | links to school | secondary |
| `submit_review`, `google_rating_shown` | reviews | quality |
| `click_sticky_cta`, `play_video`, `click_school_cta`, `school_submission` | UX and school side | not for bidding |

## 9. Test plan (weeks 1 to 6)
1. Week 0: tracking tested in Tag Assistant; brand campaign only.
2. Weeks 1 to 2: baptême campaign on 5 destinations with the most schools (see hubs), 10 € per day. Two ad variants (price in headline versus "écoles comparées").
3. Weeks 3 to 4: add the criteria ad groups (enfant, hiver) with pre-set filters; add stage levels.
4. Read after 30 requests: cost per request, conversion rate by destination and device, search terms. Ask each school how many requests it answered and how many became flights (Ads cannot see that).
5. Check **Auction insights** to see which advertisers share the auctions; adjust only on facts.

## 10. Limits to keep in mind
No tool here can see competitors' bids or Keyword Planner volumes: volumes and costs are known only after the first weeks. Operators will often rank above us on their own destinations; our gain is the comparison query and every place they do not serve.

## 11. Legal
The privacy page lists the tools and choices only when IDs are set. No names, emails or phone numbers are sent to Google: events carry school and offer identifiers only.


---
## Ajout v11 (15/11/2026) : comparateurs, bon cadeau, « saut en parapente »

Générateur : `node scripts/make-ads-v11.mjs --market FR` (puis `CH`, `BE`) → `ads/v11-<marché>.csv` (Google Ads Editor, tout en pause) + `ads/RAPPORT-v11-<marché>.txt`.

| Campagne | Page d'atterrissage | Mots-clés (extraits) |
|---|---|---|
| Comparateur baptêmes | `/comparateur-baptemes-parapente/` (+ présélections `?photo=any`, `?lift=yes`, `?dur=3`, `?profile=Enfant`) | comparateur baptême parapente, prix baptême parapente, baptême parapente vidéo incluse, remontée incluse, 30 minutes, enfant |
| Quel baptême choisir | `/quel-bapteme-parapente-choisir/` | quel baptême parapente choisir, premier vol parapente conseils |
| Comparateur formation | `/comparateur-prix-formation-parapente/` | comparateur école parapente, comparateur prix formation parapente, prix brevet parapente, combien coûte une formation parapente |
| Quand commencer | `/quand-commencer-parapente/` | quand commencer le parapente, stage initiation parapente dates |
| Parcours et brevets | `/cursus-brevets-parapente/` | brevet parapente, devenir pilote de parapente |
| Bon cadeau | `/bon-cadeau-parapente-noel/` | bon cadeau parapente, offrir un baptême parapente, cadeau noël parapente, idée cadeau parapente, carte cadeau parapente |
| Réduction et promo | idem | bon de réduction parapente, code promo baptême parapente (annonce honnête : promos réellement publiées) |
| Saut en parapente | `/saut-en-parapente/` + pages région | saut en parapente, saut parapente, saut en parapente prix / tandem / biplace, saut en parapente <région> |

- Suisse : campagnes en français, allemand et anglais (pays ciblé : Suisse). Belgique : français et anglais. Mots-clés allemands : tandemflug gleitschirm, gleitschirm gutschein, gleitschirmkurs kosten, gleitschirm brevet schweiz.
- Mots-clés négatifs par langue (occasion, parachute, paramoteur, emploi, achat de voile…).
- Saisonnalité : lancer « Bon cadeau » et « Noël » **maintenant** (Noël dans 40 jours) ; activer « Comparateur formation » plutôt en février-mars (préparation de la saison).
- Mesure : événement `gift_request_sent` envoyé à GA4 à l'envoi du formulaire cadeau.

### Saut en parapente : prendre la première place en France
- Une page dédiée et claire sur l'intention : `/saut-en-parapente/` (titre, H1, FAQ, données chiffrées mises à jour à chaque compilation). L'ancien guide `/bapteme/biplace-saut-en-parapente/` renvoie vers cette page.
- Maillage : menu Baptême, pied de page, listes de baptêmes, comparateur, bon cadeau, accueil.
- Objectif réaliste : se positionner sur « saut en parapente + région/ville » (pages `/bapteme-parapente/<lieu>/`) avant de viser le terme générique ; liens depuis les articles du blog et du partenaire MonParapente (à faire côté MonParapente).
- Belgique et Suisse : même page sur .be et .ch, contenus localisés (prix en CHF, écoles locales), en français, allemand et anglais en Suisse.


---
## Ajout v11b (15/11/2026) : campagnes « conquête » contre ecole-de-parapente.fr

Objectif : prendre du trafic à ecole-de-parapente.fr sur **les mêmes mots-clés que lui**, en France, en Suisse et en Belgique. Relevé de leur site (titre, H1, menus, pages régions et villes) : école de parapente, stage de parapente (initiation, perfectionnement, pilote confirmé, SIV, cross et thermique, à l'étranger), baptême de parapente, saut en parapente, prix du parapente, bon cadeau, brevets FFVL, permis et licence, cours théoriques, + 16 régions et 21 villes.

Commande : `node scripts/make-ads-v11.mjs --market FR` (puis `CH`, `BE`) ; budget des campagnes conquête : `--budget-conq 15` (par jour et par campagne, 15 par défaut ; 10 pour les autres).

| Campagne conquête | Mots-clés (extraits) | Page d'atterrissage |
|---|---|---|
| Écoles et stages | école de parapente, écoles de parapente france, trouver une école de parapente, annuaire / liste des écoles, école de parapente ffvl ; stage de parapente, stage parapente prix, prochains stages, stage initiation, perfectionnement, cross, thermique, pilote confirmé, SIV, mini-stage, stage à l'étranger | accueil, `/stage/`, `/stage/<type>/` |
| Baptême et prix | baptême de parapente, vol biplace parapente, parapente tandem, prix du parapente, tarif parapente, combien coûte le parapente | comparateur de baptêmes |
| Brevets et cours | brevet parapente, brevet initial / de pilote / pilote confirmé, permis parapente, licence ffvl, cours de parapente, aérologie, apprendre le parapente | `/apprendre/brevets/…`, `/apprendre/licence-ffvl/`, `/apprendre/cours/` |
| Lieux (France) | école / stage / baptême / « parapente » + chaque ville et région de leur annuaire (Annecy, Chamonix, Grenoble, La Clusaz, Morzine, Millau, Luchon, La Réunion, Alpes du Nord, Pyrénées…) | page locale la plus proche (`/stage-parapente/<lieu>/`, `/bapteme-parapente/<lieu>/`) |
| Marque concurrent (optionnel) | ecole-de-parapente.fr, ecole de parapente fr | accueil |

- Le saut en parapente, le bon cadeau et les comparateurs restent dans leurs campagnes (un mot-clé n'est porté que par une campagne : le générateur écarte les doublons).
- **Suisse** : mêmes campagnes en français, allemand (Gleitschirmschule, Gleitschirmkurs, Tandemflug, Brevet) et anglais (paragliding school / course / tandem / licence). **Belgique** : français et anglais.
- **Campagne « Marque concurrent » : à décider.** Enchérir sur le nom d'un concurrent est autorisé par Google Ads en France, en Suisse et en Belgique ; le texte des annonces ne cite jamais son nom ni ne suggère de lien avec lui. Un concurrent peut quand même déposer une réclamation si son nom est une marque déposée. Le nom est ici proche d'une expression générique, le risque est faible mais non nul : la campagne est séparée pour être supprimée en un clic. Prévoyez un budget faible et un CPC plafonné.
- Pages locales qui manquent par rapport à leur annuaire (aucune école ou trop peu chez nous) : Paris, Corse. Si vous avez des écoles référencées là, ajoutez-les dans le classeur : la page locale et les groupes d'annonces seront créés au prochain calcul.
- Ne pas viser : « météo parapente » et « paramoteur » (autre intention).
