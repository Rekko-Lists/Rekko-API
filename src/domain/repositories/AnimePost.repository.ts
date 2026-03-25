import { Anime } from '../entities/Anime';
import { Post } from '../entities/Post';

export interface AnimePostRepository {
    addAnimeToPost(
        postId: number,
        animeId: number
    ): Promise<void>;

    removeAnimeFromPost(
        postId: number,
        animeId: number
    ): Promise<void>;

    getAnimesByPost(postId: number): Promise<Anime[]>;

    getPostsByAnime(animeId: number): Promise<Post[]>;
}
