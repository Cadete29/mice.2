BEGIN;

ALTER TABLE sesiones
  ADD COLUMN IF NOT EXISTS familia_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS token_padre_id UUID,
  ADD COLUMN IF NOT EXISTS reemplazada_por_id UUID,
  ADD COLUMN IF NOT EXISTS motivo_revocacion VARCHAR(40);

UPDATE sesiones SET familia_id = id WHERE familia_id IS NULL;
ALTER TABLE sesiones ALTER COLUMN familia_id SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE sesiones ADD CONSTRAINT fk_sesion_token_padre
    FOREIGN KEY (token_padre_id) REFERENCES sesiones(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE sesiones ADD CONSTRAINT fk_sesion_reemplazo
    FOREIGN KEY (reemplazada_por_id) REFERENCES sesiones(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE sesiones ADD CONSTRAINT chk_sesion_no_autoreferencia
    CHECK (id IS DISTINCT FROM token_padre_id AND id IS DISTINCT FROM reemplazada_por_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sesiones_familia ON sesiones (familia_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_padre ON sesiones (token_padre_id) WHERE token_padre_id IS NOT NULL;

CREATE OR REPLACE FUNCTION revocar_sesiones_cambio_password() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
    UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP, motivo_revocacion = 'password_changed'
    WHERE usuario_id = NEW.id AND revocada_en IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION revocar_sesiones_usuario_desactivado() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.activo = TRUE AND NEW.activo = FALSE THEN
    UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP, motivo_revocacion = 'account_disabled'
    WHERE usuario_id = NEW.id AND revocada_en IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
