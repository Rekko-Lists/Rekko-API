import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { userRateSchema } from '../../domain/schemas/anime/rate.schemas';
import { ValidationError } from '../../exceptions/ValidationError';

export const postRate = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const ratingInput = {
            userId,
            malId: req.body.malId,
            rating: req.body.rating
        };

        const validatedRating =
            userRateSchema.parse(ratingInput);

        const { services } = req.container!;
        const rate = await services.rate.rateAnime(
            validatedRating.userId,
            validatedRating.malId,
            validatedRating.rating
        );

        ok(res, 'Anime rated successfully', rate);
    }
);

export const getRate = catchAsync(
    async (req: Request, res: Response) => {
        const userId = parseInt(req.params.userid as string);

        if (isNaN(userId)) {
            throw new ValidationError('Invalid user ID', {
                received: req.params.userid
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result = await services.rate.getUserRateList(
            userId,
            findOptions
        );

        ok(res, 'Anime rating list found', {
            ratingList: result.data,
            pagination: result.pagination
        });
    }
);

export const deleteRate = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError('Invalid MAL ID', {
                received: req.params.malid
            });
        }

        const { services } = req.container!;
        await services.rate.removeRate(userId, malId);

        ok(res, 'Anime rate deleted successfully');
    }
);
