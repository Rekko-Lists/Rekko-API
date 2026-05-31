import { z } from 'zod';

export const createPostSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(120, 'Title must be 120 characters or less'),
    description: z
        .string()
        .max(1500, 'Description must be 1500 characters or less')
        .optional(),
    animeIds: z
        .array(z.number().int().positive('Invalid anime ID'))
        .max(10, 'A post can be related to at most 10 animes')
        .optional()
        .default([])
});

export const postWhereUniqueSchema = z.object({
    postId: z.number().int().positive('Invalid post ID')
});

export const postUpdateSchema = z
    .object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(120, 'Title must be 120 characters or less'),
        description: z
            .string()
            .max(
                1500,
                'Description must be 1500 characters or less'
            )
            .nullable(),
        photo: z.string().url('Invalid photo URL').nullable()
    })
    .partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostWhereUnique = z.infer<
    typeof postWhereUniqueSchema
>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

export type EnrichedPost = {
    postId: number;
    title: string;
    description: string | null;
    photo: string | null;
    likes: number;
    createdAt: Date;
    commentCount: number;
    userId: number | null;
    user: { username: string; profileImage: string } | undefined;
    animes: Array<{
        malId: number;
        name: string;
        imgMedium: string;
        imgLarge: string;
    }>;
    hasLiked: boolean;
};
