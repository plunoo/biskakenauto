const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ success: true, message: 'Backend working!', version: 'v4' }));
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'Biskaken Auto API v4' }));
app.get('/api/status', (req, res) => res.json({ success: true, data: { server: 'running', version: '4.0.0' } }));

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@biskaken.com' && password === 'admin123') {
    res.json({ success: true, data: { user: { id: 1, name: 'Admin', email, role: 'ADMIN' }, token: 'demo_token' } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('/api/test/reports/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: { totalRevenue: 15250.50, totalJobs: 48, pendingJobs: 7, completedJobs: 41, totalCustomers: 23, lowStockItems: 3 },
      recentJobs: [{ id: 1, customerName: 'John Doe', vehicleInfo: '2018 Toyota Camry', status: 'COMPLETED', estimatedCost: 450 }],
      lowStock: [{ id: 1, name: 'Engine Oil', stock: 2, reorderLevel: 5 }]
    }
  });
});

app.get('/api/test/customers', (req, res) => {
  res.json({ success: true, data: [{ id: 1, name: 'John Doe', phone: '+233241234567', email: 'john@example.com' }] });
});

app.get('/api/test/jobs', (req, res) => {
  res.json({ success: true, data: [{ id: 1, customerName: 'John Doe', title: 'Oil Change', status: 'COMPLETED' }] });
});

app.get('/api/test/inventory', (req, res) => {
  res.json({ success: true, data: [{ id: 1, name: 'Engine Oil', stock: 25, unitPrice: 45 }] });
});

app.get('/api/test/invoices', (req, res) => {
  res.json({ success: true, data: [{ id: 1, customerId: 1, subtotal: 150, grandTotal: 172.5, status: 'PAID' }] });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));

app.listen(process.env.PORT || 5000, '0.0.0.0', () => console.log('🚀 Minimal Backend v4 running'));