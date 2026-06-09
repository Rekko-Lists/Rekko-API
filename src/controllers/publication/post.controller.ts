import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { ValidationError } from '../../exceptions/exceptions';
import { createPostSchema } from '../../domain/schemas/publication/post.schemas';

export const getPosts = catchAsync(
    async (req: Request, res: Response) => {
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result = await services.post.getPosts(findOptions);

        const formattedPosts =
            await services.post.enrichPostsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Posts found', {
            posts: formattedPosts,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

export const getPopularPosts = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const userId = req.user?.userId;

        const posts = await services.post.getPopularPosts(limit);
        const formattedPosts =
            await services.post.enrichPostsWithLikesStatus(
                posts,
                userId
            );

        ok(res, 'Popular posts found', {
            posts: formattedPosts
        });
    }
);

export const getPost = catchAsync(
    async (req: Request, res: Response) => {
        const findOptions = (req as any).findOptions;
        const postId = parseInt(req.params.postid as string);
        const { services } = req.container!;
        const userId = req.user?.userId;

        const post = await services.post.getPostById(postId);
        const formattedPost =
            await services.post.enrichPostWithLikesStatus(
                post,
                userId
            );

        const comments =
            await services.comment.getCommentsByPostId(
                post.getPostId(),
                findOptions
            );

        const formattedComments =
            await services.comment.enrichCommentsWithLikesStatus(
                comments.data,
                userId
            );

        ok(res, 'Post found', {
            post: formattedPost,
            comments: {
                data: formattedComments,
                pagination: {
                    page: comments.pagination.page,
                    limit: comments.pagination.limit,
                    total: comments.pagination.total,
                    pages: comments.pagination.pages
                }
            }
        });
    }
);

export const postPost = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const userId = req.user!.userId;
        const file = req.file;

        const data = {
            title: req.body.title,
            description: req.body.description,
            animeIds: parseAnimeIds(req.body.animeIds)
        };

        const input = createPostSchema.parse(data);

        const post = await services.post.createPost(
            userId,
            input,
            file
        );

        ok(res, 'Post created successfully', {
            post
        });
    }
);

export const deletePost = catchAsync(
    async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postid as string);

        const { services } = req.container!;
        const userId = req.user!.userId;

        await services.post.deletePost(postId, userId);

        ok(res, 'Post deleted successfully');
    }
);

export const getPostsByUsername = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result = await services.post.getPostsByUsername(
            username,
            findOptions
        );

        const formattedPosts =
            await services.post.enrichPostsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Posts found', {
            posts: formattedPosts,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

export const likePost = catchAsync(
    async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postid as string);

        if (isNaN(postId)) {
            throw new ValidationError('Invalid post ID', {
                received: req.params.postid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const post = await services.like.likePost(
            postId,
            userId
        );
        const formattedPost =
            await services.post.enrichPostWithLikesStatus(
                post,
                userId
            );

        ok(res, 'Post liked successfully', {
            post: formattedPost
        });
    }
);

export const unlikePost = catchAsync(
    async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postid as string);

        if (isNaN(postId)) {
            throw new ValidationError('Invalid post ID', {
                received: req.params.postid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const post = await services.like.unlikePost(
            postId,
            userId
        );
        const formattedPost =
            await services.post.enrichPostWithLikesStatus(
                post,
                userId
            );

        ok(res, 'Post unliked successfully', {
            post: formattedPost
        });
    }
);

export const getPostsByMalId = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseInt(req.params.malId as string);

        if (isNaN(malId)) {
            throw new ValidationError('Invalid anime ID', {
                received: req.params.malId
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result = await services.post.getPostsByMalId(
            malId,
            findOptions
        );

        const formattedPosts =
            await services.post.enrichPostsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Posts found', {
            posts: formattedPosts,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            }
        });
    }
);

const parseAnimeIds = (animeIds: unknown): number[] => {
    if (!animeIds) return [];

    if (Array.isArray(animeIds)) {
        return animeIds.map(Number);
    }

    if (typeof animeIds === 'string') {
        try {
            const parsed = JSON.parse(animeIds);
            return Array.isArray(parsed)
                ? parsed.map(Number)
                : [];
        } catch {
            return animeIds
                .split(',')
                .filter(Boolean)
                .map(Number);
        }
    }

    return [];
};

const parseWidgetLimit = (value: unknown): number => {
    const limit = Number(value ?? 5);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        throw new ValidationError('Invalid limit', { received: value });
    }
    return limit;
};
