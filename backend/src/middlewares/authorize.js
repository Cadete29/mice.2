const HttpError = require('../utils/http-error');

module.exports = (...allowedRoles) => (req, _res, next) => {
  if (!req.auth) return next(new HttpError(401, 'Se requiere autenticación.', 'AUTH_REQUIRED'));
  if (!allowedRoles.includes(req.auth.role)) {
    return next(new HttpError(403, 'No tienes permisos para realizar esta acción.', 'INSUFFICIENT_PERMISSIONS'));
  }
  next();
};
