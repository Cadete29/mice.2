BEGIN;

CREATE TABLE IF NOT EXISTS tokens_verificacion_correo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash BYTEA NOT NULL UNIQUE CHECK (OCTET_LENGTH(token_hash) = 32),
  expira_en TIMESTAMPTZ NOT NULL,
  usado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_token_correo_expiracion CHECK (expira_en > creado_en),
  CONSTRAINT chk_token_correo_uso CHECK (usado_en IS NULL OR usado_en >= creado_en)
);

CREATE INDEX IF NOT EXISTS idx_tokens_correo_usuario ON tokens_verificacion_correo (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tokens_correo_activos
  ON tokens_verificacion_correo (expira_en) WHERE usado_en IS NULL;

COMMIT;
