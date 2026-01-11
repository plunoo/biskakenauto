
import { create } from 'zustand';
import { User, Customer, Job, InventoryItem, Invoice, UserRole, JobStatus, Priority, InvoiceStatus } from '../types';
import { MOCK_USERS } from '../constants';
import { apiService } from '../services/apiService';
// import { smsService } from '../services/smsService'; // Disabled for static deployment

interface Notification {
  id: string;
  type: 'job' | 'payment' | 'inventory' | 'system' | 'user' | 'reorder';
  message: string;
  time: string;
  unread: boolean;
  userId?: string;
  userName?: string;
}

interface ReorderRequest {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  requestedQuantity: number;
  requestedBy: string;
  requestedById: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  requestDate: string;
  notes?: string;
}

interface AppState {
  user: User | null;
  customers: Customer[];
  jobs: Job[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  notifications: Notification[];
  reorderRequests: ReorderRequest[];
  loading: boolean;
  error: string | null;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Data Loading Actions
  loadCustomers: () => Promise<void>;
  loadJobs: () => Promise<void>;
  loadInventory: () => Promise<void>;
  loadInvoices: () => Promise<void>;
  loadAllData: () => Promise<void>;
  
  // Data Actions
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  deleteJob: (jobId: string) => void;
  
  addInventory: (item: InventoryItem) => void;
  updateInventory: (itemId: string, updates: Partial<InventoryItem>) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  deleteInventory: (itemId: string) => void;
  
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  recordPayment: (invoiceId: string, payment: { amount: number; date: string; method: string; ref?: string }) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'unread'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  // Reorder Actions
  createReorderRequest: (itemId: string, quantity: number, notes?: string) => void;
  updateReorderStatus: (reorderId: string, status: ReorderRequest['status']) => void;
}

const initializeStore = () => {
  if (typeof window === 'undefined') return { user: null };
  
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('🔄 Restoring user session:', user);
      
      // Load data after session restoration
      setTimeout(() => {
        const store = useStore.getState();
        console.log('📊 Loading data after session restoration...');
        store.loadAllData();
      }, 100);
      
      return { user };
    } catch (error) {
      console.error('❌ Failed to restore user session:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
  
  // Auto-login demo user for localhost testing
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🏠 Localhost detected, auto-logging demo user...');
    const demoUser = {
      id: 'admin@biskaken.com',
      name: 'Demo Admin User',
      email: 'admin@biskaken.com',
      role: 'ADMIN'
    };
    const demoToken = `demo_token_${Date.now()}`;
    
    localStorage.setItem('authToken', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    
    // Load data after auto-login
    setTimeout(() => {
      const store = useStore.getState();
      console.log('📊 Loading data after auto-login...');
      store.loadAllData();
    }, 100);
    
    return { user: demoUser };
  }
  
  return { user: null };
};

export const useStore = create<AppState>((set, get) => ({
  ...initializeStore(),
  customers: [],
  jobs: [],
  inventory: [],
  invoices: [],
  notifications: [],
  reorderRequests: [],
  loading: false,
  error: null,

  // Authentication functions
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting login...', { email });
      set({ loading: true, error: null });
      const response = await apiService.login({ email, password });
      console.log('🔑 Login response:', response);
      
      if (response.success) {
        const user = response.data.user;
        const token = response.data.token;
        
        console.log('✅ Login successful, storing user and loading data...');
        // Store user and token
        set({ user, loading: false });
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Load all data after successful login
        console.log('📊 Loading all data...');
        get().loadAllData();
        
        return true;
      } else {
        console.error('❌ Login failed:', response.error);
        set({ error: response.error || 'Login failed', loading: false });
        return false;
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      set({ error: 'Login failed. Please check your connection.', loading: false });
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, customers: [], jobs: [], inventory: [], invoices: [] });
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Data loading functions
  loadCustomers: async () => {
    try {
      console.log('🔄 Loading customers...');
      set({ loading: true, error: null });
      const response = await apiService.getCustomers();
      console.log('👥 Customers response:', response);
      if (response.success) {
        console.log('✅ Customers loaded:', response.data.length, 'customers');
        set({ customers: response.data, loading: false });
      } else {
        console.error('❌ Failed to load customers:', response.error);
        set({ error: 'Failed to load customers', loading: false });
      }
    } catch (error) {
      console.error('💥 Error loading customers:', error);
      set({ error: 'Failed to load customers', loading: false });
    }
  },

  loadJobs: async () => {
    try {
      console.log('🔄 Loading jobs...');
      set({ loading: true, error: null });
      const response = await apiService.getJobs();
      console.log('👷 Jobs response:', response);
      if (response.success) {
        console.log('✅ Jobs loaded:', response.data.length, 'jobs');
        set({ jobs: response.data, loading: false });
      } else {
        console.error('❌ Failed to load jobs:', response.error);
        set({ error: 'Failed to load jobs', loading: false });
      }
    } catch (error) {
      console.error('💥 Error loading jobs:', error);
      set({ error: 'Failed to load jobs', loading: false });
    }
  },

  loadInventory: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.getInventory();
      if (response.success) {
        set({ inventory: response.data, loading: false });
      } else {
        set({ error: 'Failed to load inventory', loading: false });
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      set({ error: 'Failed to load inventory', loading: false });
    }
  },

  loadInvoices: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.getInvoices();
      if (response.success) {
        set({ invoices: response.data, loading: false });
      } else {
        set({ error: 'Failed to load invoices', loading: false });
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      set({ error: 'Failed to load invoices', loading: false });
    }
  },

  loadAllData: async () => {
    console.log('🚀 Starting loadAllData...');
    const state = get();
    try {
      console.log('📝 Current state before loading:', {
        customers: state.customers?.length || 0,
        jobs: state.jobs?.length || 0,
        inventory: state.inventory?.length || 0,
        invoices: state.invoices?.length || 0
      });
      
      const results = await Promise.allSettled([
        state.loadCustomers(),
        state.loadJobs(), 
        state.loadInventory(),
        state.loadInvoices()
      ]);
      
      results.forEach((result, index) => {
        const names = ['customers', 'jobs', 'inventory', 'invoices'];
        if (result.status === 'rejected') {
          console.error(`❌ Failed to load ${names[index]}:`, result.reason);
        } else {
          console.log(`✅ Successfully loaded ${names[index]}`);
        }
      });
      
      // Get fresh state after loading
      const freshState = get();
      console.log('📊 Final data count after loading:', {
        customers: freshState.customers?.length || 0,
        jobs: freshState.jobs?.length || 0,
        inventory: freshState.inventory?.length || 0,
        invoices: freshState.invoices?.length || 0
      });
      
      // Make data available globally for debugging
      if (typeof window !== 'undefined') {
        (window as any).debugStore = freshState;
        console.log('🐛 Store data available as window.debugStore');
      }
    } catch (error) {
      console.error('💥 Error in loadAllData:', error);
    }
  },

  // Customer CRUD operations
  addCustomer: (customer) => {
    const state = get();
    set((prevState) => ({ 
      customers: [...prevState.customers, { ...customer, createdAt: new Date().toISOString() }] 
    }));
    
    const updatedState = get();
    // Create notification for all user actions (including admin for demo purposes)
    updatedState.addNotification({
      type: 'user',
      message: `${updatedState.user?.name} added new customer: ${customer.name}`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });
  },
  updateCustomer: (customerId, updates) => {
    const state = get();
    const customer = state.customers.find(c => c.id === customerId);
    set((prevState) => ({
      customers: prevState.customers.map(c => c.id === customerId ? { ...c, ...updates } : c)
    }));
    
    const updatedState = get();
    if (customer) {
      updatedState.addNotification({
        type: 'user',
        message: `${updatedState.user?.name} updated customer: ${customer.name}`,
        userId: updatedState.user?.id,
        userName: updatedState.user?.name
      });
    }
  },
  deleteCustomer: (customerId) => {
    const state = get();
    const customer = state.customers.find(c => c.id === customerId);
    set((prevState) => ({
      customers: prevState.customers.filter(c => c.id !== customerId),
      jobs: prevState.jobs.filter(j => j.customerId !== customerId),
      invoices: prevState.invoices.filter(i => i.customerId !== customerId)
    }));
    
    const updatedState = get();
    if (customer) {
      updatedState.addNotification({
        type: 'user',
        message: `${updatedState.user?.name} deleted customer: ${customer.name}`,
        userId: updatedState.user?.id,
        userName: updatedState.user?.name
      });
    }
  },

  // Job CRUD operations
  addJob: (job) => {
    const state = get();
    const customer = state.customers.find(c => c.id === job.customerId);
    
    set((prevState) => ({ 
      jobs: [...prevState.jobs, { ...job, createdAt: new Date().toISOString() }] 
    }));

    const updatedState = get();
    updatedState.addNotification({
      type: 'job',
      message: `New job created for ${customer?.name || 'customer'}: ${job.id}`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });

    // SMS notification disabled for static deployment
    if (customer && customer.phone) {
      console.log('📱 Would send SMS to:', customer.phone, 'for job:', job.id);
    }
  },
  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(j => j.id === jobId ? { ...j, ...updates } : j)
  })),
  updateJobStatus: (jobId, status) => {
    const state = get();
    const job = state.jobs.find(j => j.id === jobId);
    const customer = state.customers.find(c => c.id === job?.customerId);
    
    set((prevState) => ({
      jobs: prevState.jobs.map(j => j.id === jobId ? { ...j, status } : j)
    }));

    const updatedState = get();
    updatedState.addNotification({
      type: 'job',
      message: `Job #${jobId} status changed to ${status}`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });

    // SMS notification disabled for static deployment
    if (job && customer && customer.phone) {
      console.log('📱 Would send SMS status update to:', customer.phone, status);
    }
  },
  deleteJob: (jobId) => set((state) => ({
    jobs: state.jobs.filter(j => j.id !== jobId)
  })),

  // Inventory CRUD operations
  addInventory: (item) => {
    const state = get();
    set((prevState) => ({ 
      inventory: [...prevState.inventory, { ...item, createdAt: new Date().toISOString() }] 
    }));
    
    const updatedState = get();
    // Create notification for all user actions (including admin for demo purposes)
    updatedState.addNotification({
      type: 'inventory',
      message: `${updatedState.user?.name} added new inventory item: ${item.name}`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });
  },
  updateInventory: (itemId, updates) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    set((prevState) => ({
      inventory: prevState.inventory.map(i => i.id === itemId ? { ...i, ...updates } : i)
    }));
    
    const updatedState = get();
    if (item) {
      updatedState.addNotification({
        type: 'inventory',
        message: `${updatedState.user?.name} updated inventory item: ${item.name}`,
        userId: updatedState.user?.id,
        userName: updatedState.user?.name
      });
    }
  },
  updateInventoryStock: (itemId, newStock) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    set((prevState) => ({
      inventory: prevState.inventory.map(i => i.id === itemId ? { ...i, stock: newStock } : i)
    }));
    
    const updatedState = get();
    if (item) {
      updatedState.addNotification({
        type: 'inventory',
        message: `${updatedState.user?.name} updated stock for ${item.name}: ${newStock} units`,
        userId: updatedState.user?.id,
        userName: updatedState.user?.name
      });
    }
  },
  deleteInventory: (itemId) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    set((prevState) => ({
      inventory: prevState.inventory.filter(i => i.id !== itemId)
    }));
    
    const updatedState = get();
    if (item) {
      updatedState.addNotification({
        type: 'inventory',
        message: `${updatedState.user?.name} deleted inventory item: ${item.name}`,
        userId: updatedState.user?.id,
        userName: updatedState.user?.name
      });
    }
  },

  // Invoice CRUD operations
  addInvoice: (invoice) => set((state) => ({ 
    invoices: [...state.invoices, { ...invoice, date: new Date().toISOString() }] 
  })),
  updateInvoice: (invoiceId, updates) => set((state) => ({
    invoices: state.invoices.map(inv => inv.id === invoiceId ? { ...inv, ...updates } : inv)
  })),
  deleteInvoice: (invoiceId) => set((state) => ({
    invoices: state.invoices.filter(inv => inv.id !== invoiceId)
  })),
  recordPayment: (invoiceId, payment) => {
    const state = get();
    const invoice = state.invoices.find(inv => inv.id === invoiceId);
    const customer = state.customers.find(c => c.id === invoice?.customerId);
    
    set((prevState) => ({
      invoices: prevState.invoices.map(inv => {
        if (inv.id === invoiceId) {
          const newPayments = [...inv.payments, payment];
          const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
          const status = totalPaid >= inv.grandTotal ? InvoiceStatus.PAID : inv.status;
          return { ...inv, payments: newPayments, status };
        }
        return inv;
      })
    }));

    const updatedState = get();
    updatedState.addNotification({
      type: 'payment',
      message: `Payment of GH₵${payment.amount} received via ${payment.method} for invoice #${invoiceId}`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });
    
    // SMS notification disabled for static deployment
    if (customer && customer.phone) {
      console.log('📱 Would send payment confirmation SMS to:', customer.phone);
    }

  },

  // Notification Functions
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      time: new Date().toISOString(),
      unread: true
    };
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only last 50 notifications
    };
  }),

  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, unread: false } : n
    )
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, unread: false }))
  })),

  // Reorder Functions
  createReorderRequest: (itemId, quantity, notes) => {
    const state = get();
    const item = state.inventory.find(i => i.id === itemId);
    
    if (!item || !state.user) return;
    
    const reorderRequest: ReorderRequest = {
      id: `RO${Date.now()}`,
      itemId,
      itemName: item.name,
      currentStock: item.stock,
      requestedQuantity: quantity,
      requestedBy: state.user.name,
      requestedById: state.user.id,
      status: 'pending',
      requestDate: new Date().toISOString(),
      notes
    };
    
    set((prevState) => ({
      reorderRequests: [...prevState.reorderRequests, reorderRequest]
    }));
    
    const updatedState = get();
    updatedState.addNotification({
      type: 'reorder',
      message: `${updatedState.user?.name} requested reorder: ${item.name} (${quantity} units)`,
      userId: updatedState.user?.id,
      userName: updatedState.user?.name
    });
  },

  updateReorderStatus: (reorderId, status) => {
    const state = get();
    const reorder = state.reorderRequests.find(r => r.id === reorderId);
    
    set((prevState) => ({
      reorderRequests: prevState.reorderRequests.map(r => 
        r.id === reorderId ? { ...r, status } : r
      )
    }));
    
    const updatedState = get();
    if (reorder && updatedState.user) {
      updatedState.addNotification({
        type: 'reorder',
        message: `Reorder request for ${reorder.itemName} has been ${status}`,
        userId: updatedState.user.id,
        userName: updatedState.user.name
      });
    }
  }
}));
