require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/auth.routes');
const customerRoutes = require('./src/routes/customers.routes');
const jobRoutes = require('./src/routes/jobs.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const invoiceRoutes = require('./src/routes/invoices.routes');
const blogRoutes = require('./src/routes/blog.routes');
const adminRoutes = require('./src/routes/admin.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const errorHandler = require('./src/middleware/errorHandler');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
const tmpDir = path.join(uploadsDir, 'tmp');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

// Serve uploaded files publicly
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({
  status: 'OK',
  version: '5.0.0',
  timestamp: new Date().toISOString()
}));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Legacy test routes for backwards compatibility
app.use('/api/test/customers', customerRoutes);
app.use('/api/test/jobs', jobRoutes);
app.use('/api/test/inventory', inventoryRoutes);
app.use('/api/test/invoices', invoiceRoutes);
app.use('/api/test/blog', blogRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Biskaken API v5 running on port ${PORT}`);
  const { getActiveProvider } = require('./src/config/database');
  console.log(`Active DB provider: ${getActiveProvider()}`);
});

module.exports = app;
