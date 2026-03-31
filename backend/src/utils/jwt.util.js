import jwt from 'jsonwebtoken';

/**
 * Generates a JWT and sets it in an HTTP-Only cookie.
 * @param {Object} res - Express response object
 * @param {String} userId - User's database ID
 * @returns {String} token - The generated JWT token
 */
export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Determine cookie max age based on JWT_EXPIRES_IN string (e.g., '1d' = 24h = 86400000ms)
    // Defaulting to 1 day if not specified properly in logic, for safety we can just set string logic.
    // For simplicity, hardcoding 1 day mapping assuming standard '1d', or setting standard ms.
    const expiresInDays = parseInt(process.env.JWT_EXPIRES_IN) || 1;
    const maxAgeMs = expiresInDays * 24 * 60 * 60 * 1000;

    res.cookie('jwt', token, {
        httpOnly: true, // Prevents XSS via JS access
        secure: process.env.NODE_ENV !== 'development', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-domain cookies
        maxAge: maxAgeMs, // Matches JWT expiry
    });

    return token;
};
