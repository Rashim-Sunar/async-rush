import { errorResponse } from '../utils/response.util.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for developer context in development
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new Error(message);
        error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new Error(message);
        error.statusCode = 400;
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Not authorized, token failed';
        error = new Error(message);
        error.statusCode = 401;
    }
    
    if (err.name === 'TokenExpiredError') {
        const message = 'Not authorized, token expired';
        error = new Error(message);
        error.statusCode = 401;
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';

    return errorResponse(
        res,
        statusCode,
        message,
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
};
