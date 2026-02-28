import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingLists.js';
import aiRoutes from './routes/ai.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

console.log('--- Server Starting in Production Mode ---');

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

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res, next) => {
        // If the request is for an API route, let it fall through to 404 handler
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

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
        let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        // On Render/Production, if one URI is localhost but the other isn't, pick the other one
        if (process.env.RENDER || process.env.NODE_ENV === 'production') {
            const isLocal = (s) => s && (s.includes('localhost') || s.includes('127.0.0.1'));
            if (isLocal(process.env.MONGODB_URI) && !isLocal(process.env.MONGO_URI) && process.env.MONGO_URI) {
                console.log('Production: MONGODB_URI is localhost, switching to MONGO_URI');
                uri = process.env.MONGO_URI;
            } else if (isLocal(process.env.MONGO_URI) && !isLocal(process.env.MONGODB_URI) && process.env.MONGODB_URI) {
                console.log('Production: MONGO_URI is localhost, switching to MONGODB_URI');
                uri = process.env.MONGODB_URI;
            }
        }

        if (!uri) {
            console.error('CRITICAL: No MongoDB connection string found in MONGODB_URI or MONGO_URI');
            process.exit(1);
        }

        console.log(`Connecting to MongoDB (URI starts with: ${uri.substring(0, 15)}...)`);

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`CRITICAL: Error connecting to MongoDB: ${error.message}`);
        console.log('TIP: If on Render, ensure you have whitelisted "0.0.0.0/0" in your MongoDB Atlas Network Access settings.');
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

// Start server only in development or if on Render
if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    const startServer = async () => {
        try {
            console.log('Starting DB connection...');
            await connectDB();

            console.log(`Attempting to listen on port ${PORT}...`);
            app.listen(PORT, () => {
                console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
                console.log(`API available at http://localhost:${PORT}/api`);
            });
        } catch (error) {
            console.error('CRITICAL: Failed to start server:', error);
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
