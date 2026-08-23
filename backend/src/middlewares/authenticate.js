const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { pool } = require('../config/database');
const userModel = require('../models/user.model');
const sessionModel = require('../models/session.model');
const HttpError = require('../utils/http-error');

async function authenticate(req, _res, next) {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Se requiere autenticación.', 'AUTH_REQUIRED'));
  }
  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'], issuer: 'mice-lo-api', audience: 'mice-lo-web',
    });
    if (!payload.sid) {
      return next(new HttpError(401, 'La sesión debe renovarse.', 'SESSION_REAUTH_REQUIRED'));
    }
    const user = await userModel.findActiveById(pool, payload.sub);
    if (!user) {
      return next(new HttpError(401, 'La sesión ya no es válida.', 'INVALID_ACCESS_TOKEN'));
    }
    if (!user.correo_verificado) {
      return next(new HttpError(
        403,
        'Debes confirmar tu correo electrónico para continuar.',
        'EMAIL_NOT_VERIFIED',
      ));
    }
    const session = await sessionModel.findActiveById(pool, payload.sid, payload.sub);
    if (!session) {
      return next(new HttpError(401, 'La sesión fue cerrada o expiró.', 'SESSION_REVOKED'));
    }
    req.auth = { userId: payload.sub, role: user.tipo, sessionId: payload.sid };
    next();
  } catch (error) {
    if (error.status) return next(error);
    next(new HttpError(401, 'El token de acceso no es válido o expiró.', 'INVALID_ACCESS_TOKEN'));
  }
}

module.exports = authenticate;
