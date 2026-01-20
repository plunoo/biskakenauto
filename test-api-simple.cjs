// Simple Backend API Tester - Run this to test API endpoints
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Simple API endpoints for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fast API Test - Backend is working!',
    service: 'Biskaken Auto API',
    version: '5.0.0-test',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      status: '/api/status',
      test: '/test'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Fast API Test', 
    timestamp: new Date().toISOString(),
    database: { connected: false, mode: 'test' }
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'running',
      database: 'test-mode',
      version: '5.0.0-test',
      environment: 'test'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoint test successful',
    data: { test: true }
  });
});

// Catch all for API requests
app.use('/api/*', (req, res) => {
  res.json({ 
    success: false, 
    error: 'Endpoint not found',
    requested: req.originalUrl,
    available: ['/health', '/api/status', '/test']
  });
});

// Non-API requests
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not an API endpoint',
    message: 'This is a backend API server. Use /health, /api/status, or /test'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fast API Test running on port ${PORT}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
  console.log(`🔍 Endpoints: /health, /api/status, /test`);
});

module.exports = app;