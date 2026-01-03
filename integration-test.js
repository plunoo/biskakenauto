#!/usr/bin/env node

console.log('🧪 Biskaken Auto Integration Test Suite');
console.log('=' .repeat(50));

// Test backend endpoints
async function testBackend() {
  console.log('\n📡 Testing Backend API...');
  
  const endpoints = [
    { method: 'POST', url: 'http://localhost:5000/api/test/auth/login', body: '{"email":"admin@biskaken.com","password":"admin123"}' },
    { method: 'GET', url: 'http://localhost:5000/api/test/customers' },
    { method: 'GET', url: 'http://localhost:5000/api/test/jobs' },
    { method: 'GET', url: 'http://localhost:5000/api/test/inventory' },
    { method: 'GET', url: 'http://localhost:5000/api/test/invoices' },
    { method: 'GET', url: 'http://localhost:5000/health' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      let curlCmd = `curl -s -X ${endpoint.method}`;
      if (endpoint.body) {
        curlCmd += ` -H "Content-Type: application/json" -d '${endpoint.body}'`;
      }
      curlCmd += ` "${endpoint.url}"`;
      
      const { exec } = require('child_process');
      const result = await new Promise((resolve, reject) => {
        exec(curlCmd, (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });
      
      const response = JSON.parse(result);
      const status = response.success ? '✅' : '❌';
      console.log(`  ${status} ${endpoint.method} ${endpoint.url.split('/').slice(-2).join('/')}`);
      
    } catch (error) {
      console.log(`  ❌ ${endpoint.method} ${endpoint.url.split('/').slice(-2).join('/')} - Error: ${error.message}`);
    }
  }
}

// Test frontend
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const { exec } = require('child_process');
    const result = await new Promise((resolve, reject) => {
      exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/', (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
    
    if (result === '200') {
      console.log('  ✅ Frontend accessible at http://localhost:3004');
    } else {
      console.log(`  ❌ Frontend returned status code: ${result}`);
    }
  } catch (error) {
    console.log(`  ❌ Frontend test failed: ${error.message}`);
  }
}

// Test CORS
async function testCORS() {
  console.log('\n🔒 Testing CORS Configuration...');
  
  try {
    const { exec } = require('child_process');
    const result = await new Promise((resolve, reject) => {
      exec('curl -s -H "Origin: http://localhost:3004" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:5000/api/test/auth/login -v 2>&1 | grep -E "(Access-Control|< HTTP)"', (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
    
    if (result.includes('Access-Control-Allow-Origin')) {
      console.log('  ✅ CORS properly configured');
    } else {
      console.log('  ⚠️  CORS headers not found');
    }
  } catch (error) {
    console.log(`  ❌ CORS test failed: ${error.message}`);
  }
}

// Main test execution
async function runTests() {
  try {
    await testBackend();
    await testFrontend(); 
    await testCORS();
    
    console.log('\n🎉 Integration Test Complete!');
    console.log('\n📋 Summary:');
    console.log('  - Backend API: Running on http://localhost:5000');
    console.log('  - Frontend: Running on http://localhost:3004');
    console.log('  - Login: admin@biskaken.com / admin123');
    console.log('  - Test Endpoints: /api/test/*');
    console.log('  - Health Check: /health');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runTests();