# Multilingue (FR / EN / DE) et marques par pays — v11

## Principe
- **Le français reste à la racine** de chaque site (`/comparateur-baptemes-parapente/`). L'anglais et l'allemand vivent sous `/en/` et `/de/`, avec **leurs propres slugs** (meilleur pour le référencement dans chaque langue).
- Langues construites par marché (`markets.mjs` → `locales`) : **FR : fr** · **CH : fr, en, de** · **BE : fr, en, de**. Pour ajouter le néerlandais en Belgique : ajouter `'nl'` à `markets.BE.locales`, à `LOCALES` et à chaque entrée de `PAGES` (`src/i18n/routes.mjs`), puis écrire les textes `nl` dans les vues (voir ci-dessous).
- **Anglais complet sur les trois sites (France, Suisse, Belgique)** : fiches d'école, offres de baptême, de stage et de formation, annuaires et calendrier sont traduits (voir `docs/TRADUCTION-EN.md`). **L'allemand (CH/BE) ne couvre pour l'instant que les comparateurs, guides, bon cadeau, cursus et l'accueil** : ses annuaires renvoient vers les pages françaises.

## Où modifier
| Quoi | Fichier |
|---|---|
| Liste des pages, slugs par langue | `src/i18n/routes.mjs` (`PAGES`) |
| Vue de chaque page | `src/views/*.astro` (un objet `C = { fr, en, de }` en haut de chaque vue) |
| Textes d'interface partagés (menu, boutons) | `src/i18n/ui.ts` |
| Cursus et brevets par pays et langue | `src/i18n/pathway.ts` |
| Génération des routes | `src/i18n/pages.ts` + `src/pages/[...slug].astro` + `regional/pages/[...slug].astro` |
| Menu / pied de page / sélecteur de langue CH-BE | `src/components/RegionalChrome.astro` |
| Menu France | `src/components/Header.astro`, `Footer.astro` |

**Ajouter une page** : créer la vue, ajouter son entrée dans `PAGES` et dans `views` (`pages.ts`). Le routage Cloudflare (`functions/_middleware.js`) et la copie des builds (`scripts/build-markets.mjs`) se déduisent de `PAGES` : rien d'autre à toucher.

**hreflang** : ajoutés automatiquement (`Base.astro`) pour toute page qui déclare `pageKey` et qui existe en plusieurs langues sur le marché.

## Logo selon le pays d'origine
`markets.mjs` contient `brands` : `fr`, `ch`, `be`, `de`, `en` (les deux derniers = marque BookParaglide), chacun avec un fichier logo (+ `@2x`).
1. **Déposer les fichiers** dans `public/images/brand/` : `logo-ch.png`, `logo-be.png`, `logo-bookparaglide.png` (marque internationale, anglais et allemand), versions `@2x`. Dès qu'un fichier existe, il est utilisé.
2. **Tant que le fichier n'existe pas**, les sites .ch et .be affichent le pictogramme + le nom de domaine en texte (« resaparapente.ch ») pour ne pas montrer un logo « .fr ». Le visiteur venu de bookparaglide.* voit le logo Resa Parapente jusqu'à l'ajout de `logo-bookparaglide.png`.
3. **Domaines européens** : `bookparaglide.com`, `.de`, `.ch` et `.fr` sont déclarés dans `redirectDomains` (`markets.mjs`) et redirigent en 301 vers le site central avec `?brand=` (voir `docs/DOMAINES.md`). Un petit script (`BrandLogo.astro`) garde la marque dans un cookie `rp_brand` (30 jours). Les domaines doivent être ajoutés comme domaines personnalisés du projet Cloudflare Pages.
4. Les logos de marque n'ont **pas** été dessinés : à fournir.

## À savoir
- Les contenus allemands visent surtout la Suisse alémanique (cursus SHV). Le cursus allemand (DHV) n'est **pas** documenté : à ajouter seulement si un marché allemand est ouvert.
- Le cursus belge n'est **pas vérifié** : la page le dit et renvoie vers l'école et la fédération.
- Prix : CHF en Suisse, € ailleurs ; formats de nombres selon la langue (`money()` dans `src/lib/compare.ts`).
