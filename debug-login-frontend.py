#!/usr/bin/env python3
"""
Debug Frontend Login - Check API calls and responses
"""
import asyncio
from playwright.async_api import async_playwright

async def debug_frontend_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=['--ignore-certificate-errors'])
        context = await browser.new_context(ignore_https_errors=True)
        page = await context.new_page()
        
        # Track network requests
        requests = []
        responses = []
        
        def handle_request(request):
            requests.append(f"{request.method} {request.url}")
            print(f"🔵 REQUEST: {request.method} {request.url}")
        
        def handle_response(response):
            responses.append(f"{response.status} {response.url}")
            print(f"🟢 RESPONSE: {response.status} {response.url}")
        
        page.on("request", handle_request)
        page.on("response", handle_response)
        
        try:
            print("🔍 Debugging Frontend Login...")
            
            # Navigate to login
            await page.goto("https://bis-test-biskakenfrontend-bjsqjz-30a840-168-231-117-165.traefik.me/login")
            await page.wait_for_load_state('networkidle')
            
            # Fill form
            await page.fill('input[type="email"], input[name="email"]', "admin@biskaken.com")
            await page.fill('input[type="password"]', "admin123")
            
            print("\n📡 Clicking login button and monitoring API calls...")
            
            # Click login and wait for network activity
            await page.click('button[type="submit"], button:has-text("Login")')
            
            # Wait for potential API calls
            await page.wait_for_timeout(5000)
            
            print(f"\n📊 Network Summary:")
            print(f"   Requests made: {len(requests)}")
            print(f"   Responses received: {len(responses)}")
            
            # Look for API calls to our backend
            api_calls = [req for req in requests if 'bisadmin.rpnmore.com' in req or '/api/' in req]
            if api_calls:
                print(f"   ✅ Found API calls: {api_calls}")
            else:
                print(f"   ❌ No API calls to backend found")
                print("   🔍 This might mean frontend is not configured to use the new backend")
            
            # Check current page state
            current_url = page.url
            page_title = await page.title()
            print(f"\n📍 Current State:")
            print(f"   URL: {current_url}")
            print(f"   Title: {page_title}")
            
            # Look for any error messages
            error_selectors = [
                '.error', '.alert-danger', '[role="alert"]', 
                '.text-red-500', '.text-red-600', '.bg-red-100'
            ]
            
            for selector in error_selectors:
                error_element = await page.query_selector(selector)
                if error_element:
                    error_text = await error_element.text_content()
                    if error_text.strip():
                        print(f"   ❌ Error found: {error_text}")
            
            # Keep browser open longer for manual inspection
            print("\n⏳ Keeping browser open for 20 seconds for manual inspection...")
            await page.wait_for_timeout(20000)
            
        except Exception as e:
            print(f"❌ Debug failed: {e}")
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_frontend_login())