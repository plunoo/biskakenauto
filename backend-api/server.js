process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'Biskaken_JWT_2024_Secret_Key';

console.log('Starting server with config:', {
  PORT,
  NODE_ENV: process.env.NODE_ENV,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  DB: process.env.DATABASE_URL ? 'configured' : 'not configured'
});

// DB Pool
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  pool.connect().then(() => {
    console.log('✅ PostgreSQL connected');
    initDB();
  }).catch(err => {
    console.error('❌ DB connection failed:', err.message);
    pool = null;
  });
}

// Init DB tables
async function initDB() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(50),
      email VARCHAR(255), plate_number VARCHAR(50), vehicle_make VARCHAR(100),
      vehicle_model VARCHAR(100), vehicle_year INT, notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY, customer_id INT REFERENCES customers(id),
      title VARCHAR(255), description TEXT, status VARCHAR(50) DEFAULT 'PENDING',
      priority VARCHAR(50) DEFAULT 'MEDIUM', estimated_cost DECIMAL(10,2),
      actual_cost DECIMAL(10,2), vehicle_info VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT,
      category VARCHAR(100), stock INT DEFAULT 0, unit_price DECIMAL(10,2),
      reorder_level INT DEFAULT 5,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY, job_id INT REFERENCES jobs(id),
      customer_id INT REFERENCES customers(id),
      amount DECIMAL(10,2), status VARCHAR(50) DEFAULT 'PENDING',
      notes TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY, title VARCHAR(255), content TEXT, excerpt TEXT,
      status VARCHAR(50) DEFAULT 'DRAFT', author VARCHAR(100) DEFAULT 'Admin', tags TEXT,
      created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ DB tables initialized');
}

// In-memory store (fallback when no DB)
const store = {
  customers: [],
  jobs: [],
  inventory: [],
  invoices: [],
  blog: [],
  nextId: { customers: 1, jobs: 1, inventory: 1, invoices: 1, blog: 1 }
};

// Security & CORS
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['https://biskakenauto.rpnmore.com', 'https://bisadmin.rpnmore.com', 'http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// ===================== HEALTH =====================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Biskaken Auto API v3 is running', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'connected', api: 'biskaken-auto', version: '3.0.0', database: pool ? 'connected' : 'in-memory' });
});

// ===================== AUTH =====================
const DEMO_USERS = [
  { id: '1', email: 'admin@biskaken.com', password: 'admin123', name: 'Biskaken Admin', role: 'ADMIN' },
  { id: '2', email: 'staff@biskaken.com', password: 'staff123', name: 'Biskaken Staff', role: 'STAFF' }
];

function loginHandler(req, res) {
  const { email, password } = req.body;
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token } });
}

app.post('/api/auth/login', loginHandler);
app.post('/api/auth/admin-login', loginHandler);
app.post('/api/test/auth/login', loginHandler);

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = DEMO_USERS.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// ===================== CUSTOMERS =====================
app.get('/api/customers', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    return res.json({ success: true, data: r.rows.map(row => ({
      id: String(row.id), name: row.name, phone: row.phone, email: row.email,
      plateNumber: row.plate_number, vehicleMake: row.vehicle_make,
      vehicleModel: row.vehicle_model, vehicleYear: row.vehicle_year,
      notes: row.notes, createdAt: row.created_at
    }))});
  }
  res.json({ success: true, data: store.customers });
});

app.post('/api/customers', authMiddleware, async (req, res) => {
  const { name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes } = req.body;
  if (pool) {
    const r = await pool.query(
      'INSERT INTO customers (name, phone, email, plate_number, vehicle_make, vehicle_model, vehicle_year, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes]
    );
    const row = r.rows[0];
    return res.json({ success: true, data: { id: String(row.id), name: row.name, phone: row.phone, email: row.email, plateNumber: row.plate_number, vehicleMake: row.vehicle_make, vehicleModel: row.vehicle_model, vehicleYear: row.vehicle_year } });
  }
  const customer = { id: String(store.nextId.customers++), name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes, createdAt: new Date().toISOString() };
  store.customers.push(customer);
  res.json({ success: true, data: customer });
});

app.put('/api/customers/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes } = req.body;
  if (pool) {
    const r = await pool.query(
      'UPDATE customers SET name=$1, phone=$2, email=$3, plate_number=$4, vehicle_make=$5, vehicle_model=$6, vehicle_year=$7, notes=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes, id]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const idx = store.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  store.customers[idx] = { ...store.customers[idx], name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, notes };
  res.json({ success: true, data: store.customers[idx] });
});

app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (pool) {
    await pool.query('DELETE FROM customers WHERE id=$1', [id]);
    return res.json({ success: true });
  }
  store.customers = store.customers.filter(c => c.id !== id);
  res.json({ success: true });
});

