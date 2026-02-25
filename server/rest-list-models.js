import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './.env' });

async function listModelsRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log('Fetching models from REST API...');
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync('rest-models.json', JSON.stringify(data, null, 2));

        if (data.models) {
            console.log('Available models:');
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log('No models found in response.');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModelsRest();
