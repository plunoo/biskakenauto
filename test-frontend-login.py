#!/usr/bin/env python3
"""
Test Frontend Admin Login using Playwright
"""
import asyncio
from playwright.async_api import async_playwright

async def test_frontend_login():
    async with async_playwright() as p:
        # Launch browser with SSL bypass
        browser = await p.chromium.launch(headless=False, args=['--ignore-certificate-errors'])
        context = await browser.new_context(ignore_https_errors=True)
        page = await context.new_page()
        
        try:
            print("🚀 Testing Frontend Admin Login...")
            
            # Navigate to login page
            print("\n1. Navigating to login page...")
            frontend_url = "https://bis-test-biskakenfrontend-bjsqjz-30a840-168-231-117-165.traefik.me/login"
            await page.goto(frontend_url, wait_until='domcontentloaded', timeout=30000)
            
            print(f"   URL: {frontend_url}")
            print(f"   Title: {await page.title()}")
            
            # Wait a bit for page to load
            await page.wait_for_timeout(2000)
            
            # Check if login form exists
            print("\n2. Looking for login form...")
            
            # Look for common login form elements
            email_input = await page.query_selector('input[type="email"], input[name="email"], input[placeholder*="email" i]')
            password_input = await page.query_selector('input[type="password"], input[name="password"]')
            login_button = await page.query_selector('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')
            
            if email_input and password_input:
                print("   ✅ Found email and password fields")
                
                # Fill in credentials
                print("\n3. Filling login form...")
                await email_input.fill("admin@biskaken.com")
                await password_input.fill("admin123")
                print("   ✅ Filled credentials: admin@biskaken.com / admin123")
                
                if login_button:
                    print("\n4. Clicking login button...")
                    await login_button.click()
                    
                    # Wait for navigation or response
                    await page.wait_for_timeout(3000)
                    
                    current_url = page.url
                    print(f"   Current URL: {current_url}")
                    
                    # Check if redirected to dashboard
                    if '/dashboard' in current_url or '/admin' in current_url:
                        print("   ✅ Login successful - redirected to dashboard")
                    else:
                        print("   ⏳ Checking for login success indicators...")
                        
                        # Look for success indicators
                        success_indicators = await page.query_selector_all(
                            'text="Dashboard", text="Welcome", text="Admin", [data-testid="dashboard"]'
                        )
                        
                        if success_indicators:
                            print("   ✅ Login appears successful")
                        else:
                            # Check for error messages
                            error_msg = await page.query_selector('.error, .alert-danger, [role="alert"]')
                            if error_msg:
                                error_text = await error_msg.text_content()
                                print(f"   ❌ Login error: {error_text}")
                            else:
                                print("   ⚠️ Login status unclear")
                else:
                    print("   ❌ No login button found")
            else:
                print("   ❌ Login form not found")
                
                # Take screenshot for debugging
                await page.screenshot(path="login-page-debug.png")
                print("   📸 Screenshot saved as login-page-debug.png")
                
                # Print page content for debugging
                content = await page.content()
                if 'login' in content.lower() or 'sign in' in content.lower():
                    print("   📋 Page contains login-related content")
                else:
                    print("   📋 Page may not be a login page")
            
            # Keep browser open for manual inspection
            print("\n5. Browser will stay open for 10 seconds for manual inspection...")
            await page.wait_for_timeout(10000)
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            await page.screenshot(path="error-screenshot.png")
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_frontend_login())