// Production API service to connect frontend with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://biskakenauto.rpnmore.com';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
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
    return this.request('/api/database/status');
  }

  // Authentication endpoints
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

  // Data endpoints
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

  async deleteInventoryItem(itemId: string) {
    return this.request(`/api/inventory/${itemId}`, {
      method: 'DELETE'
    });
  }

  async getJobs() {
    return this.request('/api/jobs');
  }

  async createJob(jobData: any) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJob(jobId: string, updates: any) {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async updateJobStatus(jobId: string, statusData: any) {
    return this.request(`/api/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async deleteJob(jobId: string) {
    return this.request(`/api/jobs/${jobId}`, {
      method: 'DELETE'
    });
  }

  async getInvoices() {
    return this.request('/api/invoices');
  }

  async createInvoice(invoiceData: any) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateInvoice(invoiceId: string, updates: any) {
    return this.request(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async recordPayment(invoiceId: string, paymentData: any) {
    return this.request(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async exportInvoice(invoiceId: string, format: string = 'pdf') {
    return this.request(`/api/invoices/${invoiceId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format })
    });
  }

  async emailInvoice(emailData: any) {
    return this.request('/api/invoices/email', {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  // Blog Management API
  async getBlogPosts() {
    return this.request('/api/blog');
  }

  async getBlogPost(id: string) {
    return this.request(`/api/blog/${id}`);
  }

  async createBlogPost(postData: any) {
    return this.request('/api/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async updateBlogPost(postId: string, updates: any) {
    return this.request(`/api/blog/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteBlogPost(postId: string) {
    return this.request(`/api/blog/${postId}`, {
      method: 'DELETE'
    });
  }

  async updateBlogPostStatus(postId: string, status: string) {
    return this.request(`/api/blog/${postId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // User Management API
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(userData: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId: string, updates: any) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async resetUserPassword(userId: string) {
    return this.request(`/api/users/${userId}/reset-password`, {
      method: 'POST'
    });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request(`/api/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Security Management API
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/security/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async getLoginHistory() {
    return this.request('/api/security/login-history');
  }

  async getActiveSessions() {
    return this.request('/api/security/active-sessions');
  }

  async terminateSession(sessionId: string) {
    return this.request(`/api/security/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  async enable2FA() {
    return this.request('/api/security/enable-2fa', {
      method: 'POST'
    });
  }

  // Report Management API
  async getDashboardReport() {
    return this.request('/api/reports/dashboard');
  }

  async getFinancialReport() {
    return this.request('/api/reports/financial');
  }

  async exportReport(reportType: string, format: string, dateRange?: {startDate: string, endDate: string}) {
    return this.request('/api/reports/export', {
      method: 'POST',
      body: JSON.stringify({
        reportType,
        format,
        dateRange
      })
    });
  }

  // Payment Testing
  async testMobileMoneyPayment(data: {
    phone: string;
    amount: number;
    provider?: 'mtn' | 'vodafone' | 'tigo';
  }) {
    return this.request('/api/payments/mobile-money', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Diagnosis
  async testAIDiagnosis(data: {
    complaint: string;
    vehicleInfo?: {
      make?: string;
      model?: string;
      year?: number;
    };
  }) {
    return this.request('/api/ai/diagnosis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SMS API
  async sendSMS(smsData: any) {
    return this.request('/api/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData)
    });
  }
}

export const apiService = new ApiService();
export default apiService;