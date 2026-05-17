import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { AnimeMapper } from '../../domain/entities/mappers/AnimeMapper';
import { ValidationError } from '../../exceptions/ValidationError';

export const getAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result =
            await services.anime.getCatalogue(findOptions);

        ok(res, 'Animes found', {
            animes: AnimeMapper.toDTOs(result.data),
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            },
            withMalData: result.withMalData
        });
    }
);

export const getAnime = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError(
                'Invalid malId parameter',
                {
                    received: req.params.malid
                }
            );
        }

        const { services } = req.container!;
        const anime =
            await services.anime.getAnimeByMalId(malId);

        ok(res, 'Anime found', {
            anime: AnimeMapper.toDTO(anime)
        });
    }
);

export const getGenres = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const genres = await services.anime.getGenres();
        ok(res, 'Genres found', { genres });
    }
);

export const seedAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const pages = Math.min(
            parseInt(req.query.pages as string) || 10,
            40  // hard cap: 40 pages × 500 = 20 000 anime
        );
        const { services } = req.container!;
        const result = await services.anime.seedFromMal(pages);
        ok(res, `Seed complete`, result);
    }
);

export const getSeasonalAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const { year, season } = (req as any).seasonParams;
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const result = await services.anime.getSeasonalAnimes(
            year,
            season,
            findOptions
        );

        ok(res, 'Seasonal animes found', {
            animes: AnimeMapper.toDTOs(result.data),
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                pages: result.pagination.pages
            },
            withMalData: result.withMalData
        });
    }
);
