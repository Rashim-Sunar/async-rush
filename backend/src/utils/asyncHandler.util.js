/**
 * Wrapper to handle asynchronous route handlers.
 * Intercepts any errors and passes them to the next() middleware (global error handler).
 * Prevents having to write try/catch blocks in every controller.
 */
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
