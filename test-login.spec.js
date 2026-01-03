const { test, expect } = require('@playwright/test');

test('Test Biskaken Auto login functionality', async ({ page }) => {
  console.log('🧪 Starting login test for https://biskakenauto.rpnmore.com/login');
  
  // Listen to console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Error:', msg.text());
    } else {
      console.log('📝 Browser Log:', msg.text());
    }
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('🌐 API Request:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('📡 API Response:', response.status(), response.url());
    }
  });
  
  // Navigate to the login page
  console.log('🔍 Navigating to login page...');
  await page.goto('https://biskakenauto.rpnmore.com/login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('✅ Page loaded');
  
  // Take screenshot of login page
  await page.screenshot({ path: 'login-page.png', fullPage: true });
  console.log('📸 Screenshot saved: login-page.png');
  
  // Check if demo credentials box is visible
  const demoCredentials = page.locator('text=Demo Credentials:');
  await expect(demoCredentials).toBeVisible();
  console.log('✅ Demo credentials box visible');
  
  // Fill in the login form
  console.log('📝 Filling login form...');
  await page.fill('input[type="email"]', 'admin@biskaken.com');
  await page.fill('input[type="password"]', 'admin123');
  
  // Take screenshot before clicking login
  await page.screenshot({ path: 'login-filled.png', fullPage: true });
  console.log('📸 Screenshot saved: login-filled.png');
  
  // Click the login button
  console.log('🔑 Clicking login button...');
  await page.click('button[type="submit"]');
  
  // Wait for navigation or error message
  await page.waitForTimeout(5000);
  
  // Take screenshot after login attempt
  await page.screenshot({ path: 'login-result.png', fullPage: true });
  console.log('📸 Screenshot saved: login-result.png');
  
  // Check current URL to see if login was successful
  const currentUrl = page.url();
  console.log('🔗 Current URL after login:', currentUrl);
  
  // Check if we're redirected to dashboard or if there's an error
  if (currentUrl.includes('/dashboard')) {
    console.log('✅ Login successful - redirected to dashboard');
  } else {
    console.log('❌ Login may have failed - still on login page or other page');
    
    // Check for any error messages or alerts
    try {
      const alertText = await page.locator('.alert, [role="alert"], text*="failed"').first().textContent({ timeout: 1000 });
      console.log('⚠️ Alert/Error message:', alertText);
    } catch (e) {
      console.log('ℹ️ No error message found on page');
    }
  }
  
  // Get page title
  const title = await page.title();
  console.log('📄 Page title:', title);
});