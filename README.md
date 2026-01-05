# Biskaken Auto Shop Management System

A comprehensive full-stack auto shop management system with React frontend and Node.js/Express backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd biskaken-auto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.production.example` to `.env.local` and update with your values:
   ```bash
   cp .env.production.example .env.local
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database
   npm run db:seed
   ```

5. **Development**
   ```bash
   # Start frontend (development)
   npm run dev
   
   # In another terminal, start backend
   cd server && npm run dev
   ```

6. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
biskaken-auto/
├── components/          # React components
├── pages/              # React pages
├── services/           # Frontend API services
├── store/             # Zustand state management
├── server/            # Backend Node.js application
│   ├── controllers/   # API controllers
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Backend services
│   └── utils/         # Utilities
├── prisma/            # Database schema and migrations
├── public/            # Static assets
└── dist/              # Built application
```

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js 20** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Services
- **OpenAI** - AI diagnostics
- **Twilio** - SMS notifications
- **Paystack** - Payment processing
- **Cloudinary** - File uploads

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database

## 🌐 Production Deployment

### Dokploy (Recommended)
1. Create new Nixpacks application in Dokploy
2. Connect to your Git repository
3. Set environment variables
4. Deploy

### Manual Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## 📧 Default Admin Access
- **Email**: admin@biskaken.com
- **Password**: admin123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.