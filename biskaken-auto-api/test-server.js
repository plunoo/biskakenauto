const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend connection
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3003'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint - HTML page for browser testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Biskaken Auto Services - Test API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { color: #fff; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            .get { background: #4CAF50; }
            .post { background: #2196F3; }
            button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; margin: 5px; }
            button:hover { background: #45a049; }
            #result { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🚀 Biskaken Auto Services - Test API</h1>
        <p>Backend API server for auto shop management with mobile money payments and AI features.</p>
        
        <h2>📋 Available Endpoints</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/health</strong> - Health check
            <button onclick="testEndpoint('GET', '/health')">Test</button>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/status</strong> - Service status
            <button onclick="testEndpoint('GET', '/api/status')">Test</button>
        </div>
        
        <div class="endpoint">
            <span class="method get">GET</span> <strong>/api/test/endpoints</strong> - List all test endpoints
            <button onclick="testEndpoint('GET', '/api/test/endpoints')">Test</button>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/auth/test</strong> - Test authentication
            <button onclick="testAuth()">Test</button>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/test/mobile-money</strong> - Test mobile money payment
            <button onclick="testMobileMoney()">Test MTN Payment</button>
        </div>
        
        <div class="endpoint">
            <span class="method post">POST</span> <strong>/api/test/ai-diagnosis</strong> - Test AI vehicle diagnosis
            <button onclick="testAI()">Test AI Diagnosis</button>
        </div>
        
        <h2>📱 Test Results</h2>
        <div id="result">Click any test button above to see results here...</div>
        
        <script>
            async function testEndpoint(method, url) {
                try {
                    const response = await fetch(url, { method });
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                }
            }
            
            async function testAuth() {
                try {
                    const response = await fetch('/api/auth/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'test@example.com', password: 'test123' })
                    });
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                }
            }
            
            async function testMobileMoney() {
                try {
                    const response = await fetch('/api/test/mobile-money', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            phone: '0241234567', 
                            amount: 100, 
                            provider: 'mtn' 
                        })
                    });
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                }
            }
            
            async function testAI() {
                try {
                    const response = await fetch('/api/test/ai-diagnosis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            complaint: 'Engine making strange rattling noise when accelerating',
                            vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2015 }
                        })
                    });
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'not_connected',
          message: 'Test server - database not initialized'
        },
        sms: {
          configured: Boolean(process.env.TWILIO_ACCOUNT_SID),
        },
        payment: {
          paystack: {
            configured: Boolean(process.env.PAYSTACK_SECRET_KEY)
          },
          usdt: {
            configured: Boolean(process.env.USDT_WALLET_ADDRESS)
          }
        },
        ai: {
          configured: Boolean(process.env.OPENAI_API_KEY),
          model: 'gpt-4'
        }
      }
    }
  });
});

// Test authentication endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working',
    received: req.body
  });
});

