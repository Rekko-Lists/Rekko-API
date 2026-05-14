import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { SearchOptions } from '../../domain/schemas/search/search.schemas';
import { AnimeMapper } from '../../domain/entities/mappers/AnimeMapper';
import { ValidationError } from '../../exceptions/ValidationError';

export const getAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const { q } = req.query;
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;

        const searchOptions: SearchOptions = {
            ...findOptions,
            query: q ? (q as string) : null
        };

        const result =
            await services.search.search(searchOptions);

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
