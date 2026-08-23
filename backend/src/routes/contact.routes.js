const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/contact.controller');
const validate = require('../middlewares/validate');
const { contactSchema, familyContactSchema } = require('../models/contact.schemas');

const router = express.Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Has enviado demasiados mensajes. Inténtalo más tarde.' } },
});

router.post('/', limiter, validate(contactSchema), controller.send);
router.post('/family', limiter, validate(familyContactSchema), controller.sendFamily);

module.exports = router;
