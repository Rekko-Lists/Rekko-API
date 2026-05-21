import { UserLikeAnimeRepository } from '../../../domain/repositories/UserLikeAnime.repository';

export class UserLikeAnimePrismaRepository implements UserLikeAnimeRepository {
    exists(userId: number, animeId: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    add(userId: number, animeId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    
    remove(userId: number, animeId: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
