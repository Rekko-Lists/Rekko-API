import { Anime } from '../../entities/Anime';
import { Broadcast } from '../../entities/Broadcast';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';

export interface AnimeRepository {
    create(entity: Anime, tx?: any): Promise<Anime | null>;

    createBroadcast(
        broadcast: {
            dayOfWeek: string;
            startTime: string;
        },
        tx?: any
    ): Promise<Broadcast>;

    createTransactionErrorHandling(
        animesData: Array<any>
    ): Promise<number[]>;

    updateAnime(
        malId: number,
        animeData: any,
        tx?: any
    ): Promise<Anime | null>;

    bumpNextUpdate(malId: number, deltaMs: number): Promise<void>;

    searchByName(query: string, limit: number): Promise<Anime[]>;

    find(
        findOptions: FindOptions
    ): Promise<FindRepository<Anime>>;

    findByMalId(malId: number): Promise<Anime | null>;

    findBySeason(year: number, season: string): Promise<Anime[]>;

    findTopSeasonal(
        year: number,
        season: string,
        limit: number
    ): Promise<Anime[]>;

    findPopularWeekly(limit: number, status?: string): Promise<Anime[]>;

    findAiringTodayJst(dayOfWeek: string, limit: number): Promise<Anime[]>;

    findWeeklyAiring(limit: number): Promise<Anime[]>;

    findTopByStatus(status: string, limit: number): Promise<Anime[]>;

    findExistingMalIds(malIds: number[]): Promise<number[]>;

    findAllGenres(): Promise<string[]>;

    updateMean(animeId: number, mean: number): Promise<Anime | null>;
}
