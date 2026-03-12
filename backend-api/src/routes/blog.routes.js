const { Router } = require('express');
const ctrl = require('../controllers/blog.controller');
const { authenticate } = require('../middleware/auth');

const r = Router();
r.get('/', ctrl.getAll);
r.get('/:id', ctrl.getById);
r.post('/', authenticate, ctrl.create);
r.put('/:id', authenticate, ctrl.update);
r.put('/:id/status', authenticate, ctrl.updateStatus);
r.delete('/:id', authenticate, ctrl.remove);
module.exports = r;
