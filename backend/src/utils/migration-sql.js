function migrationBody(sql, filename) {
  let body = sql.replace(/^\s*BEGIN\s*;?/i, '').replace(/COMMIT\s*;?\s*$/i, '').trim();
  // Keep the original migration file/checksum for databases that already applied it.
  // Older deployments may have the tables and events but no migration ledger.
  if (filename === '018_beach_cleanup_events.sql') {
    body = body.replace(
      /INSERT INTO jornadas_limpieza_playas\(numero,nombre,estado,abierto_en\)\s*VALUES\(4,'Cuarta limpieza de playas','abierto',CURRENT_TIMESTAMP\)\s*ON CONFLICT\(numero\) DO NOTHING;/,
      `LOCK TABLE jornadas_limpieza_playas IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO jornadas_limpieza_playas(numero,nombre,estado,abierto_en)
SELECT 4,'Cuarta limpieza de playas',
  CASE WHEN EXISTS(SELECT 1 FROM jornadas_limpieza_playas) THEN 'cerrado' ELSE 'abierto' END,
  CASE WHEN EXISTS(SELECT 1 FROM jornadas_limpieza_playas) THEN NULL ELSE CURRENT_TIMESTAMP END
WHERE NOT EXISTS(SELECT 1 FROM jornadas_limpieza_playas WHERE numero=4)
ON CONFLICT(numero) DO NOTHING;`,
    );
  }
  return body;
}

module.exports = { migrationBody };
