#!/usr/bin/env node
/**
 * API Testing Script - SAAS Vendor Backend
 * Tests all major endpoints with comprehensive examples
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000/api';

// Helper to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   SAAS VENDOR - API Testing Suite          ║');
  console.log('╚════════════════════════════════════════════╝\n');

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Health Check
    console.log('📋 Test 1: Health Check');
    console.log('─'.repeat(50));
    let res = await makeRequest('GET', '/health');
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.body, null, 2)}`);
    if (res.status === 200) {
      console.log('✅ PASSED\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED\n');
      testsFailed++;
    }

    // Test 2: User Registration
    console.log('📋 Test 2: User Registration');
    console.log('─'.repeat(50));
    const userData = {
      email: 'testuser@example.com',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };
    console.log(`Request: POST /auth/register`);
    console.log(`Body: ${JSON.stringify(userData, null, 2)}`);
    res = await makeRequest('POST', '/auth/register', userData);
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.body, null, 2)}`);
    if (res.status === 201 || res.status === 200) {
      console.log('✅ PASSED\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED\n');
      testsFailed++;
    }

    // Test 3: User Login
    console.log('📋 Test 3: User Login');
    console.log('─'.repeat(50));
    const loginData = {
      email: 'testuser@example.com',
      password: 'SecurePassword123!',
    };
    console.log(`Request: POST /auth/login`);
    console.log(`Body: ${JSON.stringify(loginData, null, 2)}`);
    res = await makeRequest('POST', '/auth/login', loginData);
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.body, null, 2)}`);
    if (res.status === 200) {
      console.log('✅ PASSED\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED\n');
      testsFailed++;
    }

    // Test 4: Get Public Deals
    console.log('📋 Test 4: Get Public Deals');
    console.log('─'.repeat(50));
    console.log(`Request: GET /deals`);
    res = await makeRequest('GET', '/deals');
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(res.body, null, 2)}`);
    if (res.status === 200) {
      console.log('✅ PASSED\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED\n');
      testsFailed++;
    }

    // Summary
    console.log('═'.repeat(50));
    console.log('📊 Test Summary');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Total: ${testsPassed + testsFailed}\n`);

    if (testsFailed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log(`⚠️  ${testsFailed} test(s) failed\n`);
    }
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

runTests();
