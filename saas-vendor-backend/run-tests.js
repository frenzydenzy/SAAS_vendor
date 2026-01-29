#!/usr/bin/env node

// Start server in background as a child process
const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'dist/app.js');
const server = spawn('node', [serverPath], {
  stdio: 'pipe',
  detached: false
});

let serverReady = false;
let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  if (output.includes('Ready') || output.includes('port')) {
    serverReady = true;
  }
});

server.stderr.on('data', (data) => {
  output += data.toString();
});

// Wait for server to start
setTimeout(async () => {
  if (!serverReady) {
    console.log('⚠️  Server may not be ready, but testing anyway...');
  }

  const http = require('http');

  function request(method, path, body = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: `/api${path}`,
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
          });
        });
      });

      req.on('error', () => resolve({ status: 0, body: null }));
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  console.log('\n=== API ENDPOINT TESTS ===\n');

  // Test 1: Health
  let res = await request('GET', '/health');
  console.log(`${res.status === 200 ? '✅' : '❌'} Health Check - Status: ${res.status}`);

  // Test 2: Get Deals  
  res = await request('GET', '/deals');
  console.log(`${res.status === 200 ? '✅' : '❌'} Get Deals - Status: ${res.status}`);

  // Test 3: Register
  const email = `test${Date.now()}@example.com`;
  res = await request('POST', '/auth/register', {
    email, password: 'Test123!', firstName: 'Test', lastName: 'User'
  });
  console.log(`${res.status >= 200 && res.status < 300 ? '✅' : '❌'} Register - Status: ${res.status}${res.body?.message ? ` (${res.body.message})` : ''}`);

  // Test 4: Login
  if (res.status < 300) {
    res = await request('POST', '/auth/login', {
      email, password: 'Test123!'
    });
    console.log(`${res.status >= 200 && res.status < 300 ? '✅' : '❌'} Login - Status: ${res.status}${res.body?.message ? ` (${res.body.message})` : ''}`);
  }

  // Test 5: Create Deal
  res = await request('POST', '/deals', {
    title: 'Test Deal', slug: 'test-' + Date.now(), description: 'Test',
    shortDescription: 'Test', originalPrice: 100, discountedPrice: 50,
    currency: 'USD', category: 'Cloud', saasTool: 'Test', 
    dealDuration: '1Y', partnerName: 'Test', partnerWebsite: 'https://test.com'
  });
  console.log(`${res.status >= 200 && res.status < 300 ? '✅' : '❌'} Create Deal - Status: ${res.status}`);

  console.log('\n✅ Tests complete\n');
  server.kill();
  process.exit(0);
}, 5000);

// Handle server exit
server.on('exit', (code) => {
  if (code !== null && code !== 0 && code !== -15) {
    console.log(`⚠️  Server exited with code: ${code}`);
  }
});
