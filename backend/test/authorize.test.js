const test = require('node:test');
const assert = require('node:assert/strict');
const authorize = require('../src/middlewares/authorize');

test('permite un rol autorizado', () => {
  let error;
  authorize('administrador')({ auth: { role: 'administrador' } }, {}, (value) => { error = value; });
  assert.equal(error, undefined);
});

test('rechaza un rol sin permisos', () => {
  let error;
  authorize('administrador')({ auth: { role: 'usuario' } }, {}, (value) => { error = value; });
  assert.equal(error.status, 403);
  assert.equal(error.code, 'INSUFFICIENT_PERMISSIONS');
});

test('rechaza solicitudes sin autenticación', () => {
  let error;
  authorize('administrador')({}, {}, (value) => { error = value; });
  assert.equal(error.status, 401);
});
