const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_HOST ||= 'localhost';
process.env.DB_NAME ||= 'test';
process.env.DB_USER ||= 'test';
process.env.JWT_ACCESS_SECRET ||= 'test-secret-with-at-least-thirty-two-characters';

const mfa = require('../src/services/mfa.service');

test('genera TOTP compatible con el vector RFC 6238', () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  assert.equal(mfa.totp(secret, 59_000), '287082');
});

test('acepta la ventana TOTP actual y rechaza códigos inválidos', () => {
  const secret = mfa.generateSecret();
  const now = Date.now();
  assert.equal(mfa.verifyTotp(secret, mfa.totp(secret, now), now), true);
  assert.equal(mfa.verifyTotp(secret, '00000A', now), false);
});

test('devuelve el contador exacto que debe consumirse para impedir reutilización', () => {
  const secret = mfa.generateSecret();
  const timestamp = 1_700_000_000_000;
  const code = mfa.totp(secret, timestamp);
  assert.equal(mfa.verifyTotpCounter(secret, code, timestamp), Math.floor(timestamp / 30_000));
  assert.equal(mfa.verifyTotpCounter(secret, '000000', timestamp), null);
});

test('cifra y descifra el secreto MFA con autenticación', () => {
  const secret = mfa.generateSecret();
  const encrypted = mfa.encryptSecret(secret);
  assert.notEqual(encrypted.toString('utf8'), secret);
  assert.equal(mfa.decryptSecret(encrypted), secret);
});

test('normaliza códigos de recuperación antes de generar su hash', () => {
  assert.deepEqual(mfa.hashRecoveryCode('ABCDE-12345'), mfa.hashRecoveryCode('abcde12345'));
});
