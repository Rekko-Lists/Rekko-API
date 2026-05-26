import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { AnimeRelationRepository } from '../../domain/repositories/anime/AnimeRelation.repository';
import { MalAnimeData } from '../../domain/schemas/anime/mal.schemas';
import { MalService } from './mal.service';
import {
    FindOptions,
    PaginatedResponse,
    PaginatedResponseWithMalStatus
} from '../../domain/schemas/find.schemas';
import {
    ConflictError,
    NotFoundError
} from '../../exceptions/exceptions';
import { Anime } from '../../domain/entities/Anime';
import { AnimeRelation } from '../../domain/entities/AnimeRelation';
import { Paginator } from '../../utils/pagination/paginator';
import { LikeRepository } from '../../domain/repositories/publication/Like.repository';
import { UserRateAnimeRepository } from '../../domain/repositories/anime/UserRateAnime.repository';
import { UserWatchAnimeRepository } from '../../domain/repositories/anime/UserWatchAnime.repository';
import { AnimeUserState } from '../../domain/entities/dtos/AnimeDTO';
import {
    findStaleAnimeMalIds,
    triggerBackgroundRefresh
} from './refreshStaleAnimes';
import { prisma } from '../../infraestructure/database/prisma.client';

export class AnimeService {
    constructor(
        private readonly animeRepository: AnimeRepository,
        private readonly malService: MalService,
        private readonly animeRelationRepository: AnimeRelationRepository,
        private readonly likeRepository: LikeRepository,
        private readonly userRateAnimeRepository: UserRateAnimeRepository,
        private readonly userWatchAnimeRepository: UserWatchAnimeRepository
    ) {}

    /**
     * Builds a map of animeId -> AnimeUserState for the given user.
     * Performs at most 3 batched queries (likes, rates, watches).
     * Animes with no relation are omitted from the map.
     */
    async buildUserStateMap(
        animes: Anime[],
        userId: number
    ): Promise<Map<number, AnimeUserState>> {
        const map = new Map<number, AnimeUserState>();
        if (animes.length === 0) return map;

        const animeIds = animes.map((a) => a.getAnimeId());

        const [likedIds, ratesById, watchById] =
            await Promise.all([
                this.likeRepository.findLikedAnimeIdsByUser(
                    animeIds,
                    userId
                ),
                this.userRateAnimeRepository.findRatesByUserAndAnimeIds(
                    animeIds,
                    userId
                ),
                this.userWatchAnimeRepository.findWatchByUserAndAnimeIds(
                    animeIds,
                    userId
                )
            ]);

        for (const animeId of animeIds) {
            const state: AnimeUserState = {};
            if (likedIds.has(animeId)) state.hasLiked = true;
            const rate = ratesById.get(animeId);
            if (rate !== undefined) state.rate = rate;
            const watch = watchById.get(animeId);
            if (watch) {
                state.watchState = watch.state;
                state.watchedEpisodes = watch.numEpisodes;
            }
            if (Object.keys(state).length > 0) {
                map.set(animeId, state);
            }
        }

        return map;
    }

