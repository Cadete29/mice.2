const crypto = require('node:crypto');
const config = require('../config/env');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD_SECONDS = 30;

function encodeBase32(buffer) {
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  return bits.match(/.{1,5}/g).map((chunk) => ALPHABET[parseInt(chunk.padEnd(5, '0'), 2)]).join('');
}

function decodeBase32(value) {
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const character of normalized) {
    const index = ALPHABET.indexOf(character);
    if (index < 0) throw new Error('Secreto MFA inválido.');
    bits += index.toString(2).padStart(5, '0');
  }
  return Buffer.from((bits.match(/.{8}/g) || []).map((byte) => parseInt(byte, 2)));
}

const encryptionKey = () => crypto.createHash('sha256')
  .update(config.MFA_ENCRYPTION_KEY || config.JWT_ACCESS_SECRET).digest();

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

function decryptSecret(payload) {
  const buffer = Buffer.from(payload);
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), buffer.subarray(0, 12));
  decipher.setAuthTag(buffer.subarray(12, 28));
  return Buffer.concat([decipher.update(buffer.subarray(28)), decipher.final()]).toString('utf8');
}

const generateSecret = () => encodeBase32(crypto.randomBytes(20));

function totp(secret, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 15;
  const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(number).padStart(6, '0');
}

function verifyTotp(secret, code, timestamp = Date.now()) {
  return verifyTotpCounter(secret, code, timestamp) !== null;
}

function verifyTotpCounter(secret, code, timestamp = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  for (const window of [-1, 0, 1]) {
    const expected = Buffer.from(totp(secret, timestamp + window * PERIOD_SECONDS * 1000));
    if (crypto.timingSafeEqual(expected, Buffer.from(code))) {
      return Math.floor(timestamp / 1000 / PERIOD_SECONDS) + window;
    }
  }
  return null;
}

const normalizeRecoveryCode = (code) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');
const hashRecoveryCode = (code) => crypto.createHash('sha256').update(normalizeRecoveryCode(code)).digest();
const generateRecoveryCodes = () => Array.from({ length: 8 }, () => {
  const value = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `${value.slice(0, 5)}-${value.slice(5)}`;
});

function provisioningUri(secret, email) {
  const label = encodeURIComponent(`MICE-LO:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=MICE-LO&algorithm=SHA1&digits=6&period=${PERIOD_SECONDS}`;
}

module.exports = {
  decryptSecret, encryptSecret, generateRecoveryCodes, generateSecret,
  hashRecoveryCode, normalizeRecoveryCode, provisioningUri, totp, verifyTotp, verifyTotpCounter,
};
