const argon2 = require('argon2');
const crypto = require('node:crypto');
const { pool, transaction } = require('../config/database');
const userModel = require('../models/user.model');
const sessionModel = require('../models/session.model');
const passwordResetModel = require('../models/password-reset.model');
const emailVerificationModel = require('../models/email-verification.model');
const emailService = require('./email.service');
const mfaModel = require('../models/mfa.model');
const mfaService = require('./mfa.service');
const config = require('../config/env');
const HttpError = require('../utils/http-error');
const tokenService = require('./token.service');
const { canExposeDevelopmentTokens } = require('../utils/development-tokens');
const consentModel = require('../models/consent.model');
const { parseProfilePhoto } = require('../utils/profile-photo');

const LOCK_AFTER_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function createSession(client, user, metadata, options = {}) {
  const refreshToken = tokenService.newRefreshToken();
  const csrfToken = tokenService.newRefreshToken();
  const stored = await sessionModel.create(client, {
    userId: user.id,
    tokenHash: tokenService.hashToken(refreshToken),
    csrfTokenHash: tokenService.hashToken(csrfToken),
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    expiresAt: tokenService.refreshExpiration(),
    familyId: options.familyId || crypto.randomUUID(),
    parentSessionId: options.parentSessionId || null,
  });
  return {
    accessToken: tokenService.createAccessToken(user, stored.id), refreshToken, csrfToken,
    sessionId: stored.id, familyId: stored.familia_id,
  };
}

function validCsrfToken(session, csrfToken) {
  if (!csrfToken || !session?.csrf_token_hash) return false;
  const actual = tokenService.hashToken(csrfToken);
  const expected = Buffer.from(session.csrf_token_hash);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function register(input, metadata) {
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1,
  });
  try {
    const user = await transaction(async (client) => {
      const user = await userModel.create(client, input, passwordHash);
      await consentModel.createRegistrationConsents(client, {
        userId: user.id,
        emailHash: crypto.createHmac('sha256', config.CONSENT_HASH_KEY || config.JWT_ACCESS_SECRET)
          .update(input.correoElectronico).digest(),
        termsVersion: config.TERMS_VERSION,
        privacyVersion: config.PRIVACY_VERSION,
        termsDocumentHash: config.TERMS_DOCUMENT_SHA256
          ? Buffer.from(config.TERMS_DOCUMENT_SHA256, 'hex') : null,
        privacyDocumentHash: config.PRIVACY_DOCUMENT_SHA256
          ? Buffer.from(config.PRIVACY_DOCUMENT_SHA256, 'hex') : null,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      });
      return userModel.mapUser(user);
    });
    const verificationToken = await createEmailVerificationToken(user.id);
    const delivery = await emailService.trySendVerificationEmail({
      to: user.correoElectronico, name: user.nombre, token: verificationToken,
    });
    return {
      user, emailSent: delivery.sent,
      ...(canExposeDevelopmentTokens(config) ? { verificationToken } : {}),
    };
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Ya existe una cuenta con ese correo electrónico.', 'EMAIL_IN_USE');
    }
    throw error;
  }
}

async function login(input, metadata) {
  const outcome = await transaction(async (client) => {
    const user = await userModel.findByEmailForUpdate(client, input.correoElectronico);
    if (!user) return { error: new HttpError(401, 'Correo o contraseña incorrectos.', 'INVALID_CREDENTIALS') };
    if (!user.activo) return { error: new HttpError(403, 'La cuenta está desactivada.', 'ACCOUNT_DISABLED') };
    if (user.bloqueado) return { error: new HttpError(423, 'La cuenta está bloqueada temporalmente.', 'ACCOUNT_LOCKED') };

    const valid = await argon2.verify(user.password_hash, input.password);
    if (!valid) {
      await userModel.recordFailedLogin(
        client, user.id, user.intentos_fallidos + 1, LOCK_AFTER_ATTEMPTS, LOCK_MINUTES,
      );
      // Retornar permite confirmar el contador antes de propagar el error.
      return { error: new HttpError(401, 'Correo o contraseña incorrectos.', 'INVALID_CREDENTIALS') };
    }

    if (!user.correo_verificado) {
      return { error: new HttpError(
        403,
        'Debes confirmar tu correo electrónico antes de iniciar sesión.',
        'EMAIL_NOT_VERIFIED',
      ) };
    }

    if (user.mfa_habilitado) {
      return { mfaRequired: true, mfaToken: tokenService.createMfaToken(user) };
    }

    await userModel.recordSuccessfulLogin(client, user.id, metadata.ip);
    return { user: userModel.mapUser(user), ...(await createSession(client, user, metadata)) };
  });
  if (outcome.error) throw outcome.error;
  return outcome;
}

