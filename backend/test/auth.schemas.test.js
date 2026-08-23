const test = require('node:test');
const assert = require('node:assert/strict');
const { registerSchema, loginSchema, resetPasswordSchema, profileDetailsSchema } = require('../src/models/auth.schemas');

test('normaliza el correo durante el registro', () => {
  const result = registerSchema.parse({
    nombre: 'Cory',
    apellidoPaterno: 'Pérez',
    correoElectronico: '  CORY@Example.COM ',
    password: 'ClaveSegura1',
    aceptaTerminos: true,
  });
  assert.equal(result.correoElectronico, 'cory@example.com');
});

test('rechaza contraseñas débiles durante el registro', () => {
  assert.equal(registerSchema.safeParse({
    nombre: 'Cory', apellidoPaterno: 'Pérez', correoElectronico: 'cory@example.com',
    password: 'password', aceptaTerminos: true,
  }).success, false);
});

test('rechaza el registro sin aceptación legal explícita', () => {
  assert.equal(registerSchema.safeParse({
    nombre: 'Cory', apellidoPaterno: 'Pérez', correoElectronico: 'cory@example.com',
    password: 'ClaveSegura1', aceptaTerminos: false,
  }).success, false);
});

test('el inicio de sesión no aplica reglas de complejidad a contraseñas existentes', () => {
  assert.equal(loginSchema.safeParse({ correoElectronico: 'cory@example.com', password: 'cualquiera' }).success, true);
});

test('valida la nueva contraseña al restablecer el acceso', () => {
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: 'ClaveNueva1' }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: 'debil' }).success, false);
});

test('acepta los textos opcionales del perfil y limita su longitud', () => {
  assert.equal(profileDetailsSchema.safeParse({ mision: '', vision: '', objetivos: '', descripcion: '' }).success, true);
  assert.equal(profileDetailsSchema.safeParse({ mision: 'a'.repeat(1001), vision: '', objetivos: '', descripcion: '' }).success, false);
});
