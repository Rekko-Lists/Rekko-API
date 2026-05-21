import { z } from 'zod';

const likedAnimeSchema = z.object({
    malId: z.number(),
    name: z.string(),
    synopsis: z.string(),
    imgMedium: z.string(),
    imgLarge: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    malMean: z.number(),
    malRank: z.number(),
    mean: z.number(),
    numEpisodes: z.number(),
    status: z.string(),
    mediaType: z.string(),
    nextUpdate: z.date(),
    likes: z.number(),
    genres: z.array(z.string()),
    studios: z.array(z.string()),
    broadcast: z.object({
        dayOfWeek: z.string(),
        startTime: z.string()
    })
});

export const likedAnimeListItemSchema = z.object({
    userLikeAnimeId: z.number(),
    userId: z.number(),
    animeId: z.number(),
    anime: likedAnimeSchema
});

export const likedPostListItemSchema = z.object({
    userLikePostId: z.number(),
    userId: z.number(),
    postId: z.number(),
    post: z.object({
        postId: z.number(),
        userId: z.number().nullable(),
        title: z.string(),
        description: z.string().nullable(),
        photo: z.string().nullable(),
        likes: z.number(),
        user: z
            .object({
                username: z.string(),
                profileImage: z.string()
            })
            .nullable()
    })
});

export type LikedAnimeListItem = z.infer<
    typeof likedAnimeListItemSchema
>;
export type LikedPostListItem = z.infer<
    typeof likedPostListItemSchema
>;
