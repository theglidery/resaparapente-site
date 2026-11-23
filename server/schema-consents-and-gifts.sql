-- Migration for the existing D1 database (CONTACTS_DB): consents on booking requests + storage of "Offrir" (gift) requests.
-- Run once:  wrangler d1 execute resaparapente-contacts --remote --file=server/schema-consents-and-gifts.sql

-- 1. Consents on booking requests (baptism and stage). Existing rows keep the defaults (0 / NULL).
ALTER TABLE demandes ADD COLUMN cgv_accepte        INTEGER NOT NULL DEFAULT 0;  -- box 1, always 1 on new rows (the server refuses the request otherwise)
ALTER TABLE demandes ADD COLUMN consent_tiers      INTEGER NOT NULL DEFAULT 0;  -- box 2 (optional): 1 = ticked
ALTER TABLE demandes ADD COLUMN consent_version    TEXT;                        -- consent-texts.json "version", e.g. 2026-11-22
ALTER TABLE demandes ADD COLUMN consent_marche     TEXT;                        -- fr | ch | be (market of the domain)
ALTER TABLE demandes ADD COLUMN consent_langue     TEXT;                        -- fr | en | de
ALTER TABLE demandes ADD COLUMN consent_texte_1    TEXT;                        -- exact wording of box 1 as shown
ALTER TABLE demandes ADD COLUMN consent_texte_2    TEXT;                        -- exact wording of box 2 as shown
ALTER TABLE demandes ADD COLUMN consent_at         TEXT;                        -- UTC ISO 8601

-- 2. Gift requests ("Offrir"): one row per request.
CREATE TABLE IF NOT EXISTS cadeaux (
  request_id          TEXT PRIMARY KEY,      -- UUID made by the browser (idempotency key)
  created_at          TEXT NOT NULL,         -- UTC ISO 8601
  route               TEXT NOT NULL,         -- school | team (see giftRoute)
  ecole_id            TEXT NOT NULL,
  ecole               TEXT NOT NULL,
  pays_ecole          TEXT,                  -- FR | CH | BE
  offre_id            TEXT NOT NULL,
  offre               TEXT NOT NULL,
  offre_type          TEXT,                  -- bapteme | stage
  prix_affiche        TEXT,                  -- label shown, e.g. "120 €" or "Prix sur demande"
  donateur_prenom     TEXT NOT NULL,
  donateur_nom        TEXT NOT NULL,
  donateur_email      TEXT NOT NULL,
  donateur_telephone  TEXT NOT NULL,
  passager_prenom     TEXT NOT NULL,
  passager_nom        TEXT NOT NULL,
  passager_email      TEXT NOT NULL,
  passager_telephone  TEXT NOT NULL,
  passager_poids_kg   INTEGER NOT NULL,
  vol_souhaite_mois   TEXT,                  -- YYYY-MM, optional
  message             TEXT,
  cgv_accepte         INTEGER NOT NULL,      -- box 1
  consent_tiers       INTEGER NOT NULL DEFAULT 0,  -- box 2
  consent_version     TEXT NOT NULL,
  consent_marche      TEXT NOT NULL,
  consent_langue      TEXT NOT NULL,
  consent_texte_1     TEXT NOT NULL,
  consent_texte_2     TEXT NOT NULL,
  consent_at          TEXT NOT NULL,
  page_source         TEXT,
  statut              TEXT NOT NULL DEFAULT 'enregistree',  -- enregistree | envoyee | echec_email
  envoye_le           TEXT
);
CREATE INDEX IF NOT EXISTS idx_cadeaux_donateur ON cadeaux (donateur_email);
CREATE INDEX IF NOT EXISTS idx_cadeaux_ecole ON cadeaux (ecole_id, created_at);
