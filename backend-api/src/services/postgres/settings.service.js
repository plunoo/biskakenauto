const { getPool } = require('../../config/postgres');

// Ensure settings table exists
const ensureTable = async () => {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

exports.getLandingSettings = async () => {
  await ensureTable();
  const { rows } = await getPool().query("SELECT value FROM settings WHERE key = 'landing'");
  return rows[0]?.value || {};
};

exports.updateLandingSettings = async (data) => {
  await ensureTable();
  const { rows } = await getPool().query(`
    INSERT INTO settings (key, value, updated_at)
    VALUES ('landing', $1, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = settings.value || $1, updated_at = NOW()
    RETURNING value
  `, [JSON.stringify(data)]);
  return rows[0].value;
};
