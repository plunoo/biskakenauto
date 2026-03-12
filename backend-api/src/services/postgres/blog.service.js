const { getPool } = require('../../config/postgres');

exports.getAll = async (filters = {}) => {
  let query = 'SELECT * FROM blog_posts';
  const values = [];
  if (filters.status) { query += ' WHERE status = $1'; values.push(filters.status); }
  query += ' ORDER BY created_at DESC';
  const { rows } = await getPool().query(query, values);
  return rows;
};

exports.getById = async (id) => {
  const { rows } = await getPool().query('SELECT * FROM blog_posts WHERE id = $1', [id]);
  return rows[0] || null;
};

exports.create = async (data) => {
  const { rows } = await getPool().query(
    `INSERT INTO blog_posts (title, content, excerpt, status, author, tags)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.title, data.content, data.excerpt, data.status || 'DRAFT', data.author || 'Admin', JSON.stringify(data.tags || [])]
  );
  return rows[0];
};

exports.update = async (id, data) => {
  const { rows } = await getPool().query(
    `UPDATE blog_posts SET title=$1, content=$2, excerpt=$3, status=$4, tags=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
    [data.title, data.content, data.excerpt, data.status, JSON.stringify(data.tags || []), id]
  );
  return rows[0];
};

exports.updateStatus = async (id, status) => {
  const { rows } = await getPool().query(
    'UPDATE blog_posts SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
    [status, id]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await getPool().query('DELETE FROM blog_posts WHERE id = $1', [id]);
};
