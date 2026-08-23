function canExposeDevelopmentTokens(config) {
  return config.NODE_ENV === 'development' && config.EMAIL_ENABLED === false;
}

module.exports = { canExposeDevelopmentTokens };