// Mock login endpoint for frontend
app.post('/api/test/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock users database
  const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@biskaken.com', role: 'ADMIN' },
    { id: '2', name: 'Kofi Mensah', email: 'kofi@biskaken.com', role: 'SUB_ADMIN' },
    { id: '3', name: 'Kwame Tech', email: 'kwame@biskaken.com', role: 'STAFF' },
  ];
  
  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }
  
  // In test mode, any password works
  const token = `test_token_${user.id}_${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      user,
      token
    },
    message: 'Login successful'
  });
});

// Test mobile money payment endpoint
app.post('/api/test/mobile-money', (req, res) => {
  const { phone, amount, provider = 'mtn' } = req.body;
  
  res.json({
    success: true,
    data: {
      reference: `MM_TEST_${Date.now()}`,
      amount,
      currency: 'GHS',
      provider,
      phone,
      status: 'test_mode',
      message: `Test mobile money payment for ${provider.toUpperCase()}. In production, customer would receive payment prompt.`
    }
  });
});

// Test AI diagnosis endpoint
app.post('/api/test/ai-diagnosis', (req, res) => {
  const { complaint, vehicleInfo } = req.body;
  
  res.json({
    success: true,
    data: {
      diagnosis: `Test diagnosis for complaint: "${complaint}". In production, this would use OpenAI GPT-4 for real vehicle diagnosis.`,
      confidence: 0.85,
      estimatedCostRange: "GHS 200 - 800",
      suggestedParts: ["Oil Filter", "Engine Oil", "Spark Plugs"],
      repairTime: "2-4 hours",
      urgency: "Medium"
    }
  });
});

// Mock data endpoints
app.get('/api/test/customers', (req, res) => {
  const mockCustomers = [
    {
      id: 'C001',
      name: 'Kwame Asante',
      phone: '+233241234567',
      email: 'kwame@gmail.com',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2018,
        plateNumber: 'GR-2024-X'
      }
    },
    {
      id: 'C002', 
      name: 'Ama Serwaa',
      phone: '+233202345678',
      email: 'ama@gmail.com',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        plateNumber: 'GE-3451-Z'
      }
    }
  ];
  
  res.json({
    success: true,
    data: mockCustomers,
    message: 'Customers retrieved successfully'
  });
});

app.get('/api/test/jobs', (req, res) => {
  const mockJobs = [
    {
      id: 'JOB001',
      customerId: 'C001',
      customerName: 'Kwame Asante',
      vehicleInfo: 'Toyota Camry 2018',
      issueDescription: 'Engine overheating problem',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      estimatedCost: 800,
      assignedMechanic: 'Kofi Tech'
    },
    {
      id: 'JOB002',
      customerId: 'C002', 
      customerName: 'Ama Serwaa',
      vehicleInfo: 'Honda Civic 2020',
      issueDescription: 'Brake pads replacement needed',
      status: 'PENDING',
      priority: 'MEDIUM',
      estimatedCost: 300,
      assignedMechanic: null
    }
  ];
  
  res.json({
    success: true,
    data: mockJobs,
    message: 'Jobs retrieved successfully'
  });
});

app.get('/api/test/inventory', (req, res) => {
  const mockInventory = [
    {
      id: 'INV001',
      name: 'Engine Oil (5W-30)',
      category: 'Oils',
      stock: 25,
      reorderLevel: 10,
      unitCost: 45,
      sellingPrice: 65
    },
    {
      id: 'INV002',
      name: 'Brake Pads (Front)',
      category: 'Brake Parts',
      stock: 8,
      reorderLevel: 5,
      unitCost: 120,
      sellingPrice: 180
    }
  ];
  
  res.json({
    success: true,
    data: mockInventory,
    message: 'Inventory retrieved successfully'
  });
});

// Create invoice
app.post('/api/test/invoices', (req, res) => {
  console.log('📝 Creating new invoice:', req.body);
  
  const { customerId, customerName, items, subtotal, tax, grandTotal, dueDate, notes } = req.body;
  
  if (!customerId || !customerName || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Customer and items are required'
    });
  }
  
  const newInvoice = {
    id: `INV-${Date.now()}`,
    customerId,
    customerName,
    date: new Date().toISOString(),
    dueDate: dueDate || null,
    items: items.map(item => ({
      ...item,
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    subtotal: subtotal || 0,
    tax: tax || 0,
    grandTotal: grandTotal || subtotal || 0,
    status: 'UNPAID',
    payments: [],
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ Invoice created:', newInvoice.id);
  
  res.json({
    success: true,
    data: newInvoice,
    message: 'Invoice created successfully'
  });
});

// Update invoice
app.put('/api/test/invoices/:invoiceId', (req, res) => {
  const { invoiceId } = req.params;
  console.log(`📝 Updating invoice ${invoiceId}:`, req.body);
  
  const updatedInvoice = {
    id: invoiceId,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ Invoice updated:', invoiceId);
  
  res.json({
    success: true,
    data: updatedInvoice,
    message: 'Invoice updated successfully'
  });
});

// Record payment for invoice
app.post('/api/test/invoices/:invoiceId/payments', (req, res) => {
  const { invoiceId } = req.params;
  const { amount, method, reference, notes } = req.body;
  
  console.log(`💰 Recording payment for invoice ${invoiceId}:`, req.body);
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid payment amount is required'
    });
  }
  
  const payment = {
    id: `PAY-${Date.now()}`,
    invoiceId,
    amount: parseFloat(amount),
    method: method || 'CASH',
    reference: reference || '',
    notes: notes || '',
    date: new Date().toISOString(),
    status: 'COMPLETED'
  };
  
  // Simulate invoice status update logic
  const mockInvoiceTotal = 1000; // This would come from database
  const mockPreviousPayments = 0; // This would come from database
  const totalPaid = mockPreviousPayments + payment.amount;
  const newStatus = totalPaid >= mockInvoiceTotal ? 'PAID' : 'PARTIALLY_PAID';
  
  console.log('✅ Payment recorded:', payment.id);
  
  res.json({
    success: true,
    data: {
      payment,
      invoiceStatus: newStatus,
      totalPaid: totalPaid,
      outstanding: Math.max(0, mockInvoiceTotal - totalPaid)
    },
    message: 'Payment recorded successfully'
  });
});

// Export invoice as PDF
app.post('/api/test/invoices/:invoiceId/export', (req, res) => {
  const { invoiceId } = req.params;
  const { format } = req.body;
  
  console.log(`📄 Exporting invoice ${invoiceId} as ${format}...`);
  
  if (!format || format !== 'pdf') {
    return res.status(400).json({
      success: false,
      error: 'Only PDF format is supported currently'
    });
  }
  
  // Simulate PDF generation
  const exportData = {
    invoiceId,
    format: format.toUpperCase(),
    filename: `invoice-${invoiceId}-${Date.now()}.pdf`,
    downloadUrl: `http://localhost:5000/downloads/invoice-${invoiceId}-${Date.now()}.pdf`,
    fileSize: '245KB',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  console.log('✅ Invoice exported successfully:', exportData.filename);
  
  res.json({
    success: true,
    data: exportData,
    message: 'Invoice exported successfully'
  });
});

