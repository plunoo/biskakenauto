const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS for Dokploy - allow frontend domain
const corsOptions = {
  origin: [
    'https://biskakenauto.rpnmore.com',
    'http://localhost:3000',
    /^https?:\/\/.*\.rpnmore\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Biskaken Auto API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'running',
      database: 'connected',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// Test endpoints for dashboard
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
        'GET /api/test/reports/dashboard',
        'GET /api/test/reports/financial'
      ]
    }
  });
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
        lowStockItems: 3,
        totalInvoices: 45,
        paidInvoices: 38
      },
      recentJobs: [
        {
          id: '1',
          customerName: 'John Doe',
          vehicleInfo: '2018 Toyota Camry',
          status: 'COMPLETED',
          estimatedCost: 450.00
        }
      ],
      lowStock: [
        {
          id: '1',
          name: 'Engine Oil (5W-30)',
          category: 'Lubricants',
          stock: 2,
          reorderLevel: 5
        }
      ]
    }
  });
});

// Test auth login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials
  if (email === 'admin@biskaken.com' && password === 'admin123') {
    return res.json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@biskaken.com',
          role: 'ADMIN'
        },
        token: `demo_token_${Date.now()}`
      }
    });
  }
  
  res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
});

// Test customers
app.get('/api/test/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'John Doe',
        phone: '+233241234567',
        email: 'john.doe@gmail.com',
        plateNumber: 'GR 1234-19',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2018,
        totalJobs: 3,
        totalSpent: 1250.00,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Test jobs
app.get('/api/test/jobs', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Doe',
        title: 'Oil Change',
        description: 'Regular oil change service',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        estimatedCost: 150.00,
        vehicleInfo: '2018 Toyota Camry',
        plateNumber: 'GR 1234-19',
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Biskaken Auto API Server running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 API Documentation: http://${HOST}:${PORT}/api/test/endpoints`);
});