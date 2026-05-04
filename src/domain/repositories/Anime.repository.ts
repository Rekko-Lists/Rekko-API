import { Anime } from '../entities/Anime';
import { Repository } from './repository';

export interface AnimeRepository extends Repository<Anime> {
    findByMalId(malId: number): Promise<Anime | null>;

    searchByName(query: string, limit: number): Promise<Anime[]>;

    findExistingMalIds(malIds: number[]): Promise<number[]>;

    findTopRanked(limit: number): Promise<Anime[]>;

    findByStatus(
        status: string,
        limit: number
    ): Promise<Anime[]>;

    updateByMalId(malId: number): Promise<Anime | null>;

    updateStats(
        animeId: number,
        mean: number,
        rank: number,
        likes: number
    ): Promise<void>;
}
