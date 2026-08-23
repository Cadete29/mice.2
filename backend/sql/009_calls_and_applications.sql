BEGIN;
CREATE TABLE IF NOT EXISTS convocatorias (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), creador_id UUID NOT NULL REFERENCES usuarios(id),
 titulo VARCHAR(140) NOT NULL, descripcion TEXT NOT NULL, categoria VARCHAR(60) NOT NULL,
 imagen BYTEA NOT NULL, imagen_mime VARCHAR(30) NOT NULL,
 correo VARCHAR(254), whatsapp VARCHAR(30), instagram VARCHAR(200), x VARCHAR(200),
 tiktok VARCHAR(200), youtube VARCHAR(200), linkedin VARCHAR(200),
 activa BOOLEAN NOT NULL DEFAULT TRUE, creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS postulaciones_convocatoria (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), convocatoria_id UUID NOT NULL REFERENCES convocatorias(id) ON DELETE CASCADE,
 usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
 correo VARCHAR(254) NOT NULL, whatsapp VARCHAR(30), instagram VARCHAR(200), x VARCHAR(200),
 tiktok VARCHAR(200), youtube VARCHAR(200), linkedin VARCHAR(200),
 estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobada','rechazada')),
 postulado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(convocatoria_id, usuario_id)
);
CREATE INDEX IF NOT EXISTS idx_convocatorias_activas ON convocatorias(creado_en DESC) WHERE activa=TRUE;
CREATE INDEX IF NOT EXISTS idx_postulaciones_usuario ON postulaciones_convocatoria(usuario_id, postulado_en DESC);
CREATE INDEX IF NOT EXISTS idx_postulaciones_convocatoria ON postulaciones_convocatoria(convocatoria_id, estado);
DROP TRIGGER IF EXISTS trg_actualizar_postulacion ON postulaciones_convocatoria;
CREATE TRIGGER trg_actualizar_postulacion BEFORE UPDATE ON postulaciones_convocatoria FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_modificacion();
COMMIT;
