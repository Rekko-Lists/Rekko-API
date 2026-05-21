import { UserWatchAnimeRepository } from '../../domain/repositories/UserWatchAnime.repository';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { AnimeService } from './anime.service';
import { UserWatchAnime } from '../../domain/entities/UserWatchAnime';
import {
    NotFoundError,
    ValidationError
} from '../../exceptions/exceptions';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import { UserWatchListItem } from '../../domain/schemas/anime/watch.schemas';

export class WatchService {
    constructor(
        private readonly userWatchAnimeRepository: UserWatchAnimeRepository,
        private readonly animeRepository: AnimeRepository,
        private readonly animeService: AnimeService
    ) {}

    async updateProgress(
        userId: number,
        malId: number,
        numEpisodes: number,
        state: string
    ): Promise<UserWatchAnime> {
        const anime =
            await this.animeService.getAnimeByMalId(malId);
        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} could not be resolved.`
            );
        }

        if (
            numEpisodes < 0 ||
            numEpisodes > anime.getNumEpisodes()
        ) {
            throw new ValidationError(
                'Invalid number of episodes provided.'
            );
        }

        const animeId = anime.getAnimeId();

        const userWatch =
            await this.userWatchAnimeRepository.updateProgress(
                userId,
                animeId,
                numEpisodes,
                state
            );

        return userWatch;
    }

    async getUserWatchList(
        userId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<UserWatchListItem>> {
        const result =
            await this.userWatchAnimeRepository.findByUserId(
                userId,
                findOptions
            );

        const pages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages
            }
        };
    }

    async removeProgress(
        userId: number,
        malId: number
    ): Promise<boolean> {
        const anime =
            await this.animeRepository.findByMalId(malId);
        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} not found.`
            );
        }
        const animeId = anime.getAnimeId();

        const userWatch =
            await this.userWatchAnimeRepository.findByUserAndAnime(
                userId,
                animeId
            );
        if (!userWatch) {
            throw new NotFoundError(
                `Watch progress for anime MAL ID ${malId} not found.`
            );
        }

        return this.userWatchAnimeRepository.delete(
            userWatch.getUserWatchAnimeId()
        );
    }
}
