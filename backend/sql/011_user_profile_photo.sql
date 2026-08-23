BEGIN;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil BYTEA, ADD COLUMN IF NOT EXISTS foto_perfil_mime VARCHAR(20);
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_usuario_foto_perfil;
ALTER TABLE usuarios ADD CONSTRAINT chk_usuario_foto_perfil CHECK ((foto_perfil IS NULL AND foto_perfil_mime IS NULL) OR (foto_perfil IS NOT NULL AND foto_perfil_mime IN ('image/jpeg', 'image/png', 'image/webp') AND OCTET_LENGTH(foto_perfil) BETWEEN 1 AND 2097152));
COMMIT;
