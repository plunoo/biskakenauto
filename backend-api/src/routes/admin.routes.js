const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const r = Router();
r.get('/database/status', authenticate, requireRole('ADMIN'), ctrl.getDatabaseStatus);
r.patch('/database/provider', authenticate, requireRole('ADMIN'), ctrl.switchProvider);
r.get('/system', authenticate, requireRole('ADMIN'), ctrl.getSystemInfo);
module.exports = r;
