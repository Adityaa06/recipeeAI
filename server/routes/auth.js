import express from 'express';
import {
    signup,
    login,
    getProfile,
    updateProfile,
    sendOTP,
    verifyOTP
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
