const { z } = require('zod');

const userIdSchema = z.string().uuid('El identificador de usuario no es válido.');
const changeRoleSchema = z.object({ role: z.enum(['usuario', 'administrador']) }).strict();
const changeStatusSchema = z.object({ active: z.boolean() }).strict();

module.exports = { changeRoleSchema, changeStatusSchema, userIdSchema };
