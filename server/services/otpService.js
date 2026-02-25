


import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (email, otp) => {
    // For development, if no SMTP credentials, we can use ethereal email
    // Or just log it to console for now if you prefer. 
    // I'll set up a transporter that can be configured via env.

    // Real Email Sending Setup
    // Use Nodemailer with Gmail SMTP to send OTP emails.
    // Configure using environment variables: EMAIL_USER, EMAIL_PASS

    // 👉 INSERT YOUR GMAIL HERE
    const GMAIL_USER = process.env.EMAIL_USER || '';

    // 👉 INSERT YOUR GMAIL APP PASSWORD HERE
    const GMAIL_PASS = process.env.EMAIL_PASS || '';

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"RecipeAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your RecipeAI account',
        text: `Your verification code is ${otp}. It expires in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; rounded-lg">
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
                    &copy; 2024 RecipeAI. All rights reserved.
                </p>
            </div>
        `
    };

    // If no credentials, log to console and return success for dev
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('-----------------------------------------');
        console.log(`DEV MODE: OTP for ${email} is ${otp}`);
        console.log('-----------------------------------------');
        return true;
    }

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Hash OTP
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Verify OTP
 */
export const verifyOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};
