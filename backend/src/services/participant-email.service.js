const { pool } = require('../config/database');
const config = require('../config/env');
const email = require('./email.service');

async function deliverNext(db = pool, send = email.sendParticipantEmail) {
  // An interrupted SMTP attempt may have been accepted. Do not resend it automatically.
  await db.query("UPDATE participant_email_deliveries SET status='unknown',updated_at=NOW() WHERE status='sending' AND updated_at < NOW() - INTERVAL '10 minutes'");
  const result = await db.query(`WITH candidate AS (
    SELECT id FROM participant_email_deliveries WHERE status='pending'
    ORDER BY updated_at LIMIT 1 FOR UPDATE SKIP LOCKED
  ) UPDATE participant_email_deliveries d SET status='sending',updated_at=NOW()
    FROM candidate c,participant_email_batches b WHERE d.id=c.id AND b.id=d.batch_id
    RETURNING d.id,d.email,d.recipient_name,b.subject,b.message`);
  if (!result.rowCount) return false;
  const item = result.rows[0];
  let status;
  try {
    const outcome = await send({ to: item.email, name: item.recipient_name, subject: item.subject, message: item.message });
    status = outcome.sent ? 'sent' : 'failed';
  } catch (error) {
    status = ['EAUTH', 'EENVELOPE', 'EMESSAGE'].includes(error.code) || error.responseCode >= 400 ? 'failed' : 'unknown';
  }
  await db.query('UPDATE participant_email_deliveries SET status=$2,updated_at=NOW() WHERE id=$1', [item.id, status]);
  return true;
}

function startParticipantEmailScheduler() {
  let running = false;
  const timer = setInterval(async () => {
    if (running || !config.EMAIL_ENABLED) return;
    running = true;
    try { await deliverNext(); }
    catch (error) { console.error('[participant-email]', { code: error.code || 'DELIVERY_ERROR' }); }
    finally { running = false; }
  }, 1000);
  timer.unref();
  return () => clearInterval(timer);
}
module.exports = { deliverNext, startParticipantEmailScheduler };
