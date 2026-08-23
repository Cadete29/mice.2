const { z } = require('zod');

const email = z.string().trim().email('El correo electrónico no es válido.').max(254)
  .transform((value) => value.toLowerCase());
const password = z.string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres.')
  .max(128, 'La contraseña no puede superar 128 caracteres.')
  .regex(/[a-z]/, 'La contraseña debe incluir una letra minúscula.')
  .regex(/[A-Z]/, 'La contraseña debe incluir una letra mayúscula.')
  .regex(/\d/, 'La contraseña debe incluir un número.');

const registerSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  segundoNombre: z.string().trim().min(2).max(100).optional(),
  apellidoPaterno: z.string().trim().min(2).max(100),
  apellidoMaterno: z.string().trim().min(2).max(100).optional(),
  correoElectronico: email,
  password,
  aceptaTerminos: z.literal(true, { error: 'Debes aceptar los términos y el aviso de privacidad.' }),
}).strict();

const loginSchema = z.object({
  correoElectronico: email,
  password: z.string().min(1).max(128),
}).strict();

const forgotPasswordSchema = z.object({ correoElectronico: email }).strict();
const resendVerificationSchema = z.object({ correoElectronico: email }).strict();
const verifyEmailSchema = z.object({ token: z.string().min(40).max(200) }).strict();
const resetPasswordSchema = z.object({
  token: z.string().min(40).max(200),
  password,
}).strict();
const mfaCode = z.string().trim().min(6).max(20);
const mfaChallengeSchema = z.object({
  mfaToken: z.string().min(40).max(1000),
  code: mfaCode,
}).strict();
const mfaCodeSchema = z.object({ code: mfaCode }).strict();
const profilePhotoSchema = z.object({ photo: z.string().max(2_800_000, 'La fotografía supera el tamaño permitido.') }).strict();
const optionalProfileText = (max) => z.string().trim().max(max);
const profileDetailsSchema = z.object({
  mision: optionalProfileText(1000),
  vision: optionalProfileText(1000),
  objetivos: optionalProfileText(2000),
  descripcion: optionalProfileText(2000),
}).strict();

module.exports = {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  resendVerificationSchema, verifyEmailSchema,
  mfaChallengeSchema, mfaCodeSchema, profilePhotoSchema, profileDetailsSchema,
  passwordSchema: password,
};
