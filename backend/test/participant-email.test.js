const test = require('node:test');
const assert = require('node:assert/strict');
const { participantEmailSchema } = require('../src/models/participant-email.schemas');
const { deliverNext } = require('../src/services/participant-email.service');
const { enqueue } = require('../src/models/participant-email.model');

test('validates recipients, required content and header injection', () => {
  const input = { requestId: 'b3149463-f343-4d53-b3f8-b610b427bc2c', participantIds: ['562a4514-8a29-4436-9a03-f123c09a97c2'], subject: 'Aviso', message: 'Detalles del evento' };
  assert.equal(participantEmailSchema.safeParse(input).success, true);
  for (const changes of [{ participantIds: [] }, { subject: 'Aviso\r\nBcc: other@example.com' }, { message: ' ' }, { to: 'external@example.com' }]) {
    assert.equal(participantEmailSchema.safeParse({ ...input, ...changes }).success, false);
  }
});

test('records accepted, disabled, rejected and uncertain deliveries without real SMTP', async () => {
  for (const [send, expected] of [
    [async () => ({ sent: true }), 'sent'],
    [async () => ({ sent: false }), 'failed'],
    [async () => { throw Object.assign(new Error('Rejected'), { code: 'EENVELOPE' }); }, 'failed'],
    [async () => { throw Object.assign(new Error('Timeout'), { code: 'ETIMEDOUT' }); }, 'unknown'],
  ]) {
    let saved;
    const db = { query: async (sql, args) => {
      if (sql.includes('WITH candidate')) return { rowCount: 1, rows: [{ id: 'delivery', email: 'test@example.com', recipient_name: 'Ana López', subject: 'Aviso', message: 'Prueba' }] };
      if (args) saved = args;
      return { rowCount: 0 };
    } };
    assert.equal(await deliverNext(db, payload => { assert.equal(payload.name, 'Ana López'); return send(payload); }), true);
    assert.deepEqual(saved, ['delivery', expected]);
  }
});

test('does not send when the queue is empty', async () => {
  assert.equal(await deliverNext({ query: async () => ({ rowCount: 0 }) }, async () => { throw new Error('Must not send'); }), false);
});

test('uses event participants from the database and deduplicates their addresses', async () => {
  let deliveries;
  const client = { release() {}, query: async (sql, args) => {
    if (sql.includes('RETURNING id')) return { rowCount: 1 };
    if (sql.startsWith('SELECT correo')) {
      assert.deepEqual(args, ['event', ['one', 'two']]);
      return { rowCount: 2, rows: [{ correo: 'Shared@example.com', primer_nombre: 'Ana', apellido_paterno: 'López' }, { correo: 'shared@example.com', primer_nombre: 'Luis', apellido_paterno: 'Pérez' }] };
    }
    if (sql.includes('INSERT INTO participant_email_deliveries')) deliveries = args;
    return { rowCount: 0 };
  } };
  await enqueue({ connect: async () => client }, 'event', 'admin', { requestId: 'batch', participantIds: ['one', 'two'], subject: 'Asunto', message: 'Texto' });
  assert.deepEqual(deliveries, ['batch', ['shared@example.com'], ['Ana López y Luis Pérez']]);
});

test('rejects recipients outside the event and rolls back before enqueueing', async () => {
  let rolledBack = false;
  const client = { release() {}, query: async sql => {
    if (sql.includes('RETURNING id')) return { rowCount: 1 };
    if (sql.startsWith('SELECT correo')) return { rowCount: 0, rows: [] };
    if (sql.includes('INSERT INTO participant_email_deliveries')) assert.fail('Must not queue');
    if (sql === 'ROLLBACK') rolledBack = true;
    return { rowCount: 0 };
  } };
  await assert.rejects(enqueue({ connect: async () => client }, 'event', 'admin', { requestId: 'batch', participantIds: ['outside'], subject: 'Asunto', message: 'Texto' }), { status: 400 });
  assert.equal(rolledBack, true);
});

test('repeated request IDs do not enqueue a second batch', async () => {
  const client = { release() {}, query: async sql => {
    if (sql.startsWith('SELECT id FROM participant_email_batches')) return { rowCount: 1 };
    if (sql.includes('INSERT INTO participant_email_deliveries')) assert.fail('Duplicate delivery');
    return { rowCount: 0 };
  } };
  assert.equal(await enqueue({ connect: async () => client }, 'event', 'admin', { requestId: 'same', participantIds: ['one'], subject: 'Asunto', message: 'Texto' }), 'same');
});
