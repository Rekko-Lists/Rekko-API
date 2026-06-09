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
    alternative_titles: z
        .object({
            synonyms: z.array(z.string()).optional(),
            en: z.string().nullable().optional(),
            ja: z.string().nullable().optional()
        })
        .nullable()
        .optional(),
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
        .optional(),
    broadcast: z
        .object({
            day_of_the_week: z.string().optional(),
            start_time: z.string().optional()
        })
        .optional(),
    media_type: z.string().optional(),
    average_episode_duration: z.number().nullable().optional(),
    start_season: z
        .object({
            year: z.number().optional(),
            season: z.string().optional()
        })
        .nullable()
        .optional(),
    rating: z.string().nullable().optional(),
    related_anime: z
        .array(
            z.object({
                node: z.object({
                    id: z.number(),
                    title: z.string(),
                    main_picture: z
                        .object({
                            medium: z
                                .url()
                                .nullable()
                                .optional(),
                            large: z.url().nullable().optional()
                        })
                        .optional()
                }),
                relation_type: z.string(),
                relation_type_formatted: z.string()
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
    query: z
        .string()
        .min(
            3,
            'Search query is required and min length is 3 caracters'
        ),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .optional()
});
export type MalSearchParams = z.infer<
    typeof malSearchParamsSchema
>;

export const seasonParamsSchema = z.object({
    year: z
        .number()
        .int()
        .min(1917, 'Year must be 1917 or later')
        .max(
            new Date().getFullYear() + 5,
            'Year cannot be more than 5 years in the future'
        )
        .optional(),
    season: z
        .enum(
            ['winter', 'spring', 'summer', 'fall'],
            "Season must be one of: 'winter', 'spring', 'summer', 'fall'"
        )
        .optional()
});
export type SeasonParams = z.infer<typeof seasonParamsSchema>;

export const validSeasons = [
    'winter',
    'spring',
    'summer',
    'fall'
];
