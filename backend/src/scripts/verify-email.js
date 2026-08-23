const config = require('../config/env');
const emailService = require('../services/email.service');

async function verify() {
  if (!config.EMAIL_ENABLED) throw new Error('Activa EMAIL_ENABLED=true en .env antes de verificar SMTP.');
  await emailService.verifyConnection();
  console.log(`Conexión SMTP de ${config.EMAIL_PROVIDER} verificada correctamente.`);
}

verify().catch((error) => {
  console.error('No fue posible conectar con el servidor de correo:', error.message);
  process.exitCode = 1;
});
