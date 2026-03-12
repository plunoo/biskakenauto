const { Router } = require('express');
const ctrl = require('../controllers/customers.controller');
const { authenticate } = require('../middleware/auth');

const r = Router();
r.get('/', authenticate, ctrl.getAll);
r.get('/:id', authenticate, ctrl.getById);
r.post('/', authenticate, ctrl.create);
r.put('/:id', authenticate, ctrl.update);
r.delete('/:id', authenticate, ctrl.remove);
module.exports = r;