// ===================== JOBS =====================
app.get('/api/jobs', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query(`
      SELECT j.*, c.name as customer_name FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      ORDER BY j.created_at DESC
    `);
    return res.json({ success: true, data: r.rows.map(row => ({
      id: String(row.id), customerId: String(row.customer_id), customerName: row.customer_name,
      title: row.title, description: row.description, status: row.status,
      priority: row.priority, estimatedCost: row.estimated_cost,
      actualCost: row.actual_cost, vehicleInfo: row.vehicle_info, createdAt: row.created_at
    }))});
  }
  res.json({ success: true, data: store.jobs });
});

app.post('/api/jobs', authMiddleware, async (req, res) => {
  const { customerId, title, description, status = 'PENDING', priority = 'MEDIUM', estimatedCost, vehicleInfo } = req.body;
  if (pool) {
    const r = await pool.query(
      'INSERT INTO jobs (customer_id, title, description, status, priority, estimated_cost, vehicle_info) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [customerId, title, description, status, priority, estimatedCost, vehicleInfo]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const job = { id: String(store.nextId.jobs++), customerId, title, description, status, priority, estimatedCost, vehicleInfo, createdAt: new Date().toISOString() };
  store.jobs.push(job);
  res.json({ success: true, data: job });
});

app.put('/api/jobs/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, actualCost } = req.body;
  if (pool) {
    const r = await pool.query('UPDATE jobs SET status=$1, actual_cost=$2, updated_at=NOW() WHERE id=$3 RETURNING *', [status, actualCost, id]);
    return res.json({ success: true, data: r.rows[0] });
  }
  const idx = store.jobs.findIndex(j => j.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  store.jobs[idx] = { ...store.jobs[idx], status, actualCost };
  res.json({ success: true, data: store.jobs[idx] });
});

app.put('/api/jobs/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  if (pool) {
    const r = await pool.query('UPDATE jobs SET title=$1, description=$2, status=$3, priority=$4, estimated_cost=$5, vehicle_info=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [fields.title, fields.description, fields.status, fields.priority, fields.estimatedCost, fields.vehicleInfo, id]);
    return res.json({ success: true, data: r.rows[0] });
  }
  const idx = store.jobs.findIndex(j => j.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  store.jobs[idx] = { ...store.jobs[idx], ...fields };
  res.json({ success: true, data: store.jobs[idx] });
});

// ===================== INVENTORY =====================
app.get('/api/inventory', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    return res.json({ success: true, data: r.rows.map(row => ({
      id: String(row.id), name: row.name, description: row.description,
      category: row.category, stock: row.stock, unitPrice: row.unit_price,
      reorderLevel: row.reorder_level
    }))});
  }
  res.json({ success: true, data: store.inventory });
});

app.post('/api/inventory', authMiddleware, async (req, res) => {
  const { name, description, category, stock = 0, unitPrice, reorderLevel = 5 } = req.body;
  if (pool) {
    const r = await pool.query(
      'INSERT INTO inventory (name, description, category, stock, unit_price, reorder_level) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, category, stock, unitPrice, reorderLevel]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const item = { id: String(store.nextId.inventory++), name, description, category, stock, unitPrice, reorderLevel, createdAt: new Date().toISOString() };
  store.inventory.push(item);
  res.json({ success: true, data: item });
});

app.put('/api/inventory/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, category, stock, unitPrice, reorderLevel } = req.body;
  if (pool) {
    const r = await pool.query(
      'UPDATE inventory SET name=$1, description=$2, category=$3, stock=$4, unit_price=$5, reorder_level=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, description, category, stock, unitPrice, reorderLevel, id]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const idx = store.inventory.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  store.inventory[idx] = { ...store.inventory[idx], name, description, category, stock, unitPrice, reorderLevel };
  res.json({ success: true, data: store.inventory[idx] });
});

// ===================== INVOICES =====================
app.get('/api/invoices', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query(`
      SELECT i.*, c.name as customer_name, j.title as job_title FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      ORDER BY i.created_at DESC
    `);
    return res.json({ success: true, data: r.rows });
  }
  res.json({ success: true, data: store.invoices });
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
  const { jobId, customerId, amount, status = 'PENDING', notes } = req.body;
  if (pool) {
    const r = await pool.query(
      'INSERT INTO invoices (job_id, customer_id, amount, status, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [jobId, customerId, amount, status, notes]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const invoice = { id: String(store.nextId.invoices++), jobId, customerId, amount, status, notes, createdAt: new Date().toISOString() };
  store.invoices.push(invoice);
  res.json({ success: true, data: invoice });
});

app.post('/api/invoices/:id/payments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (pool) {
    const r = await pool.query('UPDATE invoices SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', ['PAID', id]);
    return res.json({ success: true, data: r.rows[0] });
  }
  const idx = store.invoices.findIndex(i => i.id === id);
  if (idx !== -1) store.invoices[idx].status = 'PAID';
  res.json({ success: true });
});

// ===================== BLOG =====================
app.get('/api/blog', async (req, res) => {
  if (pool) {
    const r = await pool.query("SELECT * FROM blog_posts WHERE status='PUBLISHED' ORDER BY created_at DESC");
    return res.json({ success: true, data: r.rows });
  }
  res.json({ success: true, data: store.blog.filter(p => p.status === 'PUBLISHED') });
});

app.get('/api/blog/all', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    return res.json({ success: true, data: r.rows });
  }
  res.json({ success: true, data: store.blog });
});

