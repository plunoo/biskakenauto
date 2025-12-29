# Biskaken Auto Services - Backend API

A comprehensive auto repair shop management system with AI-powered features, mobile money payments, and SMS notifications.

## 🚀 Features

### Core Functionality
- **Customer Management** - Customer profiles with vehicle information
- **Job Management** - Work orders, job tracking, and mechanic assignment
- **Inventory Management** - Parts tracking with low stock alerts
- **Invoice Management** - Professional invoicing with PDF generation
- **User Management** - Role-based access control (Admin/Sub-Admin/Staff)

### Advanced Features
- **AI-Powered Diagnosis** - Vehicle issue diagnosis using OpenAI GPT-4
- **Mobile Money Payments** - MTN, Vodafone, Tigo integration via Paystack
- **USDT Payments** - Cryptocurrency payments via Plasma.to
- **SMS Notifications** - Automated customer notifications via Twilio
- **PDF Generation** - Professional invoices and reports
- **Business Insights** - AI-powered business analytics
- **Inventory Predictions** - AI-based reorder recommendations

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn package manager

## 🛠 Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd biskaken-auto-api
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

## 🔧 Environment Variables

### Required
```env
DATABASE_URL="postgresql://user:password@localhost:5432/biskaken_auto"
JWT_SECRET="your-super-secret-jwt-key"
```

### Optional Services
```env
# OpenAI (for AI features)
OPENAI_API_KEY="sk-your-openai-key"

# Twilio (for SMS)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Paystack (for payments)
PAYSTACK_SECRET_KEY="sk_test_your-paystack-key"
PAYSTACK_PUBLIC_KEY="pk_test_your-paystack-key"

# Plasma.to (for USDT)
USDT_WALLET_ADDRESS="your-wallet-address"
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints except authentication require a Bearer token:
```
Authorization: Bearer <jwt-token>
```

### Main Endpoints

#### Authentication
```
POST   /auth/register       # Register first user (admin)
POST   /auth/login          # User login
GET    /auth/me             # Get current user
PUT    /auth/change-password # Change password
POST   /auth/logout         # Logout
```

#### Customers
```
GET    /customers           # List customers (paginated)
POST   /customers           # Create customer
GET    /customers/:id       # Get customer details
PUT    /customers/:id       # Update customer
DELETE /customers/:id       # Delete customer (Admin)
GET    /customers/search    # Search customers
```

#### Jobs
```
GET    /jobs                # List jobs (role-filtered)
POST   /jobs                # Create job
GET    /jobs/:id            # Get job details
PUT    /jobs/:id            # Update job
PUT    /jobs/:id/status     # Update job status
POST   /jobs/:id/assign     # Assign mechanic
POST   /jobs/ai-diagnosis   # AI vehicle diagnosis
GET    /jobs/stats          # Job statistics
```

#### Inventory
```
GET    /inventory           # List inventory
POST   /inventory           # Add item (Admin/Sub-Admin)
GET    /inventory/:id       # Get item details
PUT    /inventory/:id       # Update item
POST   /inventory/:id/adjust-stock # Adjust stock
GET    /inventory/low-stock # Low stock alerts
GET    /inventory/:id/ai-predict # AI reorder prediction
```

#### Invoices
```
GET    /invoices            # List invoices
POST   /invoices            # Create invoice
GET    /invoices/:id        # Get invoice
PUT    /invoices/:id        # Update invoice
POST   /invoices/:id/payment # Record payment
POST   /invoices/:id/pay/mobile-money # Mobile money payment
POST   /invoices/:id/pay/online # Online payment
GET    /invoices/:id/pdf    # Download PDF
POST   /invoices/:id/send-reminder # Send SMS reminder
```

#### Reports
```
GET    /reports/dashboard   # Dashboard statistics
GET    /reports/revenue     # Revenue report
GET    /reports/inventory   # Inventory report
GET    /reports/mechanics   # Mechanic performance
GET    /reports/ai-insights # AI business insights
POST   /reports/export      # Export to PDF
```

## 🔐 Default Credentials

After running the seed command:

- **Admin**: `admin@biskaken.com` / `admin123`
- **Mechanics**: `mechanic123` (for all mechanics)

## 💳 Payment Integration

### Mobile Money (Paystack)
Supports MTN Mobile Money, Vodafone Cash, and Tigo Cash payments through Paystack's Ghana gateway.

**Flow:**
1. Initialize payment: `POST /invoices/:id/pay/mobile-money`
2. Customer receives payment prompt on phone
3. Verify payment: `GET /invoices/verify/:reference`

### USDT Payments (Plasma.to)
Zero-fee USDT transfers for international clients.

**Flow:**
1. Generate payment link: `POST /invoices/:id/pay/usdt`
2. Customer sends USDT to provided address
3. Automatic blockchain verification

## 📱 SMS Notifications

Automated SMS notifications for:
- Job started/completed
- Payment confirmations
- Payment reminders
- Parts arrival notifications
- Maintenance reminders

## 🤖 AI Features

### Vehicle Diagnosis
```javascript
POST /jobs/ai-diagnosis
{
  "complaint": "Car making grinding noise when braking",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry", 
    "year": 2015
  }
}
```

### Business Insights
```javascript
GET /reports/ai-insights
// Returns actionable business recommendations
```

### Inventory Predictions
```javascript
GET /inventory/:id/ai-predict
// Returns optimal reorder timing and quantity
```

## 📊 Role-Based Access

### ADMIN
- Full system access
- User management
- Financial reports
- System configuration

### SUB_ADMIN  
- Customer and job management
- Inventory management
- Basic reports
- Cannot manage users

### STAFF (Mechanics)
- View assigned jobs only
- Update job status
- Record job completion
- Limited customer access

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database
- Set up proper CORS origins
- Configure monitoring and logging

## 📈 Performance & Scaling

- Database connection pooling via Prisma
- JWT stateless authentication
- PDF generation with cleanup
- Graceful shutdown handling
- Error logging and monitoring ready
- API rate limiting ready

## 🔧 Development

### Database Commands
```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations  
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed sample data
```

### Development Commands
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
```

### Testing
```bash
npm test              # Run tests (when implemented)
```

## 🛡 Security Features

- JWT-based authentication
- Role-based authorization
- Input validation with Zod
- SQL injection protection via Prisma
- Password hashing with bcryptjs
- CORS protection
- Environment variable validation
- Activity logging for audit trails

## 📞 Support

For technical support or feature requests:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/status`

## 📄 License

This project is proprietary software for Biskaken Auto Services.

---

**Built with ❤️ for the automotive industry in Ghana**