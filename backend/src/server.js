const app = require('./app');
const config = require('./config/env');
const { pool } = require('./config/database');
const emailService = require('./services/email.service');
const { startCleanupScheduler } = require('./services/cleanup.service');

const {startParticipantEmailScheduler}=require('./services/participant-email.service');

async function start() {
  await pool.query('SELECT 1');
  console.log(`PostgreSQL conectado: ${config.DB_NAME}`);

  if (config.EMAIL_ENABLED) {
    try {
      await emailService.verifyConnection();
      console.log(
        `Servicio de correo conectado: ${config.EMAIL_PROVIDER} (${config.EMAIL_USER})`,
      );
    } catch (error) {
      console.warn(
        `Servicio de correo no disponible al iniciar: ${error.message}`,
      );
      console.warn(
        'La API continuará activa; los envíos de correo devolverán un error hasta recuperar la conexión.',
      );
    }
  } else {
    console.log('Servicio de correo: desactivado (EMAIL_ENABLED=false)');
  }

  const server = app.listen(config.PORT, () => {
    console.log(
      `API de MICE-LO disponible en http://localhost:${config.PORT}`,
    );
  });

  const stopCleanupScheduler = startCleanupScheduler();
  const stopParticipantEmails = startParticipantEmailScheduler();

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.warn(`Cerrando API por señal ${signal}.`);
    stopCleanupScheduler();
    stopParticipantEmails();

    server.close(async () => {
      await pool.end();
      console.log('API y conexión PostgreSQL cerradas correctamente.');
      process.exit(0);
    });
  };

  server.on('error', (error) => {
    console.error('Error del servidor HTTP:', error.message);
  });
  server.on('close', () => {
    console.warn('El servidor HTTP dejó de escuchar.');
  });
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('No fue posible iniciar el servidor:', error.message);
  process.exit(1);
});
