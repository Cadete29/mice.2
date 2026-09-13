const { z } = require('zod');

const photo = z.string().max(1400000, 'Cada fotografía procesada debe pesar máximo 1 MB.')
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/, 'Selecciona fotografías JPG, PNG o WebP.');

const registrationEventSchema = z.object({
  name: z.string().trim().min(1, 'Escribe el título del evento.').max(160),
  description: z.string().trim().min(1, 'Escribe la descripción del evento.').max(5000),
  photos: z.array(photo).length(10, 'Añade exactamente 10 fotografías.'),
}).strict();

const updateRegistrationEventSchema = registrationEventSchema.extend({ photos: registrationEventSchema.shape.photos.optional() });
module.exports = { registrationEventSchema, updateRegistrationEventSchema };
