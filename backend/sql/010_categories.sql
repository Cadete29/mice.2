BEGIN;
CREATE TABLE IF NOT EXISTS categorias (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nombre CITEXT NOT NULL UNIQUE,
 creada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (LENGTH(TRIM(nombre::TEXT)) BETWEEN 2 AND 60)
);
INSERT INTO categorias(nombre) VALUES ('Medio ambiente'),('Educación'),('Comunidad'),('Investigación'),('Biodiversidad'),('Acción climática') ON CONFLICT DO NOTHING;
ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_categoria_check;
COMMIT;
