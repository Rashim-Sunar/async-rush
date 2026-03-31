import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import gameRoutes from './routes/game.routes.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

// Middleware
// Enable CORS with options to allow cookies to be sent along with requests
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser tools (no Origin header) and configured frontend origins.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true, // Crucial for HTTP-only cookies
    })
);

// Built-in middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies from the request headers
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// Fallback for 404
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Global Error Handler
app.use(errorHandler);

export default app;
