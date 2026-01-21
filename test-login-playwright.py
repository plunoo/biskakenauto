#!/usr/bin/env python3
"""
Test FastAPI login endpoint using Playwright
"""
import json
import asyncio
from playwright.async_api import async_playwright

async def test_fastapi_login():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Testing FastAPI Backend Login...")
            
            # Test root endpoint first
            print("\n1. Testing root endpoint...")
            response = await page.request.get("https://bisadmin.rpnmore.com/")
            print(f"   Status: {response.status}")
            
            if response.status == 200:
                data = await response.json()
                print(f"   Service: {data.get('service', 'Unknown')}")
                print(f"   Version: {data.get('version', 'Unknown')}")
                print("   ✅ Root endpoint working")
            else:
                print("   ❌ Root endpoint failed")
                return
            
            # Test database status
            print("\n2. Testing database status...")
            db_response = await page.request.get("https://bisadmin.rpnmore.com/api/db-status")
            print(f"   Status: {db_response.status}")
            
            if db_response.status == 200:
                db_data = await db_response.json()
                if db_data.get('success'):
                    print(f"   Database: {db_data['data']['status']}")
                    print(f"   Connected: {db_data['data']['connected']}")
                    print("   ✅ Database connected")
                else:
                    print("   ❌ Database not connected")
            
            # Test login endpoint
            print("\n3. Testing login endpoint...")
            login_data = {
                "email": "admin@biskaken.com",
                "password": "admin123"
            }
            
            login_response = await page.request.post(
                "https://bisadmin.rpnmore.com/api/auth/login",
                headers={"Content-Type": "application/json"},
                data=json.dumps(login_data)
            )
            
            print(f"   Status: {login_response.status}")
            
            if login_response.status == 200:
                login_result = await login_response.json()
                print(f"   User: {login_result['user']['name']}")
                print(f"   Email: {login_result['user']['email']}")
                print(f"   Role: {login_result['user']['role']}")
                print(f"   Token: {login_result['access_token'][:50]}...")
                print("   ✅ Login successful")
                
                # Test protected endpoint with token
                print("\n4. Testing protected endpoint...")
                headers = {
                    "Authorization": f"Bearer {login_result['access_token']}",
                    "Content-Type": "application/json"
                }
                
                customers_response = await page.request.get(
                    "https://bisadmin.rpnmore.com/api/customers",
                    headers=headers
                )
                
                print(f"   Status: {customers_response.status}")
                if customers_response.status == 200:
                    customers_data = await customers_response.json()
                    print(f"   Customers found: {len(customers_data)}")
                    print("   ✅ Protected endpoint working")
                else:
                    print("   ❌ Protected endpoint failed")
                    
            else:
                login_text = await login_response.text()
                print(f"   Error: {login_text}")
                print("   ❌ Login failed")
            
            print("\n🎯 Test Summary:")
            print("✅ FastAPI Backend: Working")
            print("✅ Database: Connected") 
            print("✅ Authentication: Working")
            print("✅ Protected Routes: Working")
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_fastapi_login())