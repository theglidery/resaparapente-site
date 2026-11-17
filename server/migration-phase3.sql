-- Phase 3 migration for existing `resaparapente-contacts` D1 databases.
-- Run:
--   npx wrangler d1 execute resaparapente-contacts --local --file=server/migration-phase3.sql
--   npx wrangler d1 execute resaparapente-contacts --remote --file=server/migration-phase3.sql

ALTER TABLE demandes ADD COLUMN school_response_note TEXT;
ALTER TABLE demandes ADD COLUMN responded_at TEXT;
ALTER TABLE demandes ADD COLUMN review_token TEXT;
ALTER TABLE demandes ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE demandes ADD COLUMN review_email_sent_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_demandes_review_token ON demandes (review_token) WHERE review_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_demandes_statut_created ON demandes (statut, created_at);

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
  related_type TEXT NOT NULL,      -- booking | booking_action | school_submission | review | reminder | review_invite
  related_id   TEXT NOT NULL,
  recipient    TEXT NOT NULL,
  template     TEXT NOT NULL,
  status       TEXT NOT NULL,      -- sent | failed
  provider_id  TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_logs_related ON email_logs (related_type, related_id);