// Email invoice to customer
app.post('/api/test/invoices/email', (req, res) => {
  const { invoiceId, to, subject, message, includePDF } = req.body;
  
  console.log(`📧 Sending invoice ${invoiceId} to ${to}...`);
  
  if (!invoiceId || !to || !subject) {
    return res.status(400).json({
      success: false,
      error: 'Invoice ID, recipient email, and subject are required'
    });
  }
  
  // Simulate email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address'
    });
  }
  
  // Simulate email sending
  const emailData = {
    messageId: `MSG-${Date.now()}`,
    invoiceId,
    to,
    from: 'noreply@biskakenauto.com',
    subject,
    message: message || 'Please find your invoice attached.',
    includePDF,
    sentAt: new Date().toISOString(),
    status: 'SENT',
    deliveryStatus: 'DELIVERED',
    attachments: includePDF ? [`invoice-${invoiceId}.pdf`] : []
  };
  
  console.log('✅ Email sent successfully:', emailData.messageId);
  
  res.json({
    success: true,
    data: emailData,
    message: `Invoice emailed successfully to ${to}`
  });
});

// Create a new job with SMS notification
app.post('/api/test/jobs', (req, res) => {
  console.log('🔧 Creating new job:', req.body);
  
  const { customerId, customerName, vehicleInfo, issueDescription, priority, estimatedCost } = req.body;
  
  if (!customerId || !customerName || !vehicleInfo || !issueDescription) {
    return res.status(400).json({
      success: false,
      error: 'Customer ID, name, vehicle info, and issue description are required'
    });
  }
  
  const newJob = {
    id: `JOB-${Date.now()}`,
    customerId,
    customerName,
    vehicleInfo,
    issueDescription,
    status: 'PENDING',
    priority: priority || 'MEDIUM',
    estimatedCost: estimatedCost || 0,
    assignedMechanic: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: []
  };
  
  console.log('✅ Job created:', newJob.id);
  
  // Simulate SMS sending for job creation
  console.log('📱 Sending SMS notification for job creation...');
  const smsMessage = `Hello ${customerName}, we've received your vehicle (${vehicleInfo}) for repair. Job ID: ${newJob.id}. We'll keep you updated on the progress. - Biskaken Auto`;
  console.log('📝 SMS:', smsMessage);
  
  res.json({
    success: true,
    data: newJob,
    message: 'Job created successfully and customer notified via SMS'
  });
});

