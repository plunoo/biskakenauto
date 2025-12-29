import { chromium } from 'playwright';

async function debugNotificationsTab() {
  console.log('🔔 Debugging notifications tab specifically...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // Capture all console messages
  page.on('console', msg => console.log(`📱 ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`💥 Page Error: ${error.message}`));
  
  try {
    // Login as admin
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('🔐 Logging in as admin...');
    await page.fill('input[type="email"]', 'admin@biskaken.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to settings
    console.log('⚙️ Navigating to settings...');
    await page.click('a[href="#/settings"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check what tabs are available
    const tabButtons = await page.locator('nav button').all();
    console.log('📋 Available tabs:', tabButtons.length);
    
    for (let i = 0; i < tabButtons.length; i++) {
      const tabText = await tabButtons[i].textContent();
      console.log(`  Tab ${i}: ${tabText}`);
    }
    
    // Find and click notifications tab
    const notificationsTab = await page.locator('button:has-text("Notifications")');
    const notifTabCount = await notificationsTab.count();
    console.log('🔔 Notifications tab found:', notifTabCount > 0);
    
    if (notifTabCount > 0) {
      console.log('👆 Clicking notifications tab...');
      await notificationsTab.click();
      await page.waitForTimeout(1000);
      
      // Check if notification preferences section appears
      const notificationPrefs = await page.locator('h2:has-text("Notification Preferences")');
      const prefsVisible = await notificationPrefs.count();
      console.log('🔔 Notification Preferences section visible:', prefsVisible > 0);
      
      // Check for specific notification toggles
      const emailToggle = await page.locator('text=Email Notifications').count();
      const smsToggle = await page.locator('text=Sms Notifications').count();
      const stockAlerts = await page.locator('text=Low Stock Alerts').count();
      
      console.log('📊 Individual notification settings:');
      console.log('  - Email Notifications:', emailToggle > 0);
      console.log('  - SMS Notifications:', smsToggle > 0);  
      console.log('  - Low Stock Alerts:', stockAlerts > 0);
      
      // Check for toggle switches
      const toggleSwitches = await page.locator('.relative.inline-flex').count();
      console.log('🔘 Toggle switches found:', toggleSwitches);
      
      // Get the HTML content of the main content area
      const mainContent = await page.locator('.flex-1.overflow-auto.p-8').innerHTML();
      console.log('📄 Main content preview (first 500 chars):', mainContent.substring(0, 500));
      
      // Take screenshot
      await page.screenshot({ path: '/tmp/notifications-tab-debug.png', fullPage: true });
      console.log('📸 Screenshot saved to /tmp/notifications-tab-debug.png');
      
    } else {
      console.log('❌ Notifications tab not found!');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: '/tmp/notifications-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 Notifications tab debug completed!');
  }
}

debugNotificationsTab();