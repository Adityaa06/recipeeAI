import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

console.log('API Key loaded:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 5)}...` : 'MISSING');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Fetching available models...');
        // The SDK doesn't have a direct listModels, we usually use the REST API
        // But we can try to see if we can get list of models.
        // Actually, let's just try to generate a very simple text content with gemini-2.0-flash
        // to see if the API key is working and the SDK can connect.
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const result = await model.generateContent('ping');
        console.log('Connection test successful:', result.response.text());

        // If connection works, the model name issue for image gen is specific to the model or capability.
    } catch (error) {
        console.error('❌ Connection test failed:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

listModels();
