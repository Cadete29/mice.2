BEGIN;
CREATE TABLE IF NOT EXISTS proyecto_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  imagen BYTEA NOT NULL, imagen_mime VARCHAR(30) NOT NULL CHECK (imagen_mime IN ('image/jpeg','image/png','image/webp')),
  orden SMALLINT NOT NULL DEFAULT 0, principal BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_proyecto_imagen_principal ON proyecto_imagenes(proyecto_id) WHERE principal=TRUE;
CREATE INDEX IF NOT EXISTS idx_proyecto_imagenes_orden ON proyecto_imagenes(proyecto_id,orden);
INSERT INTO proyecto_imagenes(proyecto_id,imagen,imagen_mime,orden,principal)
SELECT p.id,p.imagen,p.imagen_mime,0,TRUE FROM proyectos p
WHERE NOT EXISTS(SELECT 1 FROM proyecto_imagenes pi WHERE pi.proyecto_id=p.id);
COMMIT;
