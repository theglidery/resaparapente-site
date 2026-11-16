# Collecting every school's stages (and keeping them fresh)

Goal: the richest possible calendar of dated stages, with prices, without asking every school to learn a new tool. Today the workbook holds 4 dated sessions for 83 schools that publish stage offers; most schools publish "on request" or on a page that changes. We combine four channels, from the least to the most effort for the school. Each school has one row in the workbook sheet **Sources de collecte** (channel, address to read, check frequency, last check, result, sessions found, contact for dates).

## The four channels

| # | Channel (value in the sheet) | What the school does | What we do |
| --- | --- | --- | --- |
| 1 | **Formulaire école** | Fills `/pour-les-ecoles/` (type, name, dates, price, places, town, link; as many rows as needed). Nothing to install. | The form e-mails the team a block; a person checks the school's official site, then adds rows to the sheet Sessions. |
| 2 | **Feuille de calcul (CSV ou Google Sheets)** | Keeps one table in the template `public/modele-stages-ecoles.csv` (a Google Sheet "published to the web as CSV" works) and updates it when dates change. | `scripts/collect-sessions.py` reads the link every week (or `--csv-file` for a file received by e-mail). |
| 3 | **Agenda iCal** / **Données Event schema.org** | Nothing if their site already has an agenda feed (`.ics`) or marks stages with `schema.org/Event` (many WordPress booking plugins do). | The script reads the feed, no human work on the school's side. |
| 4 | **Relevé manuel** (default today) | Nothing. | An apprentice reads the school's official page each month and enters the dates (Sheyda or Kéo's monthly round). |

Order of effort for the team: start with channel 4 for all 83 schools (already listed with the URL of the stage page), ask the 20 most active schools to move to channel 2 or 3, and give every school the link to channel 1.

## The script

```
python3 scripts/collect-sessions.py --dry-run            # which sources would be read
python3 scripts/collect-sessions.py                      # read all automatic sources
python3 scripts/collect-sessions.py --school S003        # one school
python3 scripts/collect-sessions.py --school S003 --csv-file ecole.csv   # a CSV sent by a school
```

- It reads the sheet Sources de collecte of the latest workbook, fetches each address of an automatic channel (one request per source, 20 s timeout, identifying User-Agent, no crawling) and writes `collecte/collecte-AAAA-MM-JJ.csv`.
- It keeps only future sessions, guesses the stage type from the title (initiation, progression, SIV…), flags rows that already exist in the sheet Sessions (same school, same start date) and marks every row **À valider**.
- **It never publishes.** A person reads the CSV, copies the accepted rows into the sheet Sessions (statut *Actif*, *Vérifié le* = today, offer ID chosen), fills "Dernier contrôle / Résultat / Sessions trouvées" in Sources de collecte, then runs `npm run data` and `npm run build`.
- Tested on sample iCal (including all-day events), JSON-LD `Event` (inside `@graph`) and the CSV template, with a missing source reported as an error line without stopping the run. Not yet tested on real school sites, because the build environment has no outside network: run `--dry-run` first on your computer, then a real run, and adjust the parsers for any school whose page differs.

## Freshness rule

- A session is shown in the calendar only until its start date (`Visible calendrier` formula) and is flagged **À re-vérifier** after 14 days without a check (`Fraîcheur` column).
- Every school in channel 4 is re-read monthly (twice a month from March to June). A school that answers none of two reminders keeps its offers but loses its dates.
- A daily site rebuild removes past sessions and expired promotions without manual work.

## Asking schools (monthly reminder, copy to adapt)

> Bonjour, voici le lien pour mettre à jour vos dates de stage sur ResaParapente : https://resaparapente.fr/pour-les-ecoles/ (2 minutes, gratuit). Si vous préférez, envoyez-nous votre tableau (modèle : https://resaparapente.fr/modele-stages-ecoles.csv) ou l’adresse de votre agenda. Les demandes de réservation arrivent directement chez vous.

## Later improvements

- An intake Google Sheet per school created by us and shared with the school (they edit, the script reads) removes the CSV step.
- Two-way: after a request is accepted, the school confirms the date and the places left, which updates the session automatically.
- Alerts: weekly list of schools with no future date, sent to the team.
