import {
    FindOptions,
    FindRepository
} from '../../schemas/find.schemas';
import {
    LikedAnimeListItem,
    LikedPostListItem
} from '../../schemas/publication/like.schemas';

export interface LikeRepository {
    hasUserLikedPost(
        postId: number,
        userId: number
    ): Promise<boolean>;

    createPostLike(
        postId: number,
        userId: number
    ): Promise<void>;

    removePostLike(
        postId: number,
        userId: number
    ): Promise<void>;

    hasUserLikedComment(
        commentId: number,
        userId: number
    ): Promise<boolean>;

    createCommentLike(
        commentId: number,
        userId: number
    ): Promise<void>;

    removeCommentLike(
        commentId: number,
        userId: number
    ): Promise<void>;

    hasUserLikedAnime(
        animeId: number,
        userId: number
    ): Promise<boolean>;

    createAnimeLike(
        animeId: number,
        userId: number
    ): Promise<void>;

    removeAnimeLike(
        animeId: number,
        userId: number
    ): Promise<void>;

    findLikedAnimesByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<LikedAnimeListItem>>;

    findLikedPostsByUserId(
        userId: number,
        findOptions: FindOptions
    ): Promise<FindRepository<LikedPostListItem>>;
}
