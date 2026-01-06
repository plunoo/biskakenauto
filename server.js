const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
console.log(`📁 Checking dist directory: ${distPath}`);
if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory exists');
  const files = fs.readdirSync(distPath);
  console.log('📋 Files in dist:', files);
} else {
  console.error('❌ Dist directory not found!');
  process.exit(1);
}

// Add logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Serve static files from dist directory
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`📄 Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Server Error');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Static server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});