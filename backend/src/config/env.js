const path = require('node:path');
const { z } = require('zod');

require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const booleanFromString = z.enum(['true', 'false']).transform((value) => value === 'true');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_SSL: booleanFromString.default(false),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  MFA_ENCRYPTION_KEY: z.string().min(32).optional(),
  CONSENT_HASH_KEY: z.string().min(32).optional(),
  TERMS_DOCUMENT_SHA256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  PRIVACY_DOCUMENT_SHA256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  CLEANUP_INTERVAL_MINUTES: z.coerce.number().int().min(5).max(10_080).default(60),
  SESSION_RETENTION_DAYS: z.coerce.number().int().min(1).max(3650).default(30),
  USED_TOKEN_RETENTION_DAYS: z.coerce.number().int().min(0).max(365).default(7),
  TERMS_VERSION: z.string().trim().min(1).max(50).default('2026-08-08'),
  PRIVACY_VERSION: z.string().trim().min(1).max(50).default('2026-07-17'),
  COOKIE_SECURE: booleanFromString.default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  TRUST_PROXY: booleanFromString.default(false),
  EMAIL_ENABLED: booleanFromString.default(false),
  EMAIL_PROVIDER: z.enum(['gmail', 'namecheap']).default('gmail'),
  EMAIL_USER: z.string().default(''),
  EMAIL_PASSWORD: z.string().default(''),
  EMAIL_FROM_NAME: z.string().default('MICE-LO'),
  EMAIL_FROM_ADDRESS: z.string().default(''),
  ADMIN_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: booleanFromString.optional(),
  SMTP_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60_000).default(10_000),
  SMTP_GREETING_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60_000).default(10_000),
  SMTP_SOCKET_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120_000).default(20_000),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Configuración inválida:', z.prettifyError(parsed.error));
  process.exit(1);
}

if (parsed.data.EMAIL_ENABLED && (!parsed.data.EMAIL_USER || !parsed.data.EMAIL_PASSWORD)) {
  console.error('EMAIL_USER y EMAIL_PASSWORD son obligatorios cuando EMAIL_ENABLED=true.');
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && !parsed.data.EMAIL_ENABLED) {
  console.error('EMAIL_ENABLED debe ser true en producción para verificar y recuperar cuentas sin exponer tokens.');
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production') {
  const productionErrors = [];
  if (!parsed.data.FRONTEND_URL.startsWith('https://')) productionErrors.push('FRONTEND_URL debe usar HTTPS');
  if (!parsed.data.COOKIE_SECURE) productionErrors.push('COOKIE_SECURE debe ser true');
  if (parsed.data.COOKIE_SAME_SITE === 'none' && !parsed.data.COOKIE_SECURE) productionErrors.push('SameSite=None requiere COOKIE_SECURE=true');
  if (!parsed.data.MFA_ENCRYPTION_KEY) productionErrors.push('MFA_ENCRYPTION_KEY es obligatoria');
  if (!parsed.data.CONSENT_HASH_KEY) productionErrors.push('CONSENT_HASH_KEY es obligatoria');
  if (!parsed.data.TERMS_DOCUMENT_SHA256) productionErrors.push('TERMS_DOCUMENT_SHA256 es obligatorio');
  if (!parsed.data.PRIVACY_DOCUMENT_SHA256) productionErrors.push('PRIVACY_DOCUMENT_SHA256 es obligatorio');
  if (productionErrors.length) {
    console.error(`Configuración insegura de producción: ${productionErrors.join('; ')}.`);
    process.exit(1);
  }
}

module.exports = parsed.data;
