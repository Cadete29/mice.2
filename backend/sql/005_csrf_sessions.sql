BEGIN;

ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS csrf_token_hash BYTEA;

DO $$ BEGIN
  ALTER TABLE sesiones ADD CONSTRAINT chk_sesion_csrf_hash
    CHECK (csrf_token_hash IS NULL OR OCTET_LENGTH(csrf_token_hash) = 32);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
