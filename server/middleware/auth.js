import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token exists
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = user;
            req.userId = user._id;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
