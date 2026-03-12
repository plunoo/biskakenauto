const { getPool } = require('../../config/postgres');

exports.getAll = async () => {
  const { rows } = await getPool().query('SELECT * FROM customers ORDER BY created_at DESC');
  return rows;
};

exports.getById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM customers WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const { rows } = await getPool().query(
    `INSERT INTO customers (name, phone, email, address, vehicle_make, vehicle_model, vehicle_year, vehicle_plate, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.name, data.phone, data.email, data.address,
     data.vehicle?.make, data.vehicle?.model, data.vehicle?.year, data.vehicle?.plateNumber, data.notes]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { rows } = await getPool().query(
    `UPDATE customers SET name=$1, phone=$2, email=$3, address=$4,
     vehicle_make=$5, vehicle_model=$6, vehicle_year=$7, vehicle_plate=$8, notes=$9, updated_at=NOW()
     WHERE id=$10 RETURNING *`,
    [data.name, data.phone, data.email, data.address,
     data.vehicle?.make, data.vehicle?.model, data.vehicle?.year, data.vehicle?.plateNumber, data.notes, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await getPool().query('DELETE FROM customers WHERE id = $1', [id]);
};