// Update job status with SMS notification
app.put('/api/test/jobs/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  const { status, customerPhone, customerName, vehicleInfo } = req.body;
  
  console.log(`🔧 Updating job ${jobId} status to ${status}`);
  
  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }
  
  const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    });
  }
  
  // Simulate SMS sending for status update
  if (customerPhone && customerName) {
    console.log('📱 Sending SMS notification for status update...');
    let smsMessage = '';
    
    switch (status) {
      case 'IN_PROGRESS':
        smsMessage = `Hello ${customerName}, your vehicle (${vehicleInfo}) repair has started. Job ID: ${jobId}. We'll update you when it's ready. - Biskaken Auto`;
        break;
      case 'COMPLETED':
        smsMessage = `Good news ${customerName}! Your vehicle (${vehicleInfo}) is ready for pickup. Job ID: ${jobId}. Please visit us at your convenience. - Biskaken Auto`;
        break;
      case 'CANCELLED':
        smsMessage = `Hi ${customerName}, your vehicle repair (${vehicleInfo}) has been cancelled. Job ID: ${jobId}. Please contact us for more details. - Biskaken Auto`;
        break;
      default:
        smsMessage = `Hi ${customerName}, update on your vehicle (${vehicleInfo}): Status changed to ${status}. Job ID: ${jobId}. - Biskaken Auto`;
    }
    
    console.log('📝 SMS:', smsMessage);
  }
  
  const updatedJob = {
    id: jobId,
    status: status,
    updatedAt: new Date().toISOString(),
    smsNotificationSent: !!(customerPhone && customerName)
  };
  
  console.log('✅ Job status updated:', jobId);
  
  res.json({
    success: true,
    data: updatedJob,
    message: `Job status updated to ${status}${customerPhone ? ' and customer notified via SMS' : ''}`
  });
});

// Send SMS notification endpoint
app.post('/api/test/sms/send', (req, res) => {
  const { to, message, type, jobId, invoiceId } = req.body;
  
  console.log('📱 Sending SMS notification:', { to, message, type });
  
  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: 'Phone number and message are required'
    });
  }
  
  // Format phone number for Ghana
  let formattedPhone = to.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = `+233${formattedPhone.substring(1)}`;
  } else if (formattedPhone.startsWith('233')) {
    formattedPhone = `+${formattedPhone}`;
  } else if (formattedPhone.length === 9) {
    formattedPhone = `+233${formattedPhone}`;
  }
  
  // Simulate SMS sending
  const smsData = {
    messageId: `SMS-${Date.now()}`,
    to: formattedPhone,
    message: message,
    type: type || 'notification',
    status: 'SENT',
    cost: 0.05,
    sentAt: new Date().toISOString(),
    jobId: jobId || null,
    invoiceId: invoiceId || null
  };
  
  console.log('✅ SMS sent successfully:', smsData.messageId);
  
  res.json({
    success: true,
    data: smsData,
    message: 'SMS sent successfully'
  });
});

