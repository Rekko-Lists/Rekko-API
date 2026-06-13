import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { createCommentSchema } from '../../domain/schemas/publication/comment.schemas';
import { ValidationError } from '../../exceptions/exceptions';

export const createComment = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const userId = req.user!.userId;

        const input = createCommentSchema.parse(req.body);

        const comment = await services.comment.createComment(
            userId,
            input
        );

        ok(res, 'Comment created successfully', {
            comment
        });
    }
);

export const deleteComment = catchAsync(
    async (req: Request, res: Response) => {
        const commentId = parseInt(
            req.params.commentid as string
        );

        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID', {
                received: req.params.commentid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        await services.comment.deleteComment(commentId, userId);

        ok(res, 'Comment deleted successfully');
    }
);

export const getCommentsByPostId = catchAsync(
    async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postId as string);

        if (isNaN(postId)) {
            throw new ValidationError('Invalid post ID', {
                received: req.params.postId
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result =
            await services.comment.getCommentsByPostId(
                postId,
                findOptions
            );

        const formattedComments =
            await services.comment.enrichCommentsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Comments found', {
            comments: formattedComments,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

export const getCommentThreadByPostId = catchAsync(
    async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postId as string);

        if (isNaN(postId)) {
            throw new ValidationError('Invalid post ID', {
                received: req.params.postId
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result =
            await services.comment.getCommentThreadByPostId(
                postId,
                findOptions,
                userId
            );

        ok(res, 'Comments found', {
            comments: result.data,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

export const getCommentsByParentId = catchAsync(
    async (req: Request, res: Response) => {
        const parentId = parseInt(req.params.parentId as string);

        if (isNaN(parentId)) {
            throw new ValidationError('Invalid parent ID', {
                received: req.params.parentId
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result =
            await services.comment.getCommentsByParentId(
                parentId,
                findOptions
            );

        const formattedReplies =
            await services.comment.enrichCommentsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Replies found', {
            replies: formattedReplies,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

export const likeComment = catchAsync(
    async (req: Request, res: Response) => {
        const commentId = parseInt(
            req.params.commentid as string
        );

        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID', {
                received: req.params.commentid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const comment = await services.like.likeComment(
            commentId,
            userId
        );

        ok(res, 'Comment liked successfully', {
            comment
        });
    }
);

export const unlikeComment = catchAsync(
    async (req: Request, res: Response) => {
        const commentId = parseInt(
            req.params.commentid as string
        );

        if (isNaN(commentId)) {
            throw new ValidationError('Invalid comment ID', {
                received: req.params.commentid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const comment = await services.like.unlikeComment(
            commentId,
            userId
        );

        ok(res, 'Comment unliked successfully', {
            comment
        });
    }
);
