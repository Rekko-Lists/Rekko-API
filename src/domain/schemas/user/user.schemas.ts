import { z } from 'zod';

export const createUserSchema = z
    .object({
        email: z.email('Email must be valid'),
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
        biography: z.string().optional()
    })
    .strict()
    .refine((data) => data.password === data.passwordRepeat, {
        message: "Passwords don't match",
        path: ['passwordRepeat']
    });
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const userUpdateProfileSchema = z
    .object({
        biography: z.string().optional()
    })
    .strict();
export type UserUpdateProfile = z.infer<
    typeof userUpdateProfileSchema
>;

export const userWhereUniqueSchema = z.union([
    z.object({ userId: z.number() }),
    z.object({ username: z.string() }),
    z.object({ email: z.string() })
]);
export type UserWhereUnique = z.infer<
    typeof userWhereUniqueSchema
>;

export const userUpdateUsername = z
    .object({
        email: z.email('Email must be valid'),
        username: z.string().min(1, 'Username is required')
    })
    .strict();
export type UserUpdateUsername = z.infer<
    typeof userUpdateUsername
>;

export const userUpdateEmail = z
    .object({
        username: z.string().min(1, 'Username is required'),
        newEmail: z.email('New Email must be valid.')
    })
    .strict();
export type UserUpdateEmail = z.infer<typeof userUpdateEmail>;

export const userUsernameToken = z
    .object({
        username: z.string().min(1, 'Username is required'),
        token: z.string().min(1, 'Token is required')
    })
    .strict();
export type UserUsernameToken = z.infer<
    typeof userUsernameToken
>;

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
export type UserResetPassword = z.infer<
    typeof userResetPassword
>;

export const userUpdateSocialAccounts = z
    .object({
        accounts: z.array(
            z.object({
                name: z
                    .string()
                    .min(1, 'name is required')
                    .transform((val) => val.toLowerCase()),
                url: z.url('url must be valid')
            })
        )
    })
    .strict();
export type UserUpdateSocialAccounts = z.infer<
    typeof userUpdateSocialAccounts
>;

export const socialAccount = z
    .object({
        name: z.string(),
        url: z.url()
    })
    .strict();
export type SocialAccount = z.infer<typeof socialAccount>;

export const userSocialAccounts = z.array(socialAccount);
export type UserSocialAccounts = z.infer<
    typeof userSocialAccounts
>;

export const updateReputation = z
    .object({
        username: z.string().min(1, 'Username is required'),
        reason: z.string().min(1, 'Reason is required')
    })
    .strict();
export type UpdateReputation = z.infer<typeof updateReputation>;

export const reputationReasons = {
    good_post: 10,
    helpful_comment: 5,
    spam: -15,
    bad_behavior: -20,
    misinformation: -10
} as Record<string, number>;

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
