import { Challenge } from '../../entities/Challenge';
import { Repository } from '../repository';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';
import { ChallengeFilters } from '../../schemas/challenge/challenge.schemas';

export interface ChallengeRepository {
    create(entity: Challenge): Promise<Challenge | null>;

    findWithFilters(
        findOptions: FindOptions,
        filters?: ChallengeFilters
    ): Promise<FindRepository<Challenge>>;

    findByDate(date: string): Promise<Challenge[]>;

    deleteByDate(date: string): Promise<boolean>;

    createBatch(challenges: Challenge[]): Promise<Challenge[]>;
}
