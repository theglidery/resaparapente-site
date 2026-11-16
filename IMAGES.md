# Where to put the pictures

Every image slot has a fallback, so the site works with none of them. Drop a file in the right folder with the right name, rebuild, and it appears.

## 1. Header pictures (home and search pages)

Folder: `public/images/hero/`

| File name | Appears on |
| --- | --- |
| `home.jpg` | Home page, behind the headline |
| `bapteme.jpg` | Baptême search page: a tandem flight |
| `stage.jpg` | Stage search page: a teacher and a student at take-off |

- Desktop: about 2000 × 667 px (a wide band, 3:1) for the baptême page; about 1400 × 525 px (8:3) for `stage.jpg` (the band shape and the part of the picture kept are set per page in `HERO_RATIO` and `HERO_POS`, `src/config.ts`); a wide landscape of 1700 × 1000 px or more for `home.jpg`, with the subject on the right because the headline sits on the left.
- Mobile (optional): add `-mobile` to the name, for example `bapteme-mobile.jpg`, 1080 × 810 px (4:3).
- Formats: jpg, webp or avif. Weight: 250 KB at most for desktop, 120 KB at most for mobile.
- The description read aloud for each picture is in `src/config.ts` (`HERO_ALT`).

Already placed from the pictures you sent: `home.jpg` (solo pilot in a Yeti wing), `bapteme.jpg` (tandem), `stage.jpg` (pilot launching a Susi wing), with `-mobile` versions. Check that you hold the rights to these pictures and to the brands visible on the wings.

## 2. The photo library (rights-free pictures, shared by many schools)

Folder: `public/images/library/`, plus one row per photo in the workbook sheet **Bibliothèque photos**:

| Column | What to write |
| --- | --- |
| ID photo | `PH-001`, `PH-002`… |
| Fichier | the file name inside the library folder, for example `bapteme-annecy-001.jpg` |
| Type | Baptême, Stage, Décollage, Atterrissage, Paysage or Matériel |
| Texte alternatif | one sentence describing the scene (read by screen readers, helps search engines) |
| Auteur / crédit, Licence, URL source | where it comes from and under which licence |
| Licence vérifiée le | a date. **A photo with no date is never shown.** |
| Statut | `Prête` once the file is in the folder and the licence is checked |

How a school gets its main picture, in this order:
1. The school's **own file** `public/schools/<school>/main.jpg` (see 3 below).
2. The library photo named in the workbook, sheet Écoles, column **Photo principale : ID bibliothèque** (for example `PH-004`).
3. Otherwise, **automatically** a library photo of the right type (Baptême if the school has baptêmes, else Stage). The pick is stable: the same school always gets the same photo.

The three smaller photos come from the school's own files `photo-2`, `photo-3`, `photo-4`, then from the library IDs listed in **Photos supplémentaires : IDs bibliothèque** (separated by `;`).

Size: 1800 × 600 px for a library photo (3:1 crop, subject centred), 250 KB at most.

## 3. Pictures supplied by a school

Folder: `public/schools/<school>/`, where `<school>` is the **Slug (URL)** column of the workbook (sheet Écoles), for example `les-grands-espaces`.

| File | Use |
| --- | --- |
| `logo.png` (or `.svg`, `.webp`, `.jpg`) | Logo in search results and on the school page. Square, 400 × 400 px, light background |
| `main.jpg` | Main picture, 1800 × 600 px |
| `photo-2.jpg`, `photo-3.jpg`, `photo-4.jpg` | Three smaller pictures, 800 × 600 px |

A school's own picture **replaces** the library photo. Fill the workbook columns **Crédit photo école** and **Autorisation photos école (date)** when a school sends pictures, and keep its written permission.

## 4. Logos

246 logos are already in the project, taken from your file "Fiches écoles parapente 2026-11-09_10" (sheet Contacts et offres): `public/schools/<school>/logo.png`, with empty margins trimmed. They are small (about 300 px wide), enough for the cards and for the school page header. A sharper version can replace a file at any time with the same name.

Every logo is **shown by default**. To hide one (copyright found, or the school refuses): in the workbook, sheet Écoles, column **Afficher le logo (Oui / Non)**, write `Non`, add the reason in **Logo : remarque droits ou refus**, then run `npm run data` and rebuild. The site then shows the school's initials instead. The columns **Logo : type de candidat** (img-logo, favicon, apple-touch-icon, FFVL…) and **Logo : source (URL)** tell you where each logo came from; favicons and apple-touch icons are the least sharp and the most worth a look.

Schools with no logo file (82 of 328) show their initials. To add one: save it as `public/schools/<school>/logo.png` (or .svg, .webp, .jpg).

## 4b. School cards in the search results

Each card shows the school's main picture (same priority as above), its logo, name, place, number of formulas and starting price. With no picture, the card shows a plain blue band and the logo or initials.

## 5. Rules to keep

- No picture is loaded from another website: every file lives in this project, so pages stay fast and nothing disappears.
- People recognisable in a photo need a signed release (droit à l'image). School pictures need the school's permission.
- Rights-free does not always mean no credit: write the credit in the workbook, the site shows it under the photos.
- You can send files to Claude or to the developer with the filled workbook rows, and they place them. Or drop them in the folders and commit with GitHub Desktop (README, part 2).
