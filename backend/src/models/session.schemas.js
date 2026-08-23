const { z } = require('zod');

const sessionIdSchema = z.string().uuid('El identificador de sesión no es válido.');

module.exports = { sessionIdSchema };
