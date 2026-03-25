import { Broadcast } from '../entities/Broadcast';
import { Repository } from './repository';

export interface BroadcastRepository extends Repository<Broadcast> {
    findByAnimeId(animeId: number): Promise<Broadcast | null>;

    findByDay(dayOfWeek: Date): Promise<Broadcast[]>;
}

/**
 * BroadcastRepository

findByAnimeId(animeId): Promise<Broadcast | null>

findByDay(dayOfWeek): Promise<Broadcast[]>

upsertByAnimeId(animeId, dayOfWeek, startTime): Promise<Broadcast>
 */
