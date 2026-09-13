const test = require('node:test');
const assert = require('node:assert/strict');
const { registrationEventSchema } = require('../src/models/registration-event.schemas');
const { updateRegistrationEventSchema } = require('../src/models/registration-event.schemas');
const valid = { name: 'Reforestación comunitaria', description: 'Participa en nuestro evento.', photos: Array(10).fill('data:image/png;base64,aGVsbG8=') };
test('allows editing legacy text without replacing photos, and requires ten replacement photos', () => {
  const { photos, ...text } = valid;
  assert.equal(updateRegistrationEventSchema.safeParse(text).success, true);
  assert.equal(updateRegistrationEventSchema.safeParse({ ...text, photos }).success, true);
  assert.equal(updateRegistrationEventSchema.safeParse({ ...text, photos: [] }).success, false);
  assert.equal(updateRegistrationEventSchema.safeParse({ ...text, status: 'cerrado' }).success, false);
});

test('accepts an event with title, description and exactly ten photos', () => {
  assert.equal(registrationEventSchema.safeParse(valid).success, true);
});
test('rejects missing content, wrong photo counts and unsupported images', () => {
  for (const changes of [
    { name: ' ' }, { description: ' ' }, { photos: valid.photos.slice(1) },
    { photos: [...valid.photos, valid.photos[0]] },
    { photos: Array(10).fill('data:image/svg+xml;base64,aGVsbG8=') },
    { photos: Array(10).fill('https://example.com/photo.jpg') },
    { photos: Array(10).fill('data:image/png;base64,' + 'A'.repeat(1400000)) },
  ]) assert.equal(registrationEventSchema.safeParse({ ...valid, ...changes }).success, false);
});
