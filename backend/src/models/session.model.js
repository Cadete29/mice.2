async function create(client, {
  userId, tokenHash, csrfTokenHash, ip, userAgent, expiresAt, familyId, parentSessionId = null,
}) {
  const result = await client.query(
    `INSERT INTO sesiones
      (usuario_id, refresh_token_hash, csrf_token_hash, direccion_ip, dispositivo,
       expira_en, familia_id, token_padre_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, familia_id`,
    [userId, tokenHash, csrfTokenHash, ip || null, userAgent || null,
      expiresAt, familyId, parentSessionId],
  );
  return result.rows[0];
}

async function findWithUserForUpdate(client, tokenHash) {
  const result = await client.query(
    `SELECT s.id AS session_id, s.familia_id, s.reemplazada_por_id, s.csrf_token_hash,
       s.expira_en, s.revocada_en, s.motivo_revocacion, u.*
     FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.refresh_token_hash = $1 FOR UPDATE OF s`,
    [tokenHash],
  );
  return result.rows[0];
}

async function markRotated(client, sessionId, replacementId) {
  await client.query(
    `UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP,
       reemplazada_por_id = $2, motivo_revocacion = 'rotated'
     WHERE id = $1 AND revocada_en IS NULL`, [sessionId, replacementId],
  );
}

async function revokeFamily(client, familyId, reason = 'reuse_detected') {
  await client.query(
    `UPDATE sesiones SET revocada_en = COALESCE(revocada_en, CURRENT_TIMESTAMP),
       motivo_revocacion = $2
     WHERE familia_id = $1`, [familyId, reason],
  );
}

async function revokeByTokenHash(client, tokenHash, reason = 'logout') {
  await client.query(
    `UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP, motivo_revocacion = $2
     WHERE refresh_token_hash = $1 AND revocada_en IS NULL`,
    [tokenHash, reason],
  );
}

async function findActiveById(client, sessionId, userId) {
  const result = await client.query(
    `SELECT id FROM sesiones
     WHERE id = $1 AND usuario_id = $2 AND revocada_en IS NULL
       AND expira_en > CURRENT_TIMESTAMP`, [sessionId, userId],
  );
  return result.rows[0];
}

async function listForUser(client, userId) {
  const result = await client.query(
    `SELECT id, direccion_ip, dispositivo, expira_en, revocada_en,
       motivo_revocacion, creada_en
     FROM sesiones WHERE usuario_id = $1
     ORDER BY creada_en DESC LIMIT 100`, [userId],
  );
  return result.rows;
}

async function revokeOwnedById(client, userId, sessionId, reason = 'user_revoked') {
  const result = await client.query(
    `UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP, motivo_revocacion = $3
     WHERE id = $2 AND usuario_id = $1 AND revocada_en IS NULL
     RETURNING id`, [userId, sessionId, reason],
  );
  return result.rows[0];
}

async function revokeAllForUser(client, userId, reason = 'logout_all') {
  const result = await client.query(
    `UPDATE sesiones SET revocada_en = CURRENT_TIMESTAMP, motivo_revocacion = $2
     WHERE usuario_id = $1 AND revocada_en IS NULL RETURNING id`, [userId, reason],
  );
  return result.rowCount;
}

module.exports = {
  create, findActiveById, findWithUserForUpdate, listForUser, markRotated,
  revokeAllForUser, revokeByTokenHash, revokeFamily, revokeOwnedById,
};
