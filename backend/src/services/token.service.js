const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest();
const newRefreshToken = () => crypto.randomBytes(48).toString('base64url');

function createAccessToken(user, sessionId) {
  return jwt.sign({ role: user.tipo, sid: sessionId }, config.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    subject: user.id,
    issuer: 'mice-lo-api',
    audience: 'mice-lo-web',
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
}

function createMfaToken(user) {
  return jwt.sign({ purpose: 'mfa-login' }, config.JWT_ACCESS_SECRET, {
    algorithm: 'HS256', subject: user.id, issuer: 'mice-lo-api', audience: 'mice-lo-mfa', expiresIn: '5m',
  });
}

function verifyMfaToken(token) {
  const payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'], issuer: 'mice-lo-api', audience: 'mice-lo-mfa',
  });
  if (payload.purpose !== 'mfa-login') throw new Error('Propósito de token inválido.');
  return payload;
}

const refreshExpiration = () => new Date(Date.now() + config.REFRESH_TOKEN_DAYS * 86_400_000);

module.exports = {
  createAccessToken, createMfaToken, verifyMfaToken, newRefreshToken, hashToken, refreshExpiration,
};
