import { Challenge } from '../entities/Challenge';
import { Repository } from './repository';

export interface ChallengeRepository extends Repository<Challenge> {
    findByDayId(dayId: number): Promise<Challenge[]>;
}
