const { getService } = require('../services/db.factory');

exports.getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('inventory').getAll() }); }
  catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await getService('inventory').getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await getService('inventory').create(req.body) }); }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('inventory').update(req.params.id, req.body) }); }
  catch (err) { next(err); }
};

exports.updateStock = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('inventory').updateStock(req.params.id, req.body.quantity) }); }
  catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try { await getService('inventory').remove(req.params.id); res.json({ success: true, message: 'Deleted' }); }
  catch (err) { next(err); }
};