    async getAnimes(
        findOptions: FindOptions
    ): Promise<PaginatedResponse<Anime>> {
        const result =
            await this.animeRepository.find(findOptions);

        if (
            !result ||
            !result.data ||
            result.data.length === 0
        ) {
            throw new NotFoundError('No animes found.');
        }

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (findOptions.pagination.page > maxPages) {
            throw new NotFoundError(
                `Page ${findOptions.pagination.page} does not exist. Max pages: ${maxPages}`
            );
        }

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages: maxPages
            }
        };
    }

    async getAnimeByMalId(malId: number): Promise<Anime> {
        const dbAnime =
            await this.animeRepository.findByMalId(malId);

        if (dbAnime) {
            if (dbAnime.isStale()) {
                triggerBackgroundRefresh(
                    [malId],
                    this.malService,
                    this.animeRepository,
                    this.animeRelationRepository
                );
            }

            return dbAnime;
        }

        const malAnime =
            await this.malService.getAnimeById(malId);
        const mappedAnime =
            this.malService.mapMalToAnime(malAnime);

        const createdAnime = await prisma.$transaction(
            async (tx: any) => {
                const created = await this.animeRepository.create(
                    mappedAnime as any,
                    tx
                );

                if (!created) return null;

                if (
                    mappedAnime.relatedAnime &&
                    mappedAnime.relatedAnime.length > 0
                ) {
                    await this.animeRelationRepository.upsertMany(
                        created.getAnimeId(),
                        mappedAnime.relatedAnime,
                        tx
                    );
                }

                return created;
            }
        );

        if (createdAnime) return createdAnime;

        const existingAnime =
            await this.animeRepository.findByMalId(malId);

        if (existingAnime) return existingAnime;

        throw new ConflictError('Anime already exists but could not be loaded.');
    }

    async getRelatedAnimes(
        malId: number
    ): Promise<AnimeRelation[]> {
        const anime = await this.animeRepository.findByMalId(malId);

        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} was not found`
            );
        }

        return this.animeRelationRepository.findByAnimeId(
            anime.getAnimeId()
        );
    }

    async getSeasonalAnimes(
        year: number,
        season: string,
        findOptions: FindOptions
    ): Promise<
        PaginatedResponse<Anime> & { withMalData: boolean }
    > {
        // Esperamos a ambas para que `withMalData` refleje si MAL respondió.
        // Si MAL falla, devolvemos solo lo de DB.
        const [dbResult, malResult] = await Promise.allSettled([
            this.animeRepository.findBySeason(year, season),
            this.updateSeasonalAnimesFromMal(
                year,
                season,
                findOptions.pagination.limit
            )
        ]);

        if (dbResult.status === 'rejected') {
            throw dbResult.reason;
        }

        const allAnimes = dbResult.value;

        if (!allAnimes || allAnimes.length === 0) {
            throw new NotFoundError(
                `No animes found for ${season} ${year}`
            );
        }

        if (malResult.status === 'rejected') {
            console.warn(
                '[getSeasonalAnimes] MAL fetch failed, using DB only:',
                malResult.reason
            );
        }

        const paginator = new Paginator();
        const paginatedResult = paginator.paginate(
            allAnimes,
            findOptions.pagination.page,
            findOptions.pagination.limit
        );

        return {
            ...paginatedResult,
            withMalData: malResult.status === 'fulfilled'
        };
    }

    private async updateSeasonalAnimesFromMal(
        year: number,
        season: string,
        limit: number
    ): Promise<void> {
        const malAnimes =
            await this.malService.getSeasonalAnimes(
                year,
                season,
                limit
            );

        for (const malAnime of malAnimes) {
            const mappedAnime =
                this.malService.mapMalToAnime(malAnime);
            await this.animeRepository.create(
                mappedAnime as any
            );
        }
    }

    async getCatalogue(
        findOptions: FindOptions
    ): Promise<PaginatedResponseWithMalStatus<Anime>> {
        const { pagination } = findOptions;
        const page  = pagination?.page  ?? 1;
        const limit = pagination?.limit ?? 10;

        // DB maneja paginación, sort y filtros directamente.
        // MAL corre en paralelo solo para descubrir animes nuevos en background.
        const [dbResult, malResult] = await Promise.allSettled([
            this.animeRepository.find(findOptions),
            this.malService.getTrendingAnimes(500)
        ]);

        if (dbResult.status === 'rejected') {
            console.error('[getCatalogue] DB query failed:', dbResult.reason);
            throw dbResult.reason;
        }
        const dbData = dbResult.value;

        const malApiWorked = malResult.status === 'fulfilled';

        if (!malApiWorked) {
            console.warn(
                '[getCatalogue] MAL fetch failed, using DB only:',
                (malResult as PromiseRejectedResult).reason
            );
        }

        // Background: detectar y guardar animes de MAL que no estén en DB
        if (malApiWorked) {
            const malAnimes = malResult.value;
            const malIds    = malAnimes.map((m) => m.id);

            this.animeRepository.findExistingMalIds(malIds)
                .then((existingIds) => {
                    const existing = new Set(existingIds);
                    const newOnes  = malAnimes.filter((m) => !existing.has(m.id));
                    if (newOnes.length > 0) {
                        return this.saveMalAnimes(newOnes);
                    }
                })
                .catch((err) =>
                    console.error('[getCatalogue] Background save error:', err)
                );
        }

        if (dbData.data.length === 0 && page === 1) {
            throw new NotFoundError('No animes found.');
        }

        const maxPages = Math.ceil(dbData.total / limit);

        if (page > maxPages && maxPages > 0) {
            throw new NotFoundError(
                `Page ${page} does not exist. Max pages: ${maxPages}`
            );
        }

        // Respect TTL: trigger background refresh for stale rows.
        // Fire-and-forget — user gets the current (possibly stale) snapshot,
        // next request sees fresh data.
        const staleMalIds = findStaleAnimeMalIds(dbData.data);
        triggerBackgroundRefresh(
            staleMalIds,
            this.malService,
            this.animeRepository,
            this.animeRelationRepository
        );

        return {
            data: dbData.data,
            pagination: { page, limit, total: dbData.total, pages: maxPages },
            withMalData: malApiWorked
        };
    }

    async getGenres(): Promise<string[]> {
        return this.animeRepository.findAllGenres();
    }

    async seedFromMal(
        pages: number = 10
    ): Promise<{ saved: number; skipped: number; pages: number }> {
        const pageSize = 500; // MAL ranking max per request
        let totalSaved = 0;
        let totalSkipped = 0;

        for (let page = 0; page < pages; page++) {
            const offset = page * pageSize;

            try {
                const malAnimes = await this.malService.getTrendingAnimes(
                    pageSize,
                    offset
                );

                if (malAnimes.length === 0) break;

                const malIds = malAnimes.map((m) => m.id);
                const existingIds =
                    await this.animeRepository.findExistingMalIds(malIds);
                const existing = new Set(existingIds);
                const newOnes = malAnimes.filter((m) => !existing.has(m.id));

                totalSkipped += malAnimes.length - newOnes.length;

                if (newOnes.length > 0) {
                    await this.saveMalAnimes(newOnes);
                    totalSaved += newOnes.length;
                }

                if (malAnimes.length < pageSize) break;

                // Respect MAL rate limits between pages
                if (page < pages - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 1200));
                }
            } catch (error) {
                console.error(
                    `[seedFromMal] Failed at offset ${offset}:`,
                    error
                );
                break;
            }
        }

        return { saved: totalSaved, skipped: totalSkipped, pages };
    }

    private async saveMalAnimes(
        malAnimes: MalAnimeData[]
    ): Promise<void> {
        const animesData = malAnimes.map((m) =>
            this.malService.mapMalToAnime(m)
        );
        await this.animeRepository.createTransactionErrorHandling(
            animesData as any
        );
    }
}
