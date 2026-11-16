# Where the guide pages come from

Pages concerned: `/stage/<type>/` (7 pages, `src/data/stage-types.ts`), `/bapteme/biplace-saut-en-parapente/` (`src/data/bapteme-guide.ts`), `/apprendre/*` (`src/data/learn.ts`: path, three brevets, licence, 6 course modules with 28 lessons).

## Method

- The structure of the reference school site ecole-de-parapente.fr (menus Stage, Baptême, Brevet, Cours; one page per stage type; 6 modules and 28 lessons) was used **only to decide which pages exist**. No sentence was copied: every text is written in our own words from the facts below.
- Facts that vary by school (duration, price, what is included) are given as **ranges or "selon l’école"**. Prices are never typed in: each page computes minimum, median and maximum from the workbook at build time and states how many schools they come from.
- Numbers we could not confirm are left out (for example the size of the brevet written test).

## Sources by topic

| Topic | Sources consulted |
| --- | --- |
| Brevets (initial, pilote, pilote confirmé), colours, licence and insurance, no legal pilot licence in France | FFVL (ffvl.fr, pages "passer ses brevets" and "licence"), school pages that describe the progression |
| Typical stage content and duration, what to bring | Public pages of several schools (sport-decouverte.com, freedom-parapente.fr, manawa.com, adrenactive, cap-adrenaline and schools of our own workbook) |
| Baptême: sequence of a flight, preparation, photos and video, arrival time, weather cancellation, age and weight limits | School pages of the workbook, Les Hirondailes via haute-savoie-tourisme, hpac.ca (Hang Gliding and Paragliding Association of Canada) for general safety principles, FFVL |
| Aerology, weather, pre-flight, take-off, landing, safety, regulation (course modules) | FFVL educational material (titles of subjects only), general teaching practice described by several schools |
| Prices | Our own workbook (prices published by each school, with the date they were read) |

## Generated pages (v9)

- **Local pages and price pages**: every figure (number of schools, prices, medians, durations, children, winter, days) is computed from the workbook at build time, with the check date shown. Nothing is written by hand except `src/data/places-extra.ts` (general geography: lakes, massifs, stations). Each line there is hedged and must be confirmed by a school or instructor of the place, or deleted.
- **New blog articles** (price, age and weight, weather, days for a first stage, winter, safety, photos and video): general information from the school pages read for the workbook and the FFVL; same validation as the guides.
- **School pages without description**: a factual paragraph built from the data (city, formulas, prices), never invented.

## To validate before launch

1. A certified instructor (BPJEPS parapente) reads every guide page, in particular the course modules, the brevet requirements and the safety paragraphs.
2. Check the official FFVL syllabus pages for the current wording of the three brevets and add the official links.
3. Check age, weight and health statements with two partner schools; they are stated as typical, with the school's rule prevailing.
4. Replace stock pictures with rights-cleared photographs (`IMAGES.md`).
5. Keep a dated list of the URLs read when a page is revised.
