BEGIN;
CREATE TABLE IF NOT EXISTS registros_limpieza_playas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primer_nombre VARCHAR(100) NOT NULL,
  segundo_nombre VARCHAR(100),
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  curp CHAR(18) NOT NULL,
  lada VARCHAR(6) NOT NULL,
  pais_telefono CHAR(2) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(254) NOT NULL,
  transporte VARCHAR(30) NOT NULL CHECK (transporte IN ('necesita-transporte','cuenta-con-vehiculo')),
  acepta_uso_imagen BOOLEAN NOT NULL,
  acepta_privacidad BOOLEAN NOT NULL,
  acepta_deslinde BOOLEAN NOT NULL,
  version_privacidad VARCHAR(50) NOT NULL,
  direccion_ip INET,
  dispositivo TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_registros_playas_fecha ON registros_limpieza_playas(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_registros_playas_correo ON registros_limpieza_playas(correo);
COMMIT;
