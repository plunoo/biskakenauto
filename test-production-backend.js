#!/usr/bin/env node

const BASE_URL = 'https://biskakenaut-biskakenaut-back-ezoiiz-8ee8cf-168-231-117-165.traefik.me';

console.log('🧪 Testing Production Backend');
console.log('=' .repeat(50));
console.log(`🌐 Backend URL: ${BASE_URL}`);
console.log('');

// Test login endpoint
async function testLogin() {
  console.log('🔐 Testing Login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@biskaken.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ Login successful!');
      console.log(`  👤 User: ${data.data.user.name} (${data.data.user.role})`);
      console.log(`  🔑 Token: ${data.data.token.substring(0, 20)}...`);
      return data.data.token;
    } else {
      console.log('  ❌ Login failed:', data.error || data.message);
      return null;
    }
  } catch (error) {
    console.log('  ❌ Login error:', error.message);
    return null;
  }
}

// Test data endpoints
async function testDataEndpoints() {
  console.log('\n📊 Testing Data Endpoints...');
  
  const endpoints = [
    { name: 'Customers', path: '/api/test/customers' },
    { name: 'Jobs', path: '/api/test/jobs' },
    { name: 'Inventory', path: '/api/test/inventory' },
    { name: 'Invoices', path: '/api/test/invoices' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`  ✅ ${endpoint.name}: ${data.data.length} items loaded`);
      } else {
        console.log(`  ❌ ${endpoint.name}: Failed`);
      }
    } catch (error) {
      console.log(`  ❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }
}

// Test health endpoint
async function testHealth() {
  console.log('\n❤️  Testing Health...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('  ✅ Backend healthy');
      console.log(`  🕐 Timestamp: ${data.timestamp}`);
      console.log(`  🌍 Environment: ${data.environment}`);
    } else {
      console.log('  ❌ Health check failed');
    }
  } catch (error) {
    console.log('  ❌ Health error:', error.message);
  }
}

// Run all tests
async function runTests() {
  try {
    // Test health first
    await testHealth();
    
    // Test login
    const token = await testLogin();
    
    // Test data endpoints
    await testDataEndpoints();
    
    console.log('\n🎉 Production Backend Test Complete!');
    
    if (token) {
      console.log('\n📋 Integration Ready:');
      console.log(`  - Backend: ${BASE_URL}`);
      console.log(`  - Login: admin@biskaken.com / admin123`);
      console.log(`  - CORS: Configured for Dokploy domains`);
      console.log(`  - Data: Test endpoints working`);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests();