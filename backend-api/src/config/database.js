const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../.db-provider.json');
const VALID_PROVIDERS = ['firebase', 'postgres'];

const getActiveProvider = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (VALID_PROVIDERS.includes(cfg.provider)) return cfg.provider;
    }
  } catch {}
  return process.env.DB_PROVIDER || 'firebase';
};

const setActiveProvider = (provider) => {
  if (!VALID_PROVIDERS.includes(provider)) {
    throw new Error(`Invalid provider "${provider}". Must be one of: ${VALID_PROVIDERS.join(', ')}`);
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ provider, updatedAt: new Date().toISOString() }, null, 2));
  return provider;
};

module.exports = { getActiveProvider, setActiveProvider, VALID_PROVIDERS };
