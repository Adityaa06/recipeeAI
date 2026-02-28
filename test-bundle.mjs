import https from 'https';
import fs from 'fs';

https.get('https://recipee-ai.vercel.app', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (match) {
            const jsUrl = 'https://recipee-ai.vercel.app' + match[1];
            console.log('Found JS bundle:', jsUrl);
            https.get(jsUrl, (jsRes) => {
                let jsData = '';
                jsRes.on('data', chunk => jsData += chunk);
                jsRes.on('end', () => {
                    if (jsData.includes('https://recipeeai.onrender.com/api')) {
                        console.log('✅ VITE_API_URL IS injected correctly.');
                    } else if (jsData.includes('http://localhost:5000')) {
                        console.log('❌ Localhost is strictly hardcoded somewhere!');
                    } else {
                        console.log('❌ VITE_API_URL is NOT injected. Falling back to /api');
                    }
                });
            });
        } else {
            console.log('Could not find JS bundle path in HTML');
        }
    });
});
