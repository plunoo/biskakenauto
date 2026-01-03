import { test, expect } from '@playwright/test';

test.describe('Full Integration Test - Fixed Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Go to login page
    await page.goto('http://localhost:3004/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should successfully login and navigate to dashboard with data loading', async ({ page }) => {
    console.log('🧪 Testing complete login flow with data loading...');
    
    // Login
    await page.fill('input[type="email"]', 'admin@biskaken.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('button:has-text("Sign In")')
    ]);
    
    console.log('✅ Login successful, now on dashboard');
    
    // Wait for data to load (check for summary stats)
    await page.waitForSelector('.bg-white', { timeout: 10000 });
    
    // Verify dashboard content is loaded
    const dashboardContent = await page.textContent('body');
    expect(dashboardContent).toContain('Dashboard');
    
    console.log('✅ Dashboard loaded with content');
    
    // Test navigation to different pages
    const pages = [
      { name: 'Jobs', url: '/jobs' },
      { name: 'Customers', url: '/customers' },
      { name: 'Inventory', url: '/inventory' },
      { name: 'Invoices', url: '/invoices' },
      { name: 'Reports', url: '/reports' }
    ];
    
    for (const pageTest of pages) {
      console.log(`🔍 Testing ${pageTest.name} page...`);
      
      // Navigate to page
      await page.click(`a[href="${pageTest.url}"]`);
      await page.waitForURL(`**${pageTest.url}`);
      
      // Wait for page to load
      await page.waitForSelector('.bg-white', { timeout: 5000 });
      
      // Verify page content
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain(pageTest.name);
      
      console.log(`✅ ${pageTest.name} page loaded successfully`);
    }
    
    console.log('🎉 All integration tests passed!');
  });

  test('should handle session persistence on page refresh', async ({ page }) => {
    console.log('🧪 Testing session persistence...');
    
    // Login first
    await page.fill('input[type="email"]', 'admin@biskaken.com');
    await page.fill('input[type="password"]', 'admin123');
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.click('button:has-text("Sign In")')
    ]);
    
    console.log('✅ Initial login successful');
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on dashboard (session restored)
    expect(page.url()).toContain('/dashboard');
    
    console.log('✅ Session persistence working');
  });

  test('should verify API endpoints are working', async ({ page }) => {
    console.log('🧪 Testing API endpoints...');
    
    const endpoints = [
      '/api/test/auth/login',
      '/api/test/customers',
      '/api/test/jobs',
      '/api/test/inventory',
      '/api/test/invoices'
    ];
    
    for (const endpoint of endpoints) {
      const response = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url);
          return { status: res.status, ok: res.ok };
        } catch (error) {
          return { error: error.message };
        }
      }, `http://localhost:5000${endpoint}`);
      
      console.log(`📡 ${endpoint}: Status ${response.status}`);
      
      if (endpoint.includes('/auth/login')) {
        // POST endpoint needs data
        continue;
      } else {
        expect(response.ok).toBeTruthy();
      }
    }
    
    console.log('✅ All API endpoints responding');
  });
});