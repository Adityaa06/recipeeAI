import geminiService from './services/geminiService.js';

async function testReliability() {
    console.log('🚀 Starting reliability stress test...');
    const queries = [
        'healthy breakfast',
        'quick dinner',
        'vegan dessert',
        'spicy indian snack',
        'low carb lunch'
    ];

    console.log(`📡 Sending ${queries.length} concurrent requests...`);

    try {
        const results = await Promise.allSettled(queries.map(q => {
            console.log(`🔍 Testing query: ${q}`);
            return geminiService.parseRecipeQuery(q);
        }));

        let successCount = 0;
        let failCount = 0;

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`✅ Success [${queries[index]}]`);
                successCount++;
            } else {
                console.error(`❌ Failed [${queries[index]}]:`, result.reason.message);
                failCount++;
            }
        });

        console.log('\n--- Test Results ---');
        console.log(`Total: ${queries.length}`);
        console.log(`Success: ${successCount}`);
        console.log(`Failure: ${failCount}`);

        if (failCount === 0) {
            console.log('🎉 Reliability test PASSED!');
        } else {
            console.log('⚠️ Reliability test had issues, check logs above.');
        }
    } catch (error) {
        console.error('💥 Test script error:', error);
    }
}

testReliability();