async function verifyMfaFactor(client, user, code) {
  if (/^\d{6}$/.test(code)) {
    const secret = mfaService.decryptSecret(user.mfa_secret_cifrado);
    const counter = mfaService.verifyTotpCounter(secret, code);
    return counter !== null && mfaModel.consumeTotpCounter(client, user.id, counter);
  }
  return mfaModel.consumeRecoveryCode(client, user.id, mfaService.hashRecoveryCode(code));
}

async function completeMfaLogin(mfaToken, code, metadata) {
  let userId;
  try { userId = tokenService.verifyMfaToken(mfaToken).sub; } catch {
    throw new HttpError(401, 'El desafío MFA no es válido o expiró.', 'INVALID_MFA_TOKEN');
  }
  return transaction(async (client) => {
    const user = await mfaModel.findUser(client, userId, true);
    if (!user || !user.activo || !user.correo_verificado || !user.mfa_habilitado) {
      throw new HttpError(401, 'El desafío MFA ya no es válido.', 'INVALID_MFA_TOKEN');
    }
    if (!(await verifyMfaFactor(client, user, code))) {
      throw new HttpError(401, 'El código de autenticación no es válido.', 'INVALID_MFA_CODE');
    }
    await userModel.recordSuccessfulLogin(client, user.id, metadata.ip);
    return { user: userModel.mapUser(user), ...(await createSession(client, user, metadata)) };
  });
}

async function getMfaStatus(userId) {
  const user = await mfaModel.findUser(pool, userId);
  return { enabled: Boolean(user?.mfa_habilitado), setupPending: Boolean(user?.mfa_secret_cifrado && !user.mfa_habilitado) };
}

async function beginMfaSetup(userId) {
  const user = await mfaModel.findUser(pool, userId);
  if (!user || !user.activo || !user.correo_verificado) {
    throw new HttpError(403, 'La cuenta no puede configurar MFA.', 'MFA_SETUP_FORBIDDEN');
  }
  if (user.mfa_habilitado) throw new HttpError(409, 'MFA ya está habilitado.', 'MFA_ALREADY_ENABLED');
  const secret = mfaService.generateSecret();
  await mfaModel.savePendingSecret(pool, userId, mfaService.encryptSecret(secret));
  return { secret, provisioningUri: mfaService.provisioningUri(secret, user.correo_electronico) };
}

async function enableMfa(userId, code) {
  return transaction(async (client) => {
    const user = await mfaModel.findUser(client, userId, true);
    if (!user?.mfa_secret_cifrado || user.mfa_habilitado) {
      throw new HttpError(409, 'Primero inicia la configuración de MFA.', 'MFA_SETUP_REQUIRED');
    }
    const secret = mfaService.decryptSecret(user.mfa_secret_cifrado);
    const counter = mfaService.verifyTotpCounter(secret, code);
    if (counter === null || !(await mfaModel.consumeTotpCounter(client, userId, counter))) {
      throw new HttpError(400, 'El código no es válido. Verifica la hora de tu dispositivo.', 'INVALID_MFA_CODE');
    }
    const recoveryCodes = mfaService.generateRecoveryCodes();
    await mfaModel.enable(client, userId, recoveryCodes.map(mfaService.hashRecoveryCode));
    return { recoveryCodes };
  });
}

