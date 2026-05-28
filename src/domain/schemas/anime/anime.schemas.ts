import { z } from 'zod';

export const animeConstructorDataSchema = z.object({
    animeId: z.number().int(),
    malId: z.number().int(),
    broadcastId: z.number().int(),
    name: z.string().min(1),
    synopsis: z.string(),
    imgMedium: z.string().url(),
    imgLarge: z.string().url(),
    startDate: z.date(),
    endDate: z.date(),
    malMean: z.number(),
    malRank: z.number(),
    mean: z.number(),
    numEpisodes: z.number().int(),
    status: z.string(),
    nextUpdate: z.date(),
    likes: z.number().int().default(0),
    members: z.number().int().default(0),
    genres: z.array(z.string()).default([]),
    studios: z.array(z.string()).default([]),
    duration: z.number().nullable().default(null),
    premieredSeason: z.string().nullable().default(null),
    premieredYear: z.number().nullable().default(null),
    rating: z.string().nullable().default(null),
    broadcast: z
        .object({
            dayOfWeek: z.string(),
            startTime: z.string()
        })
        .optional()
});

export type AnimeConstructorData = z.infer<typeof animeConstructorDataSchema>;

export interface AnimeWriteData {
    malId: number;
    name: string;
    synopsis: string;
    imgMedium: string;
    imgLarge: string;
    startDate: Date;
    endDate: Date;
    malMean: number;
    malRank: number;
    mean: number;
    numEpisodes: number;
    status: string;
    genres: string[];
    studios: string[];
    mediaType: string;
    duration: number | null;
    premieredSeason: string | null;
    premieredYear: number | null;
    rating: string | null;
    likes: number;
    nextUpdate: Date;
    broadcast: {
        dayOfWeek: string;
        startTime: string;
    };
    relatedAnime: Array<{
        relatedMalId: number;
        relationType: string;
        relationLabel: string;
        relatedTitle: string;
        relatedImage: string | null;
    }>;
}
