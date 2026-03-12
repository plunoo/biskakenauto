const { Router } = require('express');
const ctrl = require('../controllers/invoices.controller');
const { authenticate } = require('../middleware/auth');

const r = Router();
r.get('/', authenticate, ctrl.getAll);
r.get('/:id', authenticate, ctrl.getById);
r.post('/', authenticate, ctrl.create);
r.put('/:id', authenticate, ctrl.update);
r.post('/:id/payments', authenticate, ctrl.recordPayment);
r.delete('/:id', authenticate, ctrl.remove);
module.exports = r;
