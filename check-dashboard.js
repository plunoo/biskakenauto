const { chromium } = require('playwright');

async function checkDashboard() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  try {
    const urls = [
      'https://biskakenaut-biskaken-gmgjnk-d4a684-168-231-117-165.traefik.me/',
      'http://biskakenaut-biskaken-gmgjnk-d4a684-168-231-117-165.traefik.me/'
    ];
    
    for (const url of urls) {
      console.log(`🔍 Checking admin dashboard at: ${url}`);
      
      try {
        // Navigate to the URL
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
    
    console.log(`📊 Response status: ${response.status()}`);
    console.log(`📊 Response headers:`, response.headers());
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Get page content
    const content = await page.content();
    console.log(`📝 Page HTML length: ${content.length} characters`);
    
    // Check if it's JSON response (API) or HTML (frontend)
    const bodyText = await page.evaluate(() => document.body.textContent || document.body.innerText);
    
    if (bodyText.includes('Biskaken Auto API') || bodyText.includes('"success":true')) {
      console.log('🔴 ISSUE FOUND: This URL is serving the API, not the admin dashboard!');
      console.log('📊 API Response:', bodyText.substring(0, 500) + '...');
      
      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(bodyText);
        console.log('✅ Confirmed: This is the API endpoint returning JSON data');
        console.log('🔍 API Info:', {
          service: jsonData.service,
          version: jsonData.version,
          message: jsonData.message
        });
      } catch (e) {
        console.log('⚠️  Could not parse as JSON, but appears to be API content');
      }
    } else if (title.includes('Biskaken') || bodyText.includes('dashboard') || bodyText.includes('admin')) {
      console.log('✅ This appears to be the admin dashboard');
      console.log('📄 Content preview:', bodyText.substring(0, 200) + '...');
    } else {
      console.log('❓ Unknown content type');
      console.log('📄 Content preview:', bodyText.substring(0, 200) + '...');
    }
    
    // Check for React root element
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      console.log('⚛️  React root element found - this should be the admin dashboard');
    } else {
      console.log('🔴 No React root element found - this is likely the API, not the admin dashboard');
    }
    
    // Check for specific dashboard elements
    const loginForm = await page.$('input[type="email"], input[type="password"]');
    const dashboardElements = await page.$$('[class*="dashboard"], [class*="admin"], [class*="sidebar"]');
    
    if (loginForm) {
      console.log('🔐 Login form found - this appears to be the admin dashboard login page');
    } else if (dashboardElements.length > 0) {
      console.log('📊 Dashboard elements found');
    } else {
      console.log('🔴 No admin dashboard UI elements found');
    }
    
    break; // Exit loop on successful connection
    
      } catch (error) {
        console.error(`❌ Error with ${url}:`, error.message);
        if (url === urls[urls.length - 1]) {
          throw error; // Re-throw on last URL
        }
      }
    }
    
  } catch (error) {
    console.error('❌ All URLs failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkDashboard();