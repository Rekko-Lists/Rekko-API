import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { ValidationError } from '../../exceptions/ValidationError';

const getUserIdParam = (req: Request): number => {
    const userId = parseInt(req.params.userid as string);

    if (isNaN(userId)) {
        throw new ValidationError('Invalid user ID', {
            received: req.params.userid
        });
    }

    return userId;
};

export const getLikedAnimesByUserId = catchAsync(
    async (req: Request, res: Response) => {
        const userId = getUserIdParam(req);
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result =
            await services.like.getLikedAnimesByUserId(
                userId,
                findOptions
            );

        ok(res, 'Liked animes found', {
            likedAnimes: result.data,
            pagination: result.pagination
        });
    }
);

export const getLikedPostsByUserId = catchAsync(
    async (req: Request, res: Response) => {
        const userId = getUserIdParam(req);
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result = await services.like.getLikedPostsByUserId(
            userId,
            findOptions
        );

        ok(res, 'Liked posts found', {
            likedPosts: result.data,
            pagination: result.pagination
        });
    }
);
