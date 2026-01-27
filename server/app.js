const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

// PostgreSQL connection
let pool = null;

const initDatabase = async () => {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'biskaken_auto',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

    pool = new Pool(config);
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    client.release();

    // Create tables if needed
    await createTables();
    
    return { connected: true };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Running in demo mode...');
    pool = null;
    return { connected: false, error: error.message };
  }
};

const createTables = async () => {
  if (!pool) return;
  
  try {
    const client = await pool.connect();
    
    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        plateNumber VARCHAR(20),
        vehicleMake VARCHAR(50),
        vehicleModel VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table  
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        customerId INTEGER REFERENCES customers(id),
        customerName VARCHAR(100),
        vehicleInfo TEXT,
        issueDescription TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        priority VARCHAR(20) DEFAULT 'MEDIUM',
        estimatedCost DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        stock INTEGER DEFAULT 0,
        unitPrice DECIMAL(10,2) DEFAULT 0,
        reorderLevel INTEGER DEFAULT 5,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created/verified');
    client.release();
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

const query = async (text, params = []) => {
  if (!pool) {
    console.log('🔄 Database query skipped - demo mode');
    return { rows: [], rowCount: 0 };
  }
  
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

// Initialize database on startup
initDatabase();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://biskakenauto.rpnmore.com',
    'https://bisadmin.rpnmore.com'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Biskaken Auto API', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@biskaken.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        user: { id: 1, name: 'Admin', email, role: 'ADMIN' },
        token: 'demo_token_' + Date.now()
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Dashboard data
app.get('/api/reports/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue: 15250.50,
        totalJobs: 48,
        pendingJobs: 7,
        completedJobs: 41,
        totalCustomers: 23,
        lowStockItems: 3
      },
      recentJobs: [
        { id: 1, customerName: 'John Doe', vehicleInfo: '2018 Toyota Camry', status: 'COMPLETED', estimatedCost: 450 }
      ],
      lowStock: [
        { id: 1, name: 'Engine Oil', stock: 2, reorderLevel: 5 }
      ]
    }
  });
});

// Database endpoints
app.get('/api/test/customers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows.length > 0 ? result.rows : [
        { id: 1, name: 'John Doe', phone: '+233241234567', email: 'john@example.com', plateNumber: 'GR 1234-19', vehicleMake: 'Toyota', vehicleModel: 'Camry' }
      ]
    });
  } catch (error) {
    console.error('Customers error:', error);
    res.json({
      success: true,
      data: [
        { id: 1, name: 'John Doe', phone: '+233241234567', email: 'john@example.com', plateNumber: 'GR 1234-19', vehicleMake: 'Toyota', vehicleModel: 'Camry' }
      ]
    });
  }
});

app.get('/api/test/jobs', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, customerId: 1, customerName: 'John Doe', title: 'Oil Change', status: 'COMPLETED', priority: 'MEDIUM', estimatedCost: 150 }
    ]
  });
});

app.get('/api/test/inventory', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Engine Oil', stock: 25, unitPrice: 45, reorderLevel: 10, category: 'Lubricants' }
    ]
  });
});

app.get('/api/test/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, customerId: 1, jobId: 1, subtotal: 150, tax: 22.5, grandTotal: 172.5, status: 'PAID' }
    ]
  });
});

// Catch all
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Biskaken Auto API running on port ${PORT}`);
});

module.exports = app;