import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../schemas/user.schema.js';
import { getProfile, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);

export default router;
