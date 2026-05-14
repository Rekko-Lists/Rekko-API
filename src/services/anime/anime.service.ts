import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { MalAnimeData } from '../../domain/schemas/anime/mal.schemas';
import { MalService } from './mal.service';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import { NotFoundError } from '../../exceptions/exceptions';
import { Anime } from '../../domain/entities/Anime';
import { Paginator } from '../../utils/pagination/paginator';

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
            const nextUpdate = dbAnime.getNextUpdate();
            const now = new Date();

            if (nextUpdate && nextUpdate < now) {
                this.updateAnimeFromMal(malId);
            }

            return dbAnime;
        }

        const malAnime =
            await this.malService.getAnimeById(malId);
        const mappedAnime =
            this.malService.mapMalToAnime(malAnime);

        this.animeRepository.create(mappedAnime as any);

        return Anime.fromPersistence(mappedAnime as any);
    }

    private async updateAnimeFromMal(
        malId: number
    ): Promise<void> {
        const malAnime =
            await this.malService.getAnimeById(malId);
        const mappedAnime =
            this.malService.mapMalToAnime(malAnime);

        await this.animeRepository.updateAnime(
            malId,
            mappedAnime as any
        );
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
}
