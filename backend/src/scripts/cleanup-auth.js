const { pool } = require('../config/database');
const { cleanupExpired } = require('../services/cleanup.service');

cleanupExpired()
  .then((result) => console.log('Limpieza de autenticación completada:', result))
  .catch((error) => { console.error('No fue posible ejecutar la limpieza:', error.message); process.exitCode = 1; })
  .finally(() => pool.end());
