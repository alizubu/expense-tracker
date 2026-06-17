const http = require('http');

const body = JSON.stringify({
  name: "Test API",
  type: "MONEYBAG",
  icon: "💰",
  color: "#7C3AED",
  balance: 500,
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/profiles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});

req.on('error', e => console.error('ERROR:', e.message));
req.write(body);
req.end();
