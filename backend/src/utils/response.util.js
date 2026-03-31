/**
 * Standard utility to send successful JSON responses.
 */
export const successResponse = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Standard utility to send error JSON responses.
 */
export const errorResponse = (res, statusCode, message, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error,
    });
};
