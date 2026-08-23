const ADMIN_COLUMNS = `id, nombre, segundo_nombre, apellido_paterno, apellido_materno,
  correo_electronico, tipo, activo, correo_verificado, mfa_habilitado,
  ultimo_inicio_sesion, creado_en, actualizado_en`;

async function listUsers(client, { search, limit, offset }) {
  const filter = search
    ? `WHERE correo_electronico ILIKE $3 OR nombre ILIKE $3 OR apellido_paterno ILIKE $3`
    : '';
  const params = search ? [limit, offset, `%${search}%`] : [limit, offset];
  const result = await client.query(
    `SELECT ${ADMIN_COLUMNS}, COUNT(*) OVER()::int AS total
     FROM usuarios ${filter}
     ORDER BY creado_en DESC LIMIT $1 OFFSET $2`, params,
  );
  return { rows: result.rows, total: result.rows[0]?.total || 0 };
}

async function findForUpdate(client, userId) {
  const result = await client.query(
    `SELECT ${ADMIN_COLUMNS} FROM usuarios WHERE id = $1 FOR UPDATE`, [userId],
  );
  return result.rows[0];
}

async function findById(client, userId) {
  const result = await client.query(
    `SELECT ${ADMIN_COLUMNS} FROM usuarios WHERE id = $1`, [userId],
  );
  return result.rows[0];
}

async function lockRoleManagement(client) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext('mice-lo-admin-role-management'))");
}

async function countActiveAdmins(client) {
  const result = await client.query(
    `SELECT COUNT(*)::int AS total FROM usuarios
     WHERE tipo = 'administrador' AND activo = TRUE`,
  );
  return result.rows[0].total;
}

async function updateRole(client, userId, role) {
  const result = await client.query(
    `UPDATE usuarios SET tipo = $2 WHERE id = $1 RETURNING ${ADMIN_COLUMNS}`,
    [userId, role],
  );
  return result.rows[0];
}

async function updateStatus(client, userId, active) {
  const result = await client.query(
    `UPDATE usuarios SET activo = $2 WHERE id = $1 RETURNING ${ADMIN_COLUMNS}`,
    [userId, active],
  );
  return result.rows[0];
}

module.exports = {
  countActiveAdmins, findById, findForUpdate, listUsers, lockRoleManagement, updateRole, updateStatus,
};
