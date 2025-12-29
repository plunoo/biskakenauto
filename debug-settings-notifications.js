import { chromium } from 'playwright';

async function debugSettingsNotifications() {
  console.log('⚙️ Debugging notification settings in admin settings...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newContext().then(ctx => ctx.newPage());
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('notification') || msg.text().includes('toggle')) {
      console.log(`🔍 ${msg.type()}: ${msg.text()}`);
    }
  });

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
    await page.waitForTimeout(1000);
    
    // Check current page URL
    console.log('📍 Current URL:', page.url());
    
    // Look for notification-related content
    console.log('🔍 Looking for notification settings...');
    
    // Check if we're on settings page
    const settingsTitle = await page.locator('h1:has-text("Settings"), h2:has-text("Settings")').count();
    console.log('⚙️ Settings page detected:', settingsTitle > 0);
    
    // Look for notification preferences section
    const notificationSection = await page.locator('h2:has-text("Notification Preferences"), h3:has-text("Notification")').count();
    console.log('🔔 Notification section found:', notificationSection > 0);
    
    // Look for toggle switches
    const toggles = await page.locator('.relative.inline-flex, [role="switch"], .toggle, .switch').count();
    console.log('🔘 Toggle switches found:', toggles);
    
    // Look for specific notification toggles mentioned in screenshot
    const emailNotificationToggle = await page.locator('text=Email Notifications').count();
    const smsNotificationToggle = await page.locator('text=Sms Notifications').count();
    const lowStockAlerts = await page.locator('text=Low Stock Alerts').count();
    const jobStatusUpdates = await page.locator('text=Job Status Updates').count();
    const paymentReminders = await page.locator('text=Payment Reminders').count();
    const weeklyReports = await page.locator('text=Weekly Reports').count();
    
    console.log('📊 Notification toggles found:');
    console.log('  - Email Notifications:', emailNotificationToggle > 0);
    console.log('  - SMS Notifications:', smsNotificationToggle > 0);
    console.log('  - Low Stock Alerts:', lowStockAlerts > 0);
    console.log('  - Job Status Updates:', jobStatusUpdates > 0);
    console.log('  - Payment Reminders:', paymentReminders > 0);
    console.log('  - Weekly Reports:', weeklyReports > 0);
    
    // Check toggle switch styling
    const blueToggles = await page.locator('.bg-blue-600').count();
    const grayToggles = await page.locator('.bg-gray-300').count();
    console.log('🎨 Toggle states:');
    console.log('  - Blue (ON) toggles:', blueToggles);
    console.log('  - Gray (OFF) toggles:', grayToggles);
    
    // Try to click on notification tab if it exists
    const notificationTab = await page.locator('button:has-text("Notifications"), [role="tab"]:has-text("Notification")').first();
    if (await notificationTab.count() > 0) {
      console.log('📋 Clicking notification tab...');
      await notificationTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Check for any error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500, text=error, text=Error').allTextContents();
    if (errorElements.length > 0) {
      console.log('❌ Error messages found:', errorElements);
    }
    
    // Check if toggles are functional - try clicking one
    const firstToggle = await page.locator('.relative.inline-flex').first();
    if (await firstToggle.count() > 0) {
      console.log('🔘 Testing toggle functionality...');
      await firstToggle.click();
      await page.waitForTimeout(500);
      
      // Check if state changed
      const blueTogglesAfter = await page.locator('.bg-blue-600').count();
      const grayTogglesAfter = await page.locator('.bg-gray-300').count();
      console.log('🔄 After toggle click:');
      console.log('  - Blue (ON) toggles:', blueTogglesAfter);
      console.log('  - Gray (OFF) toggles:', grayTogglesAfter);
      
      const stateChanged = (blueToggles !== blueTogglesAfter) || (grayToggles !== grayTogglesAfter);
      console.log('⚡ Toggle state changed:', stateChanged ? 'Yes' : 'No');
    }
    
    // Get the HTML of the notification settings section
    const notificationHTML = await page.locator('text=Notification Preferences').locator('..').innerHTML().catch(() => 'Not found');
    console.log('📄 Notification settings HTML preview:', notificationHTML.substring(0, 300));
    
    // Check for JavaScript errors or React errors
    const pageErrors = await page.evaluate(() => {
      const errors = window.console?.errors || [];
      return errors.length ? errors : 'No errors collected';
    });
    console.log('🐛 JavaScript errors:', pageErrors);
    
    await page.screenshot({ path: '/tmp/settings-notifications-debug.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/settings-notifications-debug.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: '/tmp/settings-error.png' });
  } finally {
    await browser.close();
    console.log('🏁 Settings notification debug completed!');
  }
}

debugSettingsNotifications();