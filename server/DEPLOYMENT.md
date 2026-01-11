# Biskaken Auto Backend Deployment Guide

## Dokploy Deployment Instructions

### 1. Environment Variables Setup

Configure these environment variables in Dokploy:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_SSL=true

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_here_must_be_long_and_random

# CORS Configuration
CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://biskakenauto.rpnmore.com:3000
```

### 2. Database Setup

The application will automatically create the required PostgreSQL tables:

- `users` - User management and authentication
- `customers` - Customer information and vehicles
- `jobs` - Work orders and repair jobs
- `inventory` - Parts and supplies inventory
- `invoices` - Billing and invoicing
- `invoice_items` - Line items for invoices
- `payments` - Payment records
- `blog_posts` - Blog content management

### 3. Default Admin User

The system automatically creates a default admin user:
- **Email**: `admin@biskaken-v3.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

**⚠️ Important**: Change this password immediately after deployment!

### 4. API Endpoints

The backend provides these main endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Core Business APIs
- `GET/POST/PUT/DELETE /api/customers` - Customer management
- `GET/POST/PUT /api/jobs` - Job management
- `GET/POST/PUT /api/inventory` - Inventory management
- `GET/POST /api/invoices` - Invoice management
- `GET/POST/PUT/DELETE /api/blog` - Blog management
- `GET /api/reports/dashboard` - Dashboard analytics
- `GET /api/reports/financial` - Financial reports

#### Test Endpoints (for development)
- `GET /api/test/endpoints` - List all available endpoints
- `GET /api/test/*` - Mock data endpoints for frontend testing

### 5. Frontend Configuration

Update the frontend environment variable:

```env
VITE_API_URL=https://your-backend-domain.com
```

### 6. Health Checks

- Health endpoint: `GET /health`
- Status endpoint: `GET /api/status`

### 7. Docker Deployment

The included Dockerfile:
- Uses Node.js 18 Alpine for small image size
- Runs as non-root user for security
- Includes health checks
- Optimized for production

### 8. Security Features

- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- JWT authentication
- Password hashing with bcrypt
- SQL injection protection with parameterized queries

### 9. Monitoring

The application includes:
- Comprehensive logging with Morgan
- Health check endpoints
- Error handling middleware
- Database connection monitoring

### 10. Scaling Considerations

- Stateless design for horizontal scaling
- PostgreSQL connection pooling
- Gzip compression enabled
- Production-optimized error handling