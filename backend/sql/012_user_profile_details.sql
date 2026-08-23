BEGIN;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS mision TEXT,
  ADD COLUMN IF NOT EXISTS vision TEXT,
  ADD COLUMN IF NOT EXISTS objetivos TEXT,
  ADD COLUMN IF NOT EXISTS descripcion_perfil TEXT;

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_usuario_detalles_perfil;
ALTER TABLE usuarios ADD CONSTRAINT chk_usuario_detalles_perfil CHECK (
  (mision IS NULL OR LENGTH(mision) <= 1000)
  AND (vision IS NULL OR LENGTH(vision) <= 1000)
  AND (objetivos IS NULL OR LENGTH(objetivos) <= 2000)
  AND (descripcion_perfil IS NULL OR LENGTH(descripcion_perfil) <= 2000)
);

COMMIT;
