import { z } from 'zod';

export const oauthDataSchema = z.object({
    provider: z.enum(['google', 'discord']),
    providerUserId: z
        .string()
        .min(1, 'providerUserId is required'),
    email: z.email('Invalid email'),
    username: z.string().optional()
});
export type OAuthData = z.infer<typeof oauthDataSchema>;

export const oauthFirebaseSchema = z
    .object({
        tokenId: z.string().min(1, 'tokenId is required')
    })
    .strict();
export type OAuthFirebase = z.infer<typeof oauthFirebaseSchema>;

export const userFirebaseSchema = z
    .object({
        uid: z.string(),
        email: z.email()
    })
    .strict();
export type FirebaseUser = z.infer<typeof userFirebaseSchema>;

export const oauthDiscordSchema = z
    .object({
        code: z.string().min(1, 'code is required')
    })
    .strict();
export type OAuthDiscord = z.infer<typeof oauthDiscordSchema>;

export const userDiscordSchema = z
    .object({
        id: z.string(),
        email: z.email(),
        username: z.string().optional()
    })
    .strict();
export type DiscordUser = z.infer<typeof userDiscordSchema>;

export const discordAccessToken = z.object({
    accessToken: z.string()
});
export type DiscordAccessToken = z.infer<
    typeof discordAccessToken
>;
