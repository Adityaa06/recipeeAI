import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testImageGen() {
    try {
        console.log('Testing image generation with gemini-2.0-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = "Ultra realistic professional food photography of Butter Paneer, Indian cuisine, rich texture, detailed garnish, restaurant presentation, 4K food photography";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const candidates = response.candidates;

        console.log('Response received. Checking for image data...');

        if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData) {
                    console.log('✅ Image data found!');
                    console.log('MimeType:', part.inlineData.mimeType);
                    console.log('Data length:', part.inlineData.data.length);
                    return;
                }
            }
        }

        console.log('❌ No image data found in response parts.');
        console.log('Text response:', response.text());
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testImageGen();
