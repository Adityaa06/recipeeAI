import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Force IPv4 as default to avoid ENETUNREACH errors on cloud platforms like Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingLists.js';
import aiRoutes from './routes/ai.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables robustly
dotenv.config(); // Load .env file if it exists (local dev)

console.log('--- Environment Configuration ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'MISSING');
console.log('---------------------------------');

console.log('Starting Server Initialization...');


// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all routes
app.use('/api', limiter);

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        // In production, allow CLIENT_URL and the specific Vercel domain.
        const allowedOrigins = [
            'https://recipee-ai.vercel.app',
            'https://recipeeai.vercel.app', // Adding a common variant just in case
            process.env.CLIENT_URL
        ].filter(Boolean); // Filter out undefined values

        if (process.env.NODE_ENV !== 'production') {
            allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed. Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body with limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

// Root route for backend health checking from browser
app.get('/', (req, res) => {
    res.send('Recipe AI Backend is running. Access API endpoints at /api');
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const dbUri = process.env.MONGO_URI;

    if (!dbUri) {
        console.error('CRITICAL ERROR: MongoDB connection string (MONGO_URI) is missing in environment variables.');
        // Do not exit, just return so server can listen for routes (e.g. health check)
        return;
    }

    try {
        console.log(`Attempting to connect to MongoDB...`);
        const conn = await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of ~30s
        });
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    } catch (error) {
        console.error('=============== MONGODB CONNECTION ERROR ===============');
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('The server will continue running, but database operations will fail.');
        console.error('========================================================');
        // Do not process.exit(1) here so the app keeps running and Render considers deploy successful
    }

    // Auto-reconnect handlers just to be safe
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected! Attempting to reconnect...');
        isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected!');
        isConnected = true;
    });
};

// Start server
const PORT = process.env.PORT || 5000;

// Start server only in development or if on Render/Production
if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.NODE_ENV === 'production') {
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
    // In production (Vercel Serverless environment), we just need to export the app and ensure DB is connected
    connectDB().catch(console.error);
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
