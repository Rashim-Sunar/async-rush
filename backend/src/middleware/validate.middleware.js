import { errorResponse } from '../utils/response.util.js';

/**
 * Middleware that uses a Zod schema to validate incoming request data.
 */
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        // Extract the specific error messages from Zod
        const errors = error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        
        return errorResponse(res, 400, 'Validation failed', errors);
    }
};
