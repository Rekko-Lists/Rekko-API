import { Challenge } from '../../../domain/entities/Challenge';
import { ChallengeRepository } from '../../../domain/repositories/Challenge.repository';
import { Filter } from '../../../domain/repositories/filters/filter';
import { Pagination } from '../../../domain/types/pagination';

export class ChallengePrismaRepository implements ChallengeRepository {
    create(entity: Challenge): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Challenge | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<Challenge[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: Challenge
    ): Promise<Challenge | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByDayId(dayId: number): Promise<Challenge[]> {
        throw new Error('Method not implemented.');
    }
}
