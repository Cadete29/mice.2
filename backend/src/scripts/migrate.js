const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { pool } = require('../config/database');
const { migrationBody } = require('../utils/migration-sql');

const LOCK_ID = 741_852_963;

async function migrate() {
  const client = await pool.connect();
  const directory = path.resolve(__dirname, '..', '..', 'sql');
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      nombre TEXT PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    for (const file of files) {
      const sql = await fs.readFile(path.join(directory, file), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const previous = await client.query(
        'SELECT checksum FROM schema_migrations WHERE nombre = $1', [file],
      );
      if (previous.rowCount) {
        if (previous.rows[0].checksum !== checksum) {
          throw new Error(`La migración ${file} cambió después de aplicarse.`);
        }
        console.log(`Migración ya aplicada: ${file}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(migrationBody(sql, file));
        await client.query(
          'INSERT INTO schema_migrations (nombre, checksum) VALUES ($1, $2)', [file, checksum],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
      console.log(`Migración aplicada: ${file}`);
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}

migrate()
  .catch((error) => {
    console.error('Error al ejecutar la migración:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
