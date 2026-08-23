process.env.EMAIL_ENABLED = 'false';
process.env.NODE_ENV = 'development';

const crypto = require('node:crypto');
const app = require('../app');
const { pool } = require('../config/database');

const email = `codex-smoke-${Date.now()}@example.com`;
const oldPassword = 'PruebaSegura1';
const newPassword = 'NuevaSegura2';
let server;

async function call(baseUrl, path, { body, token, cookie, csrfToken, method } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: method || (body ? 'POST' : 'GET'),
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { cookie } : {}),
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(data)}`);
  return { data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}

async function expectError(baseUrl, path, expectedStatus, expectedCode, options) {
  try {
    await call(baseUrl, path, options);
  } catch (error) {
    if (error.message.includes(`${path}: ${expectedStatus}`)
      && error.message.includes(`\"code\":\"${expectedCode}\"`)) return;
    throw error;
  }
  throw new Error(`${path}: la solicitud debió fallar con ${expectedCode}.`);
}

async function smoke() {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  const registration = await call(baseUrl, '/auth/register', { body: {
    nombre: 'Usuario', apellidoPaterno: 'Temporal', correoElectronico: email,
    password: oldPassword, aceptaTerminos: true,
  } });
  const consentEvidence = await pool.query(
    'SELECT tipo FROM consentimientos_legales WHERE correo_hash = $1',
    [crypto.createHash('sha256').update(email).digest()],
  );
  if (consentEvidence.rowCount !== 2) {
    throw new Error('El registro debe guardar exactamente dos aceptaciones legales.');
  }
  if (registration.data.accessToken || registration.cookie) {
    throw new Error('El registro sin verificar no debe crear una sesión.');
  }
  await expectError(baseUrl, '/auth/login', 403, 'EMAIL_NOT_VERIFIED', {
    body: { correoElectronico: email, password: oldPassword },
  });
  if (registration.data.verificationToken) {
    await call(baseUrl, '/auth/verify-email', { body: { token: registration.data.verificationToken } });
  }
  const login = await call(baseUrl, '/auth/login', {
    body: { correoElectronico: email, password: oldPassword },
  });
  await call(baseUrl, '/auth/me', { token: login.data.accessToken });
  await expectError(baseUrl, '/auth/refresh', 403, 'INVALID_CSRF_TOKEN', { body: {}, cookie: login.cookie });
  const rotated = await call(baseUrl, '/auth/refresh', {
    body: {}, cookie: login.cookie, csrfToken: login.data.csrfToken,
  });
  await expectError(baseUrl, '/auth/refresh', 401, 'REFRESH_TOKEN_REUSE', {
    body: {}, cookie: login.cookie, csrfToken: login.data.csrfToken,
  });
  await expectError(baseUrl, '/auth/refresh', 401, 'INVALID_REFRESH_TOKEN', {
    body: {}, cookie: rotated.cookie, csrfToken: rotated.data.csrfToken,
  });

  const relogin = await call(baseUrl, '/auth/login', {
    body: { correoElectronico: email, password: oldPassword },
  });
  await expectError(baseUrl, '/auth/logout', 403, 'INVALID_CSRF_TOKEN', {
    body: {}, cookie: relogin.cookie,
  });
  const secondDevice = await call(baseUrl, '/auth/login', {
    body: { correoElectronico: email, password: oldPassword },
  });
  const sessionList = await call(baseUrl, '/auth/sessions', { token: secondDevice.data.accessToken });
  const otherSession = sessionList.data.sessions.find((session) => !session.current && session.active);
  if (!otherSession) throw new Error('No se encontró la segunda sesión para revocarla.');
  await call(baseUrl, `/auth/sessions/${otherSession.id}`, {
    method: 'DELETE', token: secondDevice.data.accessToken,
  });
  await expectError(baseUrl, '/auth/me', 401, 'SESSION_REVOKED', { token: relogin.data.accessToken });
  await call(baseUrl, '/auth/logout-all', { body: {}, token: secondDevice.data.accessToken });
  await expectError(baseUrl, '/auth/me', 401, 'SESSION_REVOKED', { token: secondDevice.data.accessToken });

  const recovery = await call(baseUrl, '/auth/forgot-password', { body: { correoElectronico: email } });
  if (!recovery.data.resetToken) throw new Error('El token de desarrollo no fue devuelto.');
  await call(baseUrl, '/auth/reset-password', {
    body: { token: recovery.data.resetToken, password: newPassword },
  });
  await call(baseUrl, '/auth/login', { body: { correoElectronico: email, password: newPassword } });
  console.log('Flujo completo de autenticación y recuperación verificado.');
}

smoke()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(async () => {
    await pool.query('DELETE FROM consentimientos_legales WHERE correo_hash = $1', [
      crypto.createHash('sha256').update(email).digest(),
    ]);
    await pool.query('DELETE FROM usuarios WHERE correo_electronico = $1', [email]);
    if (server) await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });
