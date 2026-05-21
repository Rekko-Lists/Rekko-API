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
}
