const test = require('node:test');
const assert = require('node:assert/strict');
const { canExposeDevelopmentTokens } = require('../src/utils/development-tokens');

test('sólo expone tokens en desarrollo con correo desactivado', () => {
  assert.equal(canExposeDevelopmentTokens({ NODE_ENV: 'development', EMAIL_ENABLED: false }), true);
});

test('nunca expone tokens en producción aunque el correo esté desactivado', () => {
  assert.equal(canExposeDevelopmentTokens({ NODE_ENV: 'production', EMAIL_ENABLED: false }), false);
  assert.equal(canExposeDevelopmentTokens({ NODE_ENV: 'production', EMAIL_ENABLED: true }), false);
});

test('no expone tokens en test ni cuando el correo funciona', () => {
  assert.equal(canExposeDevelopmentTokens({ NODE_ENV: 'test', EMAIL_ENABLED: false }), false);
  assert.equal(canExposeDevelopmentTokens({ NODE_ENV: 'development', EMAIL_ENABLED: true }), false);
});
