#!/usr/bin/env node

const http = require('http');

const BASE = 'localhost:8000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            error: 'Parse error'
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, method, path, body) {
  try {
    const res = await request(method, path, body);
    const pass = res.status >= 200 && res.status < 300;
    const status = pass ? '✅' : '❌';
    console.log(`${status} ${name}`);
    console.log(`   Status: ${res.status}`);
    if (!pass && res.body?.message) console.log(`   Message: ${res.body.message}`);
    return pass;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('\n=== COMPREHENSIVE API TEST ===\n');
  let passed = 0;
  let total = 0;

  // Test 1: Health Check
  total++;
  if (await test('1. Health Check', 'GET', '/health')) passed++;

  // Test 2: Get Public Deals
  total++;
  if (await test('2. Get Public Deals', 'GET', '/deals')) passed++;

  // Test 3: User Registration
  total++;
  const regBody = {
    email: 'testuser' + Date.now() + '@example.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User'
  };
  if (await test('3. User Registration', 'POST', '/auth/register', regBody)) {
    passed++;
    
    // Test 4: User Login (using same credentials)
    total++;
    const loginBody = {
      email: regBody.email,
      password: regBody.password
    };
    if (await test('4. User Login', 'POST', '/auth/login', loginBody)) {
      passed++;
    }
  }

  // Test 5: Create Deal (requires admin or auth)
  total++;
  const dealBody = {
    title: 'Test Deal',
    slug: 'test-deal-' + Date.now(),
    description: 'Test description',
    shortDescription: 'Test',
    originalPrice: 1000,
    discountedPrice: 500,
    currency: 'USD',
    category: 'Cloud',
    saasTool: 'TestTool',
    dealDuration: '1 Year',
    partnerName: 'Test Partner',
    partnerWebsite: 'https://test.com'
  };
  if (await test('5. Create Deal', 'POST', '/deals', dealBody)) passed++;

  console.log(`\n=== RESULTS ===`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success rate: ${Math.round(passed/total*100)}%\n`);
  
  process.exit(passed === total ? 0 : 1);
}

// Wait for server
setTimeout(run, 2000);
