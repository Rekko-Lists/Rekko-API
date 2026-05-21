import z from 'zod';

export const userRateSchema = z.object({
    userId: z.coerce.number().int().positive(),
    malId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(0).max(10)
});

export const userRateListItemSchema = z.object({
    userRateAnimeId: z.number(),
    userId: z.number(),
    animeId: z.number(),
    rate: z.number(),
    anime: z.object({
        malId: z.number(),
        name: z.string(),
        imgMedium: z.string(),
        imgLarge: z.string(),
        malMean: z.number(),
        malRank: z.number(),
        mean: z.number(),
        status: z.string(),
        mediaType: z.string(),
        likes: z.number(),
    })
});

export type UserRate = z.infer<typeof userRateSchema>;
export type UserRateListItem = z.infer<
    typeof userRateListItemSchema
>;
