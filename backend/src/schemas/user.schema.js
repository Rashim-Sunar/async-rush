import { z } from 'zod';

export const updateProfileSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(2, 'Username must be at least 2 characters')
            .max(20, 'Username cannot exceed 20 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
            .optional(),
        bio: z
            .string()
            .max(150, 'Bio cannot exceed 150 characters')
            .optional(),
    }),
});
