import { z } from 'zod';

export const createUserSchema = z
    .object({
        email: z.string().email('Email must be valid'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[0-9]/,
                'Password must contain at least one number'
            ),
        passwordRepeat: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[0-9]/,
                'Password must contain at least one number'
            ),
        username: z.string().min(1, 'Username is required'),
        profileImage: z.string().optional(),
        bannerImage: z.string().optional(),
        backgroundImage: z.string().optional(),
        biography: z.string().optional()
    })
    .strict()
    .refine((data) => data.password === data.passwordRepeat, {
        message: "Passwords don't match",
        path: ['passwordRepeat']
    });

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

export const userUpdateUsername = z
    .object({
        email: z.string().email('Email must be valid'),
        username: z.string().min(1, 'Username is required')
    })
    .strict();

export const userUpdateEmail = z
    .object({
        username: z.string().min(1, 'Username is required'),
        newEmail: z.string().email('New Email must be valid.')
    })
    .strict();

export const userUsernameToken = z
    .object({
        username: z.string().min(1, 'Username is required'),
        token: z.string().min(1, 'Token is required')
    })
    .strict();

export const userResetPassword = z
    .object({
        username: z.string().min(1, 'Username is required'),
        token: z.string().min(1, 'Token is required'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[0-9]/,
                'Password must contain at least one number'
            ),
        passwordRepeat: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[0-9]/,
                'Password must contain at least one number'
            )
    })
    .strict()
    .refine((data) => data.password === data.passwordRepeat, {
        message: "Passwords don't match",
        path: ['passwordRepeat']
    });

export const userUpdateSocialAccounts = z
    .object({
        accounts: z.array(
            z.object({
                name: z
                    .string()
                    .min(1, 'name is required')
                    .transform((val) => val.toLowerCase()),
                url: z.string().url('url must be valid')
            })
        )
    })
    .strict();

export const socialAccount = z
    .object({
        name: z.string(),
        url: z.string().url()
    })
    .strict();

export const userSocialAccounts = z.array(socialAccount);

export const updateReputation = z
    .object({
        username: z.string().min(1, 'Username is required'),
        reason: z.string().min(1, 'Reason is required')
    })
    .strict();

export const userSelectableField = z.enum([
    'userId',
    'email',
    'username',
    'reputation',
    'profileImage',
    'bannerImage',
    'backgroundImage',
    'role',
    'emailVerified',
    'createdAt',
    'biography',
    'socialAccounts',
    'posts',
    'oauthAccounts'
]);

export const loginSchema = z
    .object({
        email: z.string().email('Email must be valid'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
    })
    .strict();

export const refreshTokenSchema = z
    .object({
        refreshToken: z
            .string()
            .min(1, 'Refresh token is required')
    })
    .strict();

export const tokenPairSchema = z
    .object({
        accessToken: z.string(),
        refreshToken: z.string()
    })
    .strict();

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

export const reputationReasons = {
    good_post: 10,
    helpful_comment: 5,
    spam: -15,
    bad_behavior: -20,
    misinformation: -10
} as Record<string, number>;

export const userDefaultSelect = [
    'username',
    'email',
    'profileImage',
    'bannerImage',
    'backgroundImage',
    'biography',
    'reputation',
    'emailVerified'
];

export const userFieldMappings = {
    socialAccounts: {
        selectKey: 'userSocialAccount',
        config: { include: { socialAccount: true } }
    },
    posts: { config: true },
    oauthAccounts: { config: true }
};

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserUpdateProfile = z.infer<
    typeof userUpdateProfileSchema
>;
export type UserWhereUnique = z.infer<
    typeof userWhereUniqueSchema
>;
export type UserUpdateUsername = z.infer<
    typeof userUpdateUsername
>;
export type UserUpdateEmail = z.infer<typeof userUpdateEmail>;
export type UserUpdateSocialAccounts = z.infer<
    typeof userUpdateSocialAccounts
>;
export type UserUsernameToken = z.infer<
    typeof userUsernameToken
>;
export type UserResetPassword = z.infer<
    typeof userResetPassword
>;
export type SocialAccount = z.infer<typeof socialAccount>;
export type UserSocialAccounts = z.infer<
    typeof userSocialAccounts
>;
export type UpdateReputation = z.infer<typeof updateReputation>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<
    typeof refreshTokenSchema
>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type SessionInfo = z.infer<typeof sessionInfoSchema>;
