const { z } = require('zod');

const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre.').max(100),
  correo: z.string().trim().email('El correo electrónico no es válido.').max(254)
    .transform((value) => value.toLowerCase()),
  asunto: z.string().trim().min(3, 'Escribe el asunto.').max(140),
  mensaje: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.').max(5000),
}).strict();

const familyContactSchema = contactSchema.pick({
  nombre: true,
  correo: true,
  mensaje: true,
});

module.exports = { contactSchema, familyContactSchema };
