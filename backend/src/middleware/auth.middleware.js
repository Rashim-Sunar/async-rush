import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { errorResponse } from '../utils/response.util.js';
import { User } from '../models/user.model.js';

/**
 * Middleware to protect routes.
 * Checks for a valid JWT in the HTTP-only cookie.
 * Attaches the authenticated user to the request object.
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // We configured cookie-parser, so req.cookies should have our 'jwt' cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return errorResponse(res, 401, 'Not authorized, no token');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token payload (excluding password)
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return errorResponse(res, 401, 'Not authorized, user not found');
        }

        next();
    } catch (error) {
        // Pass the JWT verification errors (like TokenExpiredError) to the global handler
        next(error);
    }
});
