import { Anime } from '../entities/Anime';
import { Pagination } from '../types/pagination';
import { Repository } from './repository';

export interface AnimeRepository extends Repository<Anime> {
    findByMalId(malId: number): Promise<Anime | null>;

    findByName(pagination: Pagination): Promise<Anime[]>;

    findTopRanked(limit: number): Promise<Anime[]>;

    findByStatus(
        status: string,
        pagination: Pagination
    ): Promise<Anime[]>;

    updateByMalId(malId: number): Promise<Anime | null>;

    updateStats(
        animeId: number,
        mean: number,
        rank: number,
        likes: number
    ): Promise<void>;
}
