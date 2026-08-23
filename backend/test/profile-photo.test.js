const test = require('node:test');
const assert = require('node:assert/strict');
const { parseProfilePhoto } = require('../src/utils/profile-photo');
test('acepta una fotografía PNG serializada', () => { const bytes = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,1]); const result = parseProfilePhoto(`data:image/png;base64,${bytes.toString('base64')}`); assert.equal(result.mime, 'image/png'); assert.deepEqual(result.buffer, bytes); });
test('rechaza contenido que no coincide con el MIME declarado', () => { assert.throws(() => parseProfilePhoto(`data:image/png;base64,${Buffer.from('not-png').toString('base64')}`), (error) => error.code === 'INVALID_PROFILE_PHOTO'); });
test('rechaza formatos no permitidos', () => { assert.throws(() => parseProfilePhoto('data:image/gif;base64,R0lGODlh'), (error) => error.code === 'INVALID_PROFILE_PHOTO'); });
