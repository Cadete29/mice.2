process.env.EMAIL_ENABLED = 'false';
process.env.NODE_ENV = 'development';

require('dotenv').config();
const integrationDbName = process.env.DB_NAME || '';
if (!/(^|[_-])(test|testing)([_-]|$)/i.test(integrationDbName)
  || process.env.ALLOW_DATABASE_RESET_FOR_TESTS !== integrationDbName) {
  throw new Error(
    'Pruebas bloqueadas: DB_NAME debe ser una base de pruebas y '
    + 'ALLOW_DATABASE_RESET_FOR_TESTS debe coincidir exactamente con su nombre.',
  );
}

const crypto = require('node:crypto');
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { pool } = require('../src/config/database');
const mfaService = require('../src/services/mfa.service');

const email = `integration-${Date.now()}-${crypto.randomBytes(4).toString('hex')}@example.com`;
const password = 'IntegracionSegura1';
let server;
let baseUrl;

async function request(path, { method = 'GET', body, accessToken, cookie, csrfToken } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(cookie ? { cookie } : {}),
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      'user-agent': 'MICE-LO integration security test',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  const setCookie = response.headers.get('set-cookie');
  return {
    status: response.status,
    data,
    cookie: setCookie?.split(';')[0],
    setCookie,
    headers: response.headers,
  };
}

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

