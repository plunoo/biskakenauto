const { getService } = require('../services/db.factory');

exports.getAll = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('blog').getAll(req.query) }); }
  catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await getService('blog').getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await getService('blog').create(req.body) }); }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('blog').update(req.params.id, req.body) }); }
  catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try { res.json({ success: true, data: await getService('blog').updateStatus(req.params.id, req.body.status) }); }
  catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try { await getService('blog').remove(req.params.id); res.json({ success: true, message: 'Deleted' }); }
  catch (err) { next(err); }
};
