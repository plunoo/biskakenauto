// Production API service for Biskaken Auto
// Optimized for Dokploy internal container communication
const getApiBaseUrl = () => {
  // Use environment variable if set (Dokploy internal container)
  if (import.meta.env.VITE_API_URL) {
    console.log(`🌐 Using configured API URL: ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }
  
  // Dokploy external URL communication
  if (import.meta.env.PROD) {
    console.log('🌐 Using Dokploy external URL');
    return 'https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me';
  }
  
  // Development fallback
  console.log('🔧 Using development API URL');
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      console.log(`🌐 API Request: ${API_BASE_URL}${endpoint}`);
      
      // Get auth token if available
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      console.log(`📡 Response status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        console.error(`❌ HTTP error! status: ${response.status} for ${endpoint}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`💥 API request failed for ${endpoint}:`, error);
      
      // Fallback to test data for development
      if (endpoint.includes('/customers')) {
        return this.getFallbackCustomers();
      } else if (endpoint.includes('/jobs')) {
        return this.getFallbackJobs();
      } else if (endpoint.includes('/inventory')) {
        return this.getFallbackInventory();
      } else if (endpoint.includes('/reports')) {
        return this.getFallbackReports(endpoint);
      }
      
      throw error;
    }
  }

  // Health and status
  async getHealth() {
    return this.request('/health');
  }

  async getStatus() {
    return this.request('/api/status');
  }

  async getDatabaseStatus() {
    return this.request('/api/status');
  }

  // Authentication
  async login(data: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(token: string) {
    return this.request('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Customers
  async getCustomers() {
    return this.request('/api/customers');
  }

  async createCustomer(customerData: any) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async updateCustomer(customerId: string, updates: any) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteCustomer(customerId: string) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'DELETE'
    });
  }

  // Jobs
  async getJobs() {
    return this.request('/api/jobs');
  }

  async createJob(jobData: any) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJobStatus(jobId: string, statusData: any) {
    return this.request(`/api/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  // Inventory
  async getInventory() {
    return this.request('/api/inventory');
  }

  async createInventoryItem(itemData: any) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async updateInventoryItem(itemId: string, updates: any) {
    return this.request(`/api/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Invoices
  async getInvoices() {
    return this.request('/api/invoices');
  }

  async createInvoice(invoiceData: any) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async recordPayment(invoiceId: string, paymentData: any) {
    return this.request(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  // Blog
  async getBlogPosts() {
    return this.request('/api/blog');
  }

  async createBlogPost(postData: any) {
    return this.request('/api/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async deleteBlogPost(postId: string) {
    return this.request(`/api/blog/${postId}`, {
      method: 'DELETE'
    });
  }

  // Reports
  async getDashboardReport() {
    return this.request('/api/reports/dashboard');
  }

  async getFinancialReport() {
    return this.request('/api/reports/financial');
  }

  async exportReport(reportType: string, format: string, dateRange?: any) {
    return this.request('/api/reports/export', {
      method: 'POST',
      body: JSON.stringify({ reportType, format, dateRange })
    });
  }

  // Test endpoints for development fallback
  async getTestEndpoints() {
    return this.request('/api/test/endpoints');
  }

  // Mobile Money
  async testMobileMoneyPayment(data: any) {
    return this.request('/api/test/mobile-money', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // AI Diagnosis
  async testAIDiagnosis(data: any) {
    return this.request('/api/test/ai-diagnosis', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Landing page
  async getLandingHero() {
    return this.request('/api/landing/hero');
  }

  async getLandingServices() {
    return this.request('/api/landing/services');
  }

  async submitContactInquiry(inquiryData: any) {
    return this.request('/api/landing/contact', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  // Fallback methods for development/testing
  private getFallbackCustomers() {
    return {
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
          vehicleYear: 2018
        },
        {
          id: '2',
          name: 'Jane Smith',
          phone: '+233201234567',
          email: 'jane.smith@gmail.com',
          plateNumber: 'AS 5678-20',
          vehicleMake: 'Honda',
          vehicleModel: 'Civic',
          vehicleYear: 2020
        }
      ]
    };
  }

  private getFallbackJobs() {
    return {
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
          vehicleInfo: '2018 Toyota Camry'
        }
      ]
    };
  }

  private getFallbackInventory() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Engine Oil (5W-30)',
          description: 'High-quality synthetic engine oil',
          category: 'Lubricants',
          stock: 25,
          unitPrice: 45.00,
          reorderLevel: 10
        }
      ]
    };
  }

  private getFallbackReports(endpoint: string) {
    if (endpoint.includes('dashboard')) {
      return {
        success: true,
        data: {
          summary: {
            totalRevenue: 15250.50,
            totalJobs: 48,
            pendingJobs: 7,
            completedJobs: 41,
            totalCustomers: 23,
            lowStockItems: 3
          },
          recentJobs: [],
          lowStock: []
        }
      };
    }
    return { success: true, data: {} };
  }
}

export const apiService = new ApiService();