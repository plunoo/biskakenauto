// Simple test to verify server can start and bind to correct port
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

// Basic test endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Biskaken Auto Test API',
    port: PORT,
    host: HOST
  });
});

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working correctly!',
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test/endpoints', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Test endpoints are working',
      available: [
        'GET /health',
        'GET /test',
        'GET /api/test/endpoints'
      ]
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Test Server running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://${HOST}:${PORT}/test`);
  console.log(`📁 API Test: http://${HOST}:${PORT}/api/test/endpoints`);
});