const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://biskakenauto.rpnmore.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Biskaken Auto API v3 is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'connected',
    api: 'biskaken-auto',
    version: '3.0.0',
    database: process.env.DATABASE_URL ? 'connected' : 'not configured'
  });
});

// Demo users for authentication
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@biskaken.com',
    password: 'admin123', // In production, use hashed passwords
    name: 'Biskaken Admin',
    role: 'ADMIN'
  },
  {
    id: '2', 
    email: 'staff@biskaken.com',
    password: 'staff123',
    name: 'Biskaken Staff',
    role: 'STAFF'
  }
];

// Authentication endpoints
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', email);
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_demo_only',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_demo_only',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/test/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Test login attempt:', email);
    
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_demo_only',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Blog endpoints (basic implementation)
app.get('/api/test/blog', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Essential Car Maintenance Tips',
        content: 'Car maintenance is crucial for vehicle longevity...',
        excerpt: 'Learn essential maintenance tips',
        status: 'PUBLISHED',
        author: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['maintenance', 'tips']
      }
    ]
  });
});

app.post('/api/test/blog', (req, res) => {
  const { title, content, excerpt, status } = req.body;
  
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      title,
      content,
      excerpt,
      status: status || 'DRAFT',
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Basic data endpoints
app.get('/api/test/customers', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/test/jobs', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/test/inventory', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/test/invoices', (req, res) => {
  res.json({ success: true, data: [] });
});

// Catch all for unimplemented endpoints
app.use('/api/*', (req, res) => {
  res.json({
    success: true,
    message: `Endpoint ${req.path} is not yet implemented`,
    data: []
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Biskaken API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;