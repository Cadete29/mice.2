const { transaction } = require('../config/database');
const config = require('../config/env');

const BATCH_SIZE = 1000;

async function deleteBatches(client, sql, params = []) {
  let total = 0;
  while (true) {
    const result = await client.query(sql, [BATCH_SIZE, ...params]);
    total += result.rowCount;
    if (result.rowCount < BATCH_SIZE) return total;
  }
}

async function cleanupExpired() {
  return transaction(async (client) => {
    const lock = await client.query(
      "SELECT pg_try_advisory_xact_lock(hashtext('mice-lo-auth-cleanup')) AS acquired",
    );
    if (!lock.rows[0].acquired) return { skipped: true };

    const sessions = await deleteBatches(client, `
      WITH candidates AS (
        SELECT id FROM sesiones
        WHERE expira_en < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
           OR revocada_en < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
        ORDER BY creada_en LIMIT $1 FOR UPDATE SKIP LOCKED
      )
      DELETE FROM sesiones s USING candidates c WHERE s.id = c.id
    `, [config.SESSION_RETENTION_DAYS]);

    const passwordTokens = await deleteBatches(client, `
      WITH candidates AS (
        SELECT id FROM tokens_recuperacion_password
        WHERE expira_en < CURRENT_TIMESTAMP
           OR usado_en < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
        ORDER BY creado_en LIMIT $1 FOR UPDATE SKIP LOCKED
      )
      DELETE FROM tokens_recuperacion_password t USING candidates c WHERE t.id = c.id
    `, [config.USED_TOKEN_RETENTION_DAYS]);

    const verificationTokens = await deleteBatches(client, `
      WITH candidates AS (
        SELECT id FROM tokens_verificacion_correo
        WHERE expira_en < CURRENT_TIMESTAMP
           OR usado_en < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
        ORDER BY creado_en LIMIT $1 FOR UPDATE SKIP LOCKED
      )
      DELETE FROM tokens_verificacion_correo t USING candidates c WHERE t.id = c.id
    `, [config.USED_TOKEN_RETENTION_DAYS]);

    const recoveryCodes = await deleteBatches(client, `
      WITH candidates AS (
        SELECT id FROM codigos_recuperacion_mfa
        WHERE expira_en < CURRENT_TIMESTAMP
           OR usado_en < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
        ORDER BY creado_en LIMIT $1 FOR UPDATE SKIP LOCKED
      )
      DELETE FROM codigos_recuperacion_mfa c USING candidates d WHERE c.id = d.id
    `, [config.USED_TOKEN_RETENTION_DAYS]);

    return { skipped: false, sessions, passwordTokens, verificationTokens, recoveryCodes };
  });
}

function startCleanupScheduler() {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await cleanupExpired();
      if (!result.skipped) console.info('[maintenance:auth-cleanup]', result);
    } catch (error) {
      console.error('[maintenance:auth-cleanup-error]', { message: error.message });
    } finally { running = false; }
  };
  const initial = setTimeout(run, 10_000);
  const interval = setInterval(run, config.CLEANUP_INTERVAL_MINUTES * 60_000);
  initial.unref();
  interval.unref();
  return () => { clearTimeout(initial); clearInterval(interval); };
}

module.exports = { cleanupExpired, startCleanupScheduler };
