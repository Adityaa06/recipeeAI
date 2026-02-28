import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendOTPEmail } from './services/otpService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log('Testing email delivery...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'MISSING');

    try {
        await sendOTPEmail('singhaditya06.04.2005@gmail.com', '123456');
        console.log('Test email triggered successfully.');
    } catch (error) {
        console.error('Test email failed:', error);
    }
}

test();
