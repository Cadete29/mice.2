const config = require('../config/env');
const emailService = require('../services/email.service');
const HttpError = require('../utils/http-error');

async function send(req, res) {
  if (!config.EMAIL_ENABLED || !(config.ADMIN_EMAIL || config.EMAIL_USER)) {
    throw new HttpError(503, 'El servicio de contacto no está disponible temporalmente.', 'CONTACT_UNAVAILABLE');
  }

  try {
    await emailService.sendContactEmails(req.body);
  } catch (error) {
    console.error('[email:contact-delivery-failed]', { message: error.message });
    throw new HttpError(502, 'No fue posible enviar tu mensaje. Inténtalo nuevamente.', 'CONTACT_DELIVERY_FAILED');
  }

  res.status(201).json({
    message: 'Tu mensaje fue enviado. Te mandamos una confirmación por correo.',
  });
}

async function sendFamily(req, res) {
  if (!config.EMAIL_ENABLED || !(config.ADMIN_EMAIL || config.EMAIL_USER)) {
    throw new HttpError(503, 'El servicio de contacto no está disponible temporalmente.', 'CONTACT_UNAVAILABLE');
  }

  try {
    await emailService.sendFamilyContactEmail(req.body);
  } catch (error) {
    console.error('[email:family-contact-delivery-failed]', { message: error.message });
    throw new HttpError(502, 'No fue posible enviar tu mensaje. Inténtalo nuevamente.', 'CONTACT_DELIVERY_FAILED');
  }

  res.status(201).json({
    message: 'Tus datos fueron enviados. El equipo de MICE-LO se pondrá en contacto contigo.',
  });
}

module.exports = { send, sendFamily };
