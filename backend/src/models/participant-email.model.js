const HttpError = require('../utils/http-error');

async function enqueue(pool, eventId, userId, input) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(`INSERT INTO participant_email_batches(id,event_id,created_by,subject,message)
      VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING RETURNING id`,
    [input.requestId, eventId, userId, input.subject, input.message]);
    if (!inserted.rowCount) {
      const existing = await client.query('SELECT id FROM participant_email_batches WHERE id=$1 AND event_id=$2 AND created_by=$3', [input.requestId, eventId, userId]);
      if (!existing.rowCount) throw new HttpError(409, 'Identificador de envío no válido.');
    } else {
      const ids = [...new Set(input.participantIds)];
      const recipients = await client.query('SELECT correo,primer_nombre,segundo_nombre,apellido_paterno,apellido_materno FROM registros_limpieza_playas WHERE jornada_id=$1 AND id=ANY($2::uuid[]) ORDER BY creado_en,id', [eventId, ids]);
      if (recipients.rowCount !== ids.length) throw new HttpError(400, 'Algunos participantes no pertenecen a este evento. Actualiza la lista.');
      const byEmail = new Map();
      for (const row of recipients.rows) {
        const address = row.correo.trim().toLowerCase();
        const name = [row.primer_nombre, row.segundo_nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(' ').trim();
        if (!byEmail.has(address)) byEmail.set(address, new Set());
        if (name) byEmail.get(address).add(name);
      }
      const emails = [...byEmail.keys()];
      const names = [...byEmail.values()].map(names => [...names].join(' y ') || null);
      await client.query(`INSERT INTO participant_email_deliveries(batch_id,email,recipient_name)
        SELECT $1,address,name FROM unnest($2::text[],$3::text[]) AS recipients(address,name)`, [input.requestId, emails, names]);
    }
    await client.query('COMMIT');
    return input.requestId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

async function list(pool, eventId) {
  const result = await pool.query(`SELECT b.id,b.subject,b.created_at,
    COUNT(d.id)::int AS total,
    COUNT(d.id) FILTER (WHERE d.status='sent')::int AS sent,
    COUNT(d.id) FILTER (WHERE d.status IN ('pending','sending'))::int AS pending,
    COUNT(d.id) FILTER (WHERE d.status='failed')::int AS failed,
    COUNT(d.id) FILTER (WHERE d.status='unknown')::int AS unknown
    FROM participant_email_batches b JOIN participant_email_deliveries d ON d.batch_id=b.id
    WHERE b.event_id=$1 GROUP BY b.id ORDER BY b.created_at DESC LIMIT 10`, [eventId]);
  return result.rows;
}
module.exports = { enqueue, list };
