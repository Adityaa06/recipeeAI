import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function debugConnection() {
    const logFile = 'debug-connection.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    log('API Key loaded: ' + (process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'MISSING'));

    try {
        log('Attempting to generate content with gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('ping');
        log('✅ Connection test successful!');
        log('Response: ' + result.response.text());
    } catch (error) {
        log('❌ Connection test failed!');
        log('Message: ' + error.message);
        log('Stack: ' + error.stack);
        if (error.response) {
            log('Response Error Data: ' + JSON.stringify(error.response, null, 2));
        }
        if (error.cause) {
            log('Cause: ' + JSON.stringify(error.cause, null, 2));
        }
    }
}

debugConnection();
