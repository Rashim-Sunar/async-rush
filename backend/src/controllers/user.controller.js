import { asyncHandler } from '../utils/asyncHandler.util.js';
import { User } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

/**
 * Compute aggregate stats from the existing progress[] array.
 * Avoids maintaining duplicate state — single source of truth.
 */
function computeStats(user) {
    const progress = user.progress || [];

    let totalStars = 0;
    let levelsCompleted = 0;
    const completedByDifficulty = { easy: 0, medium: 0, hard: 0 };
    const starsByDifficulty = { easy: [], medium: [], hard: [] };

    for (const entry of progress) {
        if (entry.stars >= 1) {
            levelsCompleted++;
            totalStars += entry.stars;
            completedByDifficulty[entry.difficulty]++;
        }
        starsByDifficulty[entry.difficulty].push({
            level: entry.level,
            stars: entry.stars,
            score: entry.score,
            isUnlocked: entry.isUnlocked,
        });
    }

    // Determine highest difficulty reached
    let highestDifficulty = 'none';
    if (completedByDifficulty.hard > 0) highestDifficulty = 'hard';
    else if (completedByDifficulty.medium > 0) highestDifficulty = 'medium';
    else if (completedByDifficulty.easy > 0) highestDifficulty = 'easy';

    // Sort stars arrays by level number for consistent display
    for (const diff of ['easy', 'medium', 'hard']) {
        starsByDifficulty[diff].sort((a, b) => a.level - b.level);
    }

    return {
        stats: {
            totalScore: user.totalScore || 0,
            totalStars,
            levelsCompleted,
            highestDifficulty,
        },
        progress: {
            easy: {
                completed: completedByDifficulty.easy,
                levels: starsByDifficulty.easy,
            },
            medium: {
                completed: completedByDifficulty.medium,
                levels: starsByDifficulty.medium,
            },
            hard: {
                completed: completedByDifficulty.hard,
                levels: starsByDifficulty.hard,
            },
        },
    };
}

// @desc    Get user profile with computed stats
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    const { stats, progress } = computeStats(user);

    return successResponse(res, 200, 'Profile retrieved', {
        id: user._id,
        name: user.name,
        username: user.username || user.name,
        email: user.email,
        bio: user.bio || '',
        stats,
        progress,
        createdAt: user.createdAt,
    });
});

// @desc    Update user profile (bio, username)
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { bio, username } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
        const existing = await User.findOne({ username });
        if (existing && existing._id.toString() !== user._id.toString()) {
            return errorResponse(res, 409, 'Username is already taken');
        }
        user.username = username;
    }

    if (bio !== undefined) {
        user.bio = bio;
    }

    await user.save();

    const { stats, progress } = computeStats(user);

    return successResponse(res, 200, 'Profile updated', {
        id: user._id,
        name: user.name,
        username: user.username || user.name,
        email: user.email,
        bio: user.bio || '',
        stats,
        progress,
        createdAt: user.createdAt,
    });
});
