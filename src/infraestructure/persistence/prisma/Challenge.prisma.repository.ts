import { Challenge } from '../../../domain/entities/Challenge';
import { ChallengeRepository } from '../../../domain/repositories/Challenge.repository';
import { FindOptions, FindRepository } from '../../../domain/schemas/find.schemas';

export class ChallengePrismaRepository implements ChallengeRepository {
    create(entity: Challenge): Promise<Challenge | null> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Challenge | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<Challenge>> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: Challenge): Promise<Challenge | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByDayId(dayId: number): Promise<Challenge[]> {
        throw new Error('Method not implemented.');
    }
}
