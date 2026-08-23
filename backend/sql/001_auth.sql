BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  CREATE TYPE tipo_usuario AS ENUM ('usuario', 'administrador');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(nombre)) >= 2),
  segundo_nombre VARCHAR(100),
  apellido_paterno VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(apellido_paterno)) >= 2),
  apellido_materno VARCHAR(100),
  correo_electronico CITEXT NOT NULL UNIQUE CHECK (LENGTH(TRIM(correo_electronico::TEXT)) > 0),
  password_hash TEXT NOT NULL CHECK (LENGTH(TRIM(password_hash)) > 0),
  tipo tipo_usuario NOT NULL DEFAULT 'usuario',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret_cifrado BYTEA,
  mfa_habilitado BOOLEAN NOT NULL DEFAULT FALSE,
  intentos_fallidos SMALLINT NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
  bloqueado_hasta TIMESTAMPTZ,
  ultima_ip INET,
  ultimo_inicio_sesion TIMESTAMPTZ,
  password_cambiada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_usuario_mfa CHECK (
    mfa_habilitado = FALSE OR (mfa_secret_cifrado IS NOT NULL AND OCTET_LENGTH(mfa_secret_cifrado) > 0)
  ),
  CONSTRAINT chk_usuario_bloqueo CHECK (bloqueado_hasta IS NULL OR intentos_fallidos > 0)
);

CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  refresh_token_hash BYTEA NOT NULL UNIQUE CHECK (OCTET_LENGTH(refresh_token_hash) = 32),
  direccion_ip INET,
  dispositivo TEXT,
  expira_en TIMESTAMPTZ NOT NULL,
  revocada_en TIMESTAMPTZ,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_sesion_expiracion CHECK (expira_en > creada_en),
  CONSTRAINT chk_sesion_revocacion CHECK (revocada_en IS NULL OR revocada_en >= creada_en)
);

CREATE TABLE IF NOT EXISTS codigos_recuperacion_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  codigo_hash BYTEA NOT NULL CHECK (OCTET_LENGTH(codigo_hash) = 32),
  usado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  UNIQUE (usuario_id, codigo_hash),
  CONSTRAINT chk_codigo_mfa_expiracion CHECK (expira_en > creado_en),
  CONSTRAINT chk_codigo_mfa_fecha_uso CHECK (usado_en IS NULL OR usado_en >= creado_en)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios (tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_creado_en ON usuarios (creado_en);
CREATE INDEX IF NOT EXISTS idx_usuarios_activos ON usuarios (id) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueados ON usuarios (bloqueado_hasta) WHERE bloqueado_hasta IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_correo_trgm ON usuarios USING GIN ((correo_electronico::TEXT) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion ON sesiones (expira_en);
CREATE INDEX IF NOT EXISTS idx_sesiones_activas ON sesiones (usuario_id, expira_en) WHERE revocada_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_codigos_mfa_usuario ON codigos_recuperacion_mfa (usuario_id);
CREATE INDEX IF NOT EXISTS idx_codigos_mfa_disponibles ON codigos_recuperacion_mfa (usuario_id, expira_en) WHERE usado_en IS NULL;

CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion() RETURNS TRIGGER AS $$
BEGIN NEW.actualizado_en = CURRENT_TIMESTAMP; RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION registrar_cambio_password() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN NEW.password_cambiada_en = CURRENT_TIMESTAMP; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION revocar_sesiones_cambio_password() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
    UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP WHERE usuario_id = NEW.id AND revocada_en IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION revocar_sesiones_usuario_desactivado() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.activo = TRUE AND NEW.activo = FALSE THEN
    UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP WHERE usuario_id = NEW.id AND revocada_en IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_usuario ON usuarios;
CREATE TRIGGER trg_actualizar_usuario BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
DROP TRIGGER IF EXISTS trg_registrar_cambio_password ON usuarios;
CREATE TRIGGER trg_registrar_cambio_password BEFORE UPDATE OF password_hash ON usuarios FOR EACH ROW EXECUTE FUNCTION registrar_cambio_password();
DROP TRIGGER IF EXISTS trg_revocar_sesiones_cambio_password ON usuarios;
CREATE TRIGGER trg_revocar_sesiones_cambio_password AFTER UPDATE OF password_hash ON usuarios FOR EACH ROW EXECUTE FUNCTION revocar_sesiones_cambio_password();
DROP TRIGGER IF EXISTS trg_revocar_sesiones_usuario_desactivado ON usuarios;
CREATE TRIGGER trg_revocar_sesiones_usuario_desactivado AFTER UPDATE OF activo ON usuarios FOR EACH ROW EXECUTE FUNCTION revocar_sesiones_usuario_desactivado();

COMMIT;
