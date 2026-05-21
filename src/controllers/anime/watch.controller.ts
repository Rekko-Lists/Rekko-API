import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { userWatchSchema } from '../../domain/schemas/anime/watch.schemas';
import { ValidationError } from '../../exceptions/ValidationError';

export const postWatch = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const watchInput = {
            userId,
            malId: req.body.malId,
            numEpisodes: req.body.numEpisodes,
            state: req.body.state
        };

        const validatedWatch = userWatchSchema.parse(watchInput);

        const { services } = req.container!;
        const watch = await services.watch.updateProgress(
            validatedWatch.userId,
            validatedWatch.malId,
            validatedWatch.numEpisodes,
            validatedWatch.state
        );

        ok(
            res,
            'Anime watch progress recorded successfully',
            watch
        );
    }
);

export const getWatch = catchAsync(
    async (req: Request, res: Response) => {
        const userId = parseInt(req.params.userid as string);

        if (isNaN(userId)) {
            throw new ValidationError('Invalid user ID', {
                received: req.params.userid
            });
        }

        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result = await services.watch.getUserWatchList(
            userId,
            findOptions
        );

        ok(res, 'Anime watch list found', {
            watchList: result.data,
            pagination: result.pagination
        });
    }
);

export const deleteWatch = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError('Invalid MAL ID', {
                received: req.params.malid
            });
        }

        const { services } = req.container!;
        await services.watch.removeProgress(userId, malId);

        ok(res, 'Anime watch progress deleted successfully');
    }
);
