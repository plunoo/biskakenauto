# 🚗 Biskaken Auto Shop Management System

A comprehensive auto shop management system built for Ghana's automotive repair industry, featuring AI-powered diagnostics, mobile money integration, and professional workflow management.

## 🌟 Features

### 🏪 **Shop Management**
- Customer vehicle records and history
- Job tracking with status updates
- Parts inventory with low-stock alerts
- Professional invoice generation
- SMS notifications to customers

### 🤖 **AI-Powered Tools**
- Vehicle issue diagnosis with Gemini AI
- Cost estimation for repairs
- Business insights and analytics
- Automated content generation

### 💳 **Ghana-Focused Payments**
- Paystack integration for card payments
- Mobile Money support (MTN, Vodafone, Tigo)
- USDT cryptocurrency payments
- Cash transaction tracking

### 👥 **Multi-User Access**
- Admin, Sub-Admin, and Staff roles
- Secure authentication with JWT
- Role-based permissions
- Activity notifications

### 📊 **Business Intelligence**
- Revenue tracking and reports
- Inventory turnover analysis
- Customer growth metrics
- Job completion statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Gemini API key (for AI features)

### Installation
```bash
# Clone repository
git clone https://github.com/plunoo/biskakenauto.git
cd biskakenauto

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev           # Frontend (port 3003)
cd biskaken-auto-api && npm run dev  # Backend (port 5000)
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - For AI diagnostics
- `PAYSTACK_SECRET_KEY` - Ghana payment processing
- `TWILIO_*` - SMS notifications

## 🌐 Live Demo

**Production URL**: https://biskakenauto.rpnmore.com

**Test Credentials:**
- Email: `admin@biskaken.com`
- Password: `admin123`
- Role: Admin (full access)

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with code splitting
- **State Management**: Zustand
- **UI Library**: Tailwind CSS + Lucide icons
- **Charts**: Recharts for analytics
- **Routing**: React Router with protected routes

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Uploads**: Cloudinary integration
- **SMS**: Twilio API

### Deployment
- **Platform**: Dokploy with Nixpacks
- **Build**: Multi-stage builds
- **Static Serving**: Backend serves frontend
- **SSL**: Automatic Let's Encrypt

## 📁 Project Structure

```
biskaken-auto/
├── 📁 components/          # React components
├── 📁 pages/              # Route components
├── 📁 services/           # API and external services
├── 📁 store/              # Zustand state management
├── 📁 biskaken-auto-api/  # Backend API
│   ├── 📁 src/            # TypeScript source
│   ├── 📁 prisma/         # Database schema
│   └── 📁 dist/           # Compiled JavaScript
├── 📄 nixpacks.toml       # Deployment configuration
├── 📄 Dockerfile          # Container configuration
└── 📄 DEPLOYMENT.md       # Deployment guide
```

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd biskaken-auto-api
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm start           # Production start
```

### Database Management
```bash
cd biskaken-auto-api
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## 🚀 Deployment

### Dokploy Deployment
1. **Repository**: `https://github.com/plunoo/biskakenauto.git`
2. **Domain**: `biskakenauto.rpnmore.com`
3. **Build**: Nixpacks (recommended)
4. **Environment**: See `.env.example`

### Manual Deployment
```bash
# Build application
./deploy.sh

# Start production server
cd biskaken-auto-api && npm start
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Security Features

- **Authentication**: JWT-based with secure secrets
- **CORS**: Restricted to known domains
- **Input Validation**: Zod schema validation
- **SQL Injection**: Prisma ORM protection
- **Rate Limiting**: Built-in API protection
- **Environment**: Secure variable management

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user

### Business Operations
- `GET /api/customers` - List customers
- `GET /api/jobs` - List repair jobs
- `GET /api/inventory` - Inventory management
- `GET /api/invoices` - Invoice operations

### AI Services
- `POST /api/ai/diagnose` - Vehicle diagnosis
- `GET /api/reports/insights` - Business analytics

### Testing
- `GET /api/test/*` - Test endpoints with mock data
- `GET /health` - Health check
- `GET /api/status` - Service status

## 🧪 Testing

The system includes comprehensive test endpoints:
- Mock data for development
- Service status monitoring
- Payment system testing
- SMS notification testing
- AI diagnosis simulation

## 📊 Business Metrics

### Key Performance Indicators
- Jobs completed per month
- Average repair time
- Customer satisfaction
- Revenue growth
- Inventory turnover

### Reporting Features
- Daily sales summaries
- Monthly profit/loss
- Customer analytics
- Mechanic performance
- Parts usage statistics

## 🌍 Localization

### Ghana Market Focus
- **Currency**: Ghana Cedis (₵)
- **Payments**: Mobile Money integration
- **Phone**: Ghana number formats
- **Language**: English with local terms
- **Time Zone**: GMT (UTC+0)

### Payment Methods
- Cash transactions
- MTN Mobile Money
- Vodafone Cash
- Tigo Cash
- Paystack card payments
- USDT cryptocurrency

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commits
- Test all payment integrations
- Ensure mobile responsiveness
- Document API changes

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check `DEPLOYMENT.md` for setup help
- **Issues**: Create GitHub issues for bugs
- **Discussions**: GitHub Discussions for questions
- **Email**: Contact repository maintainers

## 🏆 Acknowledgments

- **Ghana Auto Industry**: For inspiring this solution
- **Gemini AI**: Powering vehicle diagnostics
- **Paystack**: Enabling local payments
- **Dokploy**: Simplifying deployments
- **Open Source Community**: For amazing tools and libraries

---

🇬🇭 **Built with love for Ghana's auto repair industry** - Empowering local mechanics with modern technology.