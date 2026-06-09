import { Challenge } from '../../domain/entities/Challenge';
import { ChallengeRepository } from '../../domain/repositories/challenge/Challenge.repository';
import { DayRepository } from '../../domain/repositories/challenge/Day.repository';
import {
    CHALLENGE_TYPE_IDS,
    ChallengeFilters,
    ChallengeWithRelations,
    CreateDailyChallengesBatch
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
    ): Promise<ChallengeWithRelations[]> {
        const existingChallenges =
            await this.challengeRepository.findByDate(batch.date);

        const existingTypes = new Set(
            existingChallenges.map((c: any) =>
                (c.type?.name ?? '').toUpperCase()
            )
        );

        for (const challengeDto of batch.challenges) {
            if (existingTypes.has(challengeDto.type.toUpperCase())) {
                throw new ValidationError(
                    `Challenge of type '${challengeDto.type}' already exists for date ${batch.date}`
                );
            }
        }

        const day = await this.dayRepository.findOrCreate(batch.date);

        if (!day || day.getDayId() <= 0) {
            throw new ValidationError(
                'Failed to create or retrieve day'
            );
        }

        const challengesToCreate: Challenge[] = [];

        for (const challengeDto of batch.challenges) {
            const anime = await this.animeService.getAnimeByMalId(
                challengeDto.malId
            );

            if (!anime || anime.getAnimeId() <= 0) {
                throw new ValidationError(
                    `Failed to create or retrieve anime with malId ${challengeDto.malId}`
                );
            }

            const typeId = CHALLENGE_TYPE_IDS[challengeDto.type];

            challengesToCreate.push(
                Challenge.create(
                    typeId,
                    day.getDayId(),
                    anime.getAnimeId(),
                    challengeDto.data || {}
                )
            );
        }

        return this.challengeRepository.createBatch(challengesToCreate);
    }

    async updateChallenge(
        challengeId: number,
        data: Record<string, any>
    ): Promise<ChallengeWithRelations> {
        const updated =
            await this.challengeRepository.update(
                challengeId,
                data
            );
        if (!updated) {
            throw new NotFoundError(
                `Challenge with id ${challengeId} not found`
            );
        }
        return updated;
    }

    async getChallenges(
        findOptions: FindOptions,
        filters?: ChallengeFilters
    ): Promise<FindRepository<ChallengeWithRelations>> {
        return this.challengeRepository.findWithFilters(
            findOptions,
            filters
        );
    }

    async getDailyChallenges(): Promise<ChallengeWithRelations[]> {
        const today = new Date().toISOString().split('T')[0];
        const challenges =
            await this.challengeRepository.findByDate(today);

        if (challenges.length === 0) {
            throw new NotFoundError('No challenges found for today');
        }

        return challenges;
    }

    async getChallengesByDate(
        date: string
    ): Promise<ChallengeWithRelations[]> {
        const challenges =
            await this.challengeRepository.findByDate(date);

        if (challenges.length === 0) {
            throw new NotFoundError(
                `No challenges found for date ${date}`
            );
        }

        return challenges;
    }

    async deleteChallengesByDate(date: string): Promise<boolean> {
        const deleted =
            await this.challengeRepository.deleteByDate(date);

        if (!deleted) {
            throw new NotFoundError(`No challenges for ${date}.`);
        }
        return deleted;
    }
}
