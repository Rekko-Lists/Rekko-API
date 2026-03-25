import { UserWatchAnime } from '../entities/UserWatchAnime';
import { Repository } from './repository';

export interface UserWatchAnimeRepository extends Repository<UserWatchAnime> {
    findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserWatchAnime | null>;

    updateProgress(
        userId: number,
        animeId: number,
        numEpisodes: number,
        state: string
    ): Promise<UserWatchAnime>;

    findByUserAndState(
        userId: number,
        state: string
    ): Promise<UserWatchAnime[]>;
}
