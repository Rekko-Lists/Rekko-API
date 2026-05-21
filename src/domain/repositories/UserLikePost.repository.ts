export interface UserLikePostRepository {
    exists(userId: number, postId: number): Promise<boolean>;

    add(userId: number, postId: number): Promise<void>;

    remove(userId: number, postId: number): Promise<void>;
}
