const BASE_URL = 'http://localhost:5000/api/auth';

async function verifyBackend() {
    console.log('--- Starting Backend Verification ---');

    try {
        // 1. Test Send OTP
        console.log('Testing /send-otp...');
        const sendOtpRes = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'verify_test@example.com' })
        });
        const sendOtpData = await sendOtpRes.json();
        console.log('Send OTP Status:', sendOtpRes.status);
        console.log('Send OTP Response:', sendOtpData);

        // 2. Test Verify OTP with incorrect code
        console.log('Testing /verify-otp with incorrect code...');
        const verifyOtpRes = await fetch(`${BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'verify_test@example.com', otp: '000000' })
        });
        const verifyOtpData = await verifyOtpRes.json();
        console.log('Verify OTP Status:', verifyOtpRes.status);
        console.log('Verify OTP Response:', verifyOtpData);

        console.log('--- Backend Verification Script Complete ---');
    } catch (error) {
        console.error('Verification error:', error.message);
    }
}

verifyBackend();
