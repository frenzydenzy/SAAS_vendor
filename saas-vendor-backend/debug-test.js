#!/usr/bin/env node

const http = require('http');

function makeRequest(method, path) {
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
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
        });
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });

    req.end();
  });
}

async function test() {
  console.log('Testing health endpoint...\n');
  try {
    const res = await makeRequest('GET', '/health');
    console.log('Status:', res.status);
    console.log('Response body:', res.body);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
