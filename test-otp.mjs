import https from 'https';

console.log('Testing OTP endpoint...');
const data = JSON.stringify({ email: 'test@example.com' });

const options = {
    hostname: 'recipeeai.onrender.com',
    port: 443,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => console.log('OTP:', res.statusCode, responseData));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
