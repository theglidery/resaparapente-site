-- Cloudflare D1 schema for ResaParapente (contacts, booking actions, school submissions, reviews, email logs).
-- Fresh install:
--   npx wrangler d1 create resaparapente-contacts
--   npx wrangler d1 execute resaparapente-contacts --remote --file=server/schema-contacts.sql
-- Bind it to the Pages project under the name CONTACTS_DB (Settings > Functions > D1 bindings).

CREATE TABLE IF NOT EXISTS demandes (
  request_id           TEXT PRIMARY KEY,           -- UUID made by the browser (also the idempotency key of the email)
  created_at           TEXT NOT NULL,              -- UTC ISO 8601
  type_contact         TEXT NOT NULL,              -- bapteme-passenger | student
  ecole_id             TEXT NOT NULL,
  ecole                TEXT NOT NULL,
  offre_id             TEXT NOT NULL,
  offre                TEXT NOT NULL,
  nom                  TEXT NOT NULL,
  email                TEXT NOT NULL,
  telephone            TEXT,
  dates_souhaitees     TEXT,                       -- comma-separated ISO dates, empty = flexible
  nb_participants      INTEGER NOT NULL,
  message              TEXT,
  consentement_ecole   INTEGER NOT NULL,           -- 1 = box "transmission à l'école" ticked
  texte_consentement   TEXT NOT NULL,              -- exact wording shown next to the box
  optin_monparapente   INTEGER NOT NULL DEFAULT 0, -- 1 = optional box "conseils et offres MonParapente.fr" ticked
  page_source          TEXT,                       -- Referer of the form
  statut               TEXT NOT NULL DEFAULT 'enregistree', -- enregistree | envoyee | echec_email | acceptee | autre_date | refusee
  envoye_le            TEXT,
  school_response_note TEXT,
  responded_at         TEXT,
  review_token         TEXT,
  reminder_sent_at     TEXT,
  review_email_sent_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_demandes_email ON demandes (email);
CREATE INDEX IF NOT EXISTS idx_demandes_ecole ON demandes (ecole_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demandes_review_token ON demandes (review_token) WHERE review_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_demandes_statut_created ON demandes (statut, created_at);

CREATE TABLE IF NOT EXISTS participants (
  request_id TEXT NOT NULL REFERENCES demandes (request_id) ON DELETE CASCADE,
  rang       INTEGER NOT NULL,                -- 1, 2, 3...
  prenom     TEXT,
  poids_kg   INTEGER NOT NULL,
  taille_cm  INTEGER,                         -- students only
  PRIMARY KEY (request_id, rang)
);

CREATE TABLE IF NOT EXISTS school_submissions (
  id              TEXT PRIMARY KEY,
  school          TEXT NOT NULL,
  site            TEXT,
  contact_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  topics_json     TEXT NOT NULL,
  sessions_json   TEXT NOT NULL,
  bapteme_json    TEXT,
  gift_json       TEXT,
  promo_json      TEXT,
  message         TEXT,
  domain_verified INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_submissions_created ON school_submissions (created_at);

CREATE TABLE IF NOT EXISTS reviews (
  id               TEXT PRIMARY KEY,
  school_id        TEXT NOT NULL,
  token            TEXT,
  verification     TEXT NOT NULL,  -- Demande vérifiée | Déclaré par le participant
  rating           INTEGER NOT NULL,
  kind             TEXT NOT NULL,
  experience_month TEXT NOT NULL,
  title            TEXT,
  text             TEXT NOT NULL,
  author_first     TEXT NOT NULL,
  author_last      TEXT NOT NULL,
  author_email     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'À modérer', -- À modérer | Publié | Refusé
  created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON reviews (school_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_email_school ON reviews (author_email, school_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_token ON reviews (token) WHERE token IS NOT NULL;

CREATE TABLE IF NOT EXISTS email_logs (
  id           TEXT PRIMARY KEY,
  related_type TEXT NOT NULL,
  related_id   TEXT NOT NULL,
  recipient    TEXT NOT NULL,
  template     TEXT NOT NULL,
  status       TEXT NOT NULL,
  provider_id  TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_logs_related ON email_logs (related_type, related_id);
