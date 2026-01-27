const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
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

// Catch all
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Biskaken Auto API running on port ${PORT}`);
});

module.exports = app;