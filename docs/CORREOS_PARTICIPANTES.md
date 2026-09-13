# Correos a participantes

En Administración → Ver registros, selecciona un evento. Marca participantes (la selección se conserva entre páginas) o elige “Todos los participantes del evento”. Escribe asunto y mensaje, revisa los destinatarios y confirma el envío.

Cada dirección recibe un mensaje individual. Las direcciones repetidas se envían una sola vez por solicitud. “Todos” incluye el evento completo, independientemente de filtros y paginación.

El saludo incluye el nombre completo guardado al preparar el envío. Si varios participantes seleccionados comparten dirección, incluye sus nombres juntos. Los envíos antiguos sin nombre guardado conservan el saludo general.

## Despliegue

1. Ejecuta `npm run db:migrate` desde `backend` para aplicar `020_participant_emails.sql` y `021_participant_email_names.sql`.
2. Despliega el frontend y el backend actualizados y reinicia el backend usando `src/server.js`.
3. El envío usa la configuración SMTP existente y requiere `EMAIL_ENABLED=true`.

El proceso del backend atiende la cola persistida en PostgreSQL. Los pendientes continúan después de un reinicio. Una entrega interrumpida durante el contacto SMTP se marca “sin confirmación” después de diez minutos, sin reenvío automático para evitar duplicados. El historial muestra los diez envíos más recientes por evento.

“Aceptados” significa que el servidor SMTP aceptó el mensaje; no confirma llegada a la bandeja de entrada ni lectura. “Fallidos” indica rechazo o falta de envío. Reintentar una solicitud de creación con el mismo identificador no crea otra cola.

Las pruebas automatizadas usan transporte simulado y no envían correos reales.
