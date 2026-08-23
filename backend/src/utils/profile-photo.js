const HttpError = require('./http-error');
const MAX_BYTES = 2 * 1024 * 1024;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;
function hasValidSignature(mime, buffer) {
  if (mime === 'image/jpeg') return buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (mime === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
}
function parseProfilePhoto(dataUrl) {
  const match = DATA_URL.exec(dataUrl);
  if (!match) throw new HttpError(400, 'La fotografía debe ser JPEG, PNG o WebP.', 'INVALID_PROFILE_PHOTO');
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > MAX_BYTES) throw new HttpError(413, 'La fotografía debe pesar máximo 2 MB.', 'PROFILE_PHOTO_TOO_LARGE');
  if (!hasValidSignature(match[1], buffer)) throw new HttpError(400, 'El contenido de la fotografía no coincide con su formato.', 'INVALID_PROFILE_PHOTO');
  return { buffer, mime: match[1] };
}
module.exports = { MAX_BYTES, parseProfilePhoto };