test.after(async () => {
  await pool.query(
    `DELETE FROM consentimientos_legales WHERE usuario_id = (
       SELECT id FROM usuarios WHERE correo_electronico = $1
     )`, [email],
  );
  await pool.query('DELETE FROM usuarios WHERE correo_electronico = $1', [email]);
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('autenticación integrada y controles de seguridad', async (t) => {
  await t.test('rechaza registro sin aceptación legal', async () => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: { nombre: 'Prueba', apellidoPaterno: 'Integración', correoElectronico: email, password, aceptaTerminos: false },
    });
    assert.equal(result.status, 400);
    assert.equal(result.data.error.code, 'VALIDATION_ERROR');
  });

  let verificationToken;
  await t.test('registra sin crear sesión y guarda evidencia legal', async () => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: { nombre: 'Prueba', apellidoPaterno: 'Integración', correoElectronico: email, password, aceptaTerminos: true },
    });
    assert.equal(result.status, 201);
    assert.equal(result.data.accessToken, undefined);
    assert.equal(result.cookie, undefined);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(result.headers.get('x-frame-options'), 'SAMEORIGIN');
    verificationToken = result.data.verificationToken;
    assert.ok(verificationToken);
    const evidence = await pool.query(
      `SELECT c.tipo, c.version FROM consentimientos_legales c
       JOIN usuarios u ON u.id = c.usuario_id WHERE u.correo_electronico = $1`, [email],
    );
    assert.deepEqual(new Set(evidence.rows.map((row) => row.tipo)), new Set(['terminos_uso', 'aviso_privacidad']));
  });

  await t.test('bloquea login hasta verificar y acepta verificación repetida', async () => {
    const blocked = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.data.error.code, 'EMAIL_NOT_VERIFIED');
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const verified = await request('/auth/verify-email', { method: 'POST', body: { token: verificationToken } });
      assert.equal(verified.status, 200);
    }
  });

  let first;
  await t.test('crea sesión con access, refresh y CSRF', async () => {
    first = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    assert.equal(first.status, 200);
    assert.ok(first.data.accessToken);
    assert.ok(first.data.csrfToken);
    assert.match(first.cookie, /^refreshToken=/);
    assert.match(first.setCookie, /HttpOnly/i);
    assert.match(first.setCookie, /SameSite=Lax/i);
  });

  await t.test('impide acceso administrativo al rol usuario', async () => {
    const result = await request('/admin/users', { accessToken: first.data.accessToken });
    assert.equal(result.status, 403);
    assert.equal(result.data.error.code, 'INSUFFICIENT_PERMISSIONS');
  });

  await t.test('exige CSRF y detecta reutilización de refresh token', async () => {
    const missingCsrf = await request('/auth/refresh', { method: 'POST', cookie: first.cookie });
    assert.equal(missingCsrf.status, 403);
    assert.equal(missingCsrf.data.error.code, 'INVALID_CSRF_TOKEN');

    const rotated = await request('/auth/refresh', {
      method: 'POST', cookie: first.cookie, csrfToken: first.data.csrfToken,
    });
    assert.equal(rotated.status, 200);
    const reuse = await request('/auth/refresh', {
      method: 'POST', cookie: first.cookie, csrfToken: first.data.csrfToken,
    });
    assert.equal(reuse.status, 401);
    assert.equal(reuse.data.error.code, 'REFRESH_TOKEN_REUSE');
    const descendant = await request('/auth/refresh', {
      method: 'POST', cookie: rotated.cookie, csrfToken: rotated.data.csrfToken,
    });
    assert.equal(descendant.status, 401);
    assert.equal(descendant.data.error.code, 'INVALID_REFRESH_TOKEN');
  });

  let deviceOne;
  let deviceTwo;
  await t.test('revoca sesiones individuales de inmediato', async () => {
    deviceOne = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    deviceTwo = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    const sessions = await request('/auth/sessions', { accessToken: deviceTwo.data.accessToken });
    const other = sessions.data.sessions.find((session) => session.active && !session.current);
    assert.ok(other);
    const revoked = await request(`/auth/sessions/${other.id}`, {
      method: 'DELETE', accessToken: deviceTwo.data.accessToken,
    });
    assert.equal(revoked.status, 204);
    const denied = await request('/auth/me', { accessToken: deviceOne.data.accessToken });
    assert.equal(denied.status, 401);
    assert.equal(denied.data.error.code, 'SESSION_REVOKED');
  });

  let recoveryCodes;
  await t.test('configura MFA y no entrega sesión antes del segundo factor', async () => {
    const setup = await request('/auth/mfa/setup', { method: 'POST', accessToken: deviceTwo.data.accessToken });
    assert.equal(setup.status, 200);
    const code = mfaService.totp(setup.data.secret);
    const enabled = await request('/auth/mfa/enable', {
      method: 'POST', accessToken: deviceTwo.data.accessToken, body: { code },
    });
    assert.equal(enabled.status, 200);
    const replayedSetupCode = await request('/auth/mfa/disable', {
      method: 'POST', accessToken: deviceTwo.data.accessToken, body: { code },
    });
    assert.equal(replayedSetupCode.status, 400);
    recoveryCodes = enabled.data.recoveryCodes;
    assert.equal(recoveryCodes.length, 8);
    await request('/auth/logout-all', { method: 'POST', accessToken: deviceTwo.data.accessToken });

    const challenged = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    assert.equal(challenged.data.mfaRequired, true);
    assert.equal(challenged.data.accessToken, undefined);
    const completed = await request('/auth/mfa/verify', {
      method: 'POST', body: { mfaToken: challenged.data.mfaToken, code: recoveryCodes[0] },
    });
    assert.equal(completed.status, 200);
    assert.ok(completed.data.accessToken);
  });

  await t.test('aplica cambios de rol inmediatamente desde PostgreSQL', async () => {
    await pool.query("UPDATE usuarios SET tipo = 'administrador' WHERE correo_electronico = $1", [email]);
    const challenged = await request('/auth/login', { method: 'POST', body: { correoElectronico: email, password } });
    const completed = await request('/auth/mfa/verify', {
      method: 'POST', body: { mfaToken: challenged.data.mfaToken, code: recoveryCodes[1] },
    });
    const admin = await request('/admin/users', { accessToken: completed.data.accessToken });
    assert.equal(admin.status, 200);
    assert.ok(Array.isArray(admin.data.users));
  });
});
