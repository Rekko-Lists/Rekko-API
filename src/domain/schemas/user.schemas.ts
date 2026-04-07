import { z } from 'zod';

export const createUserSchema = z
    .object({
        email: z.string().email('Email must be valid'),
        password: z.string().min(1, 'Password is required'),
        username: z.string().min(1, 'Username is required'),
        profileImage: z.string().optional(),
        bannerImage: z.string().optional(),
        backgroundImage: z.string().optional(),
        biography: z.string().optional()
    })
    .strict();

export const userUpdateProfileSchema = z
    .object({
        profileImage: z.string().optional(),
        bannerImage: z.string().optional(),
        backgroundImage: z.string().optional(),
        biography: z.string().optional()
    })
    .strict();

export const userWhereUniqueSchema = z.union([
    z.object({ userId: z.number() }),
    z.object({ username: z.string() }),
    z.object({ email: z.string() })
]);

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserUpdateProfile = z.infer<
    typeof userUpdateProfileSchema
>;
export type UserWhereUnique = z.infer<
    typeof userWhereUniqueSchema
>;
