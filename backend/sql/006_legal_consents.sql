BEGIN;

CREATE TABLE IF NOT EXISTS consentimientos_legales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  correo_hash BYTEA NOT NULL CHECK (OCTET_LENGTH(correo_hash) = 32),
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('terminos_uso', 'aviso_privacidad')),
  version VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(version)) > 0),
  documento_url TEXT NOT NULL,
  aceptado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  direccion_ip INET,
  dispositivo TEXT,
  UNIQUE (usuario_id, tipo, version)
);

CREATE INDEX IF NOT EXISTS idx_consentimientos_usuario
  ON consentimientos_legales (usuario_id, aceptado_en DESC);
CREATE INDEX IF NOT EXISTS idx_consentimientos_correo_hash
  ON consentimientos_legales (correo_hash);

COMMIT;
