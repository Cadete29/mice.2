const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const routes = require('./routes');
const cookies = require('./middlewares/cookies');
const { notFound, errorHandler } = require('./middlewares/error-handler');

const app = express();
if (config.TRUST_PROXY) app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '18mb' }));

app.use(cookies);
app.get('/', (_req, res) => {
  res.json({
    nombre: 'API de MICE-LO',
    estado: 'Servidor funcionando correctamente',
    documentacion: '/api',
    salud: '/api/health',
  });
});
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
