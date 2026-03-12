const { getPool } = require('../../config/postgres');
const bcrypt = require('bcryptjs');

exports.findUserByEmail = async (email) => {
  const { rows } = await getPool().query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

exports.findUserById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.getAllUsers = async () => {
  const { rows } = await getPool().query('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC');
  return rows;
};

exports.createUser = async (data) => {
  const hashed = await bcrypt.hash(data.password, 12);
  const { rows } = await getPool().query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, status, created_at',
    [data.name, data.email, hashed, data.role || 'STAFF']
  );
  return rows[0];
};

exports.updateUser = async (id, data) => {
  const fields = [];
  const values = [];
  let i = 1;
  if (data.name) { fields.push(`name = $${i++}`); values.push(data.name); }
  if (data.email) { fields.push(`email = $${i++}`); values.push(data.email); }
  if (data.role) { fields.push(`role = $${i++}`); values.push(data.role); }
  if (data.status) { fields.push(`status = $${i++}`); values.push(data.status); }
  if (data.password) { fields.push(`password = $${i++}`); values.push(await bcrypt.hash(data.password, 12)); }
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, role, status`,
    values
  );
  return rows[0];
};

exports.deleteUser = async (id) => {
  await getPool().query('DELETE FROM users WHERE id = $1', [id]);
};

exports.verifyPassword = async (plain, hashed) => bcrypt.compare(plain, hashed);
exports.hashPassword = async (plain) => bcrypt.hash(plain, 12);