async function disableMfa(userId, code) {
  await transaction(async (client) => {
    const user = await mfaModel.findUser(client, userId, true);
    if (!user?.mfa_habilitado || !(await verifyMfaFactor(client, user, code))) {
      throw new HttpError(400, 'El código de autenticación no es válido.', 'INVALID_MFA_CODE');
    }
    await mfaModel.disable(client, userId);
  });
}

async function refresh(oldToken, csrfToken, metadata) {
  if (!oldToken) throw new HttpError(401, 'No se encontró una sesión.', 'REFRESH_REQUIRED');
  const outcome = await transaction(async (client) => {
    const user = await sessionModel.findWithUserForUpdate(client, tokenService.hashToken(oldToken));
    if (user && !validCsrfToken(user, csrfToken)) {
      return { error: new HttpError(403, 'La validación CSRF falló.', 'INVALID_CSRF_TOKEN') };
    }
    if (user?.revocada_en && user.reemplazada_por_id) {
      await sessionModel.revokeFamily(client, user.familia_id, 'reuse_detected');
      console.warn('[auth:refresh-reuse]', { userId: user.id, familyId: user.familia_id });
      return { error: new HttpError(
        401,
        'Detectamos la reutilización de una sesión. Inicia sesión nuevamente.',
        'REFRESH_TOKEN_REUSE',
      ) };
    }
    if (!user || user.revocada_en || new Date(user.expira_en) <= new Date()
      || !user.activo || !user.correo_verificado) {
      return { error: new HttpError(401, 'La sesión no es válida o expiró.', 'INVALID_REFRESH_TOKEN') };
    }
    const session = await createSession(client, user, metadata, {
      familyId: user.familia_id,
      parentSessionId: user.session_id,
    });
    await sessionModel.markRotated(client, user.session_id, session.sessionId);
    return { user: userModel.mapUser(user), ...session };
  });
  if (outcome.error) throw outcome.error;
  return outcome;
}

async function logout(token, csrfToken) {
  if (!token) return;
  const outcome = await transaction(async (client) => {
    const session = await sessionModel.findWithUserForUpdate(client, tokenService.hashToken(token));
    if (!session) return {};
    if (!validCsrfToken(session, csrfToken)) {
      return { error: new HttpError(403, 'La validación CSRF falló.', 'INVALID_CSRF_TOKEN') };
    }
    await sessionModel.revokeByTokenHash(client, tokenService.hashToken(token), 'logout');
    return {};
  });
  if (outcome.error) throw outcome.error;
}

async function listSessions(userId, currentSessionId) {
  const sessions = await sessionModel.listForUser(pool, userId);
  return sessions.map((session) => ({
    id: session.id,
    ip: session.direccion_ip,
    device: session.dispositivo,
    createdAt: session.creada_en,
    expiresAt: session.expira_en,
    revokedAt: session.revocada_en,
    revocationReason: session.motivo_revocacion,
    current: session.id === currentSessionId,
    active: !session.revocada_en && new Date(session.expira_en) > new Date(),
  }));
}

async function revokeSession(userId, sessionId) {
  const revoked = await sessionModel.revokeOwnedById(pool, userId, sessionId);
  if (!revoked) throw new HttpError(404, 'La sesión no existe o ya fue cerrada.', 'SESSION_NOT_FOUND');
  return { current: sessionId };
}

async function logoutAll(userId) {
  return { revoked: await sessionModel.revokeAllForUser(pool, userId) };
}

async function getMe(userId) {
  const user = await userModel.findActiveById(pool, userId);
  if (!user) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
  return userModel.mapUser(user);
}

async function updateProfilePhoto(userId, dataUrl) {
  const { buffer, mime } = parseProfilePhoto(dataUrl);
  const user = await userModel.updateProfilePhoto(pool, userId, buffer, mime);
  if (!user) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
  return userModel.mapUser(user);
}
async function deleteProfilePhoto(userId) {
  const user = await userModel.updateProfilePhoto(pool, userId, null, null);
  if (!user) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
  return userModel.mapUser(user);
}

