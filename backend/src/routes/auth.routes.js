const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
  resendVerificationSchema, verifyEmailSchema,
  mfaChallengeSchema, mfaCodeSchema, profilePhotoSchema, profileDetailsSchema,
} = require('../models/auth.schemas');

const router = express.Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos. Inténtalo más tarde.' } },
});

router.post('/register', limiter, validate(registerSchema), controller.register);
router.post('/login', limiter, validate(loginSchema), controller.login);
router.post('/mfa/verify', limiter, validate(mfaChallengeSchema), controller.completeMfaLogin);
router.post('/refresh', limiter, controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', limiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', limiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/resend-verification', limiter, validate(resendVerificationSchema), controller.resendVerification);
router.post('/verify-email', limiter, validate(verifyEmailSchema), controller.verifyEmail);
router.get('/me', authenticate, controller.me);
router.put('/profile/photo', authenticate, validate(profilePhotoSchema), controller.updateProfilePhoto);
router.delete('/profile/photo', authenticate, controller.deleteProfilePhoto);
router.put('/profile/details', authenticate, validate(profileDetailsSchema), controller.updateProfileDetails);
router.get('/sessions', authenticate, controller.sessions);
router.delete('/sessions/:sessionId', authenticate, controller.revokeSession);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/mfa/status', authenticate, controller.mfaStatus);
router.post('/mfa/setup', authenticate, controller.beginMfaSetup);
router.post('/mfa/enable', authenticate, validate(mfaCodeSchema), controller.enableMfa);
router.post('/mfa/disable', authenticate, validate(mfaCodeSchema), controller.disableMfa);

module.exports = router;
