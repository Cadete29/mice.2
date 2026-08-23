const config = require('../config/env');
const authService = require('../services/auth.service');
const { sessionIdSchema } = require('../models/session.schemas');
const HttpError = require('../utils/http-error');
const { canExposeDevelopmentTokens } = require('../utils/development-tokens');

const cookieOptions = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAME_SITE,
  path: '/api/auth',
  maxAge: config.REFRESH_TOKEN_DAYS * 86_400_000,
};

const metadata = (req) => ({ ip: req.ip, userAgent: req.get('user-agent')?.slice(0, 500) });
const respondWithSession = (res, session, status = 200) => {
  res.cookie('refreshToken', session.refreshToken, cookieOptions);
  res.status(status).json({
    user: session.user,
    accessToken: session.accessToken,
    csrfToken: session.csrfToken,
  });
};

async function register(req, res) {
  const result = await authService.register(req.body, metadata(req));
  res.status(201).json({
    user: result.user,
    emailSent: result.emailSent,
    ...(canExposeDevelopmentTokens(config) && result.verificationToken
      ? { verificationToken: result.verificationToken } : {}),
  });
}

async function login(req, res) {
  const result = await authService.login(req.body, metadata(req));
  if (result.mfaRequired) return res.json(result);
  respondWithSession(res, result);
}

async function completeMfaLogin(req, res) {
  respondWithSession(res, await authService.completeMfaLogin(
    req.body.mfaToken, req.body.code, metadata(req),
  ));
}

async function mfaStatus(req, res) {
  res.json(await authService.getMfaStatus(req.auth.userId));
}

async function beginMfaSetup(req, res) {
  res.json(await authService.beginMfaSetup(req.auth.userId));
}

async function enableMfa(req, res) {
  res.json(await authService.enableMfa(req.auth.userId, req.body.code));
}

async function disableMfa(req, res) {
  await authService.disableMfa(req.auth.userId, req.body.code);
  res.status(204).end();
}

async function refresh(req, res) {
  try {
    respondWithSession(res, await authService.refresh(
      req.cookies.refreshToken, req.get('x-csrf-token'), metadata(req),
    ));
  } catch (error) {
    if (error.status === 401) res.clearCookie('refreshToken', cookieOptions);
    throw error;
  }
}

async function logout(req, res) {
  await authService.logout(req.cookies.refreshToken, req.get('x-csrf-token'));
  res.clearCookie('refreshToken', cookieOptions);
  res.status(204).end();
}

async function sessions(req, res) {
  res.json({ sessions: await authService.listSessions(req.auth.userId, req.auth.sessionId) });
}

async function revokeSession(req, res) {
  const parsed = sessionIdSchema.safeParse(req.params.sessionId);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message, 'VALIDATION_ERROR');
  await authService.revokeSession(req.auth.userId, parsed.data);
  if (parsed.data === req.auth.sessionId) res.clearCookie('refreshToken', cookieOptions);
  res.status(204).end();
}

async function logoutAll(req, res) {
  const result = await authService.logoutAll(req.auth.userId);
  res.clearCookie('refreshToken', cookieOptions);
  res.json(result);
}

async function me(req, res) {
  res.json({ user: await authService.getMe(req.auth.userId) });
}
async function updateProfilePhoto(req, res) { res.json({ user: await authService.updateProfilePhoto(req.auth.userId, req.body.photo) }); }
async function deleteProfilePhoto(req, res) { res.json({ user: await authService.deleteProfilePhoto(req.auth.userId) }); }
async function updateProfileDetails(req, res) { res.json({ user: await authService.updateProfileDetails(req.auth.userId, req.body) }); }

async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.correoElectronico);
  res.json({
    message: 'Si el correo está registrado, recibirás instrucciones para recuperar tu cuenta.',
    // Sólo se expone localmente; en producción debe enviarse por correo electrónico.
    ...(canExposeDevelopmentTokens(config) && result.resetToken ? { resetToken: result.resetToken } : {}),
  });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: 'La contraseña fue actualizada correctamente.' });
}

async function resendVerification(req, res) {
  const result = await authService.resendVerification(req.body.correoElectronico);
  res.json({
    message: 'Si la cuenta está pendiente, recibirás un nuevo correo de confirmación.',
    ...(canExposeDevelopmentTokens(config) && result.verificationToken
      ? { verificationToken: result.verificationToken } : {}),
  });
}

async function verifyEmail(req, res) {
  await authService.verifyEmail(req.body.token);
  res.json({ message: 'Tu correo fue confirmado correctamente.' });
}

module.exports = {
  register, login, refresh, logout, me, forgotPassword, resetPassword,
  resendVerification, verifyEmail,
  completeMfaLogin, mfaStatus, beginMfaSetup, enableMfa, disableMfa,
  sessions, revokeSession, logoutAll, updateProfilePhoto, deleteProfilePhoto, updateProfileDetails,
};