app.post('/api/blog', authMiddleware, async (req, res) => {
  const { title, content, excerpt, status = 'DRAFT', tags } = req.body;
  if (pool) {
    const r = await pool.query(
      'INSERT INTO blog_posts (title, content, excerpt, status, tags) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, content, excerpt, status, Array.isArray(tags) ? tags.join(',') : tags]
    );
    return res.json({ success: true, data: r.rows[0] });
  }
  const post = { id: String(store.nextId.blog++), title, content, excerpt, status, tags, author: 'Admin', createdAt: new Date().toISOString() };
  store.blog.push(post);
  res.json({ success: true, data: post });
});

app.delete('/api/blog/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (pool) {
    await pool.query('DELETE FROM blog_posts WHERE id=$1', [id]);
    return res.json({ success: true });
  }
  store.blog = store.blog.filter(p => p.id !== id);
  res.json({ success: true });
});

// ===================== REPORTS =====================
app.get('/api/reports/dashboard', authMiddleware, async (req, res) => {
  if (pool) {
    const [custR, jobR, invR, revR] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM customers'),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='PENDING' THEN 1 END) as pending, COUNT(CASE WHEN status='COMPLETED' THEN 1 END) as completed FROM jobs"),
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN stock <= reorder_level THEN 1 END) as low_stock FROM inventory'),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM invoices WHERE status='PAID'")
    ]);
    const recentJobs = await pool.query('SELECT j.*, c.name as customer_name FROM jobs j LEFT JOIN customers c ON j.customer_id=c.id ORDER BY j.created_at DESC LIMIT 5');
    return res.json({ success: true, data: {
      summary: {
        totalRevenue: parseFloat(revR.rows[0].total),
        totalJobs: parseInt(jobR.rows[0].total),
        pendingJobs: parseInt(jobR.rows[0].pending),
        completedJobs: parseInt(jobR.rows[0].completed),
        totalCustomers: parseInt(custR.rows[0].total),
        lowStockItems: parseInt(invR.rows[0].low_stock)
      },
      recentJobs: recentJobs.rows,
      lowStock: []
    }});
  }
  res.json({ success: true, data: {
    summary: {
      totalRevenue: store.invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + parseFloat(i.amount || 0), 0),
      totalJobs: store.jobs.length,
      pendingJobs: store.jobs.filter(j => j.status === 'PENDING').length,
      completedJobs: store.jobs.filter(j => j.status === 'COMPLETED').length,
      totalCustomers: store.customers.length,
      lowStockItems: store.inventory.filter(i => i.stock <= i.reorderLevel).length
    },
    recentJobs: store.jobs.slice(-5),
    lowStock: store.inventory.filter(i => i.stock <= i.reorderLevel)
  }});
});

app.get('/api/reports/financial', authMiddleware, async (req, res) => {
  if (pool) {
    const r = await pool.query("SELECT COALESCE(SUM(amount),0) as total, status FROM invoices GROUP BY status");
    return res.json({ success: true, data: r.rows });
  }
  res.json({ success: true, data: { total: 0, paid: 0, pending: 0 } });
});

app.post('/api/reports/export', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Export feature coming soon', data: null });
});

// ===================== LANDING =====================
app.get('/api/landing/hero', (req, res) => {
  res.json({ success: true, data: { title: 'Biskaken Auto', subtitle: 'Professional Auto Services', cta: 'Book a Service' } });
});

app.get('/api/landing/services', (req, res) => {
  res.json({ success: true, data: [
    { id: '1', name: 'Oil Change', description: 'Full synthetic oil change', price: 150 },
    { id: '2', name: 'Brake Service', description: 'Full brake inspection and service', price: 300 },
    { id: '3', name: 'Diagnostics', description: 'Full vehicle diagnostics', price: 100 }
  ]});
});

app.post('/api/landing/contact', (req, res) => {
  console.log('Contact inquiry:', req.body);
  res.json({ success: true, message: 'Inquiry received. We will contact you soon.' });
});

// ===================== TEST ENDPOINTS (legacy) =====================
app.get('/api/test/blog', (req, res) => {
  res.json({ success: true, data: store.blog });
});
app.get('/api/test/customers', (req, res) => res.json({ success: true, data: store.customers }));
app.get('/api/test/jobs', (req, res) => res.json({ success: true, data: store.jobs }));
app.get('/api/test/inventory', (req, res) => res.json({ success: true, data: store.inventory }));
app.get('/api/test/invoices', (req, res) => res.json({ success: true, data: store.invoices }));

// Catch-all
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.path} not found` });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Biskaken API server running on port ${PORT}`);
});

module.exports = app;
