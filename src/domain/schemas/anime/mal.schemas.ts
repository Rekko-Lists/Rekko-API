import { z } from 'zod';

export const malRequestSchema = z.object({
    codeVerifier: z.string(),
    redirectUri: z.string()
});
export type MalRequest = z.infer<typeof malRequestSchema>;

export const malTokenDataSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenExpiresAt: z.number()
});
export type MalTokenData = z.infer<typeof malTokenDataSchema>;

export const malTokenResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    expires_in: z.number()
});
export type MalTokenResponse = z.infer<
    typeof malTokenResponseSchema
>;

export const malTokenResultSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string().nullable(),
    expiresIn: z.number()
});
export type MalTokenResult = z.infer<
    typeof malTokenResultSchema
>;

export const malAnimeDataSchema = z.object({
    id: z.number(),
    title: z.string(),
    synopsis: z.string().nullable().optional(),
    main_picture: z
        .object({
            medium: z.url().nullable().optional(),
            large: z.url().nullable().optional()
        })
        .optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    mean: z.number().nullable().optional(),
    rank: z.number().nullable().optional(),
    num_episodes: z.number().nullable().optional(),
    status: z.string().optional(),
    studios: z
        .array(
            z.object({
                id: z.number().optional(),
                name: z.string()
            })
        )
        .optional(),
    genres: z
        .array(
            z.object({
                id: z.number().optional(),
                name: z.string()
            })
        )
        .optional()
});
export type MalAnimeData = z.infer<typeof malAnimeDataSchema>;

export const malSearchSchema = z.object({
    data: z.array(
        z.object({
            node: malAnimeDataSchema
        })
    ),
    paging: z
        .object({
            next: z.url().optional(),
            previous: z.url().optional()
        })
        .optional()
});
export type MalSearch = z.infer<typeof malSearchSchema>;

export const malAnime = malAnimeDataSchema;
export type MalAnime = z.infer<typeof malAnimeDataSchema>;

export const malSearchParamsSchema = z.object({
    query: z.string().min(1, 'Search query is required'),
    limit: z.number().int().min(1).max(25).default(10).optional()
});
export type MalSearchParams = z.infer<
    typeof malSearchParamsSchema
>;
