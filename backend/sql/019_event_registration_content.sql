BEGIN;
ALTER TABLE jornadas_limpieza_playas
  ADD COLUMN descripcion TEXT NOT NULL DEFAULT 'Súmate a una jornada de limpieza y ayúdanos a recuperar las playas de Chiapas. Registra tus datos para coordinar tu participación.',
  ADD COLUMN fotografias JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(fotografias) = 'array' AND jsonb_array_length(fotografias) IN (0, 10));
COMMIT;
