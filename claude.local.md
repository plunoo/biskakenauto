# claude.local.md

This file contains implementation details for copying and adapting this codebase to another folder/project.

## Quick Setup Checklist

1. **Copy these core files:**
   - `package.json` - Dependencies and scripts
   - `tsconfig.json` - TypeScript configuration
   - `vite.config.ts` - Build configuration
   - `.env.local` - Environment variables (create new with your API key)

2. **Essential Dependencies:**
   ```json
   {
     "react": "^19.2.3",
     "react-dom": "^19.2.3",
     "react-router-dom": "^7.11.0",
     "zustand": "^5.0.9",
     "@google/genai": "^1.34.0",
     "lucide-react": "^0.562.0",
     "recharts": "^3.6.0"
   }
   ```

3. **Environment Variables:**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Core Implementation Patterns

### State Management (Zustand)
**Location:** `store/useStore.ts`
**Pattern:** Single store with sliced actions
```typescript
interface AppState {
  user: User | null;
  customers: Customer[];
  jobs: Job[];
  // ... other entities
  
  // Actions grouped by domain
  login: (email: string, role: UserRole) => void;
  addCustomer: (customer: Customer) => void;
  addJob: (job: Job) => void;
}
```

### Route Protection Pattern
**Location:** `App.tsx`
```typescript
// Protected route pattern
<Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
```

### AI Service Integration
**Location:** `services/gemini.ts`
**Key Functions:**
- `getAIDiagnosis(complaint: string)` - Structured automotive diagnosis
- `getAIInsights(dataSummary: string)` - Business insights
- `getInventoryPrediction(itemHistory: string)` - Stock predictions

### TypeScript Interfaces
**Location:** `types.ts`
**Critical Types:**
- `User` with `UserRole` enum
- `Customer` with nested `vehicle` object
- `Job` with `JobStatus` and `Priority` enums
- `Invoice` with `InvoiceStatus` and payment tracking

## File Structure to Replicate

```
/
├── components/
│   ├── Layout.tsx          # Navigation shell
│   └── UI.tsx              # Reusable components
├── pages/
│   ├── DashboardPage.tsx   # Main dashboard
│   ├── JobsPage.tsx        # Job management
│   ├── LoginPage.tsx       # Authentication
│   └── LandingPage.tsx     # Public landing
├── services/
│   └── gemini.ts           # AI integration
├── store/
│   └── useStore.ts         # Global state
├── types.ts                # TypeScript interfaces
├── constants.tsx           # Mock users/data
├── App.tsx                 # Router & route guards
├── index.tsx               # React entry point
└── vite.config.ts          # Build config
```

## Key Implementation Details

### Vite Configuration
- **Port:** 3000 with host `0.0.0.0`
- **Path alias:** `@/` points to project root
- **Env variables:** Exposes `GEMINI_API_KEY` as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`

### Authentication Flow
1. User enters email on login page
2. System finds user by email in `MOCK_USERS` (constants.tsx)
3. Sets user in Zustand store
4. Protected routes check `user` state

### Data Flow Pattern
1. **Mock Data:** Hardcoded in store initialization (Ghana context)
2. **Actions:** Zustand actions modify state immutably
3. **UI Updates:** Components subscribe to store changes
4. **AI Enhancement:** Services augment data with Gemini insights

### Business Logic Highlights
- **Job Status Workflow:** PENDING → IN_PROGRESS → COMPLETED/CANCELLED
- **Invoice Payments:** Track multiple payments, auto-update status when fully paid
- **Inventory Management:** Stock levels with reorder thresholds
- **Customer Vehicle Tracking:** Make, model, year, plate number format

## Customization Points for New Implementation

1. **Replace Mock Data:** Update store initial state with your data
2. **Modify Business Logic:** Adjust enums, interfaces in types.ts
3. **Update AI Prompts:** Customize Gemini prompts in services/gemini.ts
4. **Change UI Theme:** Modify components/UI.tsx styling
5. **Add New Routes:** Extend App.tsx router configuration
6. **Customize Store:** Add new entities and actions to useStore.ts

## Critical Dependencies Behavior
- **React Router:** Uses HashRouter for static deployment compatibility
- **Zustand:** Provides reactive state without boilerplate
- **Lucide React:** Icon system (import specific icons only)
- **Recharts:** Chart library for dashboard analytics
- **@google/genai:** Official Google AI SDK with structured output support