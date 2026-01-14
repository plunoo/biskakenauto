require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initDatabase, query, checkHealth } = require('./config/database');

const app = express();

// Initialize database on startup
let dbStatus = { mode: 'initializing' };
initDatabase().then(result => {
  dbStatus = result;
  console.log('🗄️ Database initialization result:', result);
}).catch(error => {
  console.error('❌ Database initialization failed:', error);
  dbStatus = { mode: 'demo', error: error.message };
});

// Middleware
app.use(cors({
  origin: [
    'https://biskakenauto.rpnmore.com',
    'https://bisadmin.rpnmore.com',
    'http://localhost:3000',
    'http://localhost:5173',
    /.*\.rpnmore\.com$/,
    /.*\.traefik\.me$/
  ],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'biskaken-super-secure-jwt-secret-2026-v5');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Biskaken Auto API v5 is running!',
    service: 'Biskaken Auto API',
    version: '5.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus.mode,
    endpoints: {
      health: '/health',
      status: '/api/status',
      login: '/api/auth/login',
      dashboard: '/api/reports/dashboard',
      customers: '/api/customers',
      jobs: '/api/jobs',
      inventory: '/api/inventory',
      db_status: '/api/db-status'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  const dbHealth = await checkHealth();
  res.json({ 
    status: 'OK', 
    service: 'Biskaken Auto API v5', 
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// API Status
app.get('/api/status', async (req, res) => {
  const dbHealth = await checkHealth();
  res.json({
    success: true,
    data: {
      server: 'running',
      database: dbHealth.status,
      version: '5.0.0',
      environment: process.env.NODE_ENV || 'development',
      mode: dbStatus.mode
    }
  });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  const health = await checkHealth();
  res.json({
    success: true,
    data: {
      ...health,
      mode: dbStatus.mode,
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'biskaken_auto'
      }
    }
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Demo credentials for development/testing
    const demoCredentials = [
      { email: 'admin@biskaken.com', password: 'admin123', role: 'ADMIN', name: 'Admin User' },
      { email: 'staff@biskaken.com', password: 'staff123', role: 'STAFF', name: 'Staff User' },
      { email: 'manager@biskaken.com', password: 'manager123', role: 'SUB_ADMIN', name: 'Manager User' }
    ];

    // Check demo credentials first
    const demoUser = demoCredentials.find(cred => 
      cred.email === email && cred.password === password
    );

    if (demoUser) {
      const token = jwt.sign(
        { userId: demoUser.email, email: demoUser.email, role: demoUser.role },
        process.env.JWT_SECRET || 'biskaken-super-secure-jwt-secret-2026-v5',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: demoUser.email,
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role
          },
          token
        }
      });
    }

    // Try database authentication if not demo mode
    if (dbStatus.mode === 'production') {
      try {
        const result = await query(
          'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1 AND status = $2',
          [email, 'ACTIVE']
        );

        if (result.rows.length > 0) {
          const user = result.rows[0];
          const isValidPassword = await bcrypt.compare(password, user.password_hash);

          if (isValidPassword) {
            const token = jwt.sign(
              { userId: user.id, email: user.email, role: user.role },
              process.env.JWT_SECRET || 'biskaken-super-secure-jwt-secret-2026-v5',
              { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return res.json({
              success: true,
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                },
                token
              }
            });
          }
        }
      } catch (dbError) {
        console.error('Database auth error:', dbError.message);
      }
    }

    // Invalid credentials
    res.status(401).json({ 
      success: false, 
      error: 'Invalid credentials. Use admin@biskaken.com / admin123 for demo.' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Protected routes
app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Customers endpoints
app.get('/api/customers', async (req, res) => {
  try {
    if (dbStatus.mode === 'production') {
      const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Demo data fallback
    res.json({
      success: true,
      data: [
        { id: 1, name: 'John Doe', phone: '+233241234567', email: 'john@example.com', plate_number: 'GR 1234-19', vehicle_make: 'Toyota', vehicle_model: 'Camry' },
        { id: 2, name: 'Jane Smith', phone: '+233200987654', email: 'jane@example.com', plate_number: 'AS 5678-20', vehicle_make: 'Honda', vehicle_model: 'Civic' }
      ]
    });
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, email, address, plate_number, vehicle_make, vehicle_model, vehicle_year } = req.body;

    if (dbStatus.mode === 'production') {
      const result = await query(
        'INSERT INTO customers (name, phone, email, address, plate_number, vehicle_make, vehicle_model, vehicle_year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, phone, email, address, plate_number, vehicle_make, vehicle_model, vehicle_year]
      );
      return res.json({
        success: true,
        data: result.rows[0]
      });
    }

    // Demo mode
    res.json({
      success: true,
      data: { id: Math.floor(Math.random() * 1000), name, phone, email, message: 'Demo mode - customer not actually saved' }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    if (dbStatus.mode === 'production') {
      const result = await query('SELECT * FROM jobs ORDER BY created_at DESC');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Demo data fallback
    res.json({
      success: true,
      data: [
        { 
          id: 1, 
          customerId: 1, 
          customerName: 'John Doe', 
          vehicleInfo: '2018 Toyota Camry', 
          issueDescription: 'Engine making strange noise, needs inspection',
          status: 'COMPLETED', 
          priority: 'MEDIUM', 
          estimatedCost: 450,
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          customerId: 2, 
          customerName: 'Jane Smith', 
          vehicleInfo: '2020 Honda Civic', 
          issueDescription: 'Brake pads worn out, replacement needed',
          status: 'IN_PROGRESS', 
          priority: 'HIGH', 
          estimatedCost: 280,
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Jobs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { customer_id, customer_name, vehicle_info, issue_description, priority = 'MEDIUM', estimated_cost = 0 } = req.body;

    if (dbStatus.mode === 'production') {
      const result = await query(
        'INSERT INTO jobs (customer_id, customer_name, vehicle_info, issue_description, priority, estimated_cost) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [customer_id, customer_name, vehicle_info, issue_description, priority, estimated_cost]
      );
      return res.json({
        success: true,
        data: result.rows[0]
      });
    }

    // Demo mode
    res.json({
      success: true,
      data: { 
        id: Math.floor(Math.random() * 1000), 
        customer_name, 
        vehicle_info, 
        issue_description,
        status: 'PENDING',
        priority,
        estimated_cost,
        created_at: new Date().toISOString(),
        message: 'Demo mode - job not actually saved' 
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, error: 'Failed to create job' });
  }
});

// Inventory endpoints
app.get('/api/inventory', async (req, res) => {
  try {
    if (dbStatus.mode === 'production') {
      const result = await query('SELECT * FROM inventory ORDER BY name');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Demo data fallback
    res.json({
      success: true,
      data: [
        { id: 1, name: 'Engine Oil', sku: 'EO001', stock: 25, min_stock: 10, unit_price: 45, category: 'Lubricants' },
        { id: 2, name: 'Brake Pads', sku: 'BP001', stock: 8, min_stock: 5, unit_price: 120, category: 'Brake Parts' },
        { id: 3, name: 'Air Filter', sku: 'AF001', stock: 15, min_stock: 8, unit_price: 35, category: 'Filters' }
      ]
    });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

// Dashboard reports
app.get('/api/reports/dashboard', async (req, res) => {
  try {
    let dashboardData = {
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
    };

    if (dbStatus.mode === 'production') {
      // Get real data from database
      try {
        const jobStats = await query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status');
        const customerCount = await query('SELECT COUNT(*) as count FROM customers');
        const recentJobs = await query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5');
        const lowStock = await query('SELECT * FROM inventory WHERE stock <= min_stock LIMIT 5');

        dashboardData.summary.totalCustomers = parseInt(customerCount.rows[0]?.count || 0);
        dashboardData.summary.lowStockItems = lowStock.rows.length;
        dashboardData.recentJobs = recentJobs.rows;
        dashboardData.lowStock = lowStock.rows;

        // Process job statistics
        let totalJobs = 0, pendingJobs = 0, completedJobs = 0;
        jobStats.rows.forEach(row => {
          totalJobs += parseInt(row.count);
          if (row.status === 'PENDING') pendingJobs = parseInt(row.count);
          if (row.status === 'COMPLETED') completedJobs = parseInt(row.count);
        });

        dashboardData.summary.totalJobs = totalJobs;
        dashboardData.summary.pendingJobs = pendingJobs;
        dashboardData.summary.completedJobs = completedJobs;
      } catch (dbError) {
        console.error('Dashboard DB error:', dbError);
      }
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Test endpoints for backward compatibility
app.get('/api/test/customers', (req, res) => res.redirect(301, '/api/customers'));
app.get('/api/test/jobs', (req, res) => res.redirect(301, '/api/jobs'));
app.get('/api/test/inventory', (req, res) => res.redirect(301, '/api/inventory'));
app.get('/api/test/reports/dashboard', (req, res) => res.redirect(301, '/api/reports/dashboard'));
app.post('/api/auth/admin-login', (req, res) => res.redirect(301, '/api/auth/login'));

// Catch all
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'POST /api/auth/login',
      'GET /api/customers',
      'POST /api/customers',
      'GET /api/jobs',
      'POST /api/jobs',
      'GET /api/inventory',
      'GET /api/reports/dashboard',
      'GET /api/db-status'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Biskaken Auto API v5.0 running on port ${PORT}`);
  console.log(`📅 Deployment time: ${new Date().toISOString()}`);
  console.log(`🌐 Available at: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Database mode: ${dbStatus.mode}`);
});

module.exports = app;