app.get('/api/test/invoices', (req, res) => {
  const mockInvoices = [
    {
      id: 'INV-001',
      customerId: 'C001',
      customerName: 'Kwame Asante',
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'UNPAID',
      subtotal: 450,
      tax: 54,
      grandTotal: 504,
      items: [
        {
          description: 'Engine Oil Change',
          quantity: 1,
          unitPrice: 250,
          total: 250
        },
        {
          description: 'Oil Filter',
          quantity: 1, 
          unitPrice: 200,
          total: 200
        }
      ],
      payments: []
    },
    {
      id: 'INV-002',
      customerId: 'C002',
      customerName: 'Ama Serwaa', 
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PAID',
      subtotal: 300,
      tax: 36,
      grandTotal: 336,
      items: [
        {
          description: 'Brake Pad Replacement',
          quantity: 1,
          unitPrice: 300,
          total: 300
        }
      ],
      payments: [
        {
          amount: 336,
          method: 'Mobile Money',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'MM12345'
        }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: mockInvoices,
    message: 'Invoices retrieved successfully'
  });
});

// Blog Management Endpoints
app.get('/api/test/blog', (req, res) => {
  const mockBlogPosts = [
    {
      id: '1',
      title: 'How AI is Changing Auto Repair in Ghana\'s Local Workshops',
      excerpt: 'Discover how AI technology is transforming traditional auto repair shops across Ghana.',
      content: 'Full article content here...',
      author: 'Kwame Asante',
      authorId: 'U001',
      date: '2024-05-22T00:00:00Z',
      category: 'Technology',
      readTime: '4 min read',
      status: 'published',
      views: 1247,
      tags: ['AI', 'Ghana', 'Auto Repair', 'Technology']
    },
    {
      id: '2',
      title: 'Top 5 Brake Maintenance Tips for Ghana\'s Pothole-Heavy Roads',
      excerpt: 'Essential brake care tips tailored for Ghana\'s unique road conditions.',
      content: 'Full article content here...',
      author: 'Akosua Mensah',
      authorId: 'U002',
      date: '2024-05-18T00:00:00Z',
      category: 'Maintenance',
      readTime: '3 min read',
      status: 'published',
      views: 892,
      tags: ['Brakes', 'Ghana', 'Maintenance', 'Road Safety']
    },
    {
      id: '3',
      title: 'Mobile Money vs. Cash: Why Digital Tracking Wins Every Time',
      excerpt: 'Compare digital payment tracking with traditional cash methods in auto repair businesses.',
      content: 'Full article content here...',
      author: 'Kofi Osei',
      authorId: 'U003',
      date: '2024-05-12T00:00:00Z',
      category: 'Business',
      readTime: '5 min read',
      status: 'published',
      views: 654,
      tags: ['Mobile Money', 'Payment', 'Business', 'Ghana']
    },
    {
      id: '4',
      title: 'Understanding Your Car\'s AC System in Tropical Weather',
      excerpt: 'Complete guide to maintaining air conditioning systems in Ghana\'s hot climate.',
      content: 'Full article content here...',
      author: 'Ama Darko',
      authorId: 'U004',
      date: '2024-05-08T00:00:00Z',
      category: 'Technical',
      readTime: '6 min read',
      status: 'draft',
      views: 0,
      tags: ['AC', 'Climate', 'Maintenance', 'Technical']
    }
  ];

  res.json({
    success: true,
    data: mockBlogPosts,
    message: 'Blog posts retrieved successfully'
  });
});

app.post('/api/test/blog', (req, res) => {
  const { title, excerpt, content, category, tags } = req.body;
  
  if (!title || !excerpt || !content) {
    return res.status(400).json({
      success: false,
      error: 'Title, excerpt, and content are required'
    });
  }

  const newPost = {
    id: `blog_${Date.now()}`,
    title,
    excerpt,
    content,
    author: 'Admin User',
    authorId: 'U001',
    date: new Date().toISOString(),
    category: category || 'General',
    readTime: `${Math.ceil(content.length / 200)} min read`,
    status: 'draft',
    views: 0,
    tags: tags || []
  };

  res.status(201).json({
    success: true,
    data: newPost,
    message: 'Blog post created successfully'
  });
});

app.put('/api/test/blog/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  res.json({
    success: true,
    data: { id, ...updates },
    message: 'Blog post updated successfully'
  });
});

app.delete('/api/test/blog/:id', (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: `Blog post ${id} deleted successfully`
  });
});

app.put('/api/test/blog/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['published', 'draft', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be published, draft, or archived'
    });
  }

  res.json({
    success: true,
    data: { id, status },
    message: `Blog post ${id} status updated to ${status}`
  });
});

// User Management Endpoints
app.get('/api/test/users', (req, res) => {
  const mockUsers = [
    {
      id: '1',
      name: 'Kwame Asante',
      email: 'kwame@biskaken.com',
      role: 'ADMIN',
      status: 'active',
      lastLogin: new Date().toISOString(),
      joinDate: '2024-01-15T00:00:00Z',
      avatar: 'KA',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Akosua Mensah',
      email: 'akosua@biskaken.com',
      role: 'SUB_ADMIN',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      joinDate: '2024-02-03T00:00:00Z',
      avatar: 'AM',
      permissions: ['inventory', 'reports', 'customers', 'jobs']
    },
    {
      id: '3',
      name: 'Kofi Osei',
      email: 'kofi@biskaken.com',
      role: 'STAFF',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      joinDate: '2024-03-12T00:00:00Z',
      avatar: 'KO',
      permissions: ['dashboard', 'customers', 'jobs', 'invoices']
    },
    {
      id: '4',
      name: 'Ama Darko',
      email: 'ama@biskaken.com',
      role: 'STAFF',
      status: 'inactive',
      lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      joinDate: '2024-04-20T00:00:00Z',
      avatar: 'AD',
      permissions: ['dashboard', 'customers', 'jobs']
    },
    {
      id: '5',
      name: 'Yaw Boateng',
      email: 'yaw@biskaken.com',
      role: 'STAFF',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      joinDate: '2024-05-08T00:00:00Z',
      avatar: 'YB',
      permissions: ['dashboard', 'customers', 'jobs', 'invoices']
    }
  ];

  res.json({
    success: true,
    data: mockUsers,
    message: 'Users retrieved successfully'
  });
});

