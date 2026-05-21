import { UserWatchAnime } from '../entities/UserWatchAnime';
import {
    FindOptions,
    FindRepository
} from '../schemas/find.schemas';
import { UserWatchListItem } from '../schemas/anime/watch.schemas';

export interface UserWatchAnimeRepository {
    create(
        entity: UserWatchAnime
    ): Promise<UserWatchAnime | null>;

    delete(id: number): Promise<boolean>;

    findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserWatchAnime | null>;

    findByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<UserWatchListItem>>;

    updateProgress(
        userId: number,
        animeId: number,
        numEpisodes: number,
        state: string
    ): Promise<UserWatchAnime>;
}
