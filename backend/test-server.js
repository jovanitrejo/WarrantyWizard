// Simple test to verify the server can start
const http = require('http');

const testPort = 3001;

http.get(`http://localhost:${testPort}/health`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Backend is running!');
    console.log('Response:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.log('❌ Backend is NOT running');
  console.log('Error:', err.message);
  console.log('\nTo start the backend, run:');
  console.log('  cd backend && npm run dev');
  process.exit(1);
});

