import z from 'zod';

const watchStateSchema = z
    .enum([
        'watching',
        'completed',
        'on_hold',
        'dropped',
        'plan_to_watch'
    ])
    .transform((state) => {
        const prismaState = {
            watching: 'WATCHING',
            completed: 'COMPLETED',
            on_hold: 'ON_HOLD',
            dropped: 'DROPPED',
            plan_to_watch: 'PLAN_TO_WATCH'
        } as const;

        return prismaState[state];
    });

export const userWatchSchema = z.object({
    userId: z.coerce.number().int().positive(),
    malId: z.coerce.number().int().positive(),
    numEpisodes: z.coerce.number().int().min(0),
    state: watchStateSchema
});

export const userWatchListItemSchema = z.object({
    userWatchAnimeId: z.number(),
    userId: z.number(),
    animeId: z.number(),
    numEpisodes: z.number(),
    state: z.string(),
    anime: z.object({
        malId: z.number(),
        name: z.string(),
        imgMedium: z.string(),
        imgLarge: z.string(),
        malMean: z.number(),
        malRank: z.number(),
        mean: z.number(),
        numEpisodes: z.number(),
        status: z.string(),
        mediaType: z.string(),
        likes: z.number(),
        broadcast: z.object({
            dayOfWeek: z.string(),
            startTime: z.string()
        })
    })
});

export type UserWatch = z.infer<typeof userWatchSchema>;
export type UserWatchListItem = z.infer<
    typeof userWatchListItemSchema
>;
