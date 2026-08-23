BEGIN;
CREATE TABLE IF NOT EXISTS jornadas_limpieza_playas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE CHECK (numero > 0),
  nombre VARCHAR(160) NOT NULL,
  estado VARCHAR(10) NOT NULL DEFAULT 'cerrado' CHECK (estado IN ('abierto','cerrado')),
  abierto_en TIMESTAMPTZ,
  cerrado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_jornada_playas_unica_abierta ON jornadas_limpieza_playas(estado) WHERE estado = 'abierto';
INSERT INTO jornadas_limpieza_playas(numero,nombre,estado,abierto_en)
VALUES(4,'Cuarta limpieza de playas','abierto',CURRENT_TIMESTAMP)
ON CONFLICT(numero) DO NOTHING;
ALTER TABLE registros_limpieza_playas ADD COLUMN IF NOT EXISTS jornada_id UUID REFERENCES jornadas_limpieza_playas(id);
UPDATE registros_limpieza_playas SET jornada_id=(SELECT id FROM jornadas_limpieza_playas WHERE numero=4) WHERE jornada_id IS NULL;
ALTER TABLE registros_limpieza_playas ALTER COLUMN jornada_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registros_playas_jornada ON registros_limpieza_playas(jornada_id,creado_en DESC);
COMMIT;
