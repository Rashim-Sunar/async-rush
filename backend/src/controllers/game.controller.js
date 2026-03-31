import { asyncHandler } from '../utils/asyncHandler.util.js';
import { User } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

// @desc    Submit level result
// @route   POST /api/game/submit
// @access  Private
export const submitLevelResult = asyncHandler(async (req, res) => {
    const { difficulty, level, score, stars } = req.body;
    const userId = req.user._id;

    // Fetch user document
    const user = await User.findById(userId);
    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    // Find current level in progress array
    const progressIndex = user.progress.findIndex(
        (p) => p.difficulty === difficulty && p.level === level
    );

    let currentProgress = progressIndex !== -1 ? user.progress[progressIndex] : null;

    // Check if the level is allowed to be played
    // Rule: unlocked if explicitly set to true in DB, or implicitly if it's Easy Level 1
    const isUnlocked = currentProgress ? currentProgress.isUnlocked : (difficulty === 'easy' && level === 1);

    if (!isUnlocked) {
        return errorResponse(res, 403, 'Level is locked and cannot be played');
    }

    let scoreToAdd = 0;

    if (currentProgress) {
        // Level has been played or explicitly unlocked before. Apply replay logic.
        if (score > currentProgress.score) {
            scoreToAdd = score - currentProgress.score;
            currentProgress.score = score;
        }
        if (stars > currentProgress.stars) {
            currentProgress.stars = stars;
        }
        // Setting it back ensures mongoose marks it modified if needed
        user.progress[progressIndex] = currentProgress;
    } else {
        // Level hasn't been played and isn't physically in DB yet (must be Level 1)
        scoreToAdd = score;
        user.progress.push({
            difficulty,
            level,
            score,
            stars,
            isUnlocked: true,
        });
    }

    // Update the totalScore without double counting
    user.totalScore += scoreToAdd;

    // Unlock the next level if performance was adequate (stars >= 1)
    if (stars >= 1) {
        let nextDifficulty = difficulty;
        let nextLevel = level + 1;

        if (level === 10) {
            if (difficulty === 'easy') {
                nextDifficulty = 'medium';
                nextLevel = 1;
            } else if (difficulty === 'medium') {
                nextDifficulty = 'hard';
                nextLevel = 1;
            } else {
                // Completed Hard 10, game finished
                nextDifficulty = null;
            }
        }

        if (nextDifficulty) {
            const nextLevelIndex = user.progress.findIndex(
                (p) => p.difficulty === nextDifficulty && p.level === nextLevel
            );

            if (nextLevelIndex === -1) {
                // Next level doesn't exist in array, add it as unlocked
                user.progress.push({
                    difficulty: nextDifficulty,
                    level: nextLevel,
                    score: 0,
                    stars: 0,
                    isUnlocked: true, // Now it's unlocked for future play
                });
            } else if (!user.progress[nextLevelIndex].isUnlocked) {
                // Next level exists but was locked, unlock it
                user.progress[nextLevelIndex].isUnlocked = true;
            }
        }
    }

    await user.save();

    return successResponse(res, 200, 'Level progress updated successfully', {
        totalScore: user.totalScore,
        progress: user.progress,
    });
});

// @desc    Get user game progress
// @route   GET /api/game/progress
// @access  Private
export const getGameProgress = asyncHandler(async (req, res) => {
    // req.user is attached by the protect middleware, but we'll fetch the fresh state
    const user = await User.findById(req.user._id);

    return successResponse(res, 200, 'User game progress retrieved', {
        name: user.name,
        email: user.email,
        totalScore: user.totalScore,
        progress: user.progress,
    });
});

// @desc    Get specific level status
// @route   GET /api/game/level/:difficulty/:level
// @access  Private
export const getLevelStatus = asyncHandler(async (req, res) => {
    const { difficulty } = req.params;
    const level = parseInt(req.params.level, 10);

    const user = await User.findById(req.user._id);

    const levelProgress = user.progress.find(
        (p) => p.difficulty === difficulty && p.level === level
    );

    if (levelProgress) {
        return successResponse(res, 200, 'Level status retrieved', {
            isUnlocked: levelProgress.isUnlocked,
            stars: levelProgress.stars,
            score: levelProgress.score,
        });
    } else {
        // Level is not in the array
        // It's unlocked implicitly if it's Easy level 1, otherwise locked
        return successResponse(res, 200, 'Level status retrieved', {
            isUnlocked: difficulty === 'easy' && level === 1,
            stars: 0,
            score: 0,
        });
    }
});
