BEGIN;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS mfa_ultimo_contador BIGINT;

ALTER TABLE consentimientos_legales
  ADD COLUMN IF NOT EXISTS documento_hash BYTEA;

ALTER TABLE consentimientos_legales
  DROP CONSTRAINT IF EXISTS chk_consentimiento_documento_hash;
ALTER TABLE consentimientos_legales
  ADD CONSTRAINT chk_consentimiento_documento_hash
  CHECK (documento_hash IS NULL OR OCTET_LENGTH(documento_hash) = 32);

COMMIT;
