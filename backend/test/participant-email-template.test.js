const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('renders the participant name safely in HTML and text with a lightweight inline logo', async () => {
  let captured;
  const sandbox = {
    module: { exports: {} },
    __dirname: path.resolve(__dirname, '../src/services'),
    require: id => {
      if (id === 'node:path') return path;
      if (id === '../config/env') return { EMAIL_ENABLED: true, EMAIL_PROVIDER: 'gmail', EMAIL_FROM_NAME: 'MICE-LO', EMAIL_USER: 'test@example.com' };
      if (id === 'nodemailer') return { createTransport: () => ({ sendMail: async mail => { captured = mail; return { messageId: 'simulated' }; } }) };
      throw new Error(`Unexpected dependency: ${id}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../src/services/email.service.js'), 'utf8'), sandbox);
  await sandbox.module.exports.sendParticipantEmail({ to: 'test@example.com', name: 'Ana <López>', subject: 'Aviso', message: 'Detalles del evento' });
  assert.ok(captured.text.startsWith('Hola Ana <López>,\n'));
  assert.ok(captured.html.includes('Hola Ana &lt;López&gt;,'));
  const attachment = captured.attachments[0];
  assert.equal(attachment.contentType, 'image/png');
  assert.ok(captured.html.includes(`cid:${attachment.cid}`));
  assert.ok(fs.statSync(attachment.path).size < 25000);
});
