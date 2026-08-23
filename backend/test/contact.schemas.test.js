const test = require('node:test');
const assert = require('node:assert/strict');
const { contactSchema, familyContactSchema } = require('../src/models/contact.schemas');

test('acepta y normaliza un mensaje de contacto válido', () => {
  const result = contactSchema.parse({
    nombre: '  Ana Pérez  ',
    correo: 'ANA@EXAMPLE.COM',
    asunto: '  Colaboración  ',
    mensaje: '  Me gustaría conocer más información.  ',
  });
  assert.deepEqual(result, {
    nombre: 'Ana Pérez', correo: 'ana@example.com', asunto: 'Colaboración',
    mensaje: 'Me gustaría conocer más información.',
  });
});

test('valida los datos para unirse a la familia MICE-LO', () => {
  const result = familyContactSchema.parse({
    nombre: 'José López', correo: 'JOSE@EXAMPLE.COM',
    mensaje: 'Deseo colaborar en las próximas actividades.',
  });
  assert.equal(result.correo, 'jose@example.com');
  assert.deepEqual(Object.keys(result), ['nombre', 'correo', 'mensaje']);
});

test('rechaza campos extra y mensajes demasiado cortos', () => {
  assert.equal(contactSchema.safeParse({
    nombre: 'Ana', correo: 'ana@example.com', asunto: 'Hola', mensaje: 'Corto', website: 'spam',
  }).success, false);
});
