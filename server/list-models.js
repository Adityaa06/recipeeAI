import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    const logFile = 'model-results.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    log('Testing models with key: ' + process.env.GEMINI_API_KEY.substring(0, 5) + '...');

    // Most common models and their variations
    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.0-pro'
    ];

    for (const modelName of modelsToTest) {
        try {
            log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "Working"');
            log(`✅ ${modelName}: ${result.response.text()}`);
        } catch (error) {
            log(`❌ ${modelName}: ${error.message}`);
            if (error.status) log(`   Status: ${error.status}`);
        }
        // Wait 1 second between tests to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
}

listModels();