app.post('/api/test/users', (req, res) => {
  const { name, email, role, permissions } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and role are required'
    });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    role,
    status: 'active',
    lastLogin: null,
    joinDate: new Date().toISOString(),
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
    permissions: permissions || []
  };

  res.status(201).json({
    success: true,
    data: newUser,
    message: 'User created successfully'
  });
});

app.put('/api/test/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  res.json({
    success: true,
    data: { id, ...updates },
    message: 'User updated successfully'
  });
});

app.delete('/api/test/users/:id', (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: `User ${id} deleted successfully`
  });
});

app.post('/api/test/users/:id/reset-password', (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    data: { id, newPassword: 'temp123456' },
    message: 'Password reset successfully. Temporary password generated.'
  });
});

app.put('/api/test/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be active, inactive, or suspended'
    });
  }

  res.json({
    success: true,
    data: { id, status },
    message: `User ${id} status updated to ${status}`
  });
});

// Security Management Endpoints
app.post('/api/test/security/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters long'
    });
  }

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

app.get('/api/test/security/login-history', (req, res) => {
  const mockLoginHistory = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      location: 'Accra, Ghana',
      device: 'Chrome/Desktop',
      status: 'success'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100',
      location: 'Accra, Ghana',
      device: 'Firefox/Desktop',
      status: 'success'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: '41.189.178.45',
      location: 'Kumasi, Ghana',
      device: 'Chrome/Mobile',
      status: 'failed'
    }
  ];

  res.json({
    success: true,
    data: mockLoginHistory,
    message: 'Login history retrieved successfully'
  });
});

app.get('/api/test/security/active-sessions', (req, res) => {
  const mockActiveSessions = [
    {
      id: 'session_1',
      device: 'Chrome/Desktop',
      location: 'Accra, Ghana',
      ipAddress: '192.168.1.100',
      lastActivity: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 'session_2',
      device: 'Safari/Mobile',
      location: 'Accra, Ghana',
      ipAddress: '192.168.1.101',
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isCurrent: false
    }
  ];

  res.json({
    success: true,
    data: mockActiveSessions,
    message: 'Active sessions retrieved successfully'
  });
});

app.delete('/api/test/security/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.json({
    success: true,
    message: `Session ${sessionId} terminated successfully`
  });
});

app.post('/api/test/security/enable-2fa', (req, res) => {
  res.json({
    success: true,
    data: {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      backupCodes: ['123456', '789012', '345678', '901234', '567890']
    },
    message: '2FA setup initiated. Scan QR code with authenticator app.'
  });
});

