import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { submitLevelSchema, getLevelSchema } from '../schemas/game.schema.js';
import {
    submitLevelResult,
    getGameProgress,
    getLevelStatus,
} from '../controllers/game.controller.js';

const router = express.Router();

// All game routes require authentication
router.use(protect);

router.post('/submit', validate(submitLevelSchema), submitLevelResult);

router.get('/progress', getGameProgress);

router.get('/level/:difficulty/:level', validate(getLevelSchema), getLevelStatus);

export default router;
