import { Anime } from '../../entities/Anime';
import { Broadcast } from '../../entities/Broadcast';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';

export interface AnimeRepository {
    create(entity: Anime): Promise<Anime | null>;

    createBroadcast(broadcast: {
        dayOfWeek: string;
        startTime: string;
    }): Promise<Broadcast>;

    createTransactionErrorHandling(
        animesData: Array<any>
    ): Promise<void>;

    updateAnime(
        malId: number,
        animeData: any
    ): Promise<Anime | null>;

    searchByName(query: string, limit: number): Promise<Anime[]>;

    find(
        findOptions: FindOptions
    ): Promise<FindRepository<Anime>>;

    findByMalId(malId: number): Promise<Anime | null>;

    findBySeason(year: number, season: string): Promise<Anime[]>;

    findExistingMalIds(malIds: number[]): Promise<number[]>;
}
