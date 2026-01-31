# 🚗 Biskaken Auto Admin Dashboard

A React-based admin dashboard for automotive repair shop management.

## 🚀 Local Development

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## 📦 Dokploy Deployment

### Compose Mode (Internal PostgreSQL)

1. **Create Compose Service** (not Application) in Dokploy
2. **Repository**: Your GitHub repo
3. **Compose File**: `docker-compose.yml`
4. **Domain**: `bisadmin.rpnmore.com`

### Environment Variables

#### Internal Database (Default)
```
NODE_ENV=production
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123
```

#### Switch to External Database (Later)
Uncomment in environment variables:
```
NODE_ENV=production
# Comment out internal DB vars above, then add:
VITE_API_URL=https://your-external-api.com
```

#### External Database Examples (Currently Disabled)
```
# Supabase (uncomment when ready)
# VITE_API_URL=https://your-project.supabase.co/rest/v1
# VITE_SUPABASE_KEY=your_supabase_key

# Firebase (uncomment when ready)  
# VITE_EXTERNAL_DB_URL=https://your-project-default-rtdb.firebaseio.com

# Custom API (uncomment when ready)
# VITE_API_URL=https://api.yourdomain.com
```

## ✨ Features

- 🎯 **Dashboard Overview** - Business metrics and insights
- 🚗 **Vehicle Management** - Customer vehicles and service history
- 📋 **Work Orders** - Job tracking and management
- 🧾 **Invoicing** - Billing and payment tracking
- 📦 **Inventory** - Parts and stock management
- 📰 **Blog Management** - Content creation and publishing
- ⚙️ **Settings** - User management and configuration
- 🤖 **AI Features** - Automotive diagnosis and content generation

## 🎨 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## 🔧 Built-in Demo Data

The dashboard includes comprehensive demo data:
- Sample customers and vehicles
- Example work orders and invoices  
- Demo inventory items
- Sample blog posts

Perfect for testing and demonstration purposes!

## 🗄️ External Database Support

Connect to any external database or API:

### Supported Backends
- **Supabase** - PostgreSQL as a Service
- **Firebase** - Google's real-time database
- **Airtable** - Spreadsheet as database
- **MongoDB Atlas** - Cloud MongoDB
- **Strapi** - Headless CMS
- **Custom REST API** - Your own backend
- **GraphQL** - Any GraphQL endpoint

### Connection Modes
- **Demo Mode** - Built-in demo data (default)
- **External API** - Connect to REST/GraphQL APIs
- **Direct Database** - Connect to database services
- **Hybrid** - Fallback from external to demo data

### Quick Setup Examples

#### Supabase Connection
```bash
# In Dokploy Environment Variables:
VITE_API_URL=https://your-project.supabase.co/rest/v1
VITE_SUPABASE_KEY=your_supabase_anon_key
```

#### Firebase Connection  
```bash
VITE_EXTERNAL_DB_URL=https://your-project-default-rtdb.firebaseio.com
```

#### Custom API
```bash
VITE_API_URL=https://api.yourdomain.com
```

The dashboard automatically detects external connections and falls back to demo data if unavailable.

## 📱 Responsive Design

Fully responsive design that works on:
- 🖥️ Desktop
- 📱 Mobile
- 📱 Tablet

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