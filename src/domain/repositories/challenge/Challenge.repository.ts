import { Challenge } from '../../entities/Challenge';
import { Repository } from '../repository';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';
import {
    ChallengeFilters,
    ChallengeWithRelations
} from '../../schemas/challenge/challenge.schemas';

export interface ChallengeRepository {
    create(entity: Challenge): Promise<Challenge | null>;

    findWithFilters(
        findOptions: FindOptions,
        filters?: ChallengeFilters
    ): Promise<FindRepository<ChallengeWithRelations>>;

    findByDate(date: string): Promise<ChallengeWithRelations[]>;

    deleteByDate(date: string): Promise<boolean>;

    createBatch(
        challenges: Challenge[]
    ): Promise<ChallengeWithRelations[]>;

    update(
        challengeId: number,
        data: Record<string, any>
    ): Promise<ChallengeWithRelations | null>;
}
