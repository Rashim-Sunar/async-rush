import { z } from 'zod';

export const submitLevelSchema = z.object({
    body: z.object({
        difficulty: z.enum(['easy', 'medium', 'hard'], {
            errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
        }),
        level: z
            .number({ required_error: 'Level is required' })
            .int('Level must be an integer')
            .min(1, 'Level must be between 1 and 10')
            .max(10, 'Level must be between 1 and 10'),
        score: z
            .number({ required_error: 'Score is required' })
            .nonnegative('Score must be 0 or greater'),
        stars: z
            .number({ required_error: 'Stars are required' })
            .int('Stars must be an integer')
            .min(0, 'Stars must be between 0 and 3')
            .max(3, 'Stars must be between 0 and 3'),
    }),
});

export const getLevelSchema = z.object({
    params: z.object({
        difficulty: z.enum(['easy', 'medium', 'hard'], {
            errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
        }),
        level: z.string().refine((val) => {
            const parsed = parseInt(val, 10);
            return !isNaN(parsed) && parsed >= 1 && parsed <= 10;
        }, {
            message: 'Level must be an integer between 1 and 10',
        }),
    }),
});
