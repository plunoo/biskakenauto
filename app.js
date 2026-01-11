const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://biskakenauto.rpnmore.com',
    'http://localhost:3000',
    'https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me',
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Biskaken Auto API v3 is running!',
    service: 'Biskaken Auto API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      status: '/api/status',
      login: '/api/auth/login',
      dashboard: '/api/test/reports/dashboard',
      customers: '/api/test/customers',
      jobs: '/api/test/jobs',
      inventory: '/api/test/inventory'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Biskaken Auto API v3', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'running',
      database: 'connected',
      version: '3.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/api/test/endpoints', (req, res) => {
  res.json({
    success: true,
    data: {
      available_endpoints: [
        'GET /health',
        'GET /api/status',
        'POST /api/auth/login',
        'GET /api/test/customers',
        'GET /api/test/jobs',
        'GET /api/test/inventory',
        'GET /api/test/invoices',
        'GET /api/test/reports/dashboard'
      ]
    }
  });
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
app.get('/api/test/reports/dashboard', (req, res) => {
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

// Test endpoints
app.get('/api/test/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', phone: '+233241234567', email: 'john@example.com', plateNumber: 'GR 1234-19', vehicleMake: 'Toyota', vehicleModel: 'Camry' }
    ]
  });
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

// Blog endpoints
app.get('/api/test/blog', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Car Maintenance Tips', content: 'Regular maintenance is important...', status: 'PUBLISHED' }
    ]
  });
});

// User endpoints  
app.get('/api/test/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Admin User', email: 'admin@biskaken.com', role: 'ADMIN', status: 'ACTIVE' }
    ]
  });
});

// Financial reports
app.get('/api/test/reports/financial', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 15250.50,
      totalProfit: 4575.15,
      totalInvoices: 45,
      averageInvoiceValue: 338.90,
      monthlyData: [
        { month: 'Nov', revenue: 5800, profit: 1740 },
        { month: 'Dec', revenue: 5250.50, profit: 1575.15 }
      ]
    }
  });
});

// Database status
app.get('/api/test/db-status', (req, res) => {
  res.json({
    success: true,
    data: {
      database_connected: true,
      current_time: new Date().toISOString(),
      total_users: 1,
      message: 'Database connection successful'
    }
  });
});

// Catch all
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Biskaken Auto API v3 running on port ${PORT}`);
});

module.exports = app;