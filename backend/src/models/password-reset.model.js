async function invalidateForUser(client, userId) {
  await client.query(
    `UPDATE tokens_recuperacion_password SET usado_en = CURRENT_TIMESTAMP
     WHERE usuario_id = $1 AND usado_en IS NULL`,
    [userId],
  );
}

async function create(client, userId, tokenHash, expiresAt) {
  await client.query(
    `INSERT INTO tokens_recuperacion_password (usuario_id, token_hash, expira_en)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

async function findValidForUpdate(client, tokenHash) {
  const result = await client.query(
    `SELECT t.id, t.usuario_id
     FROM tokens_recuperacion_password t
     JOIN usuarios u ON u.id = t.usuario_id
     WHERE t.token_hash = $1 AND t.usado_en IS NULL
       AND t.expira_en > CURRENT_TIMESTAMP AND u.activo = TRUE
     FOR UPDATE OF t`,
    [tokenHash],
  );
  return result.rows[0];
}

async function markUsed(client, tokenId) {
  await client.query(
    'UPDATE tokens_recuperacion_password SET usado_en = CURRENT_TIMESTAMP WHERE id = $1',
    [tokenId],
  );
}

module.exports = { invalidateForUser, create, findValidForUpdate, markUsed };
