const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const r = Router();

r.post('/login', ctrl.login);
r.post('/admin-login', ctrl.login);
r.get('/me', authenticate, ctrl.getProfile);
r.get('/users', authenticate, requireRole('ADMIN', 'SUB_ADMIN'), ctrl.getUsers);
r.post('/users', authenticate, requireRole('ADMIN'), ctrl.createUser);
r.put('/users/:id', authenticate, requireRole('ADMIN'), ctrl.updateUser);
r.delete('/users/:id', authenticate, requireRole('ADMIN'), ctrl.deleteUser);

module.exports = r;
