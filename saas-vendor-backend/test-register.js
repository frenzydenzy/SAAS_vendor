const axios = require('axios');
const { spawn } = require('child_process');

// Start backend server
const backend = spawn('node', ['dist/app.js'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe']
});

let started = false;
backend.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('Ready') || output.includes('listening')) {
    started = true;
  }
});

backend.stderr.on('data', (data) => {
  console.log('Backend stderr:', data.toString());
});

// Wait for backend to start, then test
setTimeout(async () => {
  try {
    console.log('\n📧 Testing registration endpoint...\n');
    
    const response = await axios.post('http://localhost:8000/api/auth/register', {
      email: 'testuser@example.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User'
    }, {
      timeout: 10000
    });
    
    console.log('✅ Registration Success!');
    console.log(JSON.stringify(response.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.log('❌ Registration Failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.message) {
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error);
    }
    process.exit(1);
  }
}, 10000);

// Kill backend after test
setTimeout(() => {
  backend.kill();
  process.exit(0);
}, 25000);
