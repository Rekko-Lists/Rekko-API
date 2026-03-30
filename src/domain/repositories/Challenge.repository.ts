import { Challenge } from '../entities/Challenge';
import { Repository } from './repository';

export interface ChallengeRepository extends Repository<Challenge> {
    findByDayId(dayId: number): Promise<Challenge[]>;
}

/**
 * ChallengeRepository

findByAnimeId(animeId): Promise<Challenge[]>

findByDayId(dayId): Promise<Challenge[]>

findByTypeId(typeId): Promise<Challenge[]>

createMany(challenges): Promise<number>

updateData(challengeId, data): Promise<void>
 */
