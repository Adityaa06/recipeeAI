


import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

let transporter;

/**
 * Get or create nodemailer transporter (singleton)
 */
const getTransporter = () => {
    if (!transporter) {
        console.log('--- Initializing Email Transporter ---');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_FROM:', process.env.EMAIL_FROM || process.env.EMAIL_USER);

        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for 587/STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Reduce connection timeout
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });

        // Verify transporter configuration
        transporter.verify((error, success) => {
            if (error) {
                console.error('--- SMTP TRANSPORTER ERROR ---');
                console.error('Error Code:', error.code);
                console.error('Error Message:', error.message);
                console.error('------------------------------');
            } else {
                console.log('--- SMTP Transporter Verified Successfully ---');
            }
        });
    }
    return transporter;
};

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (email, otp) => {
    const mailTransporter = getTransporter();

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const mailOptions = {
        from: `"RecipeAI" <${fromEmail}>`,
        to: email,
        subject: 'Verify your RecipeAI account',
        text: `Your verification code is ${otp}. It expires in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                <h2 style="color: #10b981; text-align: center;">RecipeAI Verification</h2>
                <p>Hello,</p>
                <p>Thank you for signing up for RecipeAI. Please use the following code to verify your email address:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in <strong>5 minutes</strong>.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                    &copy; ${new Date().getFullYear()} RecipeAI. All rights reserved.
                </p>
            </div>
        `
    };

    // If no credentials, log to console and return success for dev
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('!!! WARNING: EMAIL_USER or EMAIL_PASS not set. Email will NOT be sent. !!!');
        console.log('--- EMAIL DEV MODE ---');
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log('----------------------');
        return true;
    }

    try {
        console.log(`[EMAIL] Attempting to send OTP to ${email}...`);

        // Use a timeout promise to ensure we don't hang the whole server
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Email delivery timed out (15s)')), 15000)
        );

        const result = await Promise.race([
            mailTransporter.sendMail(mailOptions),
            timeoutPromise
        ]);

        console.log(`[EMAIL] OTP sent successfully to ${email}. MessageId: ${result.messageId}`);
        return true;
    } catch (error) {
        console.error('--- CRITICAL SMTP SEND ERROR ---');
        console.error('Recipient:', email);
        console.error('Error:', error.message);
        if (error.stack) console.error(error.stack);
        console.error('--------------------------------');
        // We throw a standardized error but we caught it already
        throw new Error(`SMTP Error: ${error.message}`);
    }
};

/**
 * Hash OTP
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(6);
    return await bcrypt.hash(otp, salt);
};

/**
 * Verify OTP
 */
export const verifyOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};
