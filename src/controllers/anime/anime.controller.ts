import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { BadRequestError } from '../../domain/errors/http.errors';
import { animeService } from '../../infraestructure/container/anime.container';

export const getAnime = catchAsync(
    async (req: Request, res: Response) => {}
);

export const getSearchAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            throw new BadRequestError(
                'Query parameter is required and must be a string'
            );
        }

        const animes =
            await animeService.searchAnimeCandidates(query);

        ok(res, 'Anime candidates found', animes);
    }
);

export const postAnime = catchAsync(
    async (req: Request, res: Response) => {}
);
