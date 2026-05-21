import { UserRateAnime } from '../entities/UserRateAnime';
import { Repository } from './repository';

export interface UserRateAnimeRepository extends Repository<UserRateAnime> {
    findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserRateAnime | null>;

    updateRate(
        userId: number,
        animeId: number,
        rate: number
    ): Promise<UserRateAnime | null>;

    getAverageRateByAnime(
        animeId: number
    ): Promise<number | null>;
}
