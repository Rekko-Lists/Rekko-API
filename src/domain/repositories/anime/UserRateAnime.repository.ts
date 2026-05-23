import { UserRateAnime } from '../../entities/UserRateAnime';
import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';
import { UserRateListItem } from '../../schemas/anime/rate.schemas';

export interface UserRateAnimeRepository {
    create(entity: UserRateAnime): Promise<UserRateAnime | null>;

    delete(id: number): Promise<boolean>;

    findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserRateAnime | null>;

    findByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<UserRateListItem>>;

    findRatesByUserAndAnimeIds(
        animeIds: number[],
        userId: number
    ): Promise<Map<number, number>>;

    updateRate(
        userRateAnimeId: number,
        rate: number
    ): Promise<UserRateAnime | null>;

    getAverageRateByAnime(
        animeId: number
    ): Promise<number | null>;
}
