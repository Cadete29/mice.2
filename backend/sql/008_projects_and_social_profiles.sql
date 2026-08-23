BEGIN;

CREATE TABLE IF NOT EXISTS perfiles_sociales (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  whatsapp VARCHAR(30), instagram VARCHAR(100), x VARCHAR(100), tiktok VARCHAR(100),
  youtube VARCHAR(200), linkedin VARCHAR(200),
  mostrar_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  mostrar_instagram BOOLEAN NOT NULL DEFAULT FALSE,
  mostrar_x BOOLEAN NOT NULL DEFAULT FALSE,
  mostrar_tiktok BOOLEAN NOT NULL DEFAULT FALSE,
  mostrar_youtube BOOLEAN NOT NULL DEFAULT FALSE,
  mostrar_linkedin BOOLEAN NOT NULL DEFAULT FALSE,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(140) NOT NULL CHECK (LENGTH(TRIM(titulo)) >= 3),
  descripcion TEXT NOT NULL CHECK (LENGTH(TRIM(descripcion)) BETWEEN 20 AND 2000),
  categoria VARCHAR(60) NOT NULL CHECK (categoria IN
    ('Medio ambiente', 'Educación', 'Comunidad', 'Investigación', 'Biodiversidad', 'Acción climática')),
  imagen BYTEA NOT NULL,
  imagen_mime VARCHAR(30) NOT NULL CHECK (imagen_mime IN ('image/jpeg', 'image/png', 'image/webp')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proyectos_creado_en ON proyectos (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_proyectos_usuario ON proyectos (usuario_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos (categoria);

DROP TRIGGER IF EXISTS trg_actualizar_perfil_social ON perfiles_sociales;
CREATE TRIGGER trg_actualizar_perfil_social BEFORE UPDATE ON perfiles_sociales
FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
DROP TRIGGER IF EXISTS trg_actualizar_proyecto ON proyectos;
CREATE TRIGGER trg_actualizar_proyecto BEFORE UPDATE ON proyectos
FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();

COMMIT;
