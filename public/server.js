import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { authenticate, optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { paymentService } from './services/paymentService.js';
import { smsService } from './services/smsService.js';
import { pdfService } from './services/pdfService.js';
import { prisma } from './utils/prisma.js';
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
app.set('trust proxy', 1);
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.APP_URL,
            'https://biskakenauto.rpnmore.com',
            'https://www.biskakenauto.rpnmore.com',
            'https://api.biskakenauto.rpnmore.com',
            'https://biskaken-auto-preview.dokploy.com',
            'https://biskakenaut-biskakenaut-back.dokploy.com',
            'https://biskakenaut-back.dokploy.com',
            'https://www.biskaken.com',
            'https://biskaken.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3004',
            'http://localhost:3005',
            'http://localhost:3006',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:3003',
            'http://127.0.0.1:3004',
            'http://127.0.0.1:3005',
            'http://127.0.0.1:3006',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : [])
        ].filter(Boolean);
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else if (origin && origin.includes('.dokploy.com')) {
            console.log(`✅ CORS allowing Dokploy domain: ${origin}`);
            callback(null, true);
        }
        else {
            console.warn(`❌ CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Biskaken Auto Services API',
        status: 'running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/auth/*',
            test: '/api/test/*'
        }
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});
app.get('/api/database/status', asyncHandler(async (req, res) => {
    try {
        const start = Date.now();
        await prisma.$connect();
        const result = await prisma.$queryRaw `SELECT 1 as test`;
        const responseTime = Date.now() - start;
        const tables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
        res.json({
            success: true,
            data: {
                status: 'connected',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString(),
                database: {
                    type: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite',
                    host: process.env.DATABASE_URL?.includes('postgresql') ? 'Internal Container Database' : 'Local SQLite File',
                    connected: true,
                    tables: Array.isArray(tables) ? tables.length : 0
                },
                environment: process.env.NODE_ENV || 'development'
            },
            message: 'Database connection healthy'
        });
    }
    catch (error) {
        console.error('Database status check failed:', error);
        res.status(500).json({
            success: false,
            data: {
                status: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
                database: {
                    type: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite',
                    host: process.env.DATABASE_URL?.includes('postgresql') ? 'Internal Container Database' : 'Local SQLite File',
                    connected: false
                }
            },
            message: 'Database connection failed'
        });
    }
}));
app.get('/api/status', optionalAuth, asyncHandler(async (req, res) => {
    try {
        let dbStatus = 'disconnected';
        let dbLatency = 0;
        try {
            const start = Date.now();
            await prisma.$queryRaw `SELECT 1`;
            dbLatency = Date.now() - start;
            dbStatus = 'connected';
        }
        catch (error) {
            console.error('Database health check failed:', error);
        }
        const serviceStatuses = {
            database: {
                status: dbStatus,
                latency: `${dbLatency}ms`
            },
            sms: smsService.getServiceStatus(),
            payment: paymentService.getServiceStatus(),
            ai: {
                configured: Boolean(process.env.OPENAI_API_KEY),
                model: 'gpt-4'
            },
            pdf: {
                configured: true,
                tempDir: '/temp'
            }
        };
        res.json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                services: serviceStatuses,
                user: req.user ? {
                    id: req.user.id,
                    role: req.user.role
                } : null
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
const generateMockCustomers = () => [
    {
        id: '1',
        name: 'John Doe',
        phone: '0241234567',
        email: 'john@example.com',
        address: 'Accra, Ghana',
        notes: 'Regular customer',
        createdAt: '2024-01-15T10:00:00Z',
        vehicle: { make: 'Toyota', model: 'Camry', year: '2018', plateNumber: 'GH-123-45' }
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        phone: '0207654321',
        email: 'sarah@example.com',
        address: 'Kumasi, Ghana',
        notes: 'VIP customer',
        createdAt: '2024-02-10T14:30:00Z',
        vehicle: { make: 'Honda', model: 'Accord', year: '2020', plateNumber: 'GH-678-90' }
    },
    {
        id: '3',
        name: 'Kwame Boateng',
        phone: '0201239876',
        email: 'boateng.k@gmail.com',
        address: 'Tema, Ghana',
        notes: 'Fleet customer',
        createdAt: '2024-03-05T09:15:00Z',
        vehicle: { make: 'Nissan', model: 'Patrol', year: '2020', plateNumber: 'GE-9988-21' }
    }
];
const generateMockInventory = () => [
    {
        id: 'I001',
        name: 'Engine Oil (Synthetic 5W-30)',
        category: 'Oils',
        stock: 12,
        reorderLevel: 5,
        unitCost: 120,
        sellingPrice: 180,
        supplier: 'Total Ghana'
    },
    {
        id: 'I002',
        name: 'Brake Pads (Toyota Front)',
        category: 'Brake Parts',
        stock: 2,
        reorderLevel: 5,
        unitCost: 200,
        sellingPrice: 350,
        supplier: 'Bosch Ghana'
    },
    {
        id: 'I003',
        name: 'Oil Filter (Hyundai)',
        category: 'Filters',
        stock: 25,
        reorderLevel: 10,
        unitCost: 45,
        sellingPrice: 85,
        supplier: 'Mann Filter'
    },
    {
        id: 'I004',
        name: 'Fuel Pump (Nissan Patrol)',
        category: 'Engine Parts',
        stock: 1,
        reorderLevel: 2,
        unitCost: 800,
        sellingPrice: 1250,
        supplier: 'Nissan Parts'
    },
    {
        id: 'I005',
        name: 'Fan Belt (Mercedes C-Class)',
        category: 'Engine Parts',
        stock: 4,
        reorderLevel: 3,
        unitCost: 150,
        sellingPrice: 280,
        supplier: 'Mercedes Parts'
    }
];
const generateMockJobs = () => [
    {
        id: 'J001',
        customerId: '1',
        customerName: 'John Doe',
        vehicleInfo: 'Toyota Camry (GH-123-45)',
        issueDescription: 'Engine making loud noise during acceleration',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedMechanic: 'Kwame',
        estimatedCost: 450,
        parts: [{ id: 'I002', name: 'Brake Pads (Toyota)', quantity: 1, price: 350 }],
        laborHours: 2,
        laborRate: 50,
        createdAt: '2024-05-15T09:00:00Z'
    },
    {
        id: 'J002',
        customerId: '2',
        customerName: 'Sarah Johnson',
        vehicleInfo: 'Honda Accord (GH-678-90)',
        issueDescription: 'Brake pedal feels soft and car takes longer to stop',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        assignedMechanic: 'Kofi',
        estimatedCost: 1200,
        parts: [],
        laborHours: 5,
        laborRate: 60,
        createdAt: '2024-05-18T10:30:00Z'
    },
    {
        id: 'J003',
        customerId: '3',
        customerName: 'Kwame Boateng',
        vehicleInfo: 'Nissan Patrol (GE-9988-21)',
        issueDescription: 'AC blowing hot air, needs gas refill and leak check',
        status: 'PENDING',
        priority: 'MEDIUM',
        assignedMechanic: 'Mensah',
        estimatedCost: 650,
        parts: [],
        laborHours: 2,
        laborRate: 50,
        createdAt: '2024-05-21T11:00:00Z'
    }
];
const generateMockInvoices = () => [
    {
        id: 'INV-001',
        jobId: 'J001',
        customerId: '1',
        customerName: 'John Doe',
        date: '2024-05-16',
        items: [
            { description: 'Brake Pads (Toyota)', quantity: 1, unitPrice: 350, total: 350 },
            { description: 'Labor - Brake Replacement', quantity: 2, unitPrice: 50, total: 100 }
        ],
        subtotal: 450,
        tax: 0,
        discount: 0,
        grandTotal: 450,
        status: 'PAID',
        payments: [{ amount: 450, date: '2024-05-16', method: 'Cash' }]
    },
    {
        id: 'INV-002',
        jobId: 'J002',
        customerId: '2',
        customerName: 'Sarah Johnson',
        date: '2024-05-20',
        items: [
            { description: 'Full Service Package (50k km)', quantity: 1, unitPrice: 650, total: 650 },
            { description: 'Engine Oil', quantity: 1, unitPrice: 150, total: 150 }
        ],
        subtotal: 800,
        tax: 0,
        discount: 50,
        grandTotal: 750,
        status: 'UNPAID',
        payments: []
    },
    {
        id: 'INV-003',
        customerId: '3',
        customerName: 'Kwame Boateng',
        date: '2024-05-18',
        items: [
            { description: 'Deposit for AC repair', quantity: 1, unitPrice: 300, total: 300 }
        ],
        subtotal: 300,
        tax: 0,
        discount: 0,
        grandTotal: 300,
        status: 'PAID',
        payments: [{ amount: 300, date: '2024-05-18', method: 'Mobile Money', ref: 'MM-99821' }]
    }
];
app.get('/api/test/customers', (req, res) => {
    res.json({
        success: true,
        data: generateMockCustomers(),
        message: 'Mock customers data'
    });
});
app.post('/api/test/customers', (req, res) => {
    const newCustomer = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date()
    };
    res.json({
        success: true,
        data: newCustomer,
        message: 'Customer created successfully (test mode)'
    });
});
app.get('/api/test/inventory', (req, res) => {
    const inventory = generateMockInventory();
    const { lowStock } = req.query;
    let filteredData = inventory;
    if (lowStock === 'true') {
        filteredData = inventory.filter(item => item.stock <= item.reorderLevel);
    }
    res.json({
        success: true,
        data: filteredData,
        message: lowStock === 'true' ? 'Low stock items' : 'All inventory items'
    });
});
app.post('/api/test/inventory', (req, res) => {
    const newItem = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date()
    };
    res.json({
        success: true,
        data: newItem,
        message: 'Inventory item created successfully (test mode)'
    });
});
app.get('/api/test/jobs', (req, res) => {
    const jobs = generateMockJobs();
    const { status, priority } = req.query;
    let filteredJobs = jobs;
    if (status) {
        filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    if (priority) {
        filteredJobs = filteredJobs.filter(job => job.priority === priority);
    }
    res.json({
        success: true,
        data: filteredJobs,
        message: 'Mock jobs data'
    });
});
app.post('/api/test/jobs', (req, res) => {
    const newJob = {
        id: Date.now().toString(),
        jobNumber: `JOB-2024-${String(Date.now()).slice(-3)}`,
        ...req.body,
        status: 'PENDING',
        createdAt: new Date()
    };
    res.json({
        success: true,
        data: newJob,
        message: 'Job created successfully (test mode)'
    });
});
app.get('/api/test/invoices', (req, res) => {
    const invoices = generateMockInvoices();
    const { status, customerId } = req.query;
    let filteredInvoices = invoices;
    if (status) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
    }
    if (customerId) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.customerId === customerId);
    }
    res.json({
        success: true,
        data: filteredInvoices,
        message: 'Mock invoices data'
    });
});
app.post('/api/test/invoices', (req, res) => {
    const newInvoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-2024-${String(Date.now()).slice(-3)}`,
        ...req.body,
        date: new Date(),
        status: 'DRAFT',
        createdAt: new Date()
    };
    res.json({
        success: true,
        data: newInvoice,
        message: 'Invoice created successfully (test mode)'
    });
});
app.get('/api/test/reports/dashboard', (req, res) => {
    const jobs = generateMockJobs();
    const invoices = generateMockInvoices();
    const inventory = generateMockInventory();
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const pendingJobs = jobs.filter(job => job.status === 'PENDING').length;
    const lowStockItems = inventory.filter(item => item.stock <= item.reorderLevel).length;
    res.json({
        success: true,
        data: {
            summary: {
                totalRevenue,
                totalJobs: jobs.length,
                pendingJobs,
                completedJobs: jobs.filter(job => job.status === 'COMPLETED').length,
                totalCustomers: generateMockCustomers().length,
                lowStockItems,
                totalInvoices: invoices.length,
                paidInvoices: invoices.filter(inv => inv.status === 'PAID').length
            },
            recentJobs: jobs.slice(0, 5),
            recentInvoices: invoices.slice(0, 5),
            lowStock: inventory.filter(item => item.stock <= item.reorderLevel)
        },
        message: 'Dashboard data (test mode)'
    });
});
app.get('/api/test/reports/financial', (req, res) => {
    const { from, to } = req.query;
    const invoices = generateMockInvoices();
    const revenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const profit = invoices.reduce((sum, inv) => sum + (inv.grandTotal * 0.3), 0);
    res.json({
        success: true,
        data: {
            period: { from, to },
            totalRevenue: revenue,
            totalProfit: profit,
            totalInvoices: invoices.length,
            averageInvoiceValue: revenue / invoices.length,
            paymentMethods: {
                'MOBILE_MONEY': 1,
                'CASH': 0,
                'CARD': 0
            },
            monthlyData: [
                { month: 'Nov', revenue: 2800, profit: 840 },
                { month: 'Dec', revenue: revenue, profit: profit }
            ]
        },
        message: 'Financial report (test mode)'
    });
});
app.post('/api/test/mobile-money', (req, res) => {
    const { phone, amount, provider = 'mtn' } = req.body;
    const reference = `MM_TEST_${Date.now()}`;
    res.json({
        success: true,
        data: {
            reference,
            amount,
            currency: 'GHS',
            provider,
            phone,
            status: 'test_mode',
            message: `Test mobile money payment for ${provider.toUpperCase()}. In production, customer would receive payment prompt.`
        }
    });
});
app.post('/api/test/ai-diagnosis', (req, res) => {
    const { complaint, vehicleInfo } = req.body;
    res.json({
        success: true,
        data: {
            diagnosis: `Test diagnosis for complaint: "${complaint}". In production, this would use OpenAI GPT-4 for real vehicle diagnosis.`,
            confidence: 0.85,
            estimatedCostRange: 'GHS 200 - 800',
            suggestedParts: ['Oil Filter', 'Engine Oil', 'Spark Plugs'],
            repairTime: '2-4 hours',
            urgency: 'Medium'
        }
    });
});
app.post('/api/auth/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth endpoint working - UPDATED VERSION',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});
app.post('/api/test/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const mockAdmin = {
        id: 'admin-1',
        name: name || 'Admin User',
        email: email || 'admin@biskaken.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date()
    };
    const mockToken = `mock_jwt_token_${Date.now()}`;
    res.json({
        success: true,
        data: {
            user: mockAdmin,
            token: mockToken
        },
        message: 'Admin registered successfully (test mode - no database required)'
    });
});
app.post('/api/test/auth/login', (req, res) => {
    const { email, password } = req.body;
    const validCredentials = [
        { email: 'admin@biskaken.com', password: 'admin123' },
        { email: 'staff@biskaken.com', password: 'staff123' },
        { email: 'test@test.com', password: 'test123' }
    ];
    const user = validCredentials.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }
    const mockUser = {
        id: user.email.includes('admin') ? 'admin-1' : 'user-1',
        name: user.email.includes('admin') ? 'Admin User' : 'Staff User',
        email: user.email,
        role: user.email.includes('admin') ? 'ADMIN' : 'STAFF',
        status: 'ACTIVE'
    };
    const mockToken = `mock_jwt_token_${Date.now()}`;
    res.json({
        success: true,
        data: {
            user: mockUser,
            token: mockToken
        },
        message: 'Login successful (test mode)'
    });
});
app.get('/api/test/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication token required'
        });
    }
    const mockUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@biskaken.com',
        role: 'ADMIN',
        status: 'ACTIVE'
    };
    res.json({
        success: true,
        data: mockUser
    });
});
app.get('/api/test/hello', (req, res) => {
    res.json({ message: 'Test endpoints are working! Changes loaded successfully.' });
});
app.get('/api/test/endpoints', (req, res) => {
    res.json({
        success: true,
        endpoints: {
            health: "GET /health",
            status: "GET /api/status",
            auth_test: "POST /api/auth/test",
            mobile_money_test: "POST /api/test/mobile-money",
            ai_diagnosis_test: "POST /api/test/ai-diagnosis",
            endpoints_list: "GET /api/test/endpoints",
            auth_register: "POST /api/test/auth/register",
            auth_login: "POST /api/test/auth/login",
            auth_me: "GET /api/test/auth/me",
            customers_list: "GET /api/test/customers",
            customers_create: "POST /api/test/customers",
            inventory_list: "GET /api/test/inventory",
            inventory_create: "POST /api/test/inventory",
            inventory_low_stock: "GET /api/test/inventory?lowStock=true",
            jobs_list: "GET /api/test/jobs",
            jobs_create: "POST /api/test/jobs",
            jobs_by_status: "GET /api/test/jobs?status=PENDING",
            invoices_list: "GET /api/test/invoices",
            invoices_create: "POST /api/test/invoices",
            invoices_by_status: "GET /api/test/invoices?status=PAID",
            dashboard_report: "GET /api/test/reports/dashboard",
            financial_report: "GET /api/test/reports/financial"
        },
        production_endpoints: {
            authentication: "/api/auth/*",
            customers: "/api/customers/*",
            jobs: "/api/jobs/*",
            inventory: "/api/inventory/*",
            invoices: "/api/invoices/*",
            reports: "/api/reports/*",
            users: "/api/users/*"
        }
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.post('/api/webhooks/paystack', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        const body = req.body;
        if (!signature) {
            return res.status(400).json({ error: 'Missing signature' });
        }
        const event = JSON.parse(body.toString());
        if (event.event === 'charge.success') {
            const reference = event.data.reference;
            console.log(`Payment webhook received for reference: ${reference}`);
        }
        res.status(200).json({ status: 'success' });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}));
app.get('/api/public/payment/verify/:reference', asyncHandler(async (req, res) => {
    try {
        const { reference } = req.params;
        const verification = await paymentService.verifyPaystackPayment(reference);
        if (!verification.success) {
            return res.status(400).json({
                success: false,
                error: verification.error
            });
        }
        res.json({
            success: true,
            data: {
                reference,
                status: verification.data.status,
                amount: verification.data.amount,
                currency: verification.data.currency,
                paid_at: verification.data.paid_at
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/temp', authenticate, express.static(path.join(__dirname, '../temp')));
app.post('/api/callbacks/mobile-money', asyncHandler(async (req, res) => {
    try {
        const { reference, status, transaction_id } = req.body;
        console.log('Mobile Money callback:', { reference, status, transaction_id });
        res.status(200).json({
            success: true,
            message: 'Callback processed'
        });
    }
    catch (error) {
        console.error('Mobile Money callback error:', error);
        res.status(500).json({ error: 'Callback processing failed' });
    }
}));
console.log('📁 Serving static files from:', path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    const indexPath = path.join(__dirname, '../public/index.html');
    console.log('📄 Serving index.html from:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Error serving index.html:', err);
            res.status(500).send('Unable to serve application');
        }
    });
});
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        error: `API endpoint not found: ${req.method} ${req.path}`
    });
});
app.use(errorHandler);
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    try {
        await prisma.$disconnect();
        console.log('Database connections closed.');
        await pdfService.cleanupOldFiles(1);
        console.log('Temporary files cleaned up.');
        console.log('Graceful shutdown completed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Biskaken Auto Services API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Server: http://0.0.0.0:${PORT} (external access enabled)
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://0.0.0.0:${PORT}/health
📈 API Status: http://0.0.0.0:${PORT}/api/status

🔧 API Endpoints:
   Auth:      /api/auth/*
   Customers: /api/customers/*
   Jobs:      /api/jobs/*
   Inventory: /api/inventory/*
   Invoices:  /api/invoices/*
   Reports:   /api/reports/*
   Users:     /api/users/*

💰 Payment Features:
   - Paystack (Mobile Money, Cards)
   - Plasma.to (USDT) 
   - Real-time payment verification

🤖 AI Features:
   - Vehicle diagnosis
   - Business insights
   - Inventory predictions

📱 SMS Notifications:
   - Job status updates
   - Payment reminders
   - Customer notifications

📄 PDF Generation:
   - Professional invoices
   - Business reports
   - Export functionality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server ready for connections!
  `);
    console.log('🔍 Performing startup checks...');
    prisma.$connect()
        .then(() => console.log('✅ Database connection verified'))
        .catch((error) => console.error('❌ Database connection failed:', error.message));
    const services = {
        SMS: smsService.getServiceStatus().isConfigured,
        Payment: paymentService.getServiceStatus().paystack.configured,
        AI: Boolean(process.env.OPENAI_API_KEY),
        USDT: paymentService.getServiceStatus().usdt.configured
    };
    console.log('\n🔧 Service Status:');
    Object.entries(services).forEach(([service, configured]) => {
        console.log(`   ${configured ? '✅' : '❌'} ${service}: ${configured ? 'Configured' : 'Not configured'}`);
    });
    if (!services.Payment) {
        console.log('\n⚠️  Payment services not configured. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in .env');
    }
    if (!services.SMS) {
        console.log('⚠️  SMS service not configured. Set TWILIO credentials in .env');
    }
    if (!services.AI) {
        console.log('⚠️  AI service not configured. Set OPENAI_API_KEY in .env');
    }
    console.log('\n🎯 Ready to serve auto shop management requests!');
});
export default app;
