import { Anime } from '../../domain/entities/Anime';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import { NotFoundError } from '../../exceptions/exceptions';
import { prisma } from '../../infraestructure/database/prisma.client';
import { handlePrismaError } from '../../infraestructure/errors/prisma.errors';

type AnimeIdWithCount = {
    related_anime_id: number;
    relation_count: number;
};

type RecommendedTotalRow = {
    total: bigint;
};

export class RecommendationsService {
    constructor(
        private readonly animeRepository: AnimeRepository
    ) {}

    /**
     * Devuelve los animes más relacionados con el target via co-aparición
     * en posts, leyendo la tabla agregada AnimePostRecommendation.
     *
     * Si el malId no existe en la DB -> NotFoundError.
     * Si no hay co-apariciones -> data: [], pagination con total=0.
     */
    async getAnimesRelatedViaPosts(
        targetMalId: number,
        findOptions: FindOptions
    ): Promise<
        PaginatedResponse<Anime> & {
            counts: Map<number, number>;
        }
    > {
        const targetAnime =
            await this.animeRepository.findByMalId(targetMalId);

        if (!targetAnime) {
            throw new NotFoundError('Anime', targetMalId);
        }

        const targetAnimeId = targetAnime.getAnimeId();
        const { page, limit } = findOptions.pagination;
        const skip = (page - 1) * limit;

        try {
            const rowsPromise = prisma.$queryRaw<
                AnimeIdWithCount[]
            >`
                SELECT related_anime_id, relation_count
                FROM anime_post_recommendation
                WHERE anime_id = ${targetAnimeId}
                ORDER BY relation_count DESC, related_anime_id ASC
                LIMIT ${limit}
                OFFSET ${skip}
            `;
            const totalRowsPromise = prisma.$queryRaw<
                RecommendedTotalRow[]
            >`
                SELECT COUNT(*)::bigint AS total
                FROM anime_post_recommendation
                WHERE anime_id = ${targetAnimeId}
            `;
            const [rows, totalRows] = (await Promise.all([
                rowsPromise,
                totalRowsPromise
            ])) as [AnimeIdWithCount[], RecommendedTotalRow[]];

            const total = Number(totalRows[0]?.total ?? 0);
            const pages =
                total > 0 ? Math.ceil(total / limit) : 0;

            if (rows.length === 0) {
                return {
                    data: [],
                    pagination: { page, limit, total, pages },
                    counts: new Map()
                };
            }

            const animeIds = rows.map((r) => r.related_anime_id);
            const counts = new Map<number, number>(
                rows.map((r) => [r.related_anime_id, r.relation_count])
            );

            const animes =
                await this.findAnimesByIdsOrdered(animeIds);

            return {
                data: animes,
                pagination: { page, limit, total, pages },
                counts
            };
        } catch (error) {
            const err = error as any;
            // Pool exhaustion or missing table (migrations pending) — degrade
            // gracefully so the anime detail page still renders.
            if (!err?.code?.startsWith('P2')) {
                console.error(
                    '[Recommendations] getAnimesRelatedViaPosts degraded:',
                    err?.message ?? err
                );
                return {
                    data: [],
                    pagination: { page, limit, total: 0, pages: 0 },
                    counts: new Map()
                };
            }
            handlePrismaError(error);
        }
    }

    /**
     * Devuelve hasta `limit` animes similares al target. Se selecciona
     * desde la lista de animes mas relacionados via posts y se filtra
     * por aquellos que comparten al menos 1 genero con el target.
     *
     * Si el malId no existe en la DB -> NotFoundError.
     * Si no hay candidatos -> [].
     */
    async getSimilarAnimesByGenre(
        targetMalId: number,
        limit: number = 3
    ): Promise<Anime[]> {
        const targetAnime =
            await this.animeRepository.findByMalId(targetMalId);

        if (!targetAnime) {
            throw new NotFoundError('Anime', targetMalId);
        }

        const targetAnimeId = targetAnime.getAnimeId();

        try {
            const rows = (await prisma.$queryRaw<
                AnimeIdWithCount[]
            >`
                SELECT apr.related_anime_id, apr.relation_count
                FROM anime_post_recommendation apr
                WHERE apr.anime_id = ${targetAnimeId}
                AND EXISTS (
                    SELECT 1
                    FROM anime_genre ag
                    WHERE ag.anime_id = apr.related_anime_id
                      AND ag.genre_id IN (
                        SELECT ag2.genre_id
                        FROM anime_genre ag2
                        WHERE ag2.anime_id = ${targetAnimeId}
                      )
                )
                ORDER BY apr.relation_count DESC, apr.related_anime_id ASC
                LIMIT ${limit}
            `) as AnimeIdWithCount[];

            if (rows.length === 0) return [];

            const animeIds = rows.map((r) => r.related_anime_id);
            return this.findAnimesByIdsOrdered(animeIds);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    /**
     * Obtiene animes por animeId y los devuelve en el mismo orden
     * en que se le pasaron los ids (Prisma `findMany` no garantiza
     * el orden del array `in`).
     */
    private async findAnimesByIdsOrdered(
        animeIds: number[]
    ): Promise<Anime[]> {
        if (animeIds.length === 0) return [];

        try {
            const records = await prisma.anime.findMany({
                where: { animeId: { in: animeIds } },
                include: {
                    broadcast: true,
                    animeGenres: { include: { genre: true } }
                }
            });

            const byId = new Map<number, any>(
                records.map((r: any) => [r.animeId, r])
            );

            const ordered: Anime[] = [];
            for (const id of animeIds) {
                const record = byId.get(id);
                if (!record) continue;
                ordered.push(
                    Anime.fromPersistence({
                        ...record,
                        genres:
                            record.animeGenres?.map(
                                (ag: any) => ag.genre.name
                            ) ?? []
                    })
                );
            }
            return ordered;
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
