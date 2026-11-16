-- Cloudflare D1 schema for the contacts of passengers and students (one row per request + one row per participant).
-- Create once:  wrangler d1 create resaparapente-contacts   then   wrangler d1 execute resaparapente-contacts --file=server/schema-contacts.sql
-- Bind it to the Pages project under the name CONTACTS_DB (Settings > Functions > D1 bindings). See docs/CONTACTS-STOCKAGE.md.
CREATE TABLE IF NOT EXISTS demandes (
  request_id      TEXT PRIMARY KEY,           -- UUID made by the browser (also the idempotency key of the email)
  created_at      TEXT NOT NULL,              -- UTC ISO 8601
  type_contact    TEXT NOT NULL,              -- bapteme-passenger | student
  ecole_id        TEXT NOT NULL,
  ecole           TEXT NOT NULL,
  offre_id        TEXT NOT NULL,
  offre           TEXT NOT NULL,
  nom             TEXT NOT NULL,
  email           TEXT NOT NULL,
  telephone       TEXT,
  dates_souhaitees TEXT,                      -- comma-separated ISO dates, empty = flexible
  nb_participants INTEGER NOT NULL,
  message         TEXT,
  consentement_ecole      INTEGER NOT NULL,   -- 1 = box "transmission à l'école" ticked
  texte_consentement      TEXT NOT NULL,      -- exact wording shown next to the box
  optin_monparapente      INTEGER NOT NULL DEFAULT 0,  -- 1 = optional box "conseils et offres MonParapente.fr" ticked
  page_source     TEXT,                       -- Referer of the form
  statut          TEXT NOT NULL DEFAULT 'enregistree',  -- enregistree | envoyee | echec_email
  envoye_le       TEXT
);
CREATE INDEX IF NOT EXISTS idx_demandes_email ON demandes (email);
CREATE INDEX IF NOT EXISTS idx_demandes_ecole ON demandes (ecole_id, created_at);
CREATE TABLE IF NOT EXISTS participants (
  request_id TEXT NOT NULL REFERENCES demandes (request_id) ON DELETE CASCADE,
  rang       INTEGER NOT NULL,                -- 1, 2, 3...
  prenom     TEXT,
  poids_kg   INTEGER NOT NULL,
  taille_cm  INTEGER,                         -- students only
  PRIMARY KEY (request_id, rang)
);
