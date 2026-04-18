import { Anime } from '../../../domain/entities/Anime';
import { AnimeRepository } from '../../../domain/repositories/Anime.repository';
import { Filter } from '../../../domain/repositories/filters/filter';
import { Pagination } from '../../../domain/schemas/pagination.schemas';

export class AnimePrismaRepository implements AnimeRepository {
    create(entity: Anime): Promise<void> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    find(
        filters?: Filter<string>[] | undefined,
        pagination?: Pagination
    ): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: Anime): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByMalId(malId: number): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    findByName(pagination: Pagination): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    findTopRanked(limit: number): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    findByStatus(
        status: string,
        pagination: Pagination
    ): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    updateByMalId(malId: number): Promise<Anime | null> {
        throw new Error('Method not implemented.');
    }

    updateStats(
        animeId: number,
        mean: number,
        rank: number,
        likes: number
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
