const { z } = require('zod');
const participantEmailSchema = z.object({
  requestId: z.uuid(),
  participantIds: z.array(z.uuid()).min(1, 'Selecciona participantes.').max(10000),
  subject: z.string().trim().min(1, 'Escribe el asunto.').max(160).regex(/^[^\r\n]+$/),
  message: z.string().trim().min(1, 'Escribe el mensaje.').max(10000),
}).strict();
module.exports = { participantEmailSchema };
