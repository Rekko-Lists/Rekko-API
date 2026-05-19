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
}
