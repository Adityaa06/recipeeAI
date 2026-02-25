import User from '../models/User.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { generateOTP, sendOTPEmail, hashOTP, verifyOTP as checkOTP } from '../services/otpService.js';
import axios from 'axios';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

/**
 * Send OTP to email
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
    try {
        const { email, captchaToken } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Verify reCAPTCHA
        if (!captchaToken) {
            return res.status(400).json({
                success: false,
                message: 'Please verify that you are not a robot.'
            });
        }

        const recaptchaSecret = process.env.RECAPTCHA_SECRET;
        const recaptchaRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`
        );

        if (!recaptchaRes.data.success) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed. Please try again.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Save OTP to database
        await OTP.findOneAndUpdate(
            { email },
            {
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            },
            { upsert: true, new: true }
        );

        // Send email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification code',
            error: error.message
        });
    }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        const isValid = await checkOTP(otp, otpRecord.otpHash);

        if (!isValid) {
            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 5) {
                await OTP.deleteOne({ email });
                return res.status(400).json({
                    success: false,
                    message: 'Max verification attempts reached. Please request a new code.'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Invalid verification code. ${5 - otpRecord.attempts} attempts remaining.`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying code',
            error: error.message
        });
    }
};

/**
 * Register a new user
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
    try {
        const { username, email, password, dietaryRestrictions, allergies, cuisinePreferences, otp } = req.body;

        // Validate required fields
        if (!username || !email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields including verification code'
            });
        }

        // Final OTP verification check before creating user
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Verification expired. Please try again.'
            });
        }

        const isValid = await checkOTP(otp, otpRecord.otpHash);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Create new user (email is verified at this point)
        const user = await User.create({
            username,
            email,
            password,
            dietaryRestrictions: dietaryRestrictions || [],
            allergies: allergies || [],
            cuisinePreferences: cuisinePreferences || [],
            emailVerified: true
        });

        // Delete OTP record after successful signup
        await OTP.deleteOne({ email });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dietaryRestrictions: user.dietaryRestrictions,
                allergies: user.allergies,
                cuisinePreferences: user.cuisinePreferences
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user account',
            error: error.message
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your email is not verified. Please verify your email to log in.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dietaryRestrictions: user.dietaryRestrictions,
                allergies: user.allergies,
                cuisinePreferences: user.cuisinePreferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dietaryRestrictions: user.dietaryRestrictions,
                allergies: user.allergies,
                cuisinePreferences: user.cuisinePreferences,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { username, dietaryRestrictions, allergies, cuisinePreferences } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (dietaryRestrictions) updateData.dietaryRestrictions = dietaryRestrictions;
        if (allergies) updateData.allergies = allergies;
        if (cuisinePreferences) updateData.cuisinePreferences = cuisinePreferences;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                dietaryRestrictions: user.dietaryRestrictions,
                allergies: user.allergies,
                cuisinePreferences: user.cuisinePreferences
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};
