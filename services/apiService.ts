// API service to connect frontend with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      console.log(`🌐 API Request: ${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
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

  // Authentication endpoints
  async login(data: { email: string; password: string }) {
    // Try admin login first (for environment-based admin access)
    try {
      console.log('🔐 Trying admin login...');
      const adminResponse = await this.request('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('✅ Admin login successful');
      return adminResponse;
    } catch (adminError) {
      console.log('⏭️ Admin login failed, trying production login...');
      
      // Try production login
      try {
        const prodResponse = await this.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        console.log('✅ Production login successful');
        return prodResponse;
      } catch (prodError) {
        console.log('⏭️ Production login failed, falling back to test login...');
        
        // Fallback to test endpoint
        return this.request('/api/test/auth/login', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    }
  }

  async getCurrentUser(token: string) {
    return this.request('/api/test/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Data endpoints
  async getCustomers() {
    return this.request('/api/test/customers');
  }

  async getInventory() {
    return this.request('/api/test/inventory');
  }

  async getJobs() {
    return this.request('/api/test/jobs');
  }

  async getInvoices() {
    return this.request('/api/test/invoices');
  }

  async testAuth(data: { email: string; password: string }) {
    return this.request('/api/auth/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Mobile Money Payment Testing
  async testMobileMoneyPayment(data: {
    phone: string;
    amount: number;
    provider?: 'mtn' | 'vodafone' | 'tigo';
  }) {
    return this.request('/api/test/mobile-money', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Diagnosis Testing
  async testAIDiagnosis(data: {
    complaint: string;
    vehicleInfo?: {
      make?: string;
      model?: string;
      year?: number;
    };
  }) {
    return this.request('/api/test/ai-diagnosis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all available endpoints
  async getTestEndpoints() {
    return this.request('/api/test/endpoints');
  }

  // Blog Management API
  async getBlogPosts() {
    return this.request('/api/test/blog');
  }

  async getBlogPost(id: string) {
    return this.request(`/api/test/blog/${id}`);
  }

  async createBlogPost(postData: any) {
    return this.request('/api/test/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async updateBlogPost(postId: string, updates: any) {
    return this.request(`/api/test/blog/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteBlogPost(postId: string) {
    return this.request(`/api/test/blog/${postId}`, {
      method: 'DELETE'
    });
  }

  async updateBlogPostStatus(postId: string, status: string) {
    return this.request(`/api/test/blog/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // User Management API
  async getUsers() {
    return this.request('/api/test/users');
  }

  async createUser(userData: any) {
    return this.request('/api/test/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request(`/api/test/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/test/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async resetUserPassword(userId: string) {
    return this.request(`/api/test/users/${userId}/reset-password`, {
      method: 'POST'
    });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request(`/api/test/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Security Management API
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/test/security/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getLoginHistory() {
    return this.request('/api/test/security/login-history');
  }

  async getActiveSessions() {
    return this.request('/api/test/security/active-sessions');
  }

  async terminateSession(sessionId: string) {
    return this.request(`/api/test/security/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  async enable2FA() {
    return this.request('/api/test/security/enable-2fa', {
      method: 'POST'
    });
  }

  // Report Management API
  async getDashboardReport() {
    return this.request('/api/test/reports/dashboard');
  }

  async getFinancialReport() {
    return this.request('/api/test/reports/financial');
  }

  async exportReport(reportType: string, format: string, dateRange?: {startDate: string, endDate: string}) {
    return this.request('/api/test/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        reportType,
        format,
        dateRange
      })
    });
  }

  // Invoice Management API
  async createInvoice(invoiceData: any) {
    return this.request('/api/test/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateInvoice(invoiceId: string, updates: any) {
    return this.request(`/api/test/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async recordPayment(invoiceId: string, paymentData: any) {
    return this.request(`/api/test/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async exportInvoice(invoiceId: string, format: string = 'pdf') {
    return this.request(`/api/test/invoices/${invoiceId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format })
    });
  }

  async emailInvoice(emailData: any) {
    return this.request('/api/test/invoices/email', {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  // Job Management API with SMS
  async createJob(jobData: any) {
    return this.request('/api/test/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJobStatus(jobId: string, statusData: any) {
    return this.request(`/api/test/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  // SMS API
  async sendSMS(smsData: any) {
    return this.request('/api/test/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData)
    });
  }

  // Landing Page API
  async getLandingHero() {
    return this.request('/api/test/landing/hero');
  }

  async getLandingServices() {
    return this.request('/api/test/landing/services');
  }

  async getLandingTestimonials() {
    return this.request('/api/test/landing/testimonials');
  }

  async getLandingContact() {
    return this.request('/api/test/landing/contact');
  }

  async submitContactInquiry(inquiryData: any) {
    return this.request('/api/test/landing/contact', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  async getLandingBlog() {
    return this.request('/api/test/landing/blog');
  }

}

export const apiService = new ApiService();
export default apiService;