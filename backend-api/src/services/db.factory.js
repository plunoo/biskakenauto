const { getActiveProvider } = require('../config/database');

const getService = (serviceName) => {
  const provider = getActiveProvider();
  try {
    return require(`./${provider}/${serviceName}.service`);
  } catch (err) {
    throw new Error(`Service "${serviceName}" not found for provider "${provider}": ${err.message}`);
  }
};

module.exports = { getService };
