
const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/productos',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('Product slugs:');
    result.datos.forEach(product => {
      console.log(`- ${product.slug}`);
    });
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
