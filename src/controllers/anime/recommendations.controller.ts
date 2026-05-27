import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { AnimeMapper } from '../../domain/entities/mappers/AnimeMapper';
import { ValidationError } from '../../exceptions/exceptions';
import { NotFoundError } from '../../exceptions/exceptions';
import { FindOptions } from '../../domain/schemas/find.schemas';

const POST_SORT_BY_FIELD: Record<string, string> = {
    likes: 'likes',
    postId: 'postId'
};

function parseMalId(raw: unknown): number {
    const str = String(raw);
    if (!/^\d+$/.test(str)) {
        throw new ValidationError('Invalid malId parameter', {
            received: raw
        });
    }
    const malId = parseInt(str, 10);
    if (isNaN(malId) || malId <= 0) {
        throw new ValidationError('Invalid malId parameter', {
            received: raw
        });
    }
    return malId;
}

function buildPostSortBy(req: Request): FindOptions['sort'] | undefined {
    if (!req.query.sortBy) return undefined;

    const sortBy = String(req.query.sortBy)
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);
    const sortOrders = req.query.sortOrder
        ? String(req.query.sortOrder).split(',')
        : [];

    const sort = sortBy.flatMap((field, index) => {
        const mappedField = POST_SORT_BY_FIELD[field];
        if (!mappedField) return [];

        return [
            {
                field: mappedField,
                order:
                    sortOrders[index]?.trim() === 'asc'
                        ? ('asc' as const)
                        : ('desc' as const)
            }
        ];
    });

    return sort.length > 0 ? sort : undefined;
}

/**
 * GET /anime/:malid/recommended-via-posts
 *
 * Devuelve animes mas relacionados con el target via co-aparicion
 * en posts (tabla `anime_post`), ordenados por COUNT(*) desc.
 * Cada item incluye su `relatedCount` para la UI (footer "Popular related").
 */
export const getRecommendedViaPosts = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseMalId(req.params.malid);
        const findOptions = (req as any).findOptions as FindOptions;

        const { services } = req.container!;

        const result =
            await services.recommendations.getAnimesRelatedViaPosts(
                malId,
                findOptions
            );

        // Asociamos `relatedCount` directamente desde la entidad
        // (el DTO no expone `animeId`).
        const animes = result.data.map((anime) => ({
            ...AnimeMapper.toDTO(anime),
            relatedCount:
                result.counts.get(anime.getAnimeId()) ?? 0
        }));

        ok(res, 'Recommended animes found', {
            animes,
            pagination: result.pagination
        });
    }
);

/**
 * GET /anime/:malid/similar?limit=3
 *
 * Top N animes (default 3) que comparten al menos un genero con el
 * target, seleccionados desde la lista de animes mas relacionados via
 * posts.
 */
export const getSimilarAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseMalId(req.params.malid);

        const rawLimit = req.query.limit;
        const parsedLimit = rawLimit
            ? parseInt(String(rawLimit))
            : 3;

        if (isNaN(parsedLimit) || parsedLimit < 1) {
            throw new ValidationError(
                'Invalid limit parameter',
                { received: rawLimit }
            );
        }

        const limit = Math.min(parsedLimit, 110);

        const { services } = req.container!;

        const animes =
            await services.recommendations.getSimilarAnimesByGenre(
                malId,
                limit
            );

        ok(res, 'Similar animes found', {
            animes: AnimeMapper.toDTOs(animes)
        });
    }
);

/**
 * GET /anime/:malid/posts?page=&limit=10&sortBy=likes
 *
 * Posts que mencionan al anime, ordenados por likes desc por defecto.
 * Devuelve `data: []` (en lugar de 404) si no hay posts para el anime.
 * 404 unicamente cuando el anime con `:malid` no existe.
 */
export const getPostsByAnime = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseMalId(req.params.malid);
        const baseFindOptions = (req as any)
            .findOptions as FindOptions;

        const { services, repositories } = req.container!;

        // 1) Verificar que el anime existe (404 si no).
        //    Usamos el repository directamente (no el service) para
        //    evitar disparar el fetch a MAL — si no esta en DB,
        //    devolvemos 404 inmediato.
        const targetAnime =
            await repositories.anime.findByMalId(malId);
        if (!targetAnime) {
            throw new NotFoundError('Anime', malId);
        }

        // 2) Default sort: likes desc, postId desc (tiebreaker estable).
        const sortBy = buildPostSortBy(req);
        const sort =
            sortBy ??
            (baseFindOptions.sort && baseFindOptions.sort.length > 0
                ? baseFindOptions.sort
                : [
                      { field: 'likes', order: 'desc' as const },
                      { field: 'postId', order: 'desc' as const }
                  ]);

        const findOptions: FindOptions = {
            ...baseFindOptions,
            sort
        };

        const result =
            await services.post.getPostsByMalIdGraceful(
                malId,
                findOptions
            );

        const userId = req.user?.userId;
        const formattedPosts =
            await services.post.enrichPostsWithLikesStatus(
                result.data,
                userId
            );

        ok(res, 'Posts found', {
            posts: formattedPosts,
            pagination: result.pagination
        });
    }
);
