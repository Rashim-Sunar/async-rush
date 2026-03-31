import { asyncHandler } from '../utils/asyncHandler.util.js';
import { User } from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../utils/jwt.util.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return errorResponse(res, 400, 'User already exists');
    }

    // Create user in DB (password is hashed via pre-save hook)
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // Generate Token and Set HTTP-only Cookie
        generateTokenAndSetCookie(res, user._id);

        // Respond with minimal info for LocalStorage storage strategy
        return successResponse(res, 201, 'User registered successfully', {
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        return errorResponse(res, 400, 'Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include the implicitly protected password field using +password standard logic if we didn't specify it yet,
    // wait, we defined `select: false` on password in schema. Let's explicitly select it using .select('+password')
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
        // Generate Token and Set HTTP-only Cookie
        generateTokenAndSetCookie(res, user._id);

        return successResponse(res, 200, 'User logged in successfully', {
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        return errorResponse(res, 401, 'Invalid email or password');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = asyncHandler(async (req, res) => {
    // Clear the HTTP Only cookie by setting it to empty with expiring immediately
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0),
    });

    return successResponse(res, 200, 'User logged out successfully');
});