async function updateProfileDetails(userId, details) {
  const user = await userModel.updateProfileDetails(pool, userId, details);
  if (!user) throw new HttpError(403, 'Este perfil no puede editar información pública.', 'PROFILE_DETAILS_FORBIDDEN');
  return userModel.mapUser(user);
}

async function forgotPassword(email) {
  const result = await transaction(async (client) => {
    const user = await userModel.findVerificationRecipientByEmail(client, email);
    // La respuesta es idéntica aunque el correo no exista para evitar enumeración de cuentas.
    if (!user) return {};

    const resetToken = tokenService.newRefreshToken();
    await passwordResetModel.invalidateForUser(client, user.id);
    await passwordResetModel.create(
      client,
      user.id,
      tokenService.hashToken(resetToken),
      new Date(Date.now() + 30 * 60 * 1000),
    );
    return { resetToken, user };
  });
  if (result.resetToken) {
    await emailService.trySendPasswordResetEmail({
      to: result.user.correo_electronico, name: result.user.nombre, token: result.resetToken,
    });
  }
  return canExposeDevelopmentTokens(config) && result.resetToken ? { resetToken: result.resetToken } : {};
}

async function resetPassword(token, password) {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1,
  });
  await transaction(async (client) => {
    const reset = await passwordResetModel.findValidForUpdate(client, tokenService.hashToken(token));
    if (!reset) throw new HttpError(400, 'El enlace de recuperación no es válido o expiró.', 'INVALID_RESET_TOKEN');
    await userModel.updatePassword(client, reset.usuario_id, passwordHash);
    await passwordResetModel.markUsed(client, reset.id);
  });
}

async function createEmailVerificationToken(userId) {
  return transaction(async (client) => {
    const token = tokenService.newRefreshToken();
    await emailVerificationModel.invalidateForUser(client, userId);
    await emailVerificationModel.create(
      client, userId, tokenService.hashToken(token), new Date(Date.now() + 24 * 60 * 60 * 1000),
    );
    return token;
  });
}

async function resendVerification(email) {
  const recipient = await userModel.findVerificationRecipientByEmail(pool, email);
  if (!recipient || recipient.correo_verificado) return {};
  const token = await createEmailVerificationToken(recipient.id);
  const delivery = await emailService.trySendVerificationEmail({
    to: recipient.correo_electronico, name: recipient.nombre, token,
  });
  return {
    emailSent: delivery.sent,
    ...(canExposeDevelopmentTokens(config) ? { verificationToken: token } : {}),
  };
}

async function verifyEmail(token) {
  await transaction(async (client) => {
    const verification = await emailVerificationModel.findForUpdate(
      client, tokenService.hashToken(token),
    );
    if (!verification || !verification.activo || new Date(verification.expira_en) <= new Date()) {
      throw new HttpError(400, 'La liga de confirmación no es válida o expiró.', 'INVALID_VERIFICATION_TOKEN');
    }
    // Los navegadores, clientes de correo y React StrictMode pueden abrir la liga más de una vez.
    // Si este mismo token ya confirmó la cuenta, la operación continúa siendo exitosa.
    if (verification.usado_en && verification.correo_verificado) return;
    if (verification.usado_en) {
      throw new HttpError(400, 'La liga de confirmación ya fue utilizada.', 'INVALID_VERIFICATION_TOKEN');
    }
    await userModel.verifyEmail(client, verification.usuario_id);
    await emailVerificationModel.markUsed(client, verification.id);
  });
}

module.exports = {
  register, login, refresh, logout, getMe, forgotPassword, resetPassword,
  resendVerification, verifyEmail,
  completeMfaLogin, getMfaStatus, beginMfaSetup, enableMfa, disableMfa,
  listSessions, revokeSession, logoutAll, updateProfilePhoto, deleteProfilePhoto, updateProfileDetails,
};
