function notFound(_req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' } });
}

function errorHandler(error, req, res, _next) {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'La solicitud es demasiado grande.' } });
  }
  const status = error.status || 500;
  const log = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    status,
    code: error.code || 'INTERNAL_ERROR',
    ip: req.ip,
  };
  if (status >= 500) console.error('[api:error]', log, error);
  else if (req.originalUrl.startsWith('/api/auth/')) console.warn('[auth:rejected]', log);
  res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status >= 500 ? 'Ocurrió un error interno.' : error.message,
    },
  });
}

module.exports = { notFound, errorHandler };
