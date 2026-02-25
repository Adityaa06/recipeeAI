// Using global fetch

async function testFetch() {
    try {
        console.log('Testing fetch to google.com...');
        const response = await fetch('https://www.google.com');
        console.log('Status:', response.status);
    } catch (error) {
        console.error('❌ Fetch failed:', error.message);
    }
}

testFetch();
