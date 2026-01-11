// Simple version check for deployment
console.log('🚀 Biskaken Auto API v3.1 - Updated with root endpoint!');
console.log('📅 Deployment time:', new Date().toISOString());

const express = require('express');
const cors = require('cors');
const app = express();

// Ultra simple CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Version check endpoint
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ Backend is working!',
    version: 'v3.1',
    deployment: new Date().toISOString(),
    status: 'RUNNING'
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Test endpoint working!',
    backend: 'v3.1'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple backend running on port ${PORT}`);
});