const { pool } = require('../config/database');

async function promote() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error('Uso: npm run admin:promote -- correo@ejemplo.com');
  const result = await pool.query(
    `UPDATE usuarios SET tipo = 'administrador'
     WHERE correo_electronico = $1 AND activo = TRUE
     RETURNING id, correo_electronico`, [email],
  );
  if (!result.rowCount) throw new Error('No se encontró una cuenta activa con ese correo.');
  console.log(`Administrador habilitado: ${result.rows[0].correo_electronico}`);
}

promote()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
