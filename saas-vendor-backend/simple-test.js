#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:8000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
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
            body: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\nTesting API Endpoints\n');

  try {
    // Test 1: Health
    console.log('1. Health Check');
    let res = await makeRequest('GET', '/health');
    console.log('   Status:', res.status);
    console.log('   Result:', res.body.success ? 'PASS' : 'FAIL', '\n');

    // Test 2: Get Deals
    console.log('2. Get Public Deals');
    res = await makeRequest('GET', '/deals');
    console.log('   Status:', res.status);
    console.log('   Result:', res.body.success ? 'PASS' : 'FAIL');
    console.log('   Deals:', res.body.data ? res.body.data.deals.length : 0, '\n');

    // Test 3: Register
    console.log('3. User Registration');
    const userData = {
      email: 'testuser@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
    };
    res = await makeRequest('POST', '/auth/register', userData);
    console.log('   Status:', res.status);
    console.log('   Result:', res.body.success ? 'PASS' : 'FAIL');
    if (!res.body.success) console.log('   Error:', res.body.message);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTests();
