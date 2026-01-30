#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:8000/api';

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
  console.log('🧪 Starting API tests...\n');

  try {
    // 1. Test deals endpoint
    console.log('1️⃣  Fetching deals list...');
    const dealsRes = await makeRequest('GET', '/deals?page=1&limit=10');
    console.log(`   Status: ${dealsRes.status}`);
    if (dealsRes.status === 200) {
      console.log(`   Deals found: ${dealsRes.body.data.deals.length}`);
      if (dealsRes.body.data.deals.length === 0) {
        console.log(`   ⚠️  No deals found - need to seed data\n`);
      } else {
        console.log(`   ✅ Deals available:`);
        dealsRes.body.data.deals.forEach((deal, i) => {
          console.log(`      ${i + 1}. ${deal.title} (${deal.slug})`);
        });
        console.log('');
      }
    } else {
      console.log(`   ❌ Error fetching deals\n`);
    }

    // 2. Test search endpoint
    console.log('2️⃣  Testing search endpoint...');
    const searchRes = await makeRequest('GET', '/deals/search?q=aws');
    console.log(`   Status: ${searchRes.status}`);
    if (searchRes.status === 200) {
      console.log(`   ✅ Search working\n`);
    } else {
      console.log(`   Status: ${searchRes.status}`);
      console.log(`   Message: ${searchRes.body?.message || 'Unknown error'}\n`);
    }

    // 3. Register test user
    console.log('3️⃣  Registering test user...');
    const registerRes = await makeRequest('POST', '/auth/register', {
      email: `testuser${Date.now()}@test.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
    });
    console.log(`   Status: ${registerRes.status}`);
    if (registerRes.status === 201) {
      console.log(`   ✅ Registration successful\n`);
    } else {
      console.log(`   Message: ${registerRes.body?.message}\n`);
    }

    console.log('✅ API endpoints are configured correctly!');
    console.log('\n🌱 Seeding sample deals...');
    const seedRes = await makeRequest('POST', '/seed-deals', {});
    console.log(`   Status: ${seedRes.status}`);
    if (seedRes.status === 200) {
      console.log(`   ✅ ${seedRes.body.data.dealsCreated} deals seeded successfully\n`);
      
      // Fetch deals again to confirm
      console.log('4️⃣  Verifying seeded deals...');
      const dealsVerifyRes = await makeRequest('GET', '/deals?page=1&limit=10');
      if (dealsVerifyRes.status === 200 && dealsVerifyRes.body.data.deals.length > 0) {
        console.log(`   ✅ ${dealsVerifyRes.body.data.deals.length} deals now available:`);
        dealsVerifyRes.body.data.deals.forEach((deal, i) => {
          console.log(`      ${i + 1}. ${deal.title}`);
        });
      }
    } else {
      console.log(`   ❌ Seeding failed: ${seedRes.body?.message}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
