import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { AnimeMapper } from '../../domain/entities/mappers/AnimeMapper';
import { ValidationError } from '../../exceptions/ValidationError';

export const getAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const findOptions = (req as any).findOptions;
        const { services } = req.container!;
        const userId = req.user?.userId;

        const result =
            await services.anime.getCatalogue(findOptions);

        const userStateMap = userId
            ? await services.anime.buildUserStateMap(
                  result.data,
                  userId
              )
            : undefined;

        ok(res, 'Animes found', {
            animes: AnimeMapper.toDTOs(
                result.data,
                userStateMap
            ),
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
        const userId = req.user?.userId;
        const anime =
            await services.anime.getAnimeByMalId(malId);

        const userState = userId
            ? (
                  await services.anime.buildUserStateMap(
                      [anime],
                      userId
                  )
              ).get(anime.getAnimeId())
            : undefined;

        ok(res, 'Anime found', {
            anime: AnimeMapper.toDTO(anime, userState)
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
            40 // hard cap: 40 pages × 500 = 20 000 anime
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

export const getTopSeasonalAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getTopSeasonalAnimes(limit);

        ok(res, 'Top seasonal animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

export const getPopularAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getPopularAnimes(limit);

        ok(res, 'Popular animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

export const getAiringTodayAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getAiringTodayAnimes(limit);

        ok(res, 'Airing today animes found', {
            animes: AnimeMapper.toDTOs(animes),
            timezone: 'Asia/Tokyo'
        });
    }
);

export const getTopUpcomingAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getTopUpcomingAnimes(limit);

        ok(res, 'Top upcoming animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

export const getPopularUpcomingAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getPopularUpcomingAnimes(limit);

        ok(res, 'Popular upcoming animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

export const getTopAiringAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const limit = parseWidgetLimit(req.query.limit);
        const { services } = req.container!;
        const animes = await services.anime.getTopAiringAnimes(limit);

        ok(res, 'Top airing animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

export const likeAnime = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError('Invalid MAL ID', {
                received: req.params.malid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const anime = await services.like.likeAnime(
            malId,
            userId
        );

        ok(res, 'Anime liked successfully', {
            anime: AnimeMapper.toDTO(anime)
        });
    }
);

export const unlikeAnime = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError('Invalid MAL ID', {
                received: req.params.malid
            });
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const anime = await services.like.unlikeAnime(
            malId,
            userId
        );

        ok(res, 'Anime unliked successfully', {
            anime: AnimeMapper.toDTO(anime)
        });
    }
);

function parseWidgetLimit(value: unknown): number {
    const limit = Number(value ?? 5);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        throw new ValidationError('Invalid limit', { received: value });
    }
    return limit;
}
