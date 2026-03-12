const { getActiveProvider, setActiveProvider, VALID_PROVIDERS } = require('../config/database');
const { getPool } = require('../config/postgres');
const { getFirestore } = require('../config/firebase');

exports.getDatabaseStatus = async (req, res, next) => {
  try {
    const activeProvider = getActiveProvider();
    const status = {
      activeProvider,
      availableProviders: VALID_PROVIDERS,
      connections: {}
    };

    // Check Firebase
    try {
      const db = getFirestore();
      await db.collection('_health').limit(1).get();
      status.connections.firebase = { status: 'connected' };
    } catch (err) {
      status.connections.firebase = { status: 'error', message: err.message };
    }

    // Check PostgreSQL
    try {
      const pool = getPool();
      if (pool) {
        const start = Date.now();
        await pool.query('SELECT 1');
        status.connections.postgres = { status: 'connected', latencyMs: Date.now() - start };
      } else {
        status.connections.postgres = { status: 'not_configured' };
      }
    } catch (err) {
      status.connections.postgres = { status: 'error', message: err.message };
    }

    res.json({ success: true, data: status });
  } catch (err) { next(err); }
};

exports.switchProvider = async (req, res, next) => {
  try {
    const { provider } = req.body;
    const newProvider = setActiveProvider(provider);
    res.json({ success: true, data: { provider: newProvider, message: `Switched to ${newProvider}` } });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.getSystemInfo = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        version: '5.0.0',
        nodeVersion: process.version,
        uptime: process.uptime(),
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        activeProvider: getActiveProvider(),
        env: process.env.NODE_ENV || 'development'
      }
    });
  } catch (err) { next(err); }
};
