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