// Report Endpoints
app.get('/api/test/reports/dashboard', (req, res) => {
  const mockDashboardData = {
    summary: {
      totalRevenue: 45820.50,
      totalJobs: 125,
      pendingJobs: 18,
      completedJobs: 95,
      totalCustomers: 87,
      lowStockItems: 5,
      totalInvoices: 110,
      paidInvoices: 95
    },
    recentJobs: [
      {
        id: 'J001',
        customerName: 'Kwame Asante',
        vehicleInfo: 'Toyota Camry 2018 (GH-1234-20)',
        status: 'COMPLETED',
        estimatedCost: 850.00,
        issueDescription: 'Brake pad replacement'
      },
      {
        id: 'J002',
        customerName: 'Ama Serwaa',
        vehicleInfo: 'Honda Accord 2019 (GH-5678-20)',
        status: 'IN_PROGRESS',
        estimatedCost: 1200.00,
        issueDescription: 'Engine oil change and tune-up'
      },
      {
        id: 'J003',
        customerName: 'Kojo Mensah',
        vehicleInfo: 'Nissan Sentra 2017 (GH-9876-19)',
        status: 'PENDING',
        estimatedCost: 650.00,
        issueDescription: 'AC system repair'
      }
    ],
    recentInvoices: [
      {
        id: 'INV-001',
        customerName: 'Kwame Asante',
        amount: 850.00,
        status: 'PAID',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'INV-002',
        customerName: 'Ama Serwaa',
        amount: 1200.00,
        status: 'PENDING',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    lowStock: [
      {
        id: 'P001',
        name: 'Brake Pads (Front)',
        currentStock: 3,
        reorderLevel: 10,
        category: 'Brake Parts'
      },
      {
        id: 'P002',
        name: 'Engine Oil (5W-30)',
        currentStock: 2,
        reorderLevel: 15,
        category: 'Fluids'
      },
      {
        id: 'P003',
        name: 'Air Filter',
        currentStock: 1,
        reorderLevel: 8,
        category: 'Engine Parts'
      }
    ]
  };

  res.json({
    success: true,
    data: mockDashboardData,
    message: 'Dashboard report generated successfully'
  });
});

app.get('/api/test/reports/financial', (req, res) => {
  const mockFinancialData = {
    totalRevenue: 45820.50,
    totalProfit: 18328.20,
    totalInvoices: 110,
    averageInvoiceValue: 416.55,
    paymentMethods: {
      'Mobile Money': 25640.30,
      'Cash': 15420.20,
      'Bank Transfer': 4760.00
    },
    monthlyData: [
      { month: 'Jan', revenue: 3820.50, profit: 1528.20 },
      { month: 'Feb', revenue: 4150.75, profit: 1660.30 },
      { month: 'Mar', revenue: 3950.25, profit: 1580.10 },
      { month: 'Apr', revenue: 4820.00, profit: 1928.00 },
      { month: 'May', revenue: 5240.75, profit: 2096.30 },
      { month: 'Jun', revenue: 4650.25, profit: 1860.10 },
      { month: 'Jul', revenue: 5180.50, profit: 2072.20 },
      { month: 'Aug', revenue: 4920.25, profit: 1968.10 },
      { month: 'Sep', revenue: 5340.75, profit: 2136.30 },
      { month: 'Oct', revenue: 4580.25, profit: 1832.10 },
      { month: 'Nov', revenue: 4164.00, profit: 1665.60 }
    ]
  };

  res.json({
    success: true,
    data: mockFinancialData,
    message: 'Financial report generated successfully'
  });
});

app.post('/api/test/reports/export', (req, res) => {
  const { reportType, format, dateRange } = req.body;
  
  if (!reportType || !format) {
    return res.status(400).json({
      success: false,
      error: 'Report type and format are required'
    });
  }

  // Simulate report generation
  const reportId = `report_${Date.now()}`;
  const downloadUrl = `http://localhost:5000/downloads/${reportId}.${format}`;
  
  res.json({
    success: true,
    data: {
      reportId,
      downloadUrl,
      format,
      reportType,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    },
    message: `${reportType} report exported successfully as ${format.toUpperCase()}`
  });
});

// Test endpoints
app.get('/api/test/endpoints', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      health: 'GET /health',
      status: 'GET /api/status',
      auth_test: 'POST /api/auth/test',
      auth_login: 'POST /api/test/auth/login',
      customers: 'GET /api/test/customers',
      jobs: 'GET /api/test/jobs', 
      inventory: 'GET /api/test/inventory',
      invoices: 'GET /api/test/invoices',
      mobile_money_test: 'POST /api/test/mobile-money',
      ai_diagnosis_test: 'POST /api/test/ai-diagnosis',
      endpoints_list: 'GET /api/test/endpoints'
    },
    production_endpoints: {
      authentication: '/api/auth/*',
      customers: '/api/customers/*',
      jobs: '/api/jobs/*',
      inventory: '/api/inventory/*',
      invoices: '/api/invoices/*',
      reports: '/api/reports/*',
      users: '/api/users/*'
    }
  });
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    available_endpoints: '/api/test/endpoints'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Biskaken Auto Services - TEST SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Server: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📈 API Status: http://localhost:${PORT}/api/status

🧪 Test Endpoints:
   📋 List: http://localhost:${PORT}/api/test/endpoints
   🔐 Auth: POST http://localhost:${PORT}/api/auth/test
   💳 Mobile Money: POST http://localhost:${PORT}/api/test/mobile-money
   🤖 AI Diagnosis: POST http://localhost:${PORT}/api/test/ai-diagnosis

💰 Payment Testing:
   - Mobile Money: MTN, Vodafone, Tigo
   - Test with any Ghana phone number

🤖 AI Features Testing:
   - Vehicle diagnosis simulation
   - Business insights (when full API is running)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test server ready! Use these URLs to test functionality.
  `);
});

module.exports = app;