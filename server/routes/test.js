const express = require('express');
const router = express.Router();

// Test endpoints for frontend compatibility
router.get('/endpoints', (req, res) => {
  res.json({
    success: true,
    data: {
      available_endpoints: [
        'GET /health',
        'GET /api/status',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'GET /api/test/customers',
        'GET /api/test/jobs',
        'GET /api/test/inventory',
        'GET /api/test/invoices',
        'GET /api/test/blog',
        'GET /api/test/reports/dashboard',
        'GET /api/test/reports/financial',
        'POST /api/test/reports/export'
      ]
    }
  });
});

// Test customers endpoint
router.get('/customers', (req, res) => {
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
      },
      {
        id: '2',
        name: 'Jane Smith',
        phone: '+233201234567',
        email: 'jane.smith@gmail.com',
        plateNumber: 'AS 5678-20',
        vehicleMake: 'Honda',
        vehicleModel: 'Civic',
        vehicleYear: 2020,
        totalJobs: 2,
        totalSpent: 850.00,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Test jobs endpoint
router.get('/jobs', (req, res) => {
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
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Jane Smith',
        title: 'Brake Repair',
        description: 'Front brake pad replacement',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedCost: 450.00,
        vehicleInfo: '2020 Honda Civic',
        plateNumber: 'AS 5678-20',
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Test inventory endpoint
router.get('/inventory', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Engine Oil (5W-30)',
        description: 'High-quality synthetic engine oil',
        category: 'Lubricants',
        stock: 25,
        unitPrice: 45.00,
        reorderLevel: 10,
        supplier: 'Oil Supplies Ltd'
      },
      {
        id: '2',
        name: 'Brake Pads (Front)',
        description: 'Ceramic brake pads for front wheels',
        category: 'Brakes',
        stock: 8,
        unitPrice: 120.00,
        reorderLevel: 5,
        supplier: 'Brake Parts Co'
      }
    ]
  });
});

// Test invoices endpoint
router.get('/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'John Doe',
        jobId: '1',
        subtotal: 150.00,
        taxAmount: 22.50,
        totalAmount: 172.50,
        status: 'PAID',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '2',
        customerName: 'Jane Smith',
        jobId: '2',
        subtotal: 450.00,
        taxAmount: 67.50,
        totalAmount: 517.50,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }
    ]
  });
});

// Test blog endpoints
router.get('/blog', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Top 5 Car Maintenance Tips for 2024',
        content: 'Regular maintenance is key to keeping your vehicle running smoothly...',
        excerpt: 'Essential maintenance tips every car owner should know',
        category: 'Maintenance',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=300&fit=crop',
        slug: 'top-5-car-maintenance-tips-2024',
        status: 'PUBLISHED',
        date: new Date().toISOString()
      }
    ]
  });
});

router.post('/blog', (req, res) => {
  const newPost = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    data: newPost
  });
});

router.delete('/blog/:id', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Blog post deleted successfully' }
  });
});

// Test reports endpoints
router.get('/reports/dashboard', (req, res) => {
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

router.get('/reports/financial', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 15250.50,
      totalProfit: 4575.15,
      totalInvoices: 45,
      averageInvoiceValue: 338.90,
      paymentMethods: {
        'Cash': 18,
        'Mobile Money': 22,
        'Bank Transfer': 5
      },
      monthlyData: [
        { month: 'Oct', revenue: 4200, profit: 1260 },
        { month: 'Nov', revenue: 5800, profit: 1740 },
        { month: 'Dec', revenue: 5250.50, profit: 1575.15 }
      ]
    }
  });
});

router.post('/reports/export', (req, res) => {
  const { reportType, format, dateRange } = req.body;
  
  res.json({
    success: true,
    data: {
      reportId: `RPT-${Date.now()}`,
      downloadUrl: `https://api.biskaken.com/reports/download/${Date.now()}.${format}`,
      generatedAt: new Date().toISOString(),
      reportType,
      format
    }
  });
});

// Mobile Money test
router.post('/mobile-money', (req, res) => {
  const { phone, amount, provider } = req.body;
  
  res.json({
    success: true,
    data: {
      transactionId: `MM-${Date.now()}`,
      status: 'PENDING',
      message: `Mobile money payment of ₵${amount} initiated for ${phone}`,
      provider: provider || 'mtn'
    }
  });
});

// AI Diagnosis test
router.post('/ai-diagnosis', (req, res) => {
  const { complaint, vehicleInfo } = req.body;
  
  res.json({
    success: true,
    data: {
      diagnosis: `Based on the complaint "${complaint}", possible causes include: Engine oil issues, brake system problems, or electrical faults. Recommend professional inspection.`,
      confidence: 85,
      recommendations: [
        'Schedule professional inspection',
        'Check fluid levels',
        'Monitor symptoms closely'
      ]
    }
  });
});

module.exports = router;