import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            maxlength: [20, 'Username cannot exceed 20 characters'],
        },
        bio: {
            type: String,
            default: '',
            maxlength: [150, 'Bio cannot exceed 150 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default in queries
        },
        totalScore: {
            type: Number,
            default: 0,
        },
        progress: [
            {
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard'],
                    required: true,
                },
                level: {
                    type: Number,
                    required: true,
                },
                score: {
                    type: Number,
                    default: 0,
                },
                stars: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 3,
                },
                isUnlocked: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Hash the password before saving to the database
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify if a given password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
