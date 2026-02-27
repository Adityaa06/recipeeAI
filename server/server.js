import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingLists.js';
import aiRoutes from './routes/ai.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/shoppinglists', shoppingListRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date()
    });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

// Start server
const PORT = process.env.PORT || 5000;

// Start server only in development
if (process.env.NODE_ENV !== 'production') {
    const startServer = async () => {
        try {
            await connectDB();

            app.listen(PORT, () => {
                console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
                console.log(`API available at http://localhost:${PORT}/api`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };

    startServer();
} else {
    // In production (Vercel), we just need to export the app and ensure DB is connected
    connectDB();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    // process.exit(1); // Don't exit in dev to allow debugging
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    // process.exit(1); // Don't exit in dev to allow debugging
});

export default app;
