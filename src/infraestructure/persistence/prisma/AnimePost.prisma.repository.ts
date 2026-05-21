import { Anime } from '../../../domain/entities/Anime';
import { Post } from '../../../domain/entities/Post';
import { AnimePostRepository } from '../../../domain/repositories/AnimePost.repository';

export class AnimePostPrismaRepository implements AnimePostRepository {
    addAnimeToPost(
        postId: number,
        animeId: number
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    removeAnimeFromPost(
        postId: number,
        animeId: number
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getAnimesByPost(postId: number): Promise<Anime[]> {
        throw new Error('Method not implemented.');
    }

    getPostsByAnime(animeId: number): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }
}
