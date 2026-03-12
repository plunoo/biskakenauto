const { getPool } = require('../../config/postgres');
const { v4: uuid } = require('uuid');

exports.getAll = async () => {
  const { rows } = await getPool().query('SELECT * FROM invoices ORDER BY created_at DESC');
  return rows;
};

exports.getById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM invoices WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const { rows } = await getPool().query(
    `INSERT INTO invoices (customer_id, job_id, items, subtotal, tax, grand_total, status, payments)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.customerId, data.jobId, JSON.stringify(data.items || []),
     data.subtotal, data.tax, data.grandTotal, data.status || 'UNPAID', JSON.stringify([])]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { rows } = await getPool().query(
    `UPDATE invoices SET items=$1, subtotal=$2, tax=$3, grand_total=$4, status=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
    [JSON.stringify(data.items), data.subtotal, data.tax, data.grandTotal, data.status, id]
  );
  return rows[0];
};

exports.recordPayment = async (id, payment) => {
  const invoice = await exports.getById(id);
  if (!invoice) throw new Error('Invoice not found');
  const payments = [...(invoice.payments || []), { ...payment, id: uuid(), date: new Date().toISOString() }];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const status = totalPaid >= invoice.grand_total ? 'PAID' : 'PARTIAL';
  const { rows } = await getPool().query(
    'UPDATE invoices SET payments=$1, status=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
    [JSON.stringify(payments), status, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await getPool().query('DELETE FROM invoices WHERE id = $1', [id]);
};
