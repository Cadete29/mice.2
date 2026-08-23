BEGIN;
CREATE TABLE IF NOT EXISTS categorias_convocatorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(60) NOT NULL UNIQUE,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO categorias_convocatorias(nombre)
SELECT DISTINCT categoria FROM convocatorias WHERE categoria IS NOT NULL
ON CONFLICT DO NOTHING;
INSERT INTO categorias_convocatorias(nombre) VALUES
  ('Medio ambiente'),('Educación'),('Comunidad'),('Investigación'),('Biodiversidad'),('Acción climática')
ON CONFLICT DO NOTHING;
ALTER TABLE convocatorias ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'interna';
ALTER TABLE convocatorias ADD COLUMN IF NOT EXISTS enlace_externo VARCHAR(1000);
ALTER TABLE convocatorias DROP CONSTRAINT IF EXISTS convocatorias_tipo_check;
ALTER TABLE convocatorias ADD CONSTRAINT convocatorias_tipo_check CHECK (tipo IN ('interna','externa'));
CREATE TABLE IF NOT EXISTS convocatoria_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id UUID NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
  imagen BYTEA NOT NULL,
  imagen_mime VARCHAR(30) NOT NULL CHECK (imagen_mime IN ('image/jpeg','image/png','image/webp')),
  orden SMALLINT NOT NULL DEFAULT 0,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_convocatoria_imagen_principal ON convocatoria_imagenes(convocatoria_id) WHERE principal=TRUE;
CREATE INDEX IF NOT EXISTS idx_convocatoria_imagenes_orden ON convocatoria_imagenes(convocatoria_id,orden);
INSERT INTO convocatoria_imagenes(convocatoria_id,imagen,imagen_mime,orden,principal)
SELECT c.id,c.imagen,c.imagen_mime,0,TRUE FROM convocatorias c
WHERE NOT EXISTS(SELECT 1 FROM convocatoria_imagenes ci WHERE ci.convocatoria_id=c.id);
COMMIT;
