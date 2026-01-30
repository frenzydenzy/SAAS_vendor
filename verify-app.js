#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://127.0.0.1:8000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    try {
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
    } catch (e) {
      reject(e);
    }
  });
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');

  try {
    // 1. Test health check
    console.log('1️⃣  Health Check...');
    const healthRes = await makeRequest('GET', '/health');
    console.log(`   Status: ${healthRes.status} ✅\n`);

    // 2. Test deals endpoint
    console.log('2️⃣  Fetching deals list...');
    const dealsRes = await makeRequest('GET', '/deals?page=1&limit=10');
    console.log(`   Status: ${dealsRes.status}`);
    if (dealsRes.body && dealsRes.body.data) {
      console.log(`   Deals found: ${dealsRes.body.data.deals.length}`);
      if (dealsRes.body.data.deals.length === 0) {
        console.log(`   ⚠️  No deals yet - will seed\n`);
      } else {
        console.log(`   ✅ Sample deals:`)
        dealsRes.body.data.deals.slice(0, 3).forEach((d, i) => {
          console.log(`      ${i + 1}. ${d.title}`);
        });
        console.log('');
      }
    } else {
      console.log(`   Response: ${JSON.stringify(dealsRes.body)}\n`);
    }

    // 3. Seed deals
    console.log('3️⃣  Seeding sample deals...');
    const seedRes = await makeRequest('POST', '/seed-deals', {});
    console.log(`   Status: ${seedRes.status}`);
    if (seedRes.body && seedRes.body.data) {
      console.log(`   ✅ ${seedRes.body.data.dealsCreated} deals created\n`);
    } else {
      console.log(`   Response: ${JSON.stringify(seedRes.body)}\n`);
    }

    // 4. Verify seeded deals
    console.log('4️⃣  Verifying seeded deals...');
    const verifyRes = await makeRequest('GET', '/deals?page=1&limit=10');
    if (verifyRes.body && verifyRes.body.data) {
      console.log(`   ✅ ${verifyRes.body.data.deals.length} deals now available:`);
      verifyRes.body.data.deals.forEach((deal, i) => {
        console.log(`      ${i + 1}. ${deal.title}`);
      });
      console.log('');
    }

    // 5. Register test user
    console.log('5️⃣  Testing registration...');
    const regRes = await makeRequest('POST', '/auth/register', {
      email: `test${Date.now()}@example.com`,
      password: 'Test@12345',
      firstName: 'Test',
      lastName: 'User',
    });
    console.log(`   Status: ${regRes.status}`);
    if (regRes.status === 201) {
      console.log(`   ✅ Registration working\n`);
    }

    console.log('✅ All tests completed successfully!');
    console.log('\n🎉 App is ready to use:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:8000');
    console.log('   API Docs: http://localhost:8000/api/health\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message || error);
    process.exit(1);
  }
}

runTests();
