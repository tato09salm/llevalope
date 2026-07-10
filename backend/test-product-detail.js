
const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/productos/slug/iphone-12',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
