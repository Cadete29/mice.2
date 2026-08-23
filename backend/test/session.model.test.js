const test = require('node:test');
const assert = require('node:assert/strict');
const sessionModel = require('../src/models/session.model');

test('crea una sesión dentro de una familia y conserva su padre', async () => {
  let invocation;
  const client = { query: async (sql, params) => {
    invocation = { sql, params };
    return { rows: [{ id: 'new-session', familia_id: 'family' }] };
  } };
  const result = await sessionModel.create(client, {
    userId: 'user', tokenHash: Buffer.alloc(32), csrfTokenHash: Buffer.alloc(32), expiresAt: new Date(),
    familyId: 'family', parentSessionId: 'parent', ip: null, userAgent: null,
  });
  assert.match(invocation.sql, /familia_id, token_padre_id/);
  assert.equal(invocation.params[6], 'family');
  assert.equal(invocation.params[7], 'parent');
  assert.equal(result.id, 'new-session');
});

test('marca la rotación con la sesión reemplazante', async () => {
  let invocation;
  const client = { query: async (sql, params) => { invocation = { sql, params }; return {}; } };
  await sessionModel.markRotated(client, 'old', 'new');
  assert.match(invocation.sql, /motivo_revocacion = 'rotated'/);
  assert.deepEqual(invocation.params, ['old', 'new']);
});

test('revoca toda la familia cuando detecta reutilización', async () => {
  let invocation;
  const client = { query: async (sql, params) => { invocation = { sql, params }; return {}; } };
  await sessionModel.revokeFamily(client, 'family');
  assert.match(invocation.sql, /WHERE familia_id = \$1/);
  assert.deepEqual(invocation.params, ['family', 'reuse_detected']);
});

test('revoca sólo una sesión perteneciente al usuario', async () => {
  let invocation;
  const client = { query: async (sql, params) => {
    invocation = { sql, params };
    return { rows: [{ id: 'session' }] };
  } };
  const result = await sessionModel.revokeOwnedById(client, 'user', 'session');
  assert.match(invocation.sql, /usuario_id = \$1/);
  assert.deepEqual(invocation.params, ['user', 'session', 'user_revoked']);
  assert.equal(result.id, 'session');
});

test('revoca todas las sesiones activas de un usuario', async () => {
  let invocation;
  const client = { query: async (sql, params) => {
    invocation = { sql, params };
    return { rowCount: 3 };
  } };
  assert.equal(await sessionModel.revokeAllForUser(client, 'user'), 3);
  assert.match(invocation.sql, /revocada_en IS NULL/);
  assert.deepEqual(invocation.params, ['user', 'logout_all']);
});
