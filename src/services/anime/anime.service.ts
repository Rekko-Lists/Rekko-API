import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
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
import { Paginator } from '../../utils/pagination/paginator';
import {
    findStaleAnimeMalIds,
    triggerBackgroundRefresh
} from './refreshStaleAnimes';

export class AnimeService {
    constructor(
        private readonly animeRepository: AnimeRepository,
        private readonly malService: MalService
    ) {}

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
                    [dbAnime.getMalId()],
                    this.malService,
                    this.animeRepository
                );
            }

            return dbAnime;
        }

        const malAnime =
            await this.malService.getAnimeById(malId);
        const mappedAnime =
            this.malService.mapMalToAnime(malAnime);

        const createdAnime = await this.animeRepository.create(
            mappedAnime as any
        );

        if (createdAnime) return createdAnime;

        const existingAnime =
            await this.animeRepository.findByMalId(malId);

        if (existingAnime) return existingAnime;

        throw new ConflictError('Anime already exists but could not be loaded.');
    }

    async getSeasonalAnimes(
        year: number,
        season: string,
        findOptions: FindOptions
    ): Promise<
        PaginatedResponse<Anime> & { withMalData: boolean }
    > {
        const allAnimes =
            await this.animeRepository.findBySeason(
                year,
                season
            );

        if (!allAnimes || allAnimes.length === 0) {
            throw new NotFoundError(
                `No animes found for ${season} ${year}`
            );
        }

        let withMalData = false;
        this.updateSeasonalAnimesFromMal(
            year,
            season,
            findOptions.pagination.limit
        )
            .then(() => {
                withMalData = true;
            })
            .catch((error) => {
                console.warn(
                    'Failed to fetch seasonal animes from MAL:',
                    error
                );
            });

        const paginator = new Paginator();
        const paginatedResult = paginator.paginate(
            allAnimes,
            findOptions.pagination.page,
            findOptions.pagination.limit
        );

        return {
            ...paginatedResult,
            withMalData
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
            this.animeRepository
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
