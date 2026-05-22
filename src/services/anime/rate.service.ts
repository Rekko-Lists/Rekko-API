import { UserRateAnimeRepository } from '../../domain/repositories/anime/UserRateAnime.repository';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { AnimeService } from './anime.service';
import { UserRateAnime } from '../../domain/entities/UserRateAnime';
import { NotFoundError } from '../../exceptions/exceptions';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import { UserRateListItem } from '../../domain/schemas/anime/rate.schemas';

export class RateService {
    constructor(
        private readonly userRateAnimeRepository: UserRateAnimeRepository,
        private readonly animeRepository: AnimeRepository,
        private readonly animeService: AnimeService
    ) {}

    async rateAnime(
        userId: number,
        malId: number,
        rating: number
    ): Promise<UserRateAnime> {
        const anime =
            await this.animeService.getAnimeByMalId(malId);
        if (!anime) {
            throw new NotFoundError(
                `Anime with MAL ID ${malId} could not be resolved.`
            );
        }
        const animeId = anime.getAnimeId();

        let userRate =
            await this.userRateAnimeRepository.findByUserAndAnime(
                userId,
                animeId
            );

        if (userRate) {
            userRate =
                await this.userRateAnimeRepository.updateRate(
                    userRate.getUserRateAnimeId(),
                    rating
                );
        } else {
            const newEntity = UserRateAnime.fromPersistence({
                userRateAnimeId: 0,
                userId,
                animeId,
                rate: rating
            });
            userRate =
                await this.userRateAnimeRepository.create(
                    newEntity
                );
        }

        if (!userRate) {
            throw new Error(
                'Failed to save or update anime rating.'
            );
        }

        await this.recalculateAndSaveMean(animeId);

        return userRate;
    }

    async getUserRateList(
        userId: number,
        findOptions: FindOptions
    ): Promise<PaginatedResponse<UserRateListItem>> {
        const result =
            await this.userRateAnimeRepository.findByUserId(
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

    async removeRate(
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

        const userRate =
            await this.userRateAnimeRepository.findByUserAndAnime(
                userId,
                animeId
            );
        if (!userRate) {
            throw new NotFoundError(
                `Rating for anime MAL ID ${malId} not found.`
            );
        }

        const deleted =
            await this.userRateAnimeRepository.delete(
                userRate.getUserRateAnimeId()
            );
        if (deleted) {
            await this.recalculateAndSaveMean(animeId);
        }
        return deleted;
    }

    private async recalculateAndSaveMean(
        animeId: number
    ): Promise<void> {
        const avgRating =
            await this.userRateAnimeRepository.getAverageRateByAnime(
                animeId
            );
        const mean = avgRating !== null ? avgRating : 0;
        await this.animeRepository.updateMean(animeId, mean);
    }
}
