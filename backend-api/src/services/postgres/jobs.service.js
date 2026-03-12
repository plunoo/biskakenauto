const { getPool } = require('../../config/postgres');

exports.getAll = async () => {
  const { rows } = await getPool().query('SELECT * FROM jobs ORDER BY created_at DESC');
  return rows;
};

exports.getById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM jobs WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const { rows } = await getPool().query(
    `INSERT INTO jobs (customer_id, title, description, status, priority, estimated_cost, labor_hours, labor_rate, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.customerId, data.title, data.description, data.status || 'PENDING',
     data.priority || 'MEDIUM', data.estimatedCost, data.laborHours, data.laborRate, data.notes]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { rows } = await getPool().query(
    `UPDATE jobs SET title=$1, description=$2, status=$3, priority=$4,
     estimated_cost=$5, labor_hours=$6, labor_rate=$7, notes=$8, updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [data.title, data.description, data.status, data.priority,
     data.estimatedCost, data.laborHours, data.laborRate, data.notes, id]
  );
  return rows[0];
};

exports.updateStatus = async (id, status) => {
  const { rows } = await getPool().query(
    'UPDATE jobs SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
    [status, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await getPool().query('DELETE FROM jobs WHERE id = $1', [id]);
};
