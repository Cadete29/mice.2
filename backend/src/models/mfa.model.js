async function findUser(client, userId, forUpdate = false) {
  const result = await client.query(
    `SELECT * FROM usuarios WHERE id = $1${forUpdate ? ' FOR UPDATE' : ''}`,
    [userId],
  );
  return result.rows[0];
}

async function savePendingSecret(client, userId, encryptedSecret) {
  await client.query(
    `UPDATE usuarios SET mfa_secret_cifrado = $2, mfa_habilitado = FALSE,
       mfa_ultimo_contador = NULL
     WHERE id = $1 AND activo = TRUE`, [userId, encryptedSecret],
  );
}

async function enable(client, userId, recoveryHashes) {
  await client.query('UPDATE usuarios SET mfa_habilitado = TRUE WHERE id = $1', [userId]);
  await client.query('DELETE FROM codigos_recuperacion_mfa WHERE usuario_id = $1', [userId]);
  for (const hash of recoveryHashes) {
    await client.query(
      `INSERT INTO codigos_recuperacion_mfa (usuario_id, codigo_hash)
       VALUES ($1, $2)`, [userId, hash],
    );
  }
}

async function consumeRecoveryCode(client, userId, codeHash) {
  const result = await client.query(
    `UPDATE codigos_recuperacion_mfa SET usado_en = CURRENT_TIMESTAMP
     WHERE id = (
       SELECT id FROM codigos_recuperacion_mfa
       WHERE usuario_id = $1 AND codigo_hash = $2 AND usado_en IS NULL
         AND expira_en > CURRENT_TIMESTAMP FOR UPDATE
     ) RETURNING id`, [userId, codeHash],
  );
  return Boolean(result.rowCount);
}

async function consumeTotpCounter(client, userId, counter) {
  const result = await client.query(
    `UPDATE usuarios SET mfa_ultimo_contador = $2
     WHERE id = $1 AND (mfa_ultimo_contador IS NULL OR mfa_ultimo_contador < $2)
     RETURNING id`, [userId, counter],
  );
  return Boolean(result.rowCount);
}

async function disable(client, userId) {
  await client.query(
    `UPDATE usuarios SET mfa_habilitado = FALSE, mfa_secret_cifrado = NULL,
       mfa_ultimo_contador = NULL
     WHERE id = $1`, [userId],
  );
  await client.query('DELETE FROM codigos_recuperacion_mfa WHERE usuario_id = $1', [userId]);
}

module.exports = {
  consumeRecoveryCode, consumeTotpCounter, disable, enable, findUser, savePendingSecret,
};
