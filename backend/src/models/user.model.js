const PUBLIC_COLUMNS = `id, nombre, segundo_nombre, apellido_paterno, apellido_materno,
  correo_electronico, tipo, correo_verificado, mfa_habilitado, creado_en, foto_perfil,
  foto_perfil_mime, mision, vision, objetivos, descripcion_perfil`;

function mapUser(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    segundoNombre: row.segundo_nombre,
    apellidoPaterno: row.apellido_paterno,
    apellidoMaterno: row.apellido_materno,
    correoElectronico: row.correo_electronico,
    tipo: row.tipo,
    correoVerificado: row.correo_verificado,
    mfaHabilitado: row.mfa_habilitado,
    creadoEn: row.creado_en,
    fotoPerfil: row.foto_perfil && row.foto_perfil_mime ? `data:${row.foto_perfil_mime};base64,${row.foto_perfil.toString('base64')}` : null,
    mision: row.mision || '',
    vision: row.vision || '',
    objetivos: row.objetivos || '',
    descripcion: row.descripcion_perfil || '',
  };
}

async function create(client, input, passwordHash) {
  const result = await client.query(
    `INSERT INTO usuarios
      (nombre, segundo_nombre, apellido_paterno, apellido_materno, correo_electronico, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${PUBLIC_COLUMNS}`,
    [input.nombre, input.segundoNombre || null, input.apellidoPaterno,
      input.apellidoMaterno || null, input.correoElectronico, passwordHash],
  );
  return result.rows[0];
}

async function findByEmailForUpdate(client, email) {
  const result = await client.query(
    `SELECT *, (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > CURRENT_TIMESTAMP) AS bloqueado
     FROM usuarios WHERE correo_electronico = $1 FOR UPDATE`,
    [email],
  );
  return result.rows[0];
}

async function recordFailedLogin(client, userId, attempts, maxAttempts, lockMinutes) {
  await client.query(
    `UPDATE usuarios SET intentos_fallidos = $2::smallint,
      bloqueado_hasta = CASE WHEN $2::smallint >= $3::smallint
        THEN CURRENT_TIMESTAMP + make_interval(mins => $4::integer) ELSE NULL END
     WHERE id = $1`,
    [userId, attempts, maxAttempts, lockMinutes],
  );
}

async function recordSuccessfulLogin(client, userId, ip) {
  await client.query(
    `UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL,
     ultima_ip = $2, ultimo_inicio_sesion = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId, ip || null],
  );
}

async function findActiveById(client, userId) {
  const result = await client.query(
    `SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id = $1 AND activo = TRUE`,
    [userId],
  );
  return result.rows[0];
}

async function findActiveIdByEmail(client, email) {
  const result = await client.query(
    'SELECT id FROM usuarios WHERE correo_electronico = $1 AND activo = TRUE',
    [email],
  );
  return result.rows[0];
}

async function updatePassword(client, userId, passwordHash) {
  await client.query(
    `UPDATE usuarios SET password_hash = $2, intentos_fallidos = 0, bloqueado_hasta = NULL
     WHERE id = $1`,
    [userId, passwordHash],
  );
}

async function verifyEmail(client, userId) {
  await client.query(
    'UPDATE usuarios SET correo_verificado = TRUE WHERE id = $1', [userId],
  );
}

async function findVerificationRecipientByEmail(client, email) {
  const result = await client.query(
    `SELECT id, nombre, correo_electronico, correo_verificado
     FROM usuarios WHERE correo_electronico = $1 AND activo = TRUE`, [email],
  );
  return result.rows[0];
}

async function updateProfilePhoto(client, userId, photo, mime) {
  const result = await client.query(`UPDATE usuarios SET foto_perfil = $2, foto_perfil_mime = $3 WHERE id = $1 AND activo = TRUE RETURNING ${PUBLIC_COLUMNS}`, [userId, photo, mime]);
  return result.rows[0];
}

async function updateProfileDetails(client, userId, details) {
  const values = [details.mision, details.vision, details.objetivos, details.descripcion]
    .map((value) => value || null);
  const result = await client.query(
    `UPDATE usuarios SET mision = $2, vision = $3, objetivos = $4, descripcion_perfil = $5
     WHERE id = $1 AND activo = TRUE AND tipo = 'usuario' RETURNING ${PUBLIC_COLUMNS}`,
    [userId, ...values],
  );
  return result.rows[0];
}

module.exports = {
  mapUser, create, findByEmailForUpdate, recordFailedLogin, recordSuccessfulLogin,
  findActiveById, findActiveIdByEmail, updatePassword, updateProfilePhoto, updateProfileDetails,
  verifyEmail, findVerificationRecipientByEmail,
};
