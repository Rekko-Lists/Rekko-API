import { Challenge } from '../../domain/entities/Challenge';
import { ChallengeRepository } from '../../domain/repositories/challenge/Challenge.repository';
import { DayRepository } from '../../domain/repositories/challenge/Day.repository';
import {
    CreateDailyChallengesBatch,
    ChallengeFilters
} from '../../domain/schemas/challenge/challenge.schemas';
import {
    NotFoundError,
    ValidationError
} from '../../exceptions/exceptions';
import {
    FindOptions,
    FindRepository
} from '../../domain/schemas/find.schemas';
import { AnimeService } from '../anime/anime.service';

export class ChallengeService {
    constructor(
        private readonly challengeRepository: ChallengeRepository,
        private readonly dayRepository: DayRepository,
        private readonly animeService: AnimeService
    ) {}

    async createDailyChallenges(
        batch: CreateDailyChallengesBatch
    ): Promise<Challenge[]> {
        const existingChallenges =
            await this.challengeRepository.findByDate(
                batch.date
            );

        if (existingChallenges.length > 0) {
            throw new ValidationError(
                `Challenges already exist for date ${batch.date}`
            );
        }

        const day = await this.dayRepository.findOrCreate(
            batch.date
        );

        if (!day || day.getDayId() <= 0) {
            throw new ValidationError(
                'Failed to create or retrieve day'
            );
        }

        const challengesToCreate: Challenge[] = [];
        const typeMap: Record<string, number> = {
            anime: 1,
            character: 2,
            opening: 3,
            emoji: 4
        };

        for (let i = 0; i < batch.challenges.length; i++) {
            const challengeDto = batch.challenges[i];

            const anime =
                await this.animeService.getAnimeByMalId(
                    challengeDto.malId
                );

            if (!anime || anime.getAnimeId() <= 0) {
                throw new ValidationError(
                    `Failed to create or retrieve anime with malId ${challengeDto.malId}`
                );
            }

            const typeId = typeMap[challengeDto.type] || 1;

            if (typeId <= 0 || typeId > 4) {
                throw new ValidationError(
                    `Invalid typeId: ${typeId}`
                );
            }

            const challenge = Challenge.create(
                typeId,
                day.getDayId(),
                anime.getAnimeId(),
                challengeDto.data || {}
            );

            challengesToCreate.push(challenge);
        }

        const created =
            await this.challengeRepository.createBatch(
                challengesToCreate
            );

        return created;
    }

    async getChallenges(
        findOptions: FindOptions,
        filters?: ChallengeFilters
    ): Promise<FindRepository<any>> {
        return await (
            this.challengeRepository as any
        ).findWithFilters(findOptions, filters);
    }

    async getDailyChallenges(): Promise<any[]> {
        const today = new Date().toISOString().split('T')[0];
        const challenges = await (
            this.challengeRepository as any
        ).findByDate(today);

        if (challenges.length === 0) {
            throw new NotFoundError(
                'No challenges found for today'
            );
        }

        return challenges;
    }

    async getChallengesByDate(date: string): Promise<any[]> {
        const challenges = await (
            this.challengeRepository as any
        ).findByDate(date);

        if (challenges.length === 0) {
            throw new NotFoundError(
                `No challenges found for date ${date}`
            );
        }

        return challenges;
    }

    async deleteChallengesByDate(
        date: string
    ): Promise<boolean> {
        const deleted =
            await this.challengeRepository.deleteByDate(date);

        if (!deleted) {
            throw new NotFoundError(
                `No challenges for ${date}.`
            );
        }
        return deleted;
    }
}
