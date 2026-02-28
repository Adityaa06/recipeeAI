import https from 'https';

console.log('Fetching /api/health...');
https.get('https://recipeeai.onrender.com/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Health:', res.statusCode, data));
});

console.log('Fetching /api/recipes...');
https.get('https://recipeeai.onrender.com/api/recipes', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Recipes:', res.statusCode, data.substring(0, 200)));
});
