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

export type EnrichedComment = {
    commentId: number;
    message: string;
    likes: number;
    userId: number | null;
    user: { username: string; profileImage: string } | undefined;
    postId: number;
    parentCommentId: number | null;
    replyCount: number | undefined;
    hasReplies: boolean | undefined;
    hasLiked: boolean;
    // Present only on the thread endpoint: the full nested subtree of replies,
    // already enriched, so the client can render the whole tree in one render.
    replies?: EnrichedComment[];
};
