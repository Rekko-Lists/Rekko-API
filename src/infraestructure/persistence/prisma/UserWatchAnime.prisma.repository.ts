import { UserWatchAnime } from '../../../domain/entities/UserWatchAnime';
import { Filter } from '../../../domain/repositories/filters/filter';
import { UserWatchAnimeRepository } from '../../../domain/repositories/UserWatchAnime.repository';
import { Pagination } from '../../../domain/schemas/pagination.schemas';

export class UserWatchAnimePrismaRepository implements UserWatchAnimeRepository {
    create(entity: UserWatchAnime): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<UserWatchAnime | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<UserWatchAnime[]> {
        throw new Error('Method not implemented.');
    }

    update(
        id: number,
        entity: UserWatchAnime
    ): Promise<UserWatchAnime | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByUserAndAnime(
        userId: number,
        animeId: number
    ): Promise<UserWatchAnime | null> {
        throw new Error('Method not implemented.');
    }

    updateProgress(
        userId: number,
        animeId: number,
        numEpisodes: number,
        state: string
    ): Promise<UserWatchAnime> {
        throw new Error('Method not implemented.');
    }

    findByUserAndState(
        userId: number,
        state: string
    ): Promise<UserWatchAnime[]> {
        throw new Error('Method not implemented.');
    }
}
