const { getPool } = require('../../config/postgres');

exports.getAll = async () => {
  const { rows } = await getPool().query('SELECT * FROM inventory ORDER BY name');
  return rows;
};

exports.getById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM inventory WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const { rows } = await getPool().query(
    `INSERT INTO inventory (name, category, sku, stock, reorder_level, unit_cost, selling_price, supplier, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.name, data.category, data.sku, data.stock || 0,
     data.reorderLevel || 5, data.unitCost, data.sellingPrice, data.supplier, data.notes]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { rows } = await getPool().query(
    `UPDATE inventory SET name=$1, category=$2, sku=$3, stock=$4, reorder_level=$5,
     unit_cost=$6, selling_price=$7, supplier=$8, notes=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
    [data.name, data.category, data.sku, data.stock, data.reorderLevel,
     data.unitCost, data.sellingPrice, data.supplier, data.notes, id]
  );
  return rows[0];
};

exports.updateStock = async (id, quantity) => {
  const { rows } = await getPool().query(
    'UPDATE inventory SET stock=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
    [quantity, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await getPool().query('DELETE FROM inventory WHERE id = $1', [id]);
};
