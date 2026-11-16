# Domaines achetés (nov. 2026) et rôle de chacun

Sept domaines, **un seul projet Cloudflare Pages**. Le code (`markets.mjs` + `functions/_middleware.js`) décide selon le nom de domaine appelé.

| Domaine | Rôle | Comportement |
|---|---|---|
| `resaparapente.fr` | Site France (marque Resa Parapente) | Servi directement. Canonique et sitemap propres. |
| `resaparapente.ch` | Site Suisse romande (fr, en, de) | Servi directement (variante `_markets/ch`). |
| `resaparapente.be` | Site Belgique francophone (fr, en, de) | Servi directement (variante `_markets/be`). |
| `bookparaglide.com` | Entrée anglaise internationale (marque **BookParaglide**) | 301 → `https://resaparapente.fr/en/?brand=en` |
| `bookparaglide.de` | Entrée allemande | 301 → `https://resaparapente.ch/de/?brand=de` |
| `bookparaglide.ch` | Entrée suisse en anglais | 301 → `https://resaparapente.ch/en/?brand=en` |
| `bookparaglide.fr` | Protection de la marque côté France | 301 → `https://resaparapente.fr/` |

Les rôles des quatre domaines `bookparaglide.*` sont des **choix par défaut** (la demande ne les précisait pas). Pour en changer un, modifier une seule ligne de `redirectDomains` dans `markets.mjs` (`to` = marché cible `FR`/`CH`/`BE`, `locale` = `fr`/`en`/`de`, `brand` = `en`/`de`, facultatif), puis redéployer. Aucun autre fichier à toucher.

Pourquoi des redirections et pas des sites séparés : une seule base de contenu à maintenir, pas de contenu dupliqué (une page = une URL canonique), et le référencement se concentre sur les trois domaines `resaparapente`. Les domaines `bookparaglide` servent à la marque, aux annonces et au bouche-à-oreille. Si, plus tard, une version anglaise ou allemande autonome est ouverte (avec son propre catalogue d'écoles), il suffira de passer le domaine concerné de `redirectDomains` à `markets` (travail à chiffrer).

## Ce que fait la redirection
- Conserve le chemin et les paramètres de l'adresse (`utm_*`, `gclid`…) : les campagnes publicitaires ne perdent pas leur suivi.
- Ajoute `?brand=en` ou `?brand=de` : un petit script garde la marque dans un cookie (`rp_brand`, 30 jours) et affiche le logo BookParaglide si le fichier existe.
- Ajoute le préfixe de langue (`/en/`, `/de/`) sauf s'il est déjà présent.
- Traite `www.` comme le domaine nu (même redirection).
- Tout autre nom de domaine inconnu reste en `noindex`.

## À faire par le développeur (30 minutes)
1. Cloudflare Pages → projet → **Custom domains** : ajouter les 7 domaines et leur `www.` (certificats HTTPS automatiques). Zones DNS dans Cloudflare, ou CNAME vers `<projet>.pages.dev` chez le registrar.
2. Mettre `PUBLIC_CH_LIVE=1` et `PUBLIC_BE_LIVE=1` quand `resaparapente.ch` et `.be` répondent.
3. Mise en ligne : `PUBLIC_DRAFT=0 node scripts/build-markets.mjs`.
4. Tester : `curl -I https://bookparaglide.com/` doit répondre `301` avec `location: https://resaparapente.fr/en/?brand=en` (et de même pour les trois autres).
5. Google Search Console : ajouter `resaparapente.fr/.ch/.be` (propriété de domaine) et soumettre chaque sitemap. Inutile pour les domaines `bookparaglide` (simples redirections).
6. Redirection e-mail et expéditeur Resend : vérifier le domaine d'envoi (`BOOKING_FROM`) sur le domaine choisi.

## À fournir par TheGlidery
- Le logo BookParaglide : `public/images/brand/logo-bookparaglide.png` (et `@2x`). Tant qu'il manque, le logo Resa Parapente s'affiche.
- Une vérification de marque (INPI / EUIPO / WIPO) pour « BookParaglide » avant d'investir en publicité.
- Décision sur les rôles ci-dessus si un autre usage est souhaité.
