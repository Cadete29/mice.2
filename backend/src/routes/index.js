const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const projectRoutes = require('./project.routes');
const callRoutes = require('./call.routes');
const categoryRoutes = require('./category.routes');
const contactRoutes = require('./contact.routes');
const callCategoryRoutes = require('./call-category.routes');
const beachRegistrationRoutes = require('./beach-registration.routes');

const router = express.Router();
router.get('/', (_req, res) => {
  res.json({
    nombre: 'API de MICE-LO',
    version: '1.0.0',
    endpoints: {
      salud: 'GET /api/health',
      registro: 'POST /api/auth/register',
      inicioSesion: 'POST /api/auth/login',
      renovarSesion: 'POST /api/auth/refresh (rotación con detección de reutilización)',
      cerrarSesion: 'POST /api/auth/logout',
      recuperarPassword: 'POST /api/auth/forgot-password',
      restablecerPassword: 'POST /api/auth/reset-password',
      reenviarConfirmacion: 'POST /api/auth/resend-verification',
      confirmarCorreo: 'POST /api/auth/verify-email',
      usuarioActual: 'GET /api/auth/me',
      contacto: 'POST /api/contact',
    },
  });
});
router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/projects', projectRoutes);
router.use('/calls', callRoutes);
router.use('/categories', categoryRoutes);
router.use('/contact', contactRoutes);
router.use('/call-categories', callCategoryRoutes);
router.use('/beach-registrations', beachRegistrationRoutes);

module.exports = router;
