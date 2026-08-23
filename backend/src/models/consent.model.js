async function createRegistrationConsents(client, {
  userId, emailHash, termsVersion, privacyVersion, termsDocumentHash, privacyDocumentHash,
  ip, userAgent,
}) {
  await client.query(
    `INSERT INTO consentimientos_legales
      (usuario_id, correo_hash, tipo, version, documento_url, documento_hash, direccion_ip, dispositivo)
     VALUES
      ($1, $2, 'terminos_uso', $3, '/terminos-de-uso', $5, $7, $8),
      ($1, $2, 'aviso_privacidad', $4, '/aviso-de-privacidad', $6, $7, $8)`,
    [userId, emailHash, termsVersion, privacyVersion, termsDocumentHash,
      privacyDocumentHash, ip || null, userAgent || null],
  );
}

async function listForUser(client, userId) {
  const result = await client.query(
    `SELECT id, tipo, version, documento_url, encode(documento_hash, 'hex') AS documento_hash,
       aceptado_en, direccion_ip, dispositivo
     FROM consentimientos_legales WHERE usuario_id = $1 ORDER BY aceptado_en DESC`, [userId],
  );
  return result.rows;
}

module.exports = { createRegistrationConsents, listForUser };
