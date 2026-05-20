import { z } from 'zod';

export const createCommentSchema = z.object({
    message: z
        .string()
        .min(1, 'Message is required')
        .max(2000, 'Message must be 2000 characters or less'),
    postId: z.number().int().positive('Invalid post ID'),
    parentCommentId: z
        .number()
        .int()
        .positive('Invalid parent comment ID')
        .optional()
        .nullable()
});

export type CreateCommentInput = z.infer<
    typeof createCommentSchema
>;
