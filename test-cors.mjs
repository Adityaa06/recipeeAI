import https from 'https';

console.log('Testing CORS OPTIONS...');
const options = {
    hostname: 'recipeeai.onrender.com',
    port: 443,
    path: '/api/recipes',
    method: 'OPTIONS',
    headers: {
        'Origin': 'https://recipee-ai.vercel.app',
        'Access-Control-Request-Method': 'GET'
    }
};

const req = https.request(options, (res) => {
    console.log('OPTIONS status:', res.statusCode);
    console.log('CORS Headers:', res.headers);
});

req.on('error', (error) => console.error(error));
req.end();
