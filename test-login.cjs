const { chromium } = require('playwright');

async function testLogin() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('login')) {
      console.log('🌐 REQUEST:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('login')) {
      console.log('📡 RESPONSE:', response.status(), response.url());
    }
  });
  
  try {
    console.log('🔍 Testing login at: https://biskakenaut-biskaken-gmgjnk-db3a89-168-231-117-165.traefik.me/login');
    
    // Navigate to login page
    await page.goto('https://biskakenaut-biskaken-gmgjnk-db3a89-168-231-117-165.traefik.me/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('📄 Page loaded, checking for login form...');
    
    // Check if login form exists
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    if (!emailInput || !passwordInput || !loginButton) {
      console.log('❌ Login form elements not found');
      console.log('Email input:', !!emailInput);
      console.log('Password input:', !!passwordInput);
      console.log('Login button:', !!loginButton);
      
      // Get page content to debug
      const content = await page.textContent('body');
      console.log('📝 Page content preview:', content.substring(0, 500));
      return;
    }
    
    console.log('✅ Login form found, attempting login...');
    
    // Fill in credentials
    await emailInput.fill('admin@biskaken-v3.com');
    await passwordInput.fill('admin123');
    
    console.log('🔐 Credentials filled, clicking login...');
    
    // Click login and wait for network activity
    await Promise.all([
      page.waitForResponse(response => response.url().includes('login') || response.url().includes('auth'), { timeout: 10000 }),
      loginButton.click()
    ]);
    
    // Wait a bit for any redirects
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('🌐 Current URL after login attempt:', currentUrl);
    
    // Check if redirected to dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login successful! Redirected to dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('❌ Login failed - still on login page');
      
      // Check for error messages
      const errorMessage = await page.$('.error, .alert, [class*="error"], [class*="alert"]');
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        console.log('🚨 Error message found:', errorText);
      }
    } else {
      console.log('❓ Unknown redirect:', currentUrl);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();