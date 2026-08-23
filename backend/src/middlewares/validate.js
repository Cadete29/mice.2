const HttpError = require('../utils/http-error');

module.exports = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, parsed.error.issues[0].message, 'VALIDATION_ERROR'));
  req.body = parsed.data;
  next();
};
