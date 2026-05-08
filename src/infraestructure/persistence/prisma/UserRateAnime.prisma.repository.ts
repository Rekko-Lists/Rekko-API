import { UserRateAnime } from '../../../domain/entities/UserRateAnime';
import { UserRateAnimeRepository } from '../../../domain/repositories/UserRateAnime.repository';
import { FindOptions, FindRepository } from '../../../domain/schemas/find.schemas';

export class UserRateAnimePrismaRepository implements UserRateAnimeRepository {
    create(entity: UserRateAnime): Promise<UserRateAnime | null> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<UserRateAnime | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<UserRateAnime>> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: UserRateAnime): Promise<UserRateAnime | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByUserAndAnime(userId: number, animeId: number): Promise<UserRateAnime | null> {
        throw new Error('Method not implemented.');
    }

    updateRate(userId: number, animeId: number, rate: number): Promise<UserRateAnime | null> {
        throw new Error('Method not implemented.');
    }

    getAverageRateByAnime(animeId: number): Promise<number | null> {
        throw new Error('Method not implemented.');
    }
}
