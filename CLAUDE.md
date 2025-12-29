# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm install` - Install dependencies

## Environment Setup

The application requires a `GEMINI_API_KEY` environment variable for AI features. Set this in `.env.local` for local development.

## Architecture Overview

This is a React/TypeScript auto shop management system built with:
- **State Management**: Zustand store (`store/useStore.ts`) with centralized state for users, customers, jobs, inventory, and invoices
- **AI Integration**: Google Gemini API (`services/gemini.ts`) for vehicle diagnostics, business insights, and inventory predictions
- **Authentication**: Role-based access (ADMIN, SUB_ADMIN, STAFF) with route protection
- **UI Framework**: React with Vite, TailwindCSS styling, Lucide icons, Recharts for visualizations

### Key Data Models

The application manages five core entities defined in `types.ts`:
- **Jobs**: Vehicle repair requests with status tracking, cost estimation, and mechanic assignment
- **Customers**: Client records with associated vehicle information
- **Inventory**: Parts management with stock levels and reorder points
- **Invoices**: Billing with payment tracking and status management
- **Users**: Staff with role-based permissions

### Component Structure

- `components/Layout.tsx` - Main layout with role-based navigation sidebar
- `pages/` - Route components for Dashboard, Jobs, Login, etc.
- `components/UI.tsx` - Reusable UI components

### State Management Pattern

The Zustand store follows a flat structure with:
- Mock data pre-loaded for development
- Immutable update patterns using spread operators
- Action methods for each entity (add, update, delete operations)
- Authentication state management

### AI Features

Three main AI integrations via Gemini API:
- `getAIDiagnosis()` - Vehicle issue diagnosis with structured output
- `getAIInsights()` - Business recommendations based on shop data
- `getInventoryPrediction()` - Stock management predictions

All AI responses use structured JSON schemas for consistent data handling.

## Backend API Integration

### Development Setup
- **Backend**: Node.js/Express API (`biskaken-auto-api/`) running on `localhost:5000`
- **Frontend**: React/Vite app running on `localhost:3003` 
- **Database**: PostgreSQL (production) / Mock data (development)

### API Service Configuration
The `services/apiService.ts` handles all backend communication:
- Base URL: `http://localhost:5000` (development)
- Test endpoints: `/api/test/*` (no database required)
- Production endpoints: `/api/*` (requires database)

### Data Loading Pattern
Frontend uses Zustand store with backend integration:
```typescript
// Store functions for data loading
loadCustomers() // Fetches from /api/test/customers
loadJobs()      // Fetches from /api/test/jobs  
loadInventory() // Fetches from /api/test/inventory
loadInvoices()  // Fetches from /api/test/invoices
loadAllData()   // Loads all data after login
```

### Authentication Flow
1. Login form submits to `/api/test/auth/login`
2. Backend returns user object and JWT token
3. Store saves user and token, then calls `loadAllData()`
4. All pages have access to populated data

## Common Issues & Solutions

### Issue: "Empty data on all pages"
**Root Cause**: Missing page components - App.tsx was using placeholder components instead of actual data pages.

**Solution**: 
1. Create actual page components (`CustomersPage.tsx`, `InventoryPage.tsx`, `InvoicesPage.tsx`)
2. Update `App.tsx` to import and use real pages instead of placeholders
3. Each page should call appropriate load functions in useEffect:
```typescript
useEffect(() => {
  loadCustomers(); // or loadJobs(), loadInventory(), etc.
}, []);
```

### Issue: "API calls not working"
**Checklist**:
1. Backend running on correct port (`localhost:5000`)
2. CORS configured for frontend origin (`localhost:3003`)
3. API service using correct base URL
4. Check browser console for network errors

### Issue: "Data structure mismatch"
**Backend Response Format**:
- Customers: `{success: true, data: [...], message: "..."}`
- Each customer: `{id, name, phone, email, vehicle: {make, model, year, plateNumber}}`
- Inventory: `{id, name, category, stock, reorderLevel, unitCost, sellingPrice}`
- Jobs: `{id, customerId, customerName, vehicleInfo, issueDescription, status, priority}`
- Invoices: `{id, customerId, customerName, items: [...], grandTotal, status, payments: [...]}`

### Production Deployment Requirements
1. **Database**: Set up PostgreSQL and update DATABASE_URL
2. **Environment Variables**: Configure all API keys and secrets
3. **CORS**: Add production domain to allowed origins
4. **Build Process**: Ensure TypeScript compiles without errors
5. **API Endpoints**: Switch from `/api/test/*` to `/api/*` for production

### Issue: "Reports page showing placeholder"
**Root Cause**: Reports page was using placeholder component instead of actual ReportsPage.

**Solution**:
1. Create `ReportsPage.tsx` with dashboard and financial report integration
2. Use report endpoints: `/api/test/reports/dashboard` and `/api/test/reports/financial`
3. Update `App.tsx` to use ReportsPage instead of placeholder
4. ReportsPage fetches data directly from report endpoints in useEffect

## Testing Checklist
- [ ] Backend API endpoints return data
- [ ] Frontend login flow works
- [ ] All pages display data after login (Dashboard, Jobs, Customers, Inventory, Invoices, Reports)
- [ ] Browser console shows successful API calls
- [ ] No TypeScript compilation errors
- [ ] All navigation links work and show real data

## Page Component Requirements
All page components should follow this pattern:
```typescript
// 1. Import required dependencies
import { useStore } from '../store/useStore';

// 2. Add data loading in useEffect
useEffect(() => {
  console.log('📊 PageName mounted - loading data...');
  loadDataFunction(); // or fetch directly from API
}, []);

// 3. Add loading state
if (loading) {
  return <LoadingComponent />;
}

// 4. Add empty state
if (!data || data.length === 0) {
  return <EmptyStateComponent />;
}

// 5. Render data with proper error handling
```

## Complete Page List
- ✅ **LoginPage** - Authentication form
- ✅ **DashboardPage** - Overview with summary stats  
- ✅ **JobsPage** - Job listings and management
- ✅ **CustomersPage** - Customer records with vehicle details
- ✅ **InventoryPage** - Parts and supplies management
- ✅ **InvoicesPage** - Billing and payment tracking
- ✅ **ReportsPage** - Business analytics and insights
- ⏳ **SettingsPage** - Application settings (placeholder)