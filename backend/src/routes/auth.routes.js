import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { protect } from '../middleware/auth.middleware.js';
import { successResponse } from '../utils/response.util.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);

// Example of a protected route to verify the auth middleware works
router.get('/me', protect, (req, res) => {
    // protect middleware attaches req.user
    return successResponse(res, 200, 'User profile retrieved', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    });
});

export default router;
