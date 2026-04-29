import { z } from 'zod';

export const loginSchema = z
    .object({
        email: z.email('Email must be valid'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
    })
    .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z
    .object({
        refreshToken: z
            .string()
            .min(1, 'Refresh token is required')
    })
    .strict();
export type RefreshTokenInput = z.infer<
    typeof refreshTokenSchema
>;

export const tokenPairSchema = z
    .object({
        accessToken: z.string(),
        refreshToken: z.string()
    })
    .strict();
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const sessionInfoSchema = z
    .object({
        sessionId: z.number(),
        userId: z.number(),
        userAgent: z.string(),
        ip: z.string(),
        createdAt: z.date(),
        expiresAt: z.date()
    })
    .strict();
export type SessionInfo = z.infer<typeof sessionInfoSchema>;
