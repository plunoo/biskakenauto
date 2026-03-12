const { Pool } = require('pg');

let pool = null;

const getPool = () => {
  if (pool) return pool;

  const hasConfig = process.env.DATABASE_URL || process.env.DB_HOST;
  if (!hasConfig) {
    console.warn('[PostgreSQL] Not configured - set DATABASE_URL or DB_HOST');
    return null;
  }

  const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'biskaken_auto',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      };

  pool = new Pool(config);
  pool.on('error', (err) => console.error('[PostgreSQL] Pool error:', err));
  console.log('[PostgreSQL] Pool created');
  return pool;
};

module.exports = { getPool };